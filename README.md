# AI Passive Income Navigator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**An AI-powered platform to discover, track, and manage passive income opportunities**

View and edit your app on [Base44.com](http://Base44.com)

## 📋 Documentation

### Core Documentation
- 📖 **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to this project
- 🏗️ **[Architecture](./ARCHITECTURE.md)** - System architecture and design decisions
- 🔌 **[API Documentation](./docs/API.md)** - API endpoints and usage
- 🚀 **[Deployment Guide](./docs/DEPLOYMENT.md)** - How to deploy the application
- 💻 **[Development Guide](./docs/DEVELOPMENT.md)** - Development setup and workflow
- 🧪 **[Testing Guide](./docs/TESTING.md)** - Testing strategies and best practices
- 🔧 **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions
- 🔒 **[Security Policy](./SECURITY.md)** - Security policies and reporting
- 📝 **[Changelog](./CHANGELOG.md)** - Version history and changes

### Product Documentation
**Important:** Before launching to production, please review the comprehensive audit and roadmap:

- 📊 **[PRODUCT_AUDIT.md](./PRODUCT_AUDIT.md)** - Complete technical and business audit
- 🗺️ **[PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md)** - 3-month roadmap to production
- 🔧 **[TECHNICAL_RECOMMENDATIONS.md](./TECHNICAL_RECOMMENDATIONS.md)** - Recommended tools and libraries
- 🚀 **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Quick start guide for immediate actions
- 🛡️ **[SECURITY_RECOMMENDATIONS.md](./SECURITY_RECOMMENDATIONS.md)** - Security best practices

## Features

- 🎯 **Idea Discovery** - Browse 30+ curated passive income opportunities
- 📁 **Portfolio Management** - Track and manage your income ideas
- 🔖 **Bookmarks** - Save favorite ideas for later
- 📊 **Dashboard** - Analytics and performance tracking
- 📈 **Market Trends** - AI-powered trend analysis
- 🤖 **AI Guide** - Personalized recommendations and insights
- 👥 **Community** - Share and discuss ideas with others

## 🚀 Getting Started

### Prerequisites 

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-passive-income-navigator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   VITE_BASE44_APP_ID=your_app_id
   VITE_BASE44_APP_BASE_URL=your_backend_url
   ```
   
   Example:
   ```bash
   VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
   VITE_BASE44_APP_BASE_URL=https://my-app.base44.app
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run typecheck` - Run TypeScript type checking

## 🔒 Security Notice

**⚠️ CRITICAL:** Before deploying to production:

1. Enable authentication in `src/api/base44Client.js` (set `requiresAuth: true`)
2. Fix security vulnerabilities: `npm audit fix`
3. Review the [PRODUCT_AUDIT.md](./PRODUCT_AUDIT.md) for all security concerns

## 🏗️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Base44 Platform
- **UI Components:** Radix UI, Shadcn/ui
- **State Management:** React Query (TanStack Query)
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod

## 📂 Project Structure

```
ai-passive-income-navigator/
├── src/
│   ├── api/              # API clients and configurations
│   ├── components/       # React components
│   │   ├── ai/          # AI chat components
│   │   ├── data/        # Data catalogs
│   │   ├── ideas/       # Idea-related components
│   │   ├── portfolio/   # Portfolio components
│   │   ├── ui/          # Reusable UI components
│   │   └── ...
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and helpers
│   ├── pages/           # Page components
│   └── utils/           # Utility functions
├── public/              # Static assets
├── PRODUCT_AUDIT.md     # Technical audit report
├── PRODUCT_ROADMAP.md   # Development roadmap
├── TECHNICAL_RECOMMENDATIONS.md
└── IMPLEMENTATION_GUIDE.md
```

## 🚀 Deployment

### Base44 Platform

Any changes pushed to the repository will be reflected in the Base44 Builder.

1. Commit and push your changes
2. Open [Base44.com](http://Base44.com)
3. Click on "Publish" to deploy

### Alternative Deployment (Vercel/Netlify)

See [TECHNICAL_RECOMMENDATIONS.md](./TECHNICAL_RECOMMENDATIONS.md) for deployment options.

## 🐛 Known Issues

See [PRODUCT_AUDIT.md](./PRODUCT_AUDIT.md) for a complete list of:
- Security vulnerabilities (11 npm packages)
- Missing features
- Technical debt
- Performance concerns

## 📊 Current Status

**Version:** 0.0.0 (Prototype)  
**Production Ready:** ❌ No  
**Test Coverage:** 0%  
**Security Issues:** 11 vulnerabilities

**Required before production:**
- Enable authentication
- Fix security vulnerabilities
- Add test coverage (minimum 40%)
- Implement monitoring/logging
- Add legal pages (Privacy Policy, Terms)

See [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md) for the 3-month plan to production.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Read the [Contributing Guide](./CONTRIBUTING.md)
2. Check the [Development Guide](./docs/DEVELOPMENT.md)
3. Review the [Product Roadmap](./PRODUCT_ROADMAP.md)
4. Create a feature branch
5. Make your changes
6. Run tests and linting
7. Submit a pull request

### Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 📚 Documentation & Support

- **Base44 Documentation:** [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)
- **Base44 Support:** [https://app.base44.com/support](https://app.base44.com/support)
- **Project Audit:** [PRODUCT_AUDIT.md](./PRODUCT_AUDIT.md)
- **Roadmap:** [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Base44 Platform](https://base44.com)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**⚠️ Important:** This application is currently in prototype stage. Please review all documentation before deploying to production.
