// Onboarding flow configuration exported as module
export const ONBOARDING_CONFIG = {
  name: "OnboardingFlow",
  description: "Multi-path onboarding configuration with full wizard and quick start options",
  paths: {
    quick_start: {
      name: "Quick Start",
      description: "5-minute essential setup",
      duration_minutes: 5,
      steps: [1, 2, 6],
      skip_review: false,
      unlocks_app_immediately: false
    },
    full_wizard: {
      name: "Full Setup",
      description: "Comprehensive personalization (15-20 min)",
      duration_minutes: 20,
      steps: [0, 1, 2, 3, 4, 5, 6, 7],
      skip_review: false,
      unlocks_app_immediately: false
    }
  },
  steps: [
    {
      id: 0,
      name: "Welcome",
      type: "intro",
      title: "Welcome to FlashFusion",
      description: "AI-powered deal sourcing and portfolio management platform",
      component: "WelcomeStep",
      duration_seconds: 30,
      skippable: false,
      includes: {
        value_proposition: true,
        platform_overview: true,
        path_selection: true
      },
      quick_start_skip: false
    },
    {
      id: 1,
      name: "Deal Sourcing",
      type: "preferences",
      title: "Your Deal Preferences",
      description: "Help us find opportunities that match your goals",
      component: "DealSourcingStep",
      fields: [
        {
          name: "industries",
          type: "multi_select",
          label: "Industries of Interest",
          examples: ["SaaS", "E-commerce", "Content", "Service Business"],
          required: true,
          tooltip: "We'll source deals matching your interests"
        },
        {
          name: "ticket_size",
          type: "range_slider",
          label: "Investment Size Range",
          min: 5000,
          max: 1000000,
          step: 10000,
          currency: "USD",
          required: true
        },
        {
          name: "deal_structures",
          type: "multi_select",
          label: "Deal Structures",
          options: ["Equity", "Revenue Share", "Licensing", "Partnership"],
          required: true
        },
        {
          name: "geographies",
          type: "multi_select",
          label: "Geographic Focus",
          examples: ["US", "EU", "Asia", "Remote"],
          required: false
        },
        {
          name: "risk_tolerance",
          type: "single_select",
          label: "Risk Tolerance",
          options: ["Low - Proven models", "Medium - Balanced", "High - Emerging opportunities"],
          required: true
        }
      ],
      duration_seconds: 180,
      skippable: true
    },
    {
      id: 2,
      name: "Portfolio Goals",
      type: "preferences",
      title: "Portfolio & Financial Goals",
      description: "Set expectations and tailor recommendations",
      component: "PortfolioGoalsStep",
      fields: [
        {
          name: "time_horizon",
          type: "single_select",
          label: "Investment Time Horizon",
          options: ["1-2 years", "3-5 years", "5+ years"],
          required: true,
          tooltip: "How long do you plan to hold investments?"
        },
        {
          name: "annual_return_target",
          type: "single_select",
          label: "Target Annual Return",
          options: ["10-20%", "20-50%", "50%+"],
          required: true
        },
        {
          name: "diversification_preference",
          type: "radio",
          label: "Portfolio Approach",
          options: ["Focused (2-3 deals)", "Balanced (5-8 deals)", "Diversified (10+ deals)"],
          required: true
        },
        {
          name: "asset_classes",
          type: "multi_select",
          label: "Asset Class Preferences",
          options: ["Websites/Apps", "Services", "Real Estate", "Content", "Other"],
          required: false
        }
      ],
      duration_seconds: 180,
      skippable: true
    },
    {
      id: 3,
      name: "Community & Collaboration",
      type: "preferences",
      title: "Community Preferences",
      description: "Connect with other investors and learners",
      component: "CommunityStep",
      fields: [
        {
          name: "collaboration_interest",
          type: "radio",
          label: "I'm most interested in",
          options: ["Networking with other investors", "Learning from experts", "Both equally"],
          required: true
        },
        {
          name: "profile_visibility",
          type: "radio",
          label: "Profile Visibility",
          options: ["Public (discoverable)", "Network Only (peers)", "Private (just me)"],
          required: true,
          default: "network_only"
        },
        {
          name: "notification_frequency",
          type: "single_select",
          label: "Community Updates",
          options: ["Real-time", "Daily digest", "Weekly", "None"],
          required: false,
          default: "weekly"
        }
      ],
      duration_seconds: 120,
      skippable: true
    },
    {
      id: 6,
      name: "Review & Confirm",
      type: "review",
      title: "Review Your Setup",
      description: "Confirm your preferences before entering the app",
      component: "ReviewStep",
      show_summary: true,
      allow_edits: true,
      duration_seconds: 120,
      skippable: false
    }
  ],
  tutorials: {
    quick_tour: {
      name: "Platform Quick Tour",
      duration_seconds: 30,
      steps: [
        {
          target: "nav_portfolio",
          title: "Your Portfolio",
          description: "Track deals and investment ideas here",
          position: "bottom"
        },
        {
          target: "nav_ai_coach",
          title: "AI Investment Coach",
          description: "Get personalized deal recommendations and insights",
          position: "bottom"
        },
        {
          target: "nav_community",
          title: "Community",
          description: "Connect with other investors and experts",
          position: "bottom"
        }
      ]
    },
    creating_deal: {
      name: "Adding Your First Deal",
      duration_seconds: 120,
      trigger: {
        event: "first_portfolio_access",
        condition: "no_ideas_yet"
      },
      steps: [
        {
          target: "portfolio_add_button",
          title: "Start Here",
          description: "Click to add a new deal or idea"
        },
        {
          target: "portfolio_form_title",
          title: "Deal Title",
          description: "Give your deal a clear name"
        },
        {
          target: "portfolio_form_analysis",
          title: "AI Analysis",
          description: "We'll analyze the opportunity for you"
        }
      ]
    },
    deal_discovery: {
      name: "Discovering Deals",
      duration_seconds: 90,
      trigger: {
        event: "first_home_access",
        condition: "no_deals_viewed"
      },
      steps: [
        {
          target: "home_search_bar",
          title: "Search Deals",
          description: "Find opportunities matching your criteria"
        },
        {
          target: "home_deal_card",
          title: "Deal Overview",
          description: "Quick snapshot with AI match score"
        },
        {
          target: "home_save_button",
          title: "Save for Later",
          description: "Bookmark deals you're interested in"
        }
      ]
    }
  },
  nudge_triggers: [
    {
      id: "high_risk_deals",
      name: "High Risk Deals Prompt",
      condition: "risk_tolerance === 'high' && days_since_onboarding < 7",
      message: "You set a high risk tolerance. Want to explore these emerging opportunities?",
      action_label: "Show me deals",
      target_page: "Home"
    },
    {
      id: "incomplete_portfolio_goals",
      name: "Complete Portfolio Setup",
      condition: "skipped_steps.includes(2) && deals_saved > 0",
      message: "Setting portfolio goals improves our AI recommendations. Take 2 minutes?",
      action_label: "Complete setup",
      target_page: "ProfileSettings"
    },
    {
      id: "community_matching",
      name: "Peer Group Suggestion",
      condition: "skipped_steps.includes(3) && activity_score > 5",
      message: "Users like you often join this investment group. Check it out?",
      action_label: "View group",
      target_page: "Community"
    },
    {
      id: "first_deal_saved",
      name: "First Deal Saved Celebration",
      condition: "first_deal_saved_at !== null && !nudge_shown('first_deal_saved')",
      message: "Great start! Want AI to analyze this deal deeper?",
      action_label: "Analyze",
      target_page: "Portfolio"
    },
    {
      id: "inactive_user",
      name: "Re-engagement",
      condition: "days_since_last_activity > 7 && onboarding_completed",
      message: "New deals matching your interests just dropped. Check them out?",
      action_label: "Browse deals",
      target_page: "Home"
    }
  ]
};

export default ONBOARDING_CONFIG;