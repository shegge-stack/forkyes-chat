# ForkYes Database Schema

This directory contains Supabase migrations for the ForkYes meal planning application.

## Migration Overview

### 1. Families Table (`20240101000001_create_families_table.sql`)
- **Purpose**: Core family units for the application
- **Fields**: id, name, created_at
- **Indexes**: created_at for performance

### 2. Users Table (`20240101000002_create_users_table.sql`)
- **Purpose**: Extends Supabase auth.users with family relationships
- **Fields**: id (FK to auth.users), email, family_id, role, created_at
- **Roles**: admin, member, child
- **Triggers**: Automatically creates user record on auth user creation

### 3. Family Preferences (`20240101000003_create_family_preferences_table.sql`)
- **Purpose**: Stores family-wide preferences for meal planning
- **Fields**: family_id, dietary_restrictions (jsonb), household_size, cooking_skill, dislikes, favorite_meals
- **Constraints**: One preferences record per family

### 4. Meals Table (`20240101000004_create_meals_table.sql`)
- **Purpose**: Recipe database with nutrition and rating information
- **Fields**: title, prep_time, cook_time, servings, ingredients (jsonb), instructions (jsonb), tags, nutrition (jsonb), image_url, source_url, rating_avg, rating_count
- **Indexes**: Multiple indexes for searching by title, tags, ratings, times

### 5. Week Plans (`20240101000005_create_week_plans_table.sql`)
- **Purpose**: Weekly meal planning with shopping lists
- **Fields**: family_id, week_start, status, meals (jsonb), shopping_list (jsonb)
- **Constraints**: One plan per family per week
- **Status**: draft, confirmed

### 6. Meal Ratings (`20240101000006_create_meal_ratings_table.sql`)
- **Purpose**: Family feedback on meals
- **Fields**: family_id, meal_id, rating (1-5), notes, would_make_again, kid_approved
- **Triggers**: Automatically updates meal rating averages

### 7. RLS Policies (`20240101000007_create_rls_policies.sql`)
- **Purpose**: Family-based access control
- **Security**: Users can only access data for their own family
- **Permissions**: Family admins have additional management rights

### 8. Helper Functions (`20240101000008_create_helper_functions.sql`)
- **Purpose**: Business logic functions
- **Functions**:
  - `create_family_with_admin()`: Creates new family with admin user
  - `join_family()`: Allows users to join existing families
  - `generate_shopping_list_from_plan()`: Auto-generates shopping lists
  - `get_user_family_context()`: Gets user's family information
  - `get_recommended_meals()`: Smart meal recommendations

## Data Structure Examples

### Meals JSON Structure
```json
{
  "ingredients": [
    {"name": "chicken breast", "amount": "2 lbs", "category": "protein"},
    {"name": "olive oil", "amount": "2 tbsp", "category": "pantry"}
  ],
  "instructions": [
    "Preheat oven to 375°F",
    "Season chicken with salt and pepper",
    "Bake for 25-30 minutes"
  ],
  "nutrition": {
    "calories": 400,
    "protein": "45g",
    "carbs": "5g",
    "fat": "20g"
  }
}
```

### Week Plans Meals Structure
```json
[
  {
    "day": "monday",
    "meal_type": "dinner",
    "meal_id": "uuid-here",
    "servings": 4,
    "notes": "Double recipe for leftovers"
  }
]
```

### Shopping List Structure
```json
[
  {
    "name": "chicken breast",
    "quantity": "2 lbs",
    "category": "protein",
    "checked": false
  }
]
```

## Running Migrations

1. Install Supabase CLI
2. Initialize Supabase project: `supabase init`
3. Link to your project: `supabase link --project-ref your-project-id`
4. Run migrations: `supabase db push`

## Security Notes

- All tables use Row Level Security (RLS)
- Users can only access data from their own family
- Family admins have additional permissions for user management
- Auth trigger automatically creates user records
- Functions use SECURITY DEFINER for controlled access

## Next Steps

1. Apply migrations to your Supabase project
2. Create sample data for testing
3. Set up Supabase Edge Functions for AI integration
4. Configure real-time subscriptions for collaborative planning