-- Create week_plans table
CREATE TABLE week_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id uuid REFERENCES families(id) ON DELETE CASCADE NOT NULL,
    week_start date NOT NULL, -- Monday of the week
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed')),
    meals jsonb DEFAULT '[]'::jsonb, -- [{"day": "monday", "meal_type": "dinner", "meal_id": "uuid", "servings": 4, "notes": "optional notes"}]
    shopping_list jsonb DEFAULT '[]'::jsonb, -- [{"name": "ingredient", "quantity": "2 lbs", "category": "produce", "checked": false}]
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE week_plans ENABLE ROW LEVEL SECURITY;

-- Create unique constraint - one plan per family per week
ALTER TABLE week_plans ADD CONSTRAINT unique_family_week UNIQUE (family_id, week_start);

-- Create indexes for performance
CREATE INDEX idx_week_plans_family_id ON week_plans(family_id);
CREATE INDEX idx_week_plans_week_start ON week_plans(week_start);
CREATE INDEX idx_week_plans_status ON week_plans(status);
CREATE INDEX idx_week_plans_family_week ON week_plans(family_id, week_start);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_week_plans_updated_at
    BEFORE UPDATE ON week_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get week start (Monday) from any date
CREATE OR REPLACE FUNCTION public.get_week_start(input_date date)
RETURNS date AS $$
BEGIN
    -- Get the Monday of the week for the given date
    RETURN input_date - (EXTRACT(DOW FROM input_date)::integer - 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;