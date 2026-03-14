# AI Passive Income Navigator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**An AI-powered platform to discover, track, and manage passive income opportunities**

View and edit your app on [Base44.com](http://Base44.com)

## 📋 Documentation

All technical documentation lives in the **[docs/](./docs/)** directory, organized by topic.

| I want to... | Go to |
|---|---|
| Get started as a developer | [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) |
| Contribute to the project | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| Understand the architecture | [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) |
| Deploy the application | [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) |
| Use the API | [docs/API.md](./docs/API.md) |
| Write or run tests | [docs/TESTING.md](./docs/TESTING.md) |
| Fix a problem | [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) |
| Report a security issue | [SECURITY.md](./SECURITY.md) |
| Browse all docs | [docs/INDEX.md](./docs/INDEX.md) |

### Core Documentation
- 📖 **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to this project
- 🏗️ **[Architecture](./docs/ARCHITECTURE.md)** - System architecture and design decisions
- 🔌 **[API Documentation](./docs/API.md)** - API endpoints and usage
- 🚀 **[Deployment Guide](./docs/DEPLOYMENT.md)** - How to deploy the application
- 💻 **[Development Guide](./docs/DEVELOPMENT.md)** - Development setup and workflow
- 🧪 **[Testing Guide](./docs/TESTING.md)** - Testing strategies and best practices
- 🔧 **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions
- 🔒 **[Security Policy](./SECURITY.md)** - Security policies and reporting
- 📝 **[Changelog](./CHANGELOG.md)** - Version history and changes

### Product Documentation
**Important:** Before launching to production, please review the comprehensive audit and roadmap:

- 📊 **[Product Audit](./docs/product/PRODUCT_AUDIT.md)** - Complete technical and business audit
- 🗺️ **[Product Roadmap](./docs/product/PRODUCT_ROADMAP.md)** - 3-month roadmap to production
- 🔧 **[Technical Recommendations](./docs/TECHNICAL_RECOMMENDATIONS.md)** - Recommended tools and libraries
- 🚀 **[Implementation Guide](./docs/product/IMPLEMENTATION_GUIDE.md)** - Quick start guide for immediate actions
- 🛡️ **[Security Recommendations](./docs/security/SECURITY_RECOMMENDATIONS.md)** - Security best practices

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
3. Review the [Product Audit](./docs/product/PRODUCT_AUDIT.md) for all security concerns

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
└── docs/
    ├── ARCHITECTURE.md       # System architecture
    ├── API.md                # API reference
    ├── DEVELOPMENT.md        # Developer guide
    ├── DEPLOYMENT.md         # Deployment guide
    ├── TESTING.md            # Testing guide
    ├── TROUBLESHOOTING.md    # Troubleshooting
    ├── TECHNICAL_RECOMMENDATIONS.md
    ├── architecture/         # Architecture decisions & data model
    ├── api/                  # Detailed API & error-handling docs
    ├── operations/           # Runbooks, monitoring, DR
    ├── security/             # Incident response, recommendations
    ├── legal/                # Privacy policy, terms of service
    ├── features/             # Feature-level documentation
    ├── product/              # Product audit, roadmap, guides
    └── audits/               # Audit reports & refactoring notes
```

## 🚀 Deployment

### Base44 Platform

Any changes pushed to the repository will be reflected in the Base44 Builder.

1. Commit and push your changes
2. Open [Base44.com](http://Base44.com)
3. Click on "Publish" to deploy

### Alternative Deployment (Vercel/Netlify)

See [Technical Recommendations](./docs/TECHNICAL_RECOMMENDATIONS.md) for deployment options.

## 🐛 Known Issues

See [Product Audit](./docs/product/PRODUCT_AUDIT.md) for a complete list of:
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

See [Product Roadmap](./docs/product/PRODUCT_ROADMAP.md) for the 3-month plan to production.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Read the [Contributing Guide](./CONTRIBUTING.md)
2. Check the [Development Guide](./docs/DEVELOPMENT.md)
3. Review the [Product Roadmap](./docs/product/PRODUCT_ROADMAP.md)
4. Create a feature branch
5. Make your changes
6. Run tests and linting
7. Submit a pull request

### Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 📚 Documentation & Support

- **Base44 Documentation:** [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)
- **Base44 Support:** [https://app.base44.com/support](https://app.base44.com/support)
- **Project Audit:** [docs/product/PRODUCT_AUDIT.md](./docs/product/PRODUCT_AUDIT.md)
- **Roadmap:** [docs/product/PRODUCT_ROADMAP.md](./docs/product/PRODUCT_ROADMAP.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Base44 Platform](https://base44.com)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**⚠️ Important:** This application is currently in prototype stage. Please review all documentation before deploying to production.
