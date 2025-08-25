-- Create meal_ratings table
CREATE TABLE meal_ratings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id uuid REFERENCES families(id) ON DELETE CASCADE NOT NULL,
    meal_id uuid REFERENCES meals(id) ON DELETE CASCADE NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    notes text,
    would_make_again boolean DEFAULT true,
    kid_approved boolean DEFAULT null, -- null if no kids in family
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE meal_ratings ENABLE ROW LEVEL SECURITY;

-- Create unique constraint - one rating per family per meal
ALTER TABLE meal_ratings ADD CONSTRAINT unique_family_meal_rating UNIQUE (family_id, meal_id);

-- Create indexes for performance
CREATE INDEX idx_meal_ratings_family_id ON meal_ratings(family_id);
CREATE INDEX idx_meal_ratings_meal_id ON meal_ratings(meal_id);
CREATE INDEX idx_meal_ratings_rating ON meal_ratings(rating);
CREATE INDEX idx_meal_ratings_would_make_again ON meal_ratings(would_make_again);
CREATE INDEX idx_meal_ratings_kid_approved ON meal_ratings(kid_approved);

-- Create triggers to update meal rating averages
CREATE TRIGGER update_meal_rating_on_insert
    AFTER INSERT ON meal_ratings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_meal_rating();

CREATE TRIGGER update_meal_rating_on_update
    AFTER UPDATE ON meal_ratings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_meal_rating();

CREATE TRIGGER update_meal_rating_on_delete
    AFTER DELETE ON meal_ratings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_meal_rating();