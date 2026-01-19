-- Create a public view that excludes the email column
CREATE VIEW public.love_letters_public AS
SELECT id, message, name_or_role, user_type, created_at
FROM public.love_letters;

-- Grant access to the view
GRANT SELECT ON public.love_letters_public TO anon, authenticated;

-- Add comment
COMMENT ON VIEW public.love_letters_public IS 'Public view of love letters that excludes private email addresses';