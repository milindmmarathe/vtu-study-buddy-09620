import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, FileText, BookOpen, FlaskConical, ClipboardList, Download } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Document {
  id: string;
  filename: string;
  subject: string;
  semester: string;
  branch: string;
  document_type: string;
  file_path: string;
  uploaded_at: string;
  profiles: {
    email: string;
    full_name: string;
  };
}

const getDocumentIcon = (type: string) => {
  switch (type) {
    case 'Notes':
      return BookOpen;
    case 'PYQ':
      return FileText;
    case 'Lab':
      return FlaskConical;
    case 'Question Bank':
      return ClipboardList;
    default:
      return FileText;
  }
};

export default function Admin() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingDocuments();
  }, []);

  const fetchPendingDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('status', 'pending')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      // Fetch profile information separately
      const docsWithProfiles = await Promise.all(
        (data || []).map(async (doc) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', doc.uploaded_by)
            .single();

          return {
            ...doc,
            profiles: profile || { email: 'Unknown', full_name: 'Unknown' },
          };
        })
      );

      setDocuments(docsWithProfiles);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.filename;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Download started!');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleApprove = async (document: Document) => {
    setProcessingId(document.id);
    try {
      // Move file from pending to approved folder
      const oldPath = document.file_path;
      const newPath = oldPath.replace('pending/', 'approved/');

      // Copy file to new location
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(oldPath);

      if (downloadError) throw downloadError;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(newPath, fileData);

      if (uploadError) throw uploadError;

      // Delete old file
      const { error: deleteError } = await supabase.storage
        .from('documents')
        .remove([oldPath]);

      if (deleteError) throw deleteError;

      // Update database
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          status: 'approved',
          file_path: newPath,
          approved_at: new Date().toISOString(),
        })
        .eq('id', document.id);

      if (updateError) throw updateError;

      toast.success('Document approved successfully!');
      fetchPendingDocuments();
    } catch (error) {
      console.error('Error approving document:', error);
      toast.error('Failed to approve document');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (document: Document) => {
    setProcessingId(document.id);
    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      toast.success('Document rejected and removed');
      fetchPendingDocuments();
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error('Failed to reject document');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
            <CardDescription>
              Review and manage pending document uploads
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pending documents to review</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => {
                      const Icon = getDocumentIcon(doc.document_type);
                      return (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Icon className="w-4 h-4 text-primary" />
                              </div>
                              <span className="font-medium">{doc.filename}</span>
                            </div>
                          </TableCell>
                          <TableCell>{doc.subject}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="text-sm">Sem {doc.semester} • {doc.branch}</span>
                              <Badge variant="secondary" className="w-fit">
                                {doc.document_type}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {doc.profiles?.full_name || 'Unknown'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {doc.profiles?.email}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload(doc)}
                                disabled={processingId === doc.id}
                                className="gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(doc)}
                                disabled={processingId === doc.id}
                                className="gap-2"
                              >
                                {processingId === doc.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(doc)}
                                disabled={processingId === doc.id}
                                className="gap-2"
                              >
                                {processingId === doc.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
