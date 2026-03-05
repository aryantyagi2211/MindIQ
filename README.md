# 🧠 MindIQ - AI-Powered Cognitive Assessment Platform

An advanced cognitive assessment platform that uses AI to generate unique questions, evaluate 5 cognitive dimensions, and provide deep psychological insights. Features include personalized assessments, real-time 1v1 battles, and global rankings.

## 🌟 Features

### 📝 AI Paper Assessment System
- **15 Unique MCQ Questions** per test with real-world case study scenarios
- **5 Cognitive Dimensions Scoring**:
  - Logic (deductive/inductive reasoning)
  - Creativity (novel thinking)
  - Intuition (pattern recognition)
  - Emotional Intelligence (empathy/ethics)
  - Systems Thinking (interconnected consequences)
- **AI-Generated Questions** using Groq LLaMA 3.3 70B
- **Deep Archetype Reports** with famous mind matches
- **Global Ranking System** with percentile tracking
- **Beautiful Futuristic UI** with neural-themed design

### ⚔️ 1v1 Battle Arena
- **Real-time Matchmaking** with online player counter
- **Fair Competition** - same questions for both players
- **Enhanced Player Cards** showing stats and expertise
- **Live Battle System** with automatic winner determination
- **Question-by-Question Breakdown** in results

### 🎨 User Experience
- Responsive design for all devices
- Smooth animations and transitions
- Timer with color coding
- Auto-advance on answer selection
- Social sharing capabilities (1080x1080 exports)

## 🚀 Quick Start

### Prerequisites
- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Groq API Key ([get from console.groq.com](https://console.groq.com))
- Supabase account (project already configured)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/aryantyagi2211/mind-ranker.git
cd mind-ranker-main
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

The `.env` file is already set up. You only need to add your Groq API key:

```env
GROQ_API_KEY="your_groq_api_key_here"
```

4. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:5173` to see the app running!

## 🔧 Deployment

### Deploy Edge Functions to Supabase

#### Option A: Via Lovable (Recommended)
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```
Lovable will automatically deploy in 2-3 minutes.

#### Option B: Via Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref vertjjkacwtfjliwckrf

# Deploy functions
supabase functions deploy generate-questions
supabase functions deploy score-answers
```

### Configure Groq API Key in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/vertjjkacwtfjliwckrf)
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Add secret:
   - Name: `GROQ_API_KEY`
   - Value: Your Groq API key
4. Click **Save**

## 📊 How It Works

### Assessment Flow

1. **Setup** - User selects qualification, difficulty, and subject
2. **Generation** - AI generates 15 unique case-study MCQs (3-5 seconds)
3. **Test Taking** - User answers questions with timer (25-35 minutes)
4. **Scoring** - AI evaluates 5 cognitive dimensions (4-6 seconds)
5. **Results** - Display scores, archetype report, and global ranking

### Battle Flow

1. **Matchmaking** - Find opponent in same field (30 second timeout)
2. **Question Generation** - First player generates questions for both
3. **Battle** - Both players answer same 10 questions independently
4. **Results** - Automatic winner determination and breakdown

### Architecture

```
Frontend (React + TypeScript + Vite)
    ↓
Supabase Edge Functions (Deno)
    ↓
Groq API (LLaMA 3.3 70B)
    ↓
Supabase Database (PostgreSQL)
```

## 💰 Cost & Performance

### Pricing
- **Groq API**: ~$0.002 per test (extremely affordable!)
- **Supabase**: Free tier includes 500K function invocations/month
- **Total**: Essentially free for initial launch

### Performance
- Question generation: 3-5 seconds
- Scoring: 4-6 seconds
- Test duration: 25-35 minutes
- Battle duration: 15-20 minutes

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Backend**: Supabase (PostgreSQL, Edge Functions, Realtime)
- **AI**: Groq API (LLaMA 3.3 70B)
- **Animations**: Framer Motion
- **Routing**: React Router v6
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod

## 📁 Project Structure

```
mind-ranker-main/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Main application pages
│   │   ├── TestSetup.tsx    # Assessment configuration
│   │   ├── TestTake.tsx     # Question interface
│   │   ├── TestResult.tsx   # Results display
│   │   └── BattleArena.tsx  # 1v1 battle system
│   ├── lib/              # Utilities and constants
│   └── integrations/     # Supabase client
├── supabase/
│   ├── functions/
│   │   ├── generate-questions/  # AI question generation
│   │   └── score-answers/       # AI scoring system
│   └── migrations/       # Database schema
├── .env                  # Environment variables
└── package.json         # Dependencies
```

## 🎯 Key Features Explained

### AI Question Generation
- Uses advanced prompt engineering for high-quality questions
- Each question includes a 3-5 sentence real-world scenario
- Questions distributed across 5 cognitive dimensions
- Difficulty adapts to user's qualification level
- No repeated questions (unique every time)

### 5-Dimension Scoring
- **Logic**: Analyzes cause-effect reasoning and logical fallacies
- **Creativity**: Evaluates novel thinking and ambiguous scenarios
- **Intuition**: Measures pattern recognition and quick decisions
- **Emotional Intelligence**: Assesses empathy and ethical reasoning
- **Systems Thinking**: Tests understanding of interconnected consequences

### Battle System
- Fair competition with identical questions
- Real-time matchmaking based on field/subfield
- Independent answering (no interference)
- Automatic scoring and winner determination
- Detailed answer breakdown

## 🐛 Troubleshooting

### "Failed to generate questions"
- Check if `GROQ_API_KEY` is set in Supabase secrets
- Verify Groq API key is valid and has credits
- Check Supabase function logs for errors

### Functions not found
- Wait 1-2 minutes after deployment
- Refresh the page
- Check Lovable dashboard for deployment status

### Questions not loading
- Open browser console for errors
- Verify API key is correct
- Check Groq dashboard for API status

### CORS errors
- Functions include CORS headers by default
- Verify Supabase URL in `.env` is correct
- Check browser console for specific error

## 📈 Monitoring

### Supabase Function Logs
1. Go to Supabase Dashboard
2. Navigate to **Edge Functions** → **Logs**
3. Select function to view logs
4. Filter by time range and log level

### Groq API Usage
1. Go to [Groq Console](https://console.groq.com)
2. Check **Usage** section
3. Monitor API calls and token usage
4. Set up billing alerts

## 🔒 Security

- API keys stored server-side only (never exposed to client)
- Supabase Row Level Security (RLS) enabled
- User authentication required for all operations
- Input validation on all edge functions
- Rate limiting via Groq API

## 🚀 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test            # Run tests once
npm run test:watch  # Run tests in watch mode
```

## 📝 Environment Variables

```env
# Supabase Configuration (already set)
VITE_SUPABASE_URL=https://vertjjkacwtfjliwckrf.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Groq API (add your key)
GROQ_API_KEY=your_groq_api_key_here
```

## 🎨 Customization

### Modify Question Generation
Edit `supabase/functions/generate-questions/index.ts`:
- Adjust temperature for creativity (0.7-1.0)
- Change number of questions
- Modify prompt for different question styles

### Modify Scoring Criteria
Edit `supabase/functions/score-answers/index.ts`:
- Adjust dimension weights
- Change scoring algorithm
- Customize archetype reports

### Customize UI
- Edit Tailwind config in `tailwind.config.ts`
- Modify components in `src/components/`
- Update theme colors and animations

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- AI powered by [Groq](https://groq.com)
- Backend by [Supabase](https://supabase.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review Supabase function logs
- Check Groq API status
- Open an issue on GitHub

## 🎉 Ready to Launch!

Your MindIQ platform is production-ready with:
- ✅ AI-powered question generation
- ✅ 5-dimension cognitive scoring
- ✅ Real-time 1v1 battles
- ✅ Global ranking system
- ✅ Beautiful futuristic UI
- ✅ Comprehensive documentation

**Start ranking minds today!** 🧠⚡🚀

---

**GitHub**: https://github.com/aryantyagi2211/mind-ranker.git  
**Platform**: Lovable.dev  
**Status**: ✅ Production Ready
