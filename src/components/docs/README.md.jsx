# FlashFusion - AI-Powered Deal Discovery Platform

**Version:** 1.0.0  
**Last Updated:** January 2026

## Overview

FlashFusion is a production-grade, full-stack deal discovery and validation platform that helps passive income builders find, analyze, and validate investment opportunities in 2 minutes instead of 2 months. The platform leverages AI to scan 50+ deal platforms daily, match opportunities to user preferences, and provide deep due diligence.

### Core Value Proposition
- **Deal Discovery**: AI-sourced passive income opportunities from 50+ platforms
- **Smart Matching**: Intelligent matching to user risk profiles and preferences
- **Due Diligence**: Automated validation, scenario modeling, and risk assessment
- **Adaptive Learning**: AI that learns from user feedback to improve matching

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Features](#core-features)
5. [Data Models](#data-models)
6. [API Reference](#api-reference)
7. [Security & Compliance](#security--compliance)
8. [Performance & Scalability](#performance--scalability)
9. [Deployment](#deployment)
10. [Testing Strategy](#testing-strategy)
11. [Contributing Guidelines](#contributing-guidelines)
12. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  React 18 + TailwindCSS + Framer Motion + React Query       │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                   Base44 BaaS Platform                       │
│  • Authentication & Authorization                            │
│  • Entity Management (Database)                              │
│  • Real-time Subscriptions                                   │
│  • File Storage                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                    Backend Functions Layer                   │
│  Deno-based serverless functions for:                        │
│  • AI Deal Sourcing & Analysis                               │
│  • Due Diligence Processing                                  │
│  • Machine Learning & Feedback Loop                          │
│  • Integration with External APIs                            │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                   External Integrations                      │
│  • OpenAI / Anthropic (AI Analysis)                          │
│  • Deal Platforms APIs (Data Sourcing)                       │
│  • Perplexity (Market Research)                              │
│  • Firecrawl (Web Scraping)                                  │
└─────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Modular Architecture**: Components are self-contained, reusable, and follow single responsibility
2. **Separation of Concerns**: Clear boundaries between UI, business logic, and data layers
3. **API-First Design**: Backend functions expose well-defined interfaces
4. **Progressive Enhancement**: Core features work without JavaScript, enhanced with it
5. **Security by Default**: Authentication, authorization, and data validation at every layer

---

## Technology Stack

### Frontend
- **Framework**: React 18.2 (hooks, context, suspense)
- **Styling**: TailwindCSS 3.x + Custom design system
- **UI Components**: Radix UI (accessible, composable primitives)
- **Animations**: Framer Motion 11.x
- **State Management**: TanStack React Query 5.x (server state)
- **Routing**: React Router DOM 6.x
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts 2.x

### Backend
- **Runtime**: Deno (secure, modern JavaScript/TypeScript runtime)
- **BaaS**: Base44 Platform (authentication, database, storage, real-time)
- **AI/ML**: OpenAI GPT-4, Anthropic Claude, Perplexity
- **Data Processing**: Custom serverless functions

### Infrastructure
- **Hosting**: Base44 Cloud (automatic scaling, CDN)
- **Database**: Base44 Entity Store (NoSQL, auto-indexed)
- **File Storage**: Base44 Storage (encrypted, versioned)
- **Authentication**: Base44 Auth (JWT, role-based access)

---

## Project Structure

```
flashfusion/
├── components/              # Reusable React components
│   ├── ui/                 # Base UI components (Button, Card, etc.)
│   ├── deals/              # Deal-specific components
│   ├── ai/                 # AI-powered features
│   ├── onboarding/         # User onboarding flows
│   ├── guidance/           # Contextual help system
│   └── seo/                # SEO optimization
├── pages/                  # Route-level components
│   ├── Home.js            # Landing/discovery page
│   ├── AICoach.js         # AI-powered deal analysis
│   ├── UserPreferences.js # Preference management
│   ├── DealPipeline.js    # Deal tracking CRM
│   └── Community.js       # User collaboration
├── entities/               # Data model schemas (JSON)
│   ├── SourcedDealOpportunity.json
│   ├── UserPreferences.json
│   ├── AIDealsUserFeedback.json
│   └── ...
├── functions/              # Backend serverless functions
│   ├── proactivelySourceDeals.js
│   ├── performDealDueDiligence.js
│   ├── learnFromUserFeedback.js
│   └── ...
├── agents/                 # AI agent configurations
│   └── ai_assistant.json
├── components/docs/        # Documentation
│   ├── README.md          # This file
│   ├── ARCHITECTURE.md    # Detailed architecture
│   ├── API.md             # API reference
│   └── CONTRIBUTING.md    # Contribution guide
├── Layout.js              # App-wide layout wrapper
└── globals.css            # Global styles + design tokens
```

### Component Organization Best Practices

1. **Atomic Design**: Components organized by complexity (atoms → molecules → organisms)
2. **Feature-Based**: Group related components in feature folders
3. **Single Responsibility**: Each component does one thing well
4. **Composition over Inheritance**: Build complex UIs by composing simple components
5. **Props Typing**: Use JSDoc or TypeScript for prop documentation

---

## Core Features

### 1. AI Deal Sourcing
**Location**: `functions/proactivelySourceDeals.js`

Automatically scans 50+ deal platforms daily, extracts deal data, and creates `SourcedDealOpportunity` records.

**Key Capabilities**:
- Multi-platform scraping and API integration
- Intelligent deal extraction and normalization
- Duplicate detection and deduplication
- Match score calculation based on user preferences

### 2. Due Diligence AI
**Location**: `functions/performDealDueDiligence.js`

Deep analysis of individual deals using AI.

**Analyzes**:
- Actionable steps from "how to pursue"
- Red flags and warning signs
- Risk mitigation strategies
- Viability summary and key differentiators

### 3. Adaptive Learning System
**Location**: `functions/learnFromUserFeedback.js`

Machine learning system that improves deal matching based on user behavior.

**Learning From**:
- Explicit feedback (good/bad match ratings)
- Implicit signals (saved vs dismissed deals)
- Historical patterns and preferences
- Industry and structure preferences

### 4. User Preference Management
**Location**: `pages/UserPreferences.js`

Comprehensive preference configuration for personalized deal matching.

**Configurable Parameters**:
- Risk tolerance (5 levels)
- Investment size range ($min - $max)
- Target industries (multi-select)
- Preferred deal structures
- Target return percentage
- Time horizon and diversification

### 5. Deal Feed & Discovery
**Location**: `components/deals/NewDealsFeed.jsx`

Primary interface for discovering and interacting with deals.

**Features**:
- Real-time deal feed with filtering
- One-click AI due diligence
- Save to pipeline or dismiss
- Feedback mechanism for AI learning
- Match score visualization

---

## Data Models

### SourcedDealOpportunity

The core entity representing a deal opportunity.

**Key Fields**:
- `title`, `industry`, `summary`, `description`: Basic info
- `estimated_roi`, `time_to_roi`, `risk_score`: Financial metrics
- `match_score`: AI-calculated fit (0-100)
- `key_opportunities`, `key_risks`: Arrays of strings
- `dd_actionable_steps`, `dd_red_flags`: AI due diligence results
- `dd_risk_mitigation`: Risk mitigation strategies
- `dd_viability_summary`: AI-generated viability assessment

**Status Lifecycle**:
```
pending → accepted (saved to pipeline)
       → dismissed (not interested)
       → in_progress (actively pursuing)
```

### UserPreferences

User's deal matching preferences.

**Key Fields**:
- `risk_tolerance`: very_conservative | conservative | moderate | aggressive | very_aggressive
- `investment_size_min`, `investment_size_max`: Number (USD)
- `target_industries`: Array of strings
- `preferred_deal_structures`: Array of strings
- `target_return_percentage`: Number (%)
- `time_horizon`: short_term | medium_term | long_term
- `diversification_preference`: focused | moderately_diversified | highly_diversified

### AIDealsUserFeedback

Tracks user feedback for machine learning.

**Key Fields**:
- `deal_id`, `deal_title`: Reference to the deal
- `action`: saved | dismissed | good_match | bad_match
- `feedback_type`: good | bad
- `feedback_reasons`: Array of predefined reasons
- `custom_feedback`: Free-text user input
- `match_score`: Score at time of feedback
- `deal_metadata`: Deal characteristics snapshot

---

## For Complete Documentation

This is a comprehensive overview. For detailed documentation on specific topics, see:

- **Architecture**: `components/docs/ARCHITECTURE.md` - Deep dive into system design
- **API Reference**: `components/docs/API.md` - Complete API documentation
- **Contributing**: `components/docs/CONTRIBUTING.md` - Developer guidelines
- **Brand Guide**: `components/docs/BrandGuide.jsx` - Design system and branding

---

**Maintained by**: FlashFusion Engineering Team  
**License**: Proprietary  
**Last Review**: January 19, 2026