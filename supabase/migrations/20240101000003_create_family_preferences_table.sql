-- Create family_preferences table
CREATE TABLE family_preferences (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id uuid REFERENCES families(id) ON DELETE CASCADE NOT NULL,
    dietary_restrictions jsonb DEFAULT '[]'::jsonb,
    household_size integer DEFAULT 2 CHECK (household_size > 0),
    cooking_skill text DEFAULT 'beginner' CHECK (cooking_skill IN ('beginner', 'intermediate', 'advanced', 'professional')),
    dislikes text[] DEFAULT '{}',
    favorite_meals text[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE family_preferences ENABLE ROW LEVEL SECURITY;

-- Create unique constraint - one preferences record per family
ALTER TABLE family_preferences ADD CONSTRAINT unique_family_preferences UNIQUE (family_id);

-- Create indexes for performance
CREATE INDEX idx_family_preferences_family_id ON family_preferences(family_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_family_preferences_updated_at
    BEFORE UPDATE ON family_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();