import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    console.log('Chat request received:', message);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch all approved documents
    const { data: documents, error: dbError } = await supabaseClient
      .from('documents')
      .select('*')
      .eq('status', 'approved');

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log(`Found ${documents?.length || 0} approved documents`);

    // Create context for AI
    const documentsContext = documents?.map(doc => 
      `ID: ${doc.id}, Filename: ${doc.filename}, Subject: ${doc.subject}, Semester: ${doc.semester}, Branch: ${doc.branch}, Type: ${doc.document_type}`
    ).join('\n') || 'No documents available';

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are VTU MITRA, an AI study assistant for VTU (Visvesvaraya Technological University) students. Your job is to help students find study materials from our database.

Available documents in the database:
${documentsContext}

When a student asks for study materials, search through the available documents and identify the most relevant ones based on:
- Subject name (match keywords, accept variations like "DS" for "Data Structures", "OS" for "Operating Systems")
- Semester
- Branch (CSE, ISE, ECE, etc.)
- Document type (Notes, PYQ, Lab, Question Bank)

Respond in a friendly, helpful manner. If you find matching documents, return ONLY their IDs as a JSON array at the end of your message in this exact format: [DOCUMENTS:id1,id2,id3]

If no documents match, politely explain what's available and suggest alternatives.

Example response:
"I found Data Structures notes for 3rd semester CSE! Here are the materials:
[DOCUMENTS:abc123,def456]"

Keep responses concise and student-friendly.`
          },
          {
            role: 'user',
            content: message
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            message: "I'm a bit overwhelmed right now! Please try again in a moment.",
            documents: []
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiMessage = aiData.choices[0].message.content;
    console.log('AI response:', aiMessage);

    // Parse document IDs from AI response
    const docIdsMatch = aiMessage.match(/\[DOCUMENTS:(.*?)\]/);
    let relevantDocs = [];

    if (docIdsMatch) {
      const docIds = docIdsMatch[1].split(',').map((id: string) => id.trim());
      relevantDocs = documents?.filter(doc => docIds.includes(doc.id)) || [];
      console.log(`Matched ${relevantDocs.length} documents`);
    }

    // Clean up the message by removing the [DOCUMENTS:...] part
    const cleanMessage = aiMessage.replace(/\[DOCUMENTS:.*?\]/, '').trim();

    return new Response(
      JSON.stringify({ 
        message: cleanMessage,
        documents: relevantDocs
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ 
        message: "Sorry, I encountered an error. Please try again.",
        documents: [],
        error: error?.message || 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
