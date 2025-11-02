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
    const { documentId, recipientEmail } = await req.json();
    console.log('Email request:', { documentId, recipientEmail });

    if (!documentId || !recipientEmail) {
      throw new Error('Missing required fields');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch document details
    const { data: document, error: docError } = await supabaseClient
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('status', 'approved')
      .single();

    if (docError || !document) {
      console.error('Document fetch error:', docError);
      throw new Error('Document not found');
    }

    console.log('Document found:', document.filename);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('documents')
      .download(document.file_path);

    if (downloadError || !fileData) {
      console.error('File download error:', downloadError);
      throw new Error('Failed to download file');
    }

    console.log('File downloaded, size:', fileData.size);

    // Convert Blob to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64File = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Send email with attachment using Resend API directly
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "VTU MITRA <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: `Your requested study material: ${document.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">VTU MITRA</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your AI Study Assistant</p>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Your Study Material is Ready!</h2>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Here's the document you requested:
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <p style="margin: 5px 0; color: #1f2937;"><strong>Subject:</strong> ${document.subject}</p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Type:</strong> ${document.document_type}</p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Semester:</strong> ${document.semester}</p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Branch:</strong> ${document.branch}</p>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6;">
                The document is attached to this email. Good luck with your studies!
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px;">
                  Need more materials? Visit VTU MITRA and chat with our AI assistant!
                </p>
              </div>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: document.filename,
            content: base64File,
          },
        ],
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend error:', emailResponse.status, errorText);
      throw new Error('Failed to send email');
    }

    const emailData = await emailResponse.json();
    console.log('Email sent successfully:', emailData.id);

    return new Response(
      JSON.stringify({ success: true, messageId: emailData.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error in send-email function:', error);
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Unknown error',
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
