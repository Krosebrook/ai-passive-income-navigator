// Post-onboarding activation flow configuration
export const ACTIVATION_CONFIG = {
  name: "PostOnboardingActivation",
  description: "Adaptive activation system for first moment of value (FMV)",

  // Activation milestone definitions
  milestones: {
    first_deal_viewed: {
      id: "first_deal_viewed",
      name: "First Deal Viewed",
      description: "User views a deal matching their criteria",
      weight: 1,
      is_primary: true
    },
    first_deal_saved: {
      id: "first_deal_saved",
      name: "First Deal Saved",
      description: "User saves/bookmarks a deal",
      weight: 2,
      is_primary: true
    },
    portfolio_goal_configured: {
      id: "portfolio_goal_configured",
      name: "Portfolio Goals Set",
      description: "User configures portfolio goals or metrics",
      weight: 2,
      is_primary: true
    },
    community_interaction: {
      id: "community_interaction",
      name: "Community Engagement",
      description: "User joins group, follows expert, or views discussion",
      weight: 1,
      is_primary: true
    }
  },

  // Activation paths - chosen based on onboarding preferences
  paths: {
    deal_first: {
      id: "deal_first",
      name: "Deal-First Path",
      description: "For users excited about deal sourcing",
      trigger_conditions: {
        strong_deal_preferences: true,
        high_investment_amount: true,
        clear_industries_selected: true
      },
      primary_milestone: "first_deal_saved",
      secondary_milestones: ["first_deal_viewed"],
      nice_to_have: ["portfolio_goal_configured"],
      duration_days: 7,
      steps: [
        {
          id: "deal_first_explore",
          name: "Explore Deals",
          description: "Browse 3-5 AI-personalized deals",
          component: "DealExplorationGuide",
          success_metric: "3+ deals viewed",
          duration_seconds: 300
        },
        {
          id: "deal_first_save",
          name: "Save Your First Deal",
          description: "Bookmark one deal you'd investigate further",
          component: "DealSaveGuide",
          success_metric: "1+ deals saved",
          duration_seconds: 120
        },
        {
          id: "deal_first_understand",
          name: "Why This Deal?",
          description: "See personalized match explanation",
          component: "MatchExplanationGuide",
          success_metric: "Viewed match score explanation",
          duration_seconds: 60
        }
      ]
    },

    portfolio_first: {
      id: "portfolio_first",
      name: "Portfolio-First Path",
      description: "For users focused on goal-setting and returns",
      trigger_conditions: {
        high_return_target: true,
        clear_time_horizon: true,
        portfolio_goals_emphasized: true
      },
      primary_milestone: "portfolio_goal_configured",
      secondary_milestones: ["first_deal_viewed"],
      nice_to_have: ["community_interaction"],
      duration_days: 7,
      steps: [
        {
          id: "portfolio_first_review",
          name: "Review Goals",
          description: "Configure or refine portfolio target and strategy",
          component: "PortfolioGoalReviewGuide",
          success_metric: "Goals configured",
          duration_seconds: 180
        },
        {
          id: "portfolio_first_projection",
          name: "See Projections",
          description: "View how deals map to your return targets",
          component: "ProjectionGuide",
          success_metric: "Viewed projection",
          duration_seconds: 120
        },
        {
          id: "portfolio_first_deal_connect",
          name: "Browse Aligned Deals",
          description: "Find deals that fit your financial targets",
          component: "AlignedDealsGuide",
          success_metric: "Viewed aligned deals",
          duration_seconds: 240
        }
      ]
    },

    community_first: {
      id: "community_first",
      name: "Community-First Path",
      description: "For users wanting to learn and network",
      trigger_conditions: {
        networking_emphasized: true,
        learning_emphasized: true,
        collaborative_style: true
      },
      primary_milestone: "community_interaction",
      secondary_milestones: ["first_deal_viewed"],
      nice_to_have: ["portfolio_goal_configured"],
      duration_days: 7,
      steps: [
        {
          id: "community_first_discover",
          name: "Discover Communities",
          description: "Browse groups and expert profiles relevant to you",
          component: "CommunityDiscoveryGuide",
          success_metric: "2+ communities viewed",
          duration_seconds: 180
        },
        {
          id: "community_first_follow",
          name: "Follow Experts",
          description: "Follow 1-2 mentors or experienced investors",
          component: "ExpertFollowGuide",
          success_metric: "1+ experts followed",
          duration_seconds: 120
        },
        {
          id: "community_first_join",
          name: "Join a Group",
          description: "Become member of relevant investment group",
          component: "GroupJoinGuide",
          success_metric: "Joined 1+ group",
          duration_seconds: 120
        }
      ]
    }
  },

  // Smart nudge triggers
  nudge_rules: [
    {
      id: "inactivity_day3",
      name: "Day 3 Re-engagement",
      trigger: {
        days_since_onboarding: 3,
        inactivity_consecutive_hours: 48,
        pages_visited: 0
      },
      message: "Want help finding your first deal?",
      intent: "Re-engage inactive user",
      action_label: "Get started",
      surface: "banner",
      cooldown_hours: 24
    },
    {
      id: "deal_browsing_save",
      name: "Deal Browsing to Saving",
      trigger: {
        deals_viewed: { $gte: 3 },
        deals_saved: 0,
        time_in_app_minutes: { $gte: 10 }
      },
      message: "Found anything interesting? Save deals to personalize recommendations.",
      intent: "Convert browsing to saving",
      action_label: "Save deals",
      surface: "tooltip_hover",
      cooldown_hours: 12
    },
    {
      id: "skipped_portfolio_context",
      name: "Portfolio Setup - Contextual",
      trigger: {
        portfolio_goals_skipped: true,
        looking_at_analytics: true,
        deals_saved: { $gte: 1 }
      },
      message: "Setting portfolio goals unlocks smarter deal matches for your returns.",
      intent: "Complete deferred setup",
      action_label: "Set goals",
      surface: "side_panel",
      cooldown_hours: 48
    },
    {
      id: "first_deal_celebration",
      name: "First Deal Saved Celebration",
      trigger: {
        milestones: { first_deal_saved: true },
        nudge_shown: false
      },
      message: "🎉 Nice! You're building momentum. Want to explore more matches?",
      intent: "Celebrate and encourage continuation",
      action_label: "Find more",
      surface: "toast",
      cooldown_hours: 0
    },
    {
      id: "day7_activation_check",
      name: "Week 1 Activation Check",
      trigger: {
        days_since_onboarding: 7,
        activated: false
      },
      message: "Your personalized deals are waiting. Let's help you find the right fit.",
      intent: "Final re-engagement push",
      action_label: "Browse deals",
      surface: "modal",
      cooldown_hours: 0
    },
    {
      id: "community_lurker",
      name: "Community Lurker - Encouragement",
      trigger: {
        activation_path: "community_first",
        communities_viewed: { $gte: 1 },
        communities_joined: 0,
        time_since_view_hours: 24
      },
      message: "Great! Communities are more fun when you're part of it. Join one?",
      intent: "Encourage community participation",
      action_label: "Join group",
      surface: "tooltip",
      cooldown_hours: 24
    }
  ],

  // Guidance rule: Show deferred setup prompts only when contextually relevant
  deferred_setup_triggers: [
    {
      skipped_field: "portfolio_goals",
      trigger_context: "viewing_analytics",
      message: "Quick setup: What's your return target? This helps us suggest deals.",
      delay_days: 3
    },
    {
      skipped_field: "community_preferences",
      trigger_context: "viewed_community_section",
      message: "What's your learning style? Networking or Knowledge-focused?",
      delay_days: 2
    },
    {
      skipped_field: "integrations",
      trigger_context: "clicked_integrations_link",
      message: "Connect tools to sync financial data and unlock advanced features.",
      delay_days: 1
    }
  ],

  // Activation success criteria
  fmv_criteria: {
    minimum_milestones_required: 1,
    acceptable_milestone_combinations: [
      ["first_deal_saved"],
      ["portfolio_goal_configured"],
      ["community_interaction"],
      ["first_deal_viewed", "first_deal_saved"],
      ["first_deal_viewed", "portfolio_goal_configured"]
    ],
    window_days: 14
  },

  // Guidance display rules
  guidance_display: {
    max_active_guides: 1,
    auto_dismiss_after_seconds: null,
    allow_manual_dismiss: true,
    show_progress: true,
    block_app_usage: false,
    surfaces: {
      inline_highlight: "Highlight UI element with tooltip",
      banner: "Top/bottom sticky banner",
      toast: "Bottom-right toast notification",
      tooltip_hover: "Hover-triggered tooltip",
      side_panel: "Right-side panel",
      modal: "Centered modal (rare - only for critical)",
      card: "Inline card in flow"
    }
  },

  // Cooldown logic to prevent nudge spam
  cooldown_logic: {
    between_nudges_minutes: 30,
    per_nudge_type_hours: 24,
    max_nudges_per_day: 3,
    backoff_strategy: "exponential"
  }
};

export default ACTIVATION_CONFIG;