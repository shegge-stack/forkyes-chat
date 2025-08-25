# ForkYes - AI-Powered Family Meal Planning

A comprehensive meal planning SaaS application built with Next.js 14, Supabase, and OpenAI that helps families organize meals, generate shopping lists, and get personalized recipe recommendations.

## 🚀 Features

### Family-Centric Architecture
- **Multi-user families** with role-based access (admin, member, child)
- **Family preferences** including dietary restrictions, cooking skill level, and food preferences
- **Secure data isolation** with Row Level Security (RLS)

### Intelligent Meal Planning
- **AI-powered recipe suggestions** based on family preferences
- **Weekly meal planning** with drag-and-drop interface
- **Smart shopping list generation** from meal plans
- **Recipe modification** for dietary restrictions and serving sizes

### Modern Tech Stack
- **Next.js 14** with App Router and Server Components
- **Supabase** for authentication, database, and real-time features
- **OpenAI GPT-4** for intelligent meal recommendations
- **Tailwind CSS** with custom ForkYes color palette
- **TypeScript** for type safety

## 🎨 Design System

### Custom Color Palette
```css
--sage-green: #87A96B    /* Primary brand color */
--warm-cream: #FFF8E7    /* Background */
--terracotta: #CC6B49    /* Accent */
--honey-gold: #F4C430    /* Secondary accent */
--soft-charcoal: #4A4A4A /* Text */
```

## 🏗️ Architecture

### Database Schema
- **families** - Family units with unique identifiers
- **users** - Extends Supabase auth with family relationships
- **family_preferences** - Dietary restrictions, cooking skills, preferences
- **meals** - Recipe database with ingredients, nutrition, ratings
- **week_plans** - Weekly meal planning with shopping lists
- **meal_ratings** - Family feedback and recipe ratings

### Security Model
- Row Level Security (RLS) on all tables
- Family-based access control
- Automatic user provisioning via database triggers
- Role-based permissions (admin/member/child)

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- Supabase account and project
- OpenAI API key

### Setup

1. **Clone and install dependencies**
```bash
git clone https://github.com/shegge-stack/forkyes-chat.git
cd forkyes-chat
npm install
```

2. **Configure environment variables**
```bash
cp .env.example .env.local
```

Fill in your API keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

3. **Apply database migrations**
```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Link to your project
supabase link --project-ref your-project-id

# Apply migrations
supabase db push
```

4. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📱 User Journey

### New User Onboarding
1. **Sign up** with email/password
2. **Family setup** - Create family and set basic info
3. **Preferences** - Configure dietary restrictions and dislikes
4. **Welcome** - Redirected to dashboard

### Core Features
- **Dashboard** - Family stats and quick actions
- **Meal Planning** - Browse recipes and plan weekly meals
- **AI Chat** - Get personalized meal suggestions
- **Shopping Lists** - Auto-generated from meal plans
- **Family Management** - Manage members and preferences

## 🤖 AI Integration

### OpenAI Services
- **Meal Suggestions** - Personalized recipe recommendations
- **Shopping List Optimization** - Consolidate ingredients and suggest alternatives
- **Recipe Modifications** - Adapt recipes for dietary restrictions or serving sizes

### API Endpoints
```typescript
POST /api/chat
{
  "type": "meal_suggestions",
  "constraints": {
    "maxPrepTime": 30,
    "cuisine": "Italian",
    "mealType": "dinner"
  }
}
```

## 📊 Database Functions

### Family Management
- `create_family_with_admin()` - Creates family and assigns admin role
- `join_family()` - Allows users to join existing families
- `get_user_family_context()` - Returns user's family information

### Meal Planning
- `get_recommended_meals()` - AI-enhanced meal recommendations
- `generate_shopping_list_from_plan()` - Auto-generates shopping lists
- `update_meal_rating()` - Maintains recipe rating averages

## 🔧 Development

### Key Services
- `familyService` - Family CRUD operations and user management
- `mealService` - Recipe search, ratings, and recommendations  
- `weekPlanService` - Meal planning and shopping list management
- `aiService` - OpenAI integration for intelligent features

### Component Structure
```
/app
  /(auth) - Authentication pages
  /(dashboard) - Protected dashboard routes
  /api - API endpoints
/lib
  /services - Business logic
  /supabase - Database configuration
  /types - TypeScript definitions
/components - Reusable UI components
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deployment
```bash
npm run build
npm run start
```

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Family-based authentication
- ✅ AI meal recommendations
- ✅ Weekly meal planning
- ✅ Smart shopping lists

### Phase 2 (Next)
- [ ] Mobile-responsive design improvements
- [ ] Recipe photo uploads
- [ ] Nutritional goal tracking
- [ ] Meal plan sharing between families

### Phase 3 (Future)
- [ ] Integration with grocery delivery services
- [ ] Voice-activated meal planning
- [ ] Advanced dietary tracking
- [ ] Social features and community recipes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support, email support@forkyes.com or create an issue on GitHub.

---

**Built with ❤️ by the ForkYes team**