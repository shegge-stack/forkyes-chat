-- Create meals table
CREATE TABLE meals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    prep_time integer DEFAULT 0 CHECK (prep_time >= 0), -- in minutes
    cook_time integer DEFAULT 0 CHECK (cook_time >= 0), -- in minutes
    servings integer DEFAULT 4 CHECK (servings > 0),
    ingredients jsonb DEFAULT '[]'::jsonb, -- [{"name": "ingredient", "amount": "1 cup", "optional": false}]
    instructions jsonb DEFAULT '[]'::jsonb, -- ["step 1", "step 2", ...]
    tags text[] DEFAULT '{}', -- ["quick", "vegetarian", "pasta"]
    nutrition jsonb DEFAULT '{}'::jsonb, -- {"calories": 400, "protein": "20g", "carbs": "30g", "fat": "15g"}
    image_url text,
    source_url text,
    rating_avg decimal(2,1) DEFAULT 0.0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
    rating_count integer DEFAULT 0 CHECK (rating_count >= 0),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (meals are public for now, but we'll add policies for user-created meals later)
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_meals_title ON meals(title);
CREATE INDEX idx_meals_tags ON meals USING GIN(tags);
CREATE INDEX idx_meals_rating_avg ON meals(rating_avg DESC);
CREATE INDEX idx_meals_prep_time ON meals(prep_time);
CREATE INDEX idx_meals_cook_time ON meals(cook_time);
CREATE INDEX idx_meals_servings ON meals(servings);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_meals_updated_at
    BEFORE UPDATE ON meals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update meal rating averages
CREATE OR REPLACE FUNCTION public.update_meal_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE meals
    SET 
        rating_avg = (
            SELECT COALESCE(AVG(rating), 0)
            FROM meal_ratings
            WHERE meal_id = COALESCE(NEW.meal_id, OLD.meal_id)
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM meal_ratings
            WHERE meal_id = COALESCE(NEW.meal_id, OLD.meal_id)
        )
    WHERE id = COALESCE(NEW.meal_id, OLD.meal_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;