// Power-user and monetization flow configuration
export const POWER_USER_CONFIG = {
  name: "PowerUserExpansionAndMonetization",
  description: "Converts engaged users into power users and paying customers",

  // Power-user signal definitions (tunable)
  power_user_signals: {
    deals_saved: {
      id: "deals_saved",
      name: "Deal Engagement",
      threshold: 5,
      weight: 0.25,
      description: "User has saved 5+ deals",
      signal_multiplier: 0.5 // Each deal saved = 0.5 points
    },
    deals_compared: {
      id: "deals_compared",
      name: "Deal Analysis Depth",
      threshold: 3,
      weight: 0.25,
      description: "User has compared 3+ deals",
      signal_multiplier: 1.0 // Comparison = deeper engagement
    },
    portfolio_goals_reviewed: {
      id: "portfolio_goals_reviewed",
      name: "Portfolio Strategy",
      threshold: 2,
      weight: 0.2,
      description: "User has reviewed/adjusted goals 2+ times",
      signal_multiplier: 1.5 // Goal work = strategic thinking
    },
    community_interactions: {
      id: "community_interactions",
      name: "Network Building",
      threshold: 3,
      weight: 0.15,
      description: "User has 3+ community interactions",
      signal_multiplier: 0.8 // Social signals matter less than activity
    },
    weekly_engagement_streak: {
      id: "weekly_engagement_streak",
      name: "Habit Formation",
      threshold: 3,
      weight: 0.15,
      description: "User has 3+ weeks of consistent engagement",
      signal_multiplier: 2.0 // Consistency = reliability
    }
  },

  // Signal calculation
  signal_scoring: {
    base_threshold: 30, // Out of 100 to qualify
    power_user_threshold: 50,
    premium_threshold: 75,
    calculation_method: "weighted_composite",
    recalculation_frequency_hours: 24
  },

  // Capability tiers
  capability_tiers: {
    tier_1_advanced_discovery: {
      id: "advanced_discovery",
      name: "Advanced Deal Discovery",
      description: "Deeper analysis and organization tools",
      unlock_signal_threshold: 40,
      required_signals: ["deals_saved >= 5"],
      capabilities: [
        {
          id: "deal_comparison",
          name: "Deal Comparison",
          description: "Side-by-side analysis of multiple deals",
          free_limit: 2,
          premium_limit: "unlimited"
        },
        {
          id: "saved_collections",
          name: "Deal Collections",
          description: "Organize deals into custom watchlists",
          free_limit: 1,
          premium_limit: 10
        },
        {
          id: "strategy_explanation",
          name: "Strategy Explanations",
          description: "AI explains why deals match your profile",
          free_limit: false,
          premium_limit: true
        }
      ],
      unlock_message: "You've unlocked deeper deal analysis based on how you work.",
      unlock_surface: "notification",
      value_proposition: "Analyze deals faster, organize better, decide with confidence"
    },

    tier_2_portfolio_intelligence: {
      id: "portfolio_intelligence",
      name: "Portfolio Intelligence",
      description: "Advanced forecasting and scenario tools",
      unlock_signal_threshold: 55,
      required_signals: ["portfolio_goals_reviewed >= 2"],
      capabilities: [
        {
          id: "scenario_modeling",
          name: "Scenario Modeling",
          description: "What-if analysis for portfolio strategies",
          free_limit: 2,
          premium_limit: "unlimited"
        },
        {
          id: "projections",
          name: "Financial Projections",
          description: "Forecast returns based on deal mix",
          free_limit: false,
          premium_limit: true
        },
        {
          id: "goal_mapping",
          name: "Goal-to-Deal Mapping",
          description: "See exactly which deals move your targets",
          free_limit: false,
          premium_limit: true
        }
      ],
      unlock_message: "Your portfolio activity unlocked forecasting tools.",
      unlock_surface: "contextual_banner",
      value_proposition: "Model strategies confidently, see impacts clearly"
    },

    tier_3_network_amplification: {
      id: "network_amplification",
      name: "Network & Signal Amplification",
      description: "Premium networking and visibility",
      unlock_signal_threshold: 60,
      required_signals: ["community_interactions >= 3"],
      capabilities: [
        {
          id: "expert_follows",
          name: "Expert Following",
          description: "Follow and get updates from verified investors",
          free_limit: 5,
          premium_limit: "unlimited"
        },
        {
          id: "signal_boosting",
          name: "Signal Boosting",
          description: "Highlight your insights in community",
          free_limit: false,
          premium_limit: true
        },
        {
          id: "premium_communities",
          name: "Premium Communities",
          description: "Access private expert groups and mastermind",
          free_limit: false,
          premium_limit: true
        }
      ],
      unlock_message: "You now have access to higher-signal conversations.",
      unlock_surface: "community_panel",
      value_proposition: "Learn from the best, build your credibility"
    }
  },

  // Monetization triggers (soft and contextual)
  monetization_triggers: [
    {
      id: "deal_comparison_limit",
      trigger_type: "feature_usage",
      condition: "user_reached_comparison_limit && tried_to_compare_3rd_deal",
      context: "mid_task_after_preview",
      messaging: {
        headline: "Unlock Unlimited Comparisons",
        subheading: "Upgrade to analyze as many deals as you want",
        body: "You've compared 2 deals this month. Upgrade to compare unlimited.",
        cta_primary: "Upgrade to Pro",
        cta_secondary: "Continue with free (comparison saved)"
      },
      value_items: [
        "Compare unlimited deals",
        "Save 10+ deal collections",
        "AI strategy explanations"
      ],
      free_state: "Comparison saved as free deal",
      surface: "modal_soft",
      timing: "after_2_comparisons",
      cooldown_hours: 72
    },

    {
      id: "scenario_modeling_unlock",
      trigger_type: "feature_interest",
      condition: "user_viewed_analytics && portfolio_goals_set && signal_score >= 50",
      context: "natural_discovery",
      messaging: {
        headline: "Model Your Strategy",
        subheading: "See portfolio outcomes before investing",
        body: "Try scenario modeling to forecast returns. See how different deal mixes affect your goals.",
        cta_primary: "Try Scenario Modeling",
        cta_secondary: "Maybe later"
      },
      value_items: [
        "What-if analysis",
        "Confidence in strategy",
        "Faster decisions"
      ],
      free_state: "Try 2 free scenarios",
      surface: "contextual_card",
      timing: "on_analytics_view",
      cooldown_hours: 168
    },

    {
      id: "expert_network_unlock",
      trigger_type: "community_engagement",
      condition: "user_joined_community && followed_expert && signal_score >= 55",
      context: "network_value",
      messaging: {
        headline: "Go Deeper in Your Network",
        subheading: "Access premium expert communities",
        body: "You're connecting with experts. Unlock private communities where top investors share real deals and strategies.",
        cta_primary: "Explore Premium Communities",
        cta_secondary: "Stay free for now"
      },
      value_items: [
        "Follow unlimited experts",
        "Private deal sharing",
        "1-on-1 mentorship access"
      ],
      free_state: "Follow 5 experts",
      surface: "community_highlight",
      timing: "after_following_2_experts",
      cooldown_hours: 168
    },

    {
      id: "power_user_celebration",
      trigger_type: "milestone_achievement",
      condition: "signal_score >= 50 && power_user_status_newly_achieved",
      context: "value_reinforcement",
      messaging: {
        headline: "You're Now a Power User 🚀",
        subheading: "Unlock advanced tools designed for serious investors",
        body: "Your engagement shows you're serious about passive income. Advanced discovery and portfolio intelligence tools are now available.",
        cta_primary: "Explore Pro Features",
        cta_secondary: "Dismiss"
      },
      value_items: [
        "Deal analysis tools",
        "Scenario modeling",
        "Expert communities"
      ],
      free_state: "All free features unlocked",
      surface: "celebration_modal",
      timing: "on_power_user_achievement",
      cooldown_hours: 0
    },

    {
      id: "hours_saved_moment",
      trigger_type: "value_reinforcement",
      condition: "user_has_saved_deals >= 5 && completed_comparisons >= 2",
      context: "usage_insight",
      messaging: {
        headline: "You've Saved 15+ Hours",
        subheading: "And growing with every comparison",
        body: "Deal analysis that used to take days now takes minutes. That's the power of Pro.",
        cta_primary: "See Full Stats",
        cta_secondary: "Dismiss"
      },
      value_items: [
        "Time saved: 15+ hours",
        "Deals analyzed: 12",
        "Better decisions: immeasurable"
      ],
      free_state: "Keep using free tools",
      surface: "card_in_dashboard",
      timing: "weekly_digest",
      cooldown_hours: 0
    }
  ],

  // Value-based pricing rules
  pricing_rules: {
    messaging: {
      always_show_what_stays_free: true,
      always_show_what_improves: true,
      tone: "partnership",
      avoid: ["urgency", "scarcity", "guilt", "fear"]
    },

    upgrade_benefits: {
      pro: {
        price_monthly: 29,
        benefits: [
          "Unlimited deal comparisons",
          "Scenario modeling (unlimited)",
          "AI strategy explanations",
          "10 deal collections",
          "Follow 50+ experts",
          "Priority email support"
        ],
        target_user: "Serious individual investor",
        focus: "discovery + analysis"
      },

      enterprise: {
        price_monthly: 199,
        benefits: [
          "Everything in Pro",
          "Private expert communities",
          "Signal boosting to network",
          "Advanced financial modeling",
          "Unlimited scenario iterations",
          "Dedicated success manager",
          "API access for data export"
        ],
        target_user: "Groups, syndicates, professionals",
        focus: "community + advanced features"
      }
    },

    no_dark_patterns: {
      no_countdown_timers: true,
      no_fake_scarcity: true,
      show_cancel_link: true,
      allow_downgrades: true,
      clear_billing_terms: true
    }
  },

  // Power-user feedback loop
  feedback_loop: {
    value_metrics_to_show: [
      {
        metric: "hours_saved",
        calculation: "deals_saved * 0.5 + comparisons * 1.5",
        message: "You've saved {value} hours analyzing deals"
      },
      {
        metric: "strategy_precision",
        calculation: "portfolio_adjustments / time_in_app",
        message: "Your strategy precision improved by {value}%"
      },
      {
        metric: "deal_quality",
        calculation: "avg_match_score_of_saved_deals",
        message: "Quality of saved deals improved to {value}% match"
      },
      {
        metric: "expert_connections",
        calculation: "experts_followed",
        message: "You're connected to {value} verified investors"
      }
    ],
    frequency: "weekly_digest",
    surface: "stats_card_in_dashboard"
  }
};

export default POWER_USER_CONFIG;