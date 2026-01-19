-- Create love_letters table for HumIQ Love Letters feature
CREATE TABLE public.love_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  name_or_role TEXT,
  user_type TEXT CHECK (user_type IN ('Founder', 'Hiring Manager', 'Recruiter', 'Talent', 'Other')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.love_letters ENABLE ROW LEVEL SECURITY;

-- Create policy for anyone to read love letters (public wall)
CREATE POLICY "Love letters are viewable by everyone" 
ON public.love_letters 
FOR SELECT 
USING (true);

-- Create policy for anyone to insert love letters (anonymous submissions)
CREATE POLICY "Anyone can submit a love letter" 
ON public.love_letters 
FOR INSERT 
WITH CHECK (true);

-- Create index for ordering by created_at
CREATE INDEX idx_love_letters_created_at ON public.love_letters(created_at DESC);