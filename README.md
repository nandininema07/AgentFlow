# AgentFlow

**Autonomous AI Agent Marketplace** - The revolutionary platform where anyone can create powerful AI agents using just natural language prompts - no coding required!

## ✨ What Makes AgentFlow Unique

**Natural Language Agent Creation** - Simply describe what you want your agent to do in plain English, and AgentFlow builds it for you instantly

**Always-On Autonomous Agents** - Your agents work 24/7 without any supervision, completing tasks continuously while you sleep

**Intelligent Chatbot Interface** - Ask about your agents' actions and performance in natural language - get instant insights and updates

**Voice Call Updates** - Receive real-time updates about your agents' activities through automated phone calls

**Agent Marketplace** - Discover and use agent templates created by the community, or keep your premium agents private

## Overview

AgentFlow revolutionizes business automation by making AI agent creation accessible to everyone. No technical expertise needed - just tell us what you want, and watch your autonomous agents handle SEO optimization, competitor monitoring, product recommendations, social media content creation, and more.

Check out the [Demo Video](https://youtu.be/9vzwt6VrFLQ?si=Ci23DGt1QJOtiMPf) to see how it works!

## Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with Python
- **Key Components**:
  - Agent controllers and services
  - Task scheduling and management
  - File upload and processing
  - RESTful API endpoints

### Frontend (Next.js)
- **Framework**: Next.js 14 with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS
- **Workflow Visualization**: React Flow for interactive agent workflow management
- **Features**: Modern dashboard interface, form handling, real-time updates, chatbot integration

## 🛠️ Tech Stack

### Backend
- **Python 3.x** with FastAPI
- **Pydantic** for data validation
- **AsyncIO** for asynchronous operations
- **Colorlog** for enhanced logging
- **CORS** middleware for cross-origin requests

### Frontend
- **Next.js 14** with TypeScript
- **React** with modern hooks
- **React Flow** for visual workflow and agent management
- **Radix UI** component library
- **Tailwind CSS** for styling
- **React Hook Form** for form management

## Core Features

### Natural Language Agent Builder
- **Zero-Code Creation** - Describe your agent in plain English
- **Instant Deployment** - Your agent goes live immediately after creation
- **Smart Understanding** - AI interprets your requirements and builds the perfect agent

### Autonomous Agent Types
1. **SEO Optimizer** - Continuously optimize content for search engines
2. **Competitor Watchdog** - Monitor competitor activities around the clock
3. **Product Recommendation Engine** - Generate personalized recommendations 24/7
4. **Social Media Manager** - Create and schedule content across platforms automatically

### Always-Active Operations
- **24/7 Execution** - Agents never sleep, never take breaks
- **Self-Managing** - No supervision or intervention required
- **Continuous Learning** - Agents improve performance over time
- **Real-time Adaptation** - Automatically adjust to changing conditions

### Communication & Monitoring
- **Natural Language Chatbot** - Ask questions about your agents' performance and get instant answers
- **Voice Call Updates** - Receive automated phone calls with agent status updates
- **Real-time Dashboard** - Visual workflow management with React Flow
- **Intelligent Insights** - Get actionable insights about your agents' activities

### Marketplace & Business Model
- **Free Tier** - Access community agent templates in the marketplace
- **Premium Tier** - Keep your custom agents private and exclusive
- **Template Sharing** - Contribute to the community and discover new agent ideas

## Getting Started

### For Users (No Technical Skills Required)
1. **Sign Up** - Create your AgentFlow account
2. **Describe Your Agent** - Tell us what you want your agent to do in natural language
3. **Deploy & Forget** - Your agent starts working immediately and continues 24/7
4. **Monitor Results** - Check your dashboard to see what your agents have accomplished

### For Developers

#### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Start the backend server:
```bash
python main.py
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The frontend will be available at `http://localhost:3000`

## Project Structure

```
AgentFlow/
├── backend/
│   ├── api/                    # API controllers and services
│   │   ├── agent_controller.py
│   │   ├── agent_service.py
│   │   ├── generate_controller.py
│   │   └── ...
│   ├── tasks/                  # Task implementations
│   ├── utils/                  # Utility functions
│   ├── models.py              # Pydantic data models
│   ├── main.py                # FastAPI application entry point
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── app/                   # Next.js app directory
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   ├── styles/                # CSS styles
│   └── package.json           # Node.js dependencies
└── README.md
```

## Configuration

### Backend Configuration
- Environment variables in `.env` file
- CORS settings for cross-origin requests
- Logging configuration with colored output

### Frontend Configuration
- Next.js configuration in `next.config.mjs`
- Tailwind CSS configuration in `tailwind.config.ts`
- TypeScript configuration in `tsconfig.json`

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation powered by FastAPI's automatic OpenAPI generation.

### Key Endpoints
- `/agents` - Agent management
- `/tasks` - Task creation and scheduling
- `/files` - File upload and management
- `/generate` - Content generation

## Contributors

- [Sujal Choudhari](https://github.com/SujalChoudhari)
- [Nandini Nema](https://github.com/nandininema07)
- [Pranay Khandagle](https://github.com/Pranay13257)