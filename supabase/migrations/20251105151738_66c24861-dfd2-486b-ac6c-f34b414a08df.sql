-- Chat messages table for persistent chat history
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document ratings table
CREATE TABLE IF NOT EXISTS document_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, user_id)
);

-- User bookmarks table
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, document_id)
);

-- Download history table
CREATE TABLE IF NOT EXISTS download_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_ratings_document_id ON document_ratings(document_id);
CREATE INDEX IF NOT EXISTS idx_download_history_user_id ON download_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_messages
CREATE POLICY "Users can view their own chat messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages"
  ON chat_messages FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for document_ratings
CREATE POLICY "Anyone can view ratings"
  ON document_ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert ratings"
  ON document_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON document_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON document_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON user_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
  ON user_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON user_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for download_history
CREATE POLICY "Users can view their own download history"
  ON download_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own download history"
  ON download_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all data
CREATE POLICY "Admins can view all chat messages"
  ON chat_messages FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all download history"
  ON download_history FOR SELECT
  USING (is_admin(auth.uid()));

-- Function to update document rating averages
CREATE OR REPLACE FUNCTION update_document_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE documents
  SET 
    avg_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM document_ratings
      WHERE document_id = NEW.document_id
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM document_ratings
      WHERE document_id = NEW.document_id
    )
  WHERE id = NEW.document_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update ratings on insert/update/delete
CREATE TRIGGER update_document_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON document_ratings
FOR EACH ROW
EXECUTE FUNCTION update_document_rating();

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE documents
  SET download_count = download_count + 1
  WHERE id = NEW.document_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to increment download count
CREATE TRIGGER increment_download_count_trigger
AFTER INSERT ON download_history
FOR EACH ROW
EXECUTE FUNCTION increment_download_count();

-- Fix storage policies for better file access
DROP POLICY IF EXISTS "Authenticated users can read approved documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read pending documents" ON storage.objects;

CREATE POLICY "Authenticated users can read approved documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'approved'
);

CREATE POLICY "Admins can read all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND is_admin(auth.uid())
);