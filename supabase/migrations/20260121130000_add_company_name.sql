-- Add name column to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.companies.name IS 'Company name provided during setup';
