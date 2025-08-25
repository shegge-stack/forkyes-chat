-- Helper functions and additional database logic

-- ===============================
-- FAMILY MANAGEMENT FUNCTIONS
-- ===============================

-- Function to create a new family and assign the creator as admin
CREATE OR REPLACE FUNCTION public.create_family_with_admin(
    family_name text
)
RETURNS uuid AS $$
DECLARE
    new_family_id uuid;
BEGIN
    -- Create the family
    INSERT INTO families (name)
    VALUES (family_name)
    RETURNING id INTO new_family_id;
    
    -- Update the current user to be admin of this family
    UPDATE users 
    SET family_id = new_family_id, role = 'admin'
    WHERE id = auth.uid();
    
    -- Create default family preferences
    INSERT INTO family_preferences (family_id)
    VALUES (new_family_id);
    
    RETURN new_family_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join an existing family
CREATE OR REPLACE FUNCTION public.join_family(
    invite_family_id uuid,
    user_role text DEFAULT 'member'
)
RETURNS boolean AS $$
BEGIN
    -- Verify the family exists
    IF NOT EXISTS (SELECT 1 FROM families WHERE id = invite_family_id) THEN
        RAISE EXCEPTION 'Family does not exist';
    END IF;
    
    -- Verify role is valid
    IF user_role NOT IN ('admin', 'member', 'child') THEN
        RAISE EXCEPTION 'Invalid role';
    END IF;
    
    -- Update user's family
    UPDATE users 
    SET family_id = invite_family_id, role = user_role
    WHERE id = auth.uid();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- MEAL PLANNING FUNCTIONS
-- ===============================

-- Function to generate shopping list from week plan
CREATE OR REPLACE FUNCTION public.generate_shopping_list_from_plan(
    plan_id uuid
)
RETURNS jsonb AS $$
DECLARE
    plan_meals jsonb;
    shopping_items jsonb := '[]'::jsonb;
    meal_record record;
    ingredient jsonb;
    item jsonb;
BEGIN
    -- Get the meals from the week plan
    SELECT meals INTO plan_meals
    FROM week_plans
    WHERE id = plan_id;
    
    -- For each meal in the plan
    FOR meal_record IN 
        SELECT 
            m.ingredients,
            (pm.value->>'servings')::integer as planned_servings,
            m.servings as recipe_servings
        FROM jsonb_array_elements(plan_meals) pm
        JOIN meals m ON m.id = (pm.value->>'meal_id')::uuid
    LOOP
        -- Calculate serving multiplier
        DECLARE
            multiplier decimal := meal_record.planned_servings::decimal / meal_record.recipe_servings::decimal;
        BEGIN
            -- For each ingredient in the meal
            FOR ingredient IN SELECT * FROM jsonb_array_elements(meal_record.ingredients)
            LOOP
                -- Add to shopping list (simplified - in real app would need quantity calculation)
                item := jsonb_build_object(
                    'name', ingredient->>'name',
                    'quantity', ingredient->>'amount',
                    'category', COALESCE(ingredient->>'category', 'other'),
                    'checked', false
                );
                
                shopping_items := shopping_items || item;
            END LOOP;
        END;
    END LOOP;
    
    -- Update the week plan with the generated shopping list
    UPDATE week_plans
    SET shopping_list = shopping_items
    WHERE id = plan_id;
    
    RETURN shopping_items;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- UTILITY FUNCTIONS
-- ===============================

-- Function to get user's family context
CREATE OR REPLACE FUNCTION public.get_user_family_context()
RETURNS TABLE (
    user_id uuid,
    family_id uuid,
    family_name text,
    user_role text,
    household_size integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.family_id,
        f.name,
        u.role,
        fp.household_size
    FROM users u
    LEFT JOIN families f ON f.id = u.family_id
    LEFT JOIN family_preferences fp ON fp.family_id = u.family_id
    WHERE u.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recommended meals based on family preferences
CREATE OR REPLACE FUNCTION public.get_recommended_meals(
    exclude_rated boolean DEFAULT false,
    limit_count integer DEFAULT 10
)
RETURNS TABLE (
    meal_id uuid,
    title text,
    prep_time integer,
    cook_time integer,
    servings integer,
    tags text[],
    rating_avg decimal,
    matches_preferences boolean
) AS $$
DECLARE
    user_family_id uuid;
    family_dietary_restrictions jsonb;
    family_dislikes text[];
BEGIN
    -- Get user's family context
    SELECT u.family_id, fp.dietary_restrictions, fp.dislikes
    INTO user_family_id, family_dietary_restrictions, family_dislikes
    FROM users u
    LEFT JOIN family_preferences fp ON fp.family_id = u.family_id
    WHERE u.id = auth.uid();
    
    RETURN QUERY
    SELECT 
        m.id,
        m.title,
        m.prep_time,
        m.cook_time,
        m.servings,
        m.tags,
        m.rating_avg,
        -- Simple preference matching (can be enhanced)
        NOT (m.tags && family_dislikes) as matches_preferences
    FROM meals m
    WHERE 
        -- Exclude already rated meals if requested
        (NOT exclude_rated OR NOT EXISTS (
            SELECT 1 FROM meal_ratings mr 
            WHERE mr.meal_id = m.id 
            AND mr.family_id = user_family_id
        ))
    ORDER BY 
        m.rating_avg DESC,
        NOT (m.tags && family_dislikes) DESC,  -- Preference matches first
        m.id
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;