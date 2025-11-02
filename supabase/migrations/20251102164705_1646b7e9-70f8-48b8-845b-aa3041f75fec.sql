-- Create documents table for storing study materials
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  subject text NOT NULL,
  semester text NOT NULL,
  branch text NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('Notes', 'PYQ', 'Lab', 'Question Bank')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  file_path text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table for admin management
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = is_admin.user_id
      AND role = 'admin'
  );
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for documents
CREATE POLICY "Anyone can view approved documents"
  ON public.documents FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view their own uploads"
  ON public.documents FOR SELECT
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Admins can view all documents"
  ON public.documents FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can upload documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Admins can update documents"
  ON public.documents FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete documents"
  ON public.documents FOR DELETE
  USING (public.is_admin(auth.uid()));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()));

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  
  -- Add default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  -- Make specific emails admins
  IF new.email IN ('altmilind@gmail.com', 'padmeshhu2006@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN new;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view approved documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    (
      -- Document is approved (file path contains 'approved/')
      (storage.foldername(name))[1] = 'approved' OR
      -- Or user is viewing their own upload
      auth.uid()::text = (storage.foldername(name))[1] OR
      -- Or user is admin
      public.is_admin(auth.uid())
    )
  );

CREATE POLICY "Admins can update documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents' AND
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can delete documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents' AND
    public.is_admin(auth.uid())
  );