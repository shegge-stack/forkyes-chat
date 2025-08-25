-- RLS Policies for family-based access control

-- ===============================
-- FAMILIES TABLE POLICIES
-- ===============================

-- Users can read families they belong to
CREATE POLICY "Users can read their family" ON families
    FOR SELECT
    USING (
        id IN (
            SELECT family_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- Family admins can update their family
CREATE POLICY "Family admins can update their family" ON families
    FOR UPDATE
    USING (
        id IN (
            SELECT family_id 
            FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Authenticated users can create families
CREATE POLICY "Authenticated users can create families" ON families
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ===============================
-- USERS TABLE POLICIES
-- ===============================

-- Users can read their own record and family members
CREATE POLICY "Users can read family members" ON users
    FOR SELECT
    USING (
        -- Own record
        id = auth.uid() 
        OR 
        -- Same family members
        family_id IN (
            SELECT family_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- Users can update their own record
CREATE POLICY "Users can update their own record" ON users
    FOR UPDATE
    USING (id = auth.uid());

-- Family admins can update family members
CREATE POLICY "Family admins can manage family members" ON users
    FOR UPDATE
    USING (
        family_id IN (
            SELECT family_id 
            FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Family admins can invite new members
CREATE POLICY "Family admins can invite members" ON users
    FOR INSERT
    WITH CHECK (
        family_id IN (
            SELECT family_id 
            FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ===============================
-- FAMILY_PREFERENCES TABLE POLICIES
-- ===============================

-- Family members can read their family preferences
CREATE POLICY "Family members can read preferences" ON family_preferences
    FOR SELECT
    USING (
        family_id IN (
            SELECT family_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- Family members can update their family preferences
CREATE POLICY "Family members can update preferences" ON family_preferences
    FOR ALL
    USING (
        family_id IN (
            SELECT family_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- ===============================
-- MEALS TABLE POLICIES
-- ===============================

-- All authenticated users can read meals (public recipes)
CREATE POLICY "Authenticated users can read meals" ON meals
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- For now, only allow reading meals. Later we might add user-created meals.
-- CREATE POLICY "Users can create meals" ON meals
--     FOR INSERT
--     WITH CHECK (auth.role() = 'authenticated');

-- ===============================
-- WEEK_PLANS TABLE POLICIES
-- ===============================

-- Family members can read their family's week plans
CREATE POLICY "Family members can read week plans" ON week_plans
    FOR SELECT
    USING (
        family_id IN (
            SELECT family_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- Family members can create/update their family's week plans
CREATE POLICY "Family members can manage week plans" ON week_plans
    FOR ALL
    USING (
        family_id IN (
            SELECT family_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- ===============================
-- MEAL_RATINGS TABLE POLICIES
-- ===============================

-- Family members can read their family's meal ratings
CREATE POLICY "Family members can read meal ratings" ON meal_ratings
    FOR SELECT
    USING (
        family_id IN (
            SELECT family_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- Family members can create/update their family's meal ratings
CREATE POLICY "Family members can manage meal ratings" ON meal_ratings
    FOR ALL
    USING (
        family_id IN (
            SELECT family_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );