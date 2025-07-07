# Diaritas - RPG Life Tracker

A gamified life tracking web application that turns your daily activities into RPG-style character progression.

## Features

- **Daily Reflection**: Track your daily activities and see how they impact your character attributes
- **10 Life Attributes**: Vitality, Discipline, Creativity, Curiosity, Empathy, Sociality, Resilience, Courage, Wisdom, and Integrity
- **Character Progression**: Watch your attributes grow based on your real-life activities
- **Token System**: Earn tokens through daily activities and streaks
- **Visual Analytics**: Beautiful radar charts and progress bars to visualize your growth
- **Character Setup**: Create your unique character to begin your journey

## Getting Started

### Prerequisites

- Node.js 18+ 
- OpenAI API key (for AI-powered activity analysis)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Add your OpenAI API key to `.env.local`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

1. **Create Your Character**: Start by giving your character a name
2. **Daily Reflections**: Write about your daily activities and experiences
3. **AI Analysis**: Our AI analyzes your input and determines how it affects your 10 life attributes
4. **Character Growth**: Watch your character's attributes improve based on your real-life actions
5. **Track Progress**: View your journey through detailed analytics and history

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI GPT-4
- **Storage**: Browser localStorage
- **Icons**: Lucide React

## Deployment

This app is optimized for deployment on platforms like Vercel, Netlify, or any hosting service that supports Next.js.

For Vercel deployment:
1. Connect your repository to Vercel
2. Add your `OPENAI_API_KEY` environment variable in the Vercel dashboard
3. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.