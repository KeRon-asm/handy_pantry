# 🥫 Handy Pantry - Smart Pantry Management App

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://handypantry.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)

**Handy Pantry** is an intelligent pantry management system that helps you track inventory, reduce food waste, manage recipes, and optimize grocery shopping with AI-powered features.

## 🎯 Key Features

### 📦 Smart Pantry Management
- **Digital Inventory** - Track all your pantry items with quantities, expiration dates, and locations
- **Expiration Alerts** - Get notifications for items expiring soon
- **Barcode Scanner** - Scan product barcodes to quickly add items with auto-filled information
- **Category Organization** - Organize items by categories (Dairy, Produce, Grains, etc.)
- **Pantry Lifetime Stats** - Track how long items stay in your pantry

### 🤖 AI-Powered Features
- **AI Receipt Scanning** - Upload receipt images to automatically extract and add items to your pantry
- **AI Recipe Generation** - Generate personalized recipes based on your available ingredients
- **AI Price Estimation** - Get intelligent price estimates for items
- **Smart Shopping Recommendations** - AI analyzes your pantry and suggests what to buy
- **Pantry Intelligence** - Get insights about inventory diversity, category balance, and restocking needs

### 🧾 Receipt & Budget Management
- **Receipt Scanning** - Digitize and store all your grocery receipts
- **Spending Analytics** - Track spending trends with charts and visualizations
- **Budget Tracker** - Set monthly budgets and monitor spending
- **Shopping Frequency Analysis** - Understand your shopping patterns

### 👨‍🍳 Recipe Features
- **Recipe Generator** - Create recipes from your available ingredients
- **Dietary Restrictions** - Filter recipes based on dietary preferences
- **Recipe Library** - Save and organize your favorite recipes
- **Ingredient Matching** - Find recipes you can make with what you have

### 🛒 Shopping List Management
- **Smart Shopping Lists** - Automatically generate shopping lists from low stock items
- **Price Comparison** - Compare prices across different stores
- **Community Pricing** - See average prices from other users
- **Shopping Time Tracking** - Calculate average shopping frequency

### 🎤 Voice Commands
- **Voice Input** - Add items using voice commands
- **Hands-Free Operation** - Perfect for when you're cooking or restocking

### 📊 Analytics & Insights
- **Spending Trends** - Visualize your grocery spending over time
- **Shopping Patterns** - Understand when and what you buy
- **Waste Reduction** - Track items used before expiration

## 🚀 Tech Stack

- **Framework**: Next.js 16.0.7 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Models**: 
  - Anthropic Claude Sonnet 4.5 (Vision)
  - OpenAI GPT-4o-mini (Text)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Barcode Scanning**: ZXing
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Supabase Account** (free tier works)
- **Git** for version control

## 🔧 Installation

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/YOUR_USERNAME/handy-pantry-app.git
cd handy-pantry-app
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Note your project URL and API keys

#### Run Database Scripts

Execute the SQL scripts in order from the `scripts/` folder in your Supabase SQL Editor:

