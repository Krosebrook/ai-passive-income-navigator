// 30-day retention and habit-loop configuration
export const RETENTION_CONFIG = {
  name: "30DayRetentionFlow",
  description: "Adaptive habit loops and personalization for long-term engagement",

  // Retention objectives
  retention_objectives: {
    weekly_engagement: {
      id: "weekly_engagement",
      name: "Weekly Return Visits",
      description: "User has meaningful session at least once per week",
      min_sessions_per_week: 1,
      required_for_retention: true
    },
    personalization_accuracy: {
      id: "personalization_accuracy",
      name: "Improved Recommendations",
      description: "System has refined preferences based on behavior",
      min_confidence_score: 0.5,
      required_for_retention: true
    },
    compounding_actions: {
      id: "compounding_actions",
      name: "Repeated Value Actions",
      description: "User takes at least 2 of: save deals, adjust portfolio, join community",
      action_types: ["save_deal", "adjust_portfolio", "join_community"],
      min_actions_required: 2,
      required_for_retention: false
    }
  },

  // Habit loop definitions
  habit_loops: {
    discovery_loop: {
      id: "discovery_loop",
      name: "Discovery Loop (Deal Momentum)",
      description: "Engage users through deal exploration and saving",
      primary_actions: ["view_deal", "save_deal", "compare_deals"],
      trigger_conditions: {
        deals_saved_in_last_week: { $gte: 1 },
        days_since_last_deal_view: { $lte: 3 }
      },
      flow: {
        step_1: {
          name: "Surface New Matches",
          action: "show_personalized_deals",
          message: "3 new deals match your criteria",
          duration_seconds: 180
        },
        step_2: {
          name: "Explain Relevance",
          action: "show_match_explanation",
          message: "Here's why these fit your profile",
          duration_seconds: 120
        },
        step_3: {
          name: "Light Action",
          action: "encourage_save_or_dismiss",
          message: "Save deals you'd research further",
          duration_seconds: 60
        }
      },
      reward: {
        type: "visual_feedback",
        message: "Your deal feed just got smarter — {count} new matches added",
        personalization_boost: 0.1
      },
      trigger_frequency: {
        min_hours_between_triggers: 24,
        max_triggers_per_week: 3
      }
    },

    insight_loop: {
      id: "insight_loop",
      name: "Insight Loop (Portfolio Intelligence)",
      description: "Build confidence through analytics and projections",
      primary_actions: ["view_analytics", "adjust_goals", "view_projections"],
      trigger_conditions: {
        portfolio_goal_configured: true,
        days_since_last_analytics_view: { $lte: 7 }
      },
      flow: {
        step_1: {
          name: "Surface New Insights",
          action: "show_insights",
          message: "2 new insights about your portfolio",
          duration_seconds: 120
        },
        step_2: {
          name: "Tie to Opportunities",
          action: "show_opportunity_alignment",
          message: "Here are deals aligned to your targets",
          duration_seconds: 120
        },
        step_3: {
          name: "Micro-Adjustment",
          action: "invite_light_adjustment",
          message: "Small updates can improve your strategy",
          duration_seconds: 60
        }
      },
      reward: {
        type: "confidence_building",
        message: "You're on track — {metric} shows {direction} momentum",
        personalization_boost: 0.15
      },
      trigger_frequency: {
        min_hours_between_triggers: 48,
        max_triggers_per_week: 2
      }
    },

    social_proof_loop: {
      id: "social_proof_loop",
      name: "Social Proof Loop (Community Value)",
      description: "Build credibility and learning through community",
      primary_actions: ["view_community", "follow_expert", "join_group", "engage_discussion"],
      trigger_conditions: {
        activation_path: "community_first"
      },
      flow: {
        step_1: {
          name: "Highlight Discussions",
          action: "show_relevant_threads",
          message: "High-value discussions in your areas of interest",
          duration_seconds: 180
        },
        step_2: {
          name: "Recommend People",
          action: "show_expert_recommendations",
          message: "People working on similar deals",
          duration_seconds: 120
        },
        step_3: {
          name: "Low-Friction Participation",
          action: "encourage_light_engagement",
          message: "React to insights — no pressure to post",
          duration_seconds: 60
        }
      },
      reward: {
        type: "social_relevance",
        message: "Your network now sees your interests — {count} new connections",
        personalization_boost: 0.1
      },
      trigger_frequency: {
        min_hours_between_triggers: 48,
        max_triggers_per_week: 2
      }
    }
  },

  // Weekly rhythm (non-intrusive)
  weekly_cadence: {
    weekly_insight_digest: {
      id: "weekly_digest",
      name: "Weekly Insight Digest",
      description: "Personalized summary of activity, changes, and opportunities",
      default_frequency: "weekly",
      default_day: "monday",
      default_hour: 9,
      allowed_frequencies: ["weekly", "bi_weekly", "monthly", "disabled"],
      contents: {
        what_changed: {
          label: "What Changed",
          description: "Deals added, community activity, market shifts"
        },
        top_insights: {
          label: "Top Insights",
          description: "2-3 most relevant findings since last digest"
        },
        opportunity_highlights: {
          label: "Opportunity Highlights",
          description: "3-5 deals or connections matching your profile"
        },
        your_progress: {
          label: "Your Progress",
          description: "Engagement streaks, portfolio metrics, community standing"
        }
      },
      adaptive_rules: {
        increase_frequency_if: "user_opens_emails > 75% && engagement_high",
        decrease_frequency_if: "user_ignores_emails > 50% || inactivity_streak > 7",
        opt_out_after: "3_consecutive_unopened_emails"
      }
    },

    contextual_prompts: {
      id: "contextual_prompts",
      name: "\"What Changed\" Highlights",
      description: "In-app highlights of changes since last visit",
      rules: {
        show_if: "days_since_last_visit >= 2",
        highlight_examples: [
          "3 deals moved this week — want the highlights?",
          "1 expert you follow just shared insights on {topic}",
          "Your portfolio is {trend} — view the details?"
        ]
      }
    }
  },

  // Intelligent re-engagement rules
  re_engagement: {
    inactivity_triggers: [
      {
        id: "day3_silent",
        days_inactive: 3,
        condition: "no_session_for_3_days && was_previously_active",
        strategy: "value_first",
        message: "3 new deals matched your criteria",
        include_reference: "prior_preferences",
        avoid_guilt: true,
        surface: "email",
        cooldown_hours: 72
      },
      {
        id: "day7_missed_deals",
        days_inactive: 7,
        condition: "no_session_for_7_days && deals_added > 2",
        strategy: "opportunity_highlight",
        message: "{count} deals moved this week — want the highlights?",
        include_reference: "recent_activity",
        avoid_guilt: true,
        surface: "email",
        cooldown_hours: 168
      },
      {
        id: "day14_insight",
        days_inactive: 14,
        condition: "no_session_for_14_days && insights_available",
        strategy: "fresh_perspective",
        message: "Your portfolio setup unlocks new insights. See what changed.",
        include_reference: "prior_goals",
        avoid_guilt: true,
        surface: "email",
        cooldown_hours: 336
      },
      {
        id: "day21_community",
        days_inactive: 21,
        condition: "no_session_for_21_days && activation_path == community_first",
        strategy: "peer_activity",
        message: "Your community is discussing {topic}. Catch up?",
        include_reference: "followed_experts",
        avoid_guilt: true,
        surface: "email",
        cooldown_hours: 504
      }
    ],

    re_engagement_rules: {
      max_re_engagement_attempts: 4,
      per_attempt_cooldown_days: 7,
      stop_after_day: 25,
      always_include_reason: "Personalized to your interests",
      language_rules: {
        avoid: ["You haven't", "You missed", "Come back"],
        use: ["New opportunities", "Your profile shows", "Fresh insights", "Your network"]
      }
    }
  },

  // Progressive personalization rules
  progressive_personalization: {
    refinement_windows: [
      {
        window: "day_1_to_7",
        actions: ["observe_views", "observe_saves", "observe_interactions"],
        confidence_target: 0.4,
        refine_fields: ["deal_industries", "risk_preference"]
      },
      {
        window: "day_8_to_14",
        actions: ["light_refinement", "detect_patterns"],
        confidence_target: 0.6,
        refine_fields: ["ticket_size_range", "time_horizon"]
      },
      {
        window: "day_15_to_30",
        actions: ["aggressive_refinement", "suppress_low_signal_topics"],
        confidence_target: 0.8,
        refine_fields: ["community_interests", "content_preferences"]
      }
    ],

    auto_refinement: {
      trigger_when: "behavior_signal_count > threshold",
      examples: [
        {
          signal: "saved_5_tech_deals",
          refinement: "increase_tech_weight_by_20%"
        },
        {
          signal: "dismissed_4_real_estate",
          refinement: "lower_real_estate_by_30%"
        },
        {
          signal: "joined_saas_community",
          refinement: "boost_saas_topics_in_feed"
        }
      ],
      never_reset: true,
      require_consent: false,
      notify_user_when: "confidence_improvement > 0.2"
    }
  },

  // Weekly engagement tracking
  engagement_tracking: {
    weekly_success_criteria: {
      minimum_sessions: 1,
      minimum_session_duration_minutes: 3,
      minimum_actions: 1,
      acceptable_actions: ["view_deal", "view_insight", "community_interaction"]
    },

    retention_window: {
      duration_days: 30,
      retention_milestone: "day_7",
      success_checkpoint: "day_14",
      final_milestone: "day_30"
    },

    churn_signals: {
      high_risk_when: {
        inactivity_days: 10,
        unopened_emails: 3,
        dismissed_nudges: 5
      },
      medium_risk_when: {
        inactivity_days: 7,
        unopened_emails: 2,
        completed_actions: 0
      },
      low_risk_when: {
        weekly_engagement: true,
        completed_actions: { $gte: 2 }
      }
    }
  }
};

export default RETENTION_CONFIG;