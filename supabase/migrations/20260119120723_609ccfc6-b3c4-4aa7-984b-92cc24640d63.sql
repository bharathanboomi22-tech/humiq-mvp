-- Add email column to love_letters table (private, never displayed publicly)
ALTER TABLE public.love_letters ADD COLUMN email TEXT DEFAULT NULL;

-- Add comment to document privacy
COMMENT ON COLUMN public.love_letters.email IS 'Private email for follow-up only. Never displayed publicly.';