\`\`\`sql
-- Run these in order:
1. scripts/001_create_profiles.sql
2. scripts/002_create_pantry_items.sql
3. scripts/003_create_shopping_lists.sql
4. scripts/004_create_receipts.sql
5. scripts/005_create_recipes.sql
6. scripts/006_create_spending_analytics.sql
7. scripts/007_create_price_comparisons.sql
8. scripts/007_create_stores.sql
9. scripts/008_update_profiles_location.sql
10. scripts/009_seed_sample_stores.sql (optional - sample data)
11. scripts/010_seed_more_products.sql (optional - sample data)
\`\`\`

**Important**: If you encounter RLS policy errors, run:
\`\`\`sql
scripts/101_complete_supabase_restoration.sql
\`\`\`

### 4. Configure Environment Variables

The following environment variables are automatically provided with Supabase integration:

\`\`\`env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Database URLs (Auto-configured)
SUPABASE_POSTGRES_URL=your_postgres_url
SUPABASE_POSTGRES_PRISMA_URL=your_prisma_url
SUPABASE_POSTGRES_URL_NON_POOLING=your_non_pooling_url
SUPABASE_POSTGRES_HOST=your_host
SUPABASE_POSTGRES_USER=your_user
SUPABASE_POSTGRES_PASSWORD=your_password
SUPABASE_POSTGRES_DATABASE=your_database

# JWT
SUPABASE_JWT_SECRET=your_jwt_secret
\`\`\`

**For local development**, create a `.env.local` file with your Supabase credentials.

### 5. Run the Development Server

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

\`\`\`
handy-pantry-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── estimate-price/      # AI price estimation
│   │   ├── generate-recipe/     # AI recipe generation
│   │   ├── scan-receipt/        # AI receipt scanning
│   │   └── voice-command/       # Voice command processing
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   └── sign-up/
│   ├── dashboard/                # Main dashboard
│   │   ├── pantry/              # Pantry management
│   │   ├── recipes/             # Recipe features
│   │   ├── shopping/            # Shopping lists
│   │   ├── receipts/            # Receipt scanning
│   │   ├── budget/              # Budget tracking
│   │   └── settings/            # User settings
│   └── onboarding/              # User onboarding quiz
├── components/                   # React Components
│   ├── ui/                      # shadcn/ui components
│   ├── dashboard/               # Dashboard components
│   ├── pantry/                  # Pantry components
│   ├── recipes/                 # Recipe components
│   ├── shopping/                # Shopping components
│   ├── budget/                  # Budget components
│   └── settings/                # Settings components
├── lib/                         # Utilities
│   ├── supabase/               # Supabase client configs
│   └── utils.ts                # Helper functions
├── scripts/                     # SQL Database Scripts
└── public/                      # Static assets
\`\`\`

## 🎮 Usage Guide

### First Time Setup

1. **Sign Up** - Create an account at `/auth/sign-up`
2. **Complete Quiz** - Fill out the personalization quiz at `/onboarding`
3. **Add Items** - Start adding items to your pantry manually or by scanning barcodes
4. **Scan Receipts** - Upload receipt images to quickly populate your pantry

### Daily Workflow

1. **Check Dashboard** - View pantry overview, expiring items, and AI insights
2. **Scan Receipts** - Upload grocery receipts after shopping
3. **Generate Recipes** - Use AI to create recipes from available ingredients
4. **Track Budget** - Monitor spending and stay within budget
5. **Update Shopping List** - Add items running low to your shopping list

### Key Features Usage

#### Barcode Scanning
- Navigate to Add Item page
- Click "Scan Barcode" button
- Allow camera access
- Point camera at product barcode
- Item details auto-populate

#### Receipt Scanning
- Go to Receipts page
- Click "Scan Receipt"
- Upload receipt image
- AI extracts items and adds to pantry
- Review and confirm

#### Recipe Generation
- Visit Recipes page
- Click "Generate Recipe"
- Select dietary preferences
- AI creates recipes from your pantry items
- Save favorites

## 🔑 Key Configuration

### Supabase Row Level Security (RLS)

All tables have RLS policies that ensure users can only access their own data:

\`\`\`sql
-- Example: Users can only see their own pantry items
CREATE POLICY "Users can view own items" ON pantry_items
  FOR SELECT USING (auth.uid() = user_id);
\`\`\`

### AI Model Configuration

The app uses Vercel AI SDK with:
- **Claude Sonnet 4.5** for vision tasks (receipt scanning)
- **GPT-4o-mini** for text generation (recipes, insights)

Models are configured in API routes under `app/api/`.

## 🐛 Troubleshooting

### Database Connection Issues

If you see "infinite recursion" errors:
\`\`\`bash
# Run the restoration script in Supabase SQL Editor:
scripts/101_complete_supabase_restoration.sql
\`\`\`

### Authentication Issues

1. Check environment variables are set correctly
2. Verify Supabase URL and keys
3. Ensure redirect URLs are configured in Supabase Auth settings

### Receipt Scanning Not Working

1. Check image is clear and well-lit
2. Ensure receipt text is readable
3. Verify AI Gateway configuration
4. Check console logs for API errors

### Barcode Scanner Not Opening

1. Allow camera permissions in browser
2. Use HTTPS (required for camera access)
3. Try a different browser if issues persist

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables
4. Deploy

### Environment Variables in Vercel

Add all Supabase environment variables in Vercel project settings under Environment Variables.

## 📝 Development

### Adding New Features

1. Create components in appropriate folder
2. Add API routes if needed
3. Update database schema with new SQL scripts
4. Test thoroughly before deployment

### Database Migrations

When adding new tables or columns:

1. Create a new numbered SQL script in `scripts/`
2. Test locally in Supabase
3. Document in README
4. Run on production after testing

## 🤝 Contributing

This is a personal project, but suggestions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is private and not licensed for public use.

## 🔗 Links

- **Live App**: [https://handypantry.vercel.app](https://handypantry.vercel.app)
- **Supabase**: [https://supabase.com](https://supabase.com)
- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review Supabase logs for database issues
3. Check browser console for client-side errors
4. Review API logs in Vercel dashboard

---

**Built with Next.js, and Supabase**
