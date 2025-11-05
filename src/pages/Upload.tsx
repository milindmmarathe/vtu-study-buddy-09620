import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload as UploadIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const uploadSchema = z.object({
  subject: z.string().trim().min(2, 'Subject is required').max(100),
  semester: z.string().trim().min(1, 'Semester is required'),
  branch: z.string().trim().min(2, 'Branch is required').max(50),
  documentType: z.enum(['Notes', 'PYQ', 'Lab', 'Question Bank']),
  file: z.instanceof(File).refine((file) => file.size <= 20 * 1024 * 1024, 'File must be less than 20MB'),
});

export default function Upload() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setErrors({});
    setIsLoading(true);
    setUploadSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      subject: formData.get('subject') as string,
      semester: formData.get('semester') as string,
      branch: formData.get('branch') as string,
      documentType: formData.get('documentType') as string,
      file: selectedFile!,
    };

    try {
      const validated = uploadSchema.parse(data);

      // Upload file to storage
      const fileExt = validated.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `pending/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, validated.file);

      if (uploadError) throw uploadError;

      // Create database entry (types regenerate after remix)
      const { error: dbError } = await (supabase as any).from('documents').insert({
        filename: validated.file.name,
        subject: validated.subject,
        semester: validated.semester,
        branch: validated.branch,
        document_type: validated.documentType,
        file_path: filePath,
        uploaded_by: user.id,
        status: 'pending',
      });

      if (dbError) throw dbError;

      setUploadSuccess(true);
      toast.success('Document uploaded successfully! It will be reviewed by admins.');
      
      // Reset form
      (e.target as HTMLFormElement).reset();
      setSelectedFile(null);
      
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error('Please check the form for errors');
      } else {
        console.error('Upload error:', error);
        toast.error('Failed to upload document');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Upload Study Material</CardTitle>
            <CardDescription>
              Share study materials, lab programs, or PYQs with fellow students
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uploadSuccess && (
              <div className="mb-6 p-4 bg-success/10 border border-success rounded-lg flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <p className="text-sm text-success-foreground">
                  Your document has been submitted and is pending admin approval!
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Name</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="e.g., Data Structures, Operating Systems"
                  required
                />
                {errors.subject && (
                  <p className="text-sm text-destructive">{errors.subject}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select name="semester" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={String(sem)}>
                          {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.semester && (
                    <p className="text-sm text-destructive">{errors.semester}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select name="branch" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSE">CSE</SelectItem>
                      <SelectItem value="ISE">ISE</SelectItem>
                      <SelectItem value="ECE">ECE</SelectItem>
                      <SelectItem value="EEE">EEE</SelectItem>
                      <SelectItem value="MECH">MECH</SelectItem>
                      <SelectItem value="CIVIL">CIVIL</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.branch && (
                    <p className="text-sm text-destructive">{errors.branch}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type</Label>
                <Select name="documentType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Notes">Notes</SelectItem>
                    <SelectItem value="PYQ">Previous Year Questions (PYQ)</SelectItem>
                    <SelectItem value="Lab">Lab Manual</SelectItem>
                    <SelectItem value="Question Bank">Question Bank</SelectItem>
                  </SelectContent>
                </Select>
                {errors.documentType && (
                  <p className="text-sm text-destructive">{errors.documentType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Upload File</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    required
                    className="hidden"
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <UploadIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    {selectedFile ? (
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium">Click to upload</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, DOC up to 20MB
                        </p>
                      </>
                    )}
                  </label>
                </div>
                {errors.file && (
                  <p className="text-sm text-destructive">{errors.file}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !selectedFile}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload Document
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
