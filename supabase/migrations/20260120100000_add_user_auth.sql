-- =====================================================
-- Add user authentication support to platform tables
-- =====================================================

-- Add user_id to companies (optional, allows linking company to authenticated user)
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add user_id to talent_profiles (optional, allows linking profile to authenticated user)
ALTER TABLE public.talent_profiles
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_user_id ON public.talent_profiles(user_id);

-- Add unique constraint for user_id in companies (one company per user)
-- Using partial index to allow multiple NULL values
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_user_id_unique 
ON public.companies(user_id) 
WHERE user_id IS NOT NULL;

-- Add unique constraint for user_id in talent_profiles (one profile per user)
CREATE UNIQUE INDEX IF NOT EXISTS idx_talent_profiles_user_id_unique 
ON public.talent_profiles(user_id) 
WHERE user_id IS NOT NULL;

-- Create a user_role type to track if user is company or talent
CREATE TYPE public.user_role AS ENUM ('company', 'talent');

-- Create user_profiles table to store user metadata
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" 
ON public.user_profiles FOR SELECT 
USING (id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
ON public.user_profiles FOR INSERT 
WITH CHECK (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.user_profiles FOR UPDATE 
USING (id = auth.uid());

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- No automatic profile creation - user will choose role first
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup (optional, can be used later)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
