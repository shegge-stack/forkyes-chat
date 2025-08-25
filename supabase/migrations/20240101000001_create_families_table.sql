-- Create families table
CREATE TABLE families (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX idx_families_created_at ON families(created_at);