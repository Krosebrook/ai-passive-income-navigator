// Lifecycle intelligence and adaptive experience configuration
export const LIFECYCLE_CONFIG = {
  name: "LifecycleIntelligenceSystem",
  description: "Continuous adaptation across entire user journey",

  // Lifecycle states
  states: {
    new: {
      id: "new",
      name: "New User",
      description: "First session, exploring product",
      duration_days: 1,
      characteristics: ["completing onboarding", "no saved data", "exploration mode"]
    },
    activated: {
      id: "activated",
      name: "Activated",
      description: "Completed first milestone (FMV), taking first real action",
      duration_days: 7,
      characteristics: ["first deal saved or goal set", "completed activation path", "building momentum"]
    },
    engaged: {
      id: "engaged",
      name: "Engaged",
      description: "Consistent weekly engagement, habit forming",
      duration_days: 30,
      characteristics: ["2+ sessions per week", "habit loops active", "compounding actions"]
    },
    power_user: {
      id: "power_user",
      name: "Power User",
      description: "Advanced feature usage, high-signal behavior",
      duration_days: null,
      characteristics: ["unlocked tiers", "signal score 50+", "strategic thinking"]
    },
    at_risk: {
      id: "at_risk",
      name: "At-Risk",
      description: "Declining engagement, potential churn",
      duration_days: 14,
      characteristics: ["engagement drop 40%+", "nudges ignored", "reduced session frequency"]
    },
    dormant: {
      id: "dormant",
      name: "Dormant",
      description: "No meaningful activity for extended period",
      duration_days: null,
      characteristics: ["no sessions for 21+ days", "high churn risk"]
    },
    returning: {
      id: "returning",
      name: "Returning",
      description: "Formerly dormant user re-engaging",
      duration_days: 7,
      characteristics: ["resumed activity after gap", "needs context restoration"]
    }
  },

  // State transition rules
  state_transitions: {
    new_to_activated: {
      from: "new",
      to: "activated",
      required_signals: [
        { signal: "activation_milestone_achieved", threshold: true }
      ],
      grace_period_days: 7,
      rules: {
        trigger_when: "user_completes_first_milestone",
        examples: ["saved first deal", "set portfolio goal", "joined community"]
      }
    },

    activated_to_engaged: {
      from: "activated",
      to: "engaged",
      required_signals: [
        { signal: "sessions_per_week", threshold: 2 },
        { signal: "weekly_engagement_streak", threshold: 2 }
      ],
      grace_period_days: 14,
      rules: {
        trigger_when: "user_establishes_habit",
        examples: ["logged in 2+ weeks", "completed habit loops"]
      }
    },

    engaged_to_power_user: {
      from: "engaged",
      to: "power_user",
      required_signals: [
        { signal: "capability_tier_unlocked", threshold: 1 },
        { signal: "signal_score", threshold: 50 }
      ],
      grace_period_days: 0,
      rules: {
        trigger_when: "user_demonstrates_advanced_usage",
        examples: ["unlocked advanced_discovery", "scenario modeling used"]
      }
    },

    engaged_to_at_risk: {
      from: "engaged",
      to: "at_risk",
      required_signals: [
        { signal: "session_frequency_decline", threshold: 0.4 },
        { signal: "days_since_last_session", threshold: 7 }
      ],
      grace_period_days: 7,
      rules: {
        trigger_when: "engagement_drops_significantly",
        examples: ["dropped from 3 sessions/week to 1"]
      }
    },

    at_risk_to_dormant: {
      from: "at_risk",
      to: "dormant",
      required_signals: [
        { signal: "days_since_last_session", threshold: 21 }
      ],
      grace_period_days: 0,
      rules: {
        trigger_when: "no_activity_for_extended_period",
        examples: ["3+ weeks without login"]
      }
    },

    dormant_to_returning: {
      from: "dormant",
      to: "returning",
      required_signals: [
        { signal: "session_initiated", threshold: true }
      ],
      grace_period_days: 0,
      rules: {
        trigger_when: "dormant_user_logs_back_in",
        examples: ["clicked email link", "typed URL directly"]
      }
    },

    returning_to_engaged: {
      from: "returning",
      to: "engaged",
      required_signals: [
        { signal: "completed_action", threshold: true },
        { signal: "sessions_next_week", threshold: 2 }
      ],
      grace_period_days: 7,
      rules: {
        trigger_when: "returning_user_rebuilds_habit",
        examples: ["saved deal after return", "2+ logins in week"]
      }
    }
  },

  // Churn risk model
  churn_risk_model: {
    base_factors: [
      {
        factor: "session_frequency_decline",
        weight: 0.25,
        calculation: "(sessions_last_30 - sessions_prev_30) / sessions_prev_30",
        threshold_high_risk: -0.4 // 40% decline
      },
      {
        factor: "action_abandonment",
        weight: 0.25,
        calculation: "incomplete_flows / initiated_flows",
        threshold_high_risk: 0.6 // 60% abandonment
      },
      {
        factor: "nudge_dismissal_rate",
        weight: 0.15,
        calculation: "dismissed_nudges / shown_nudges",
        threshold_high_risk: 0.7 // 70% dismissal
      },
      {
        factor: "habit_loop_inactivity",
        weight: 0.15,
        calculation: "days_since_habit_loop_trigger",
        threshold_high_risk: 14 // 2+ weeks
      },
      {
        factor: "time_since_last_session",
        weight: 0.2,
        calculation: "current_date - last_session_date",
        threshold_high_risk: 7 // 7+ days
      }
    ],
    risk_categories: {
      low_risk: { min: 0, max: 30, intervention: "none" },
      medium_risk: { min: 30, max: 60, intervention: "value_reminder" },
      high_risk: { min: 60, max: 85, intervention: "relevance_reset" },
      critical_risk: { min: 85, max: 100, intervention: "win_back_sequence" }
    },
    detection_frequency_hours: 24
  },

  // Intervention playbooks
  intervention_playbooks: {
    at_risk: {
      state: "at_risk",
      primary_goal: "remind_of_value_without_pressure",
      interventions: [
        {
          id: "what_changed_reminder",
          name: "Value Reminder",
          message: "3 deals moved this week — want the highlights?",
          tone: "helpful",
          surface: "email",
          timing: "day_3_of_at_risk",
          cooldown_hours: 72
        },
        {
          id: "relevance_reset",
          name: "Relevance Reset",
          message: "Your portfolio setup unlocks smarter recommendations.",
          tone: "opportunity",
          surface: "contextual_banner",
          timing: "day_7_of_at_risk",
          cooldown_hours: 168
        },
        {
          id: "simplified_prompts",
          name: "Reduced Cognitive Load",
          message: "Two things you can do in 5 minutes",
          tone: "gentle",
          surface: "simplified_ui",
          timing: "on_session",
          cooldown_hours: 0
        }
      ]
    },

    dormant: {
      state: "dormant",
      primary_goal: "respectful_reactivation_without_pressure",
      interventions: [
        {
          id: "high_signal_summary",
          name: "Top 3 Changes Summary",
          message: "Here's what's new since you left",
          content: ["3 top deals", "1 community highlight", "1 insight"],
          tone: "informative",
          surface: "email",
          timing: "day_21_dormant",
          cooldown_hours: 168
        },
        {
          id: "optional_reactivation_path",
          name: "Optional Reactivation",
          message: "Ready to jump back in? No pressure — take 2 minutes.",
          tone: "inviting",
          surface: "modal",
          timing: "on_login_after_dormancy",
          cooldown_hours: 0,
          offers_skip: true
        },
        {
          id: "win_back_incentive",
          name: "Win-Back Offer",
          message: "Welcome back — use code RETURN for 50% off Pro",
          tone: "celebratory",
          surface: "banner",
          timing: "if_re_engaged",
          cooldown_hours: 0
        }
      ]
    },

    returning: {
      state: "returning",
      primary_goal: "context_restoration_and_momentum_building",
      interventions: [
        {
          id: "context_restoration",
          name: "Restore Context",
          message: "You were tracking these deals",
          content: ["saved deals list", "portfolio snapshot", "community activity"],
          tone: "familiar",
          surface: "landing_card",
          timing: "on_login",
          cooldown_hours: 0
        },
        {
          id: "unfinished_actions",
          name: "Resume Unfinished",
          message: "Pick up where you left off",
          content: ["incomplete comparison", "draft portfolio goal"],
          tone: "practical",
          surface: "quick_actions",
          timing: "on_login",
          cooldown_hours: 0
        },
        {
          id: "welcome_back_momentum",
          name: "Momentum Builder",
          message: "We've made improvements since you left",
          content: ["2 new features", "better recommendations"],
          tone: "positive",
          surface: "contextual",
          timing: "day_1_of_return",
          cooldown_hours: 0
        }
      ]
    }
  },

  // Adaptive personalization rules
  adaptive_personalization: {
    rules_by_state: {
      new: {
        show_tutorials: true,
        guidance_mode: "hands_on",
        insight_density: "low",
        feature_prominence: "activation_focused"
      },
      activated: {
        show_tutorials: true,
        guidance_mode: "balanced",
        insight_density: "medium",
        feature_prominence: "early_wins"
      },
      engaged: {
        show_tutorials: false,
        guidance_mode: "balanced",
        insight_density: "medium",
        feature_prominence: "capability_unlocks"
      },
      power_user: {
        show_tutorials: false,
        guidance_mode: "autonomous",
        insight_density: "high",
        feature_prominence: "advanced_features"
      },
      at_risk: {
        show_tutorials: false,
        guidance_mode: "hands_on",
        insight_density: "low",
        feature_prominence: "value_reminders"
      },
      dormant: {
        show_tutorials: false,
        guidance_mode: "minimal",
        insight_density: "low",
        feature_prominence: "reactivation_path"
      },
      returning: {
        show_tutorials: false,
        guidance_mode: "balanced",
        insight_density: "medium",
        feature_prominence: "context_restore"
      }
    },
    never_reset_unless_requested: true,
    confidence_building_escalation: true
  },

  // Lifecycle-aware monetization rules
  monetization_rules_by_state: {
    new: {
      target: false,
      strategy: "showcase_value",
      allowed_moments: [],
      reason: "No engagement yet"
    },
    activated: {
      target: false,
      strategy: "free_tier_excellence",
      allowed_moments: [],
      reason: "Too early to monetize"
    },
    engaged: {
      target: true,
      strategy: "contextual_upgrades",
      allowed_moments: ["feature_interest", "natural_discovery"],
      aggressiveness: "low"
    },
    power_user: {
      target: true,
      strategy: "capability_expansion",
      allowed_moments: ["all_moments"],
      aggressiveness: "moderate"
    },
    at_risk: {
      target: false,
      strategy: "value_preservation",
      allowed_moments: [],
      reason: "Never target at-risk users with monetization"
    },
    dormant: {
      target: false,
      strategy: "win_back_first",
      allowed_moments: ["only_if_reactivated"],
      reason: "Reactivate first, monetize later"
    },
    returning: {
      target: false,
      strategy: "rebuild_engagement",
      allowed_moments: ["after_2_weeks_return"],
      reason: "Let them rebuild momentum first"
    }
  }
};

export default LIFECYCLE_CONFIG;