{
  "wizard_metadata": {
    "title": "FlashFusion Investment Onboarding",
    "description": "5-7 minute interactive setup to personalize your investment experience",
    "total_steps": 7,
    "version": "1.0",
    "target_audience": "New investors (novice to experienced)"
  },
  "flow": [
    {
      "step_id": "welcome",
      "step_number": 1,
      "title": "Welcome to FlashFusion",
      "subtitle": "Let's personalize your investment journey",
      "description": "We'll guide you through a quick setup to match you with deals and strategies that align with your goals.",
      "duration_seconds": 30,
      "required": true,
      "microcopy": {
        "main_heading": "🚀 Ready to Find Your Next Passive Income Stream?",
        "subheading": "In just 5-7 minutes, we'll set up your profile so FlashFusion can:",
        "benefits": [
          "Automatically source deals that match your criteria",
          "Suggest personalized investment strategies",
          "Connect you with relevant investment communities",
          "Recommend portfolio optimizations"
        ],
        "cta_primary": "Get Started",
        "cta_secondary": "Learn More"
      },
      "ui_layout": "Hero card with gradient background, benefits list, prominent CTA button",
      "validation": "None - this is intro only",
      "help_text": null
    },
    {
      "step_id": "deal_sourcing",
      "step_number": 2,
      "title": "Deal Sourcing Criteria",
      "subtitle": "Help us find deals tailored to you",
      "description": "Define what types of investments you're looking for",
      "duration_seconds": 120,
      "required": true,
      "conditional_fields": [
        {
          "field_id": "investment_size_min",
          "show_when": null,
          "hide_when": null,
          "auto_fill": "1000"
        },
        {
          "field_id": "investment_size_max",
          "show_when": null,
          "hide_when": null,
          "auto_fill": "50000"
        }
      ],
      "fields": [
        {
          "field_name": "target_industries",
          "field_type": "multi_select_pills",
          "label": "Industries of Interest",
          "description": "Which industries excite you? (Select at least 1)",
          "required": true,
          "options": [
            { "value": "software_saas", "label": "Software & SaaS" },
            { "value": "ecommerce", "label": "E-commerce" },
            { "value": "content_media", "label": "Content & Media" },
            { "value": "digital_services", "label": "Digital Services" },
            { "value": "marketplaces", "label": "Marketplaces" },
            { "value": "fintech", "label": "FinTech" },
            { "value": "real_estate", "label": "Real Estate" },
            { "value": "subscriptions", "label": "Subscription Services" },
            { "value": "other", "label": "Other" }
          ],
          "max_selections": 5,
          "microcopy": "Pick industries where you have interest or expertise",
          "help_text": "💡 Focusing on 2-3 industries helps us find higher-quality matches",
          "tooltip": "You can update these anytime in your preferences"
        },
        {
          "field_name": "investment_size_min",
          "field_type": "currency_input",
          "label": "Minimum Investment Size",
          "description": "What's the smallest investment you'd consider?",
          "required": true,
          "placeholder": "$1,000",
          "min": 100,
          "max": 100000000,
          "step": 1000,
          "validation": "Must be less than maximum",
          "help_text": "$1,000-$10,000 is ideal for starting out",
          "tooltip": "This helps filter deals to your budget"
        },
        {
          "field_name": "investment_size_max",
          "field_type": "currency_input",
          "label": "Maximum Investment Size",
          "description": "What's the largest amount you'd invest?",
          "required": true,
          "placeholder": "$50,000",
          "min": 1000,
          "max": 100000000,
          "step": 5000,
          "validation": "Must be greater than minimum",
          "help_text": "Be realistic about capital availability",
          "tooltip": "Consider your available cash and risk tolerance"
        },
        {
          "field_name": "preferred_deal_structures",
          "field_type": "multi_select_cards",
          "label": "Preferred Deal Structures",
          "description": "How do you want to make money? (Select 1-3)",
          "required": true,
          "options": [
            {
              "value": "equity",
              "label": "Equity Stake",
              "description": "Ownership % in business",
              "icon": "📈"
            },
            {
              "value": "revenue_share",
              "label": "Revenue Share",
              "description": "% of business revenue",
              "icon": "💰"
            },
            {
              "value": "affiliate",
              "label": "Affiliate/Commission",
              "description": "Ongoing commissions",
              "icon": "🔗"
            },
            {
              "value": "licensing",
              "label": "Licensing Fees",
              "description": "License your content/IP",
              "icon": "📜"
            },
            {
              "value": "rental",
              "label": "Rental/Lease",
              "description": "Property or asset rentals",
              "icon": "🏠"
            }
          ],
          "max_selections": 3,
          "help_text": "You can be open to multiple structures",
          "tooltip": "Not sure? Equity and revenue share are most common"
        },
        {
          "field_name": "geo_preferences",
          "field_type": "multi_select_pills",
          "label": "Geographic Focus (Optional)",
          "description": "Do you prefer businesses in specific regions?",
          "required": false,
          "options": [
            { "value": "us_only", "label": "US Only" },
            { "value": "north_america", "label": "North America" },
            { "value": "english_speaking", "label": "English-Speaking Countries" },
            { "value": "global", "label": "Global/Location Agnostic" }
          ],
          "max_selections": 1,
          "help_text": "Timezone and language considerations are common",
          "tooltip": "You can be flexible—most deals are location-independent"
        },
        {
          "field_name": "time_to_profitability_months",
          "field_type": "slider",
          "label": "Time to Profitability",
          "description": "How long are you willing to wait for returns?",
          "required": true,
          "min": 1,
          "max": 60,
          "step": 1,
          "marks": [
            { "value": 3, "label": "3 months (fast)" },
            { "value": 12, "label": "1 year" },
            { "value": 24, "label": "2 years" },
            { "value": 60, "label": "5+ years" }
          ],
          "default": 12,
          "unit": "months",
          "help_text": "Most passive income businesses take 6-18 months to stabilize",
          "tooltip": "Longer timelines allow for more growth potential"
        }
      ],
      "microcopy": {
        "main_heading": "What deals are you hunting for?",
        "section_intro": "These criteria help us find your ideal investment matches"
      },
      "ui_layout": "Segmented form: multi-select pills for industries, currency inputs with $ prefix, cards for deal structures, slider for timeline",
      "validation": {
        "target_industries": "At least 1 required",
        "investment_size_min": "Min $100, and less than max",
        "investment_size_max": "Must be greater than min",
        "preferred_deal_structures": "At least 1 required"
      },
      "help_text": "This sets up automatic deal discovery in your preferred categories"
    },
    {
      "step_id": "portfolio_goals",
      "step_number": 3,
      "title": "Portfolio Goals",
      "subtitle": "Define your investment strategy",
      "description": "Set expectations for returns, diversification, and growth",
      "duration_seconds": 90,
      "required": true,
      "fields": [
        {
          "field_name": "time_horizon",
          "field_type": "radio_cards",
          "label": "Investment Time Horizon",
          "description": "When do you need returns or plan to exit?",
          "required": true,
          "options": [
            {
              "value": "short_term",
              "label": "Short Term",
              "description": "1-2 years | Quick exits, steady cash flow",
              "icon": "⚡"
            },
            {
              "value": "medium_term",
              "label": "Medium Term",
              "description": "3-5 years | Balanced growth & income",
              "icon": "📊"
            },
            {
              "value": "long_term",
              "label": "Long Term",
              "description": "5+ years | Maximum compounding",
              "icon": "🌱"
            }
          ],
          "default": "medium_term",
          "help_text": "This affects diversification recommendations",
          "tooltip": "Longer horizons allow riskier, higher-growth investments"
        },
        {
          "field_name": "target_return_percentage",
          "field_type": "slider",
          "label": "Target Annual Return",
          "description": "What annual ROI are you aiming for?",
          "required": true,
          "min": 5,
          "max": 100,
          "step": 5,
          "marks": [
            { "value": 10, "label": "10% (conservative)" },
            { "value": 20, "label": "20% (moderate)" },
            { "value": 50, "label": "50% (aggressive)" },
            { "value": 100, "label": "100%+ (very aggressive)" }
          ],
          "default": 20,
          "unit": "%",
          "help_text": "S&P 500 averages ~10%. Higher targets require higher risk.",
          "tooltip": "Be realistic—20-30% is ambitious but achievable"
        },
        {
          "field_name": "diversification_preference",
          "field_type": "radio_cards",
          "label": "Diversification Strategy",
          "description": "How many different investments do you want?",
          "required": true,
          "options": [
            {
              "value": "focused",
              "label": "Focused Portfolio",
              "description": "2-3 high-conviction bets",
              "icon": "🎯"
            },
            {
              "value": "moderately_diversified",
              "label": "Moderately Diversified",
              "description": "5-10 holdings, mixed sectors",
              "icon": "⚖️"
            },
            {
              "value": "highly_diversified",
              "label": "Highly Diversified",
              "description": "10+ holdings across sectors",
              "icon": "🌐"
            }
          ],
          "default": "moderately_diversified",
          "help_text": "More diversification = lower risk, but higher management",
          "tooltip": "Start with 5-7 deals, scale from there"
        },
        {
          "field_name": "sector_priorities",
          "field_type": "multi_select_pills",
          "label": "Preferred Sectors (Optional)",
          "description": "Any specific sectors to focus or avoid?",
          "required": false,
          "options": [
            { "value": "tech", "label": "Tech/Software" },
            { "value": "ecommerce", "label": "E-commerce" },
            { "value": "content", "label": "Content/Media" },
            { "value": "services", "label": "Services" },
            { "value": "finance", "label": "Finance" },
            { "value": "healthcare", "label": "Healthcare" },
            { "value": "other", "label": "Other" }
          ],
          "max_selections": 4,
          "help_text": "Leave blank to see deals across all sectors",
          "tooltip": "You can specialize in sectors you understand best"
        },
        {
          "field_name": "asset_class_priorities",
          "field_type": "multi_select_pills",
          "label": "Asset Classes (Optional)",
          "description": "Any preferences on asset types?",
          "required": false,
          "options": [
            { "value": "digital_assets", "label": "Digital Assets" },
            { "value": "physical_assets", "label": "Physical Assets" },
            { "value": "intellectual_property", "label": "IP & Licensing" },
            { "value": "securities", "label": "Securities/Equity" },
            { "value": "bonds", "label": "Bonds/Fixed Income" }
          ],
          "max_selections": 3,
          "help_text": "Mix asset types for better diversification",
          "tooltip": "Not sure? Digital assets offer best scalability"
        }
      ],
      "microcopy": {
        "main_heading": "What's your investment playbook?",
        "section_intro": "These goals guide our recommendations and track your progress"
      },
      "ui_layout": "Radio cards for strategic choices, slider for ROI target, multi-select pills for sectors",
      "validation": {
        "time_horizon": "Required",
        "target_return_percentage": "5-100%",
        "diversification_preference": "Required"
      },
      "help_text": "We'll use these to suggest portfolio rebalancing and new opportunities"
    },
    {
      "step_id": "community",
      "step_number": 4,
      "title": "Community & Collaboration",
      "subtitle": "Connect with fellow investors",
      "description": "Set your community preferences and sharing settings",
      "duration_seconds": 60,
      "required": true,
      "fields": [
        {
          "field_name": "networking_vs_knowledge",
          "field_type": "radio_cards",
          "label": "Community Priority",
          "description": "What matters most in our community?",
          "required": true,
          "options": [
            {
              "value": "networking_focused",
              "label": "Networking Focused",
              "description": "Find partners & collaborators",
              "icon": "🤝"
            },
            {
              "value": "balanced",
              "label": "Balanced",
              "description": "Mix of networking & learning",
              "icon": "⚖️"
            },
            {
              "value": "knowledge_focused",
              "label": "Knowledge Focused",
              "description": "Learn from others' experiences",
              "icon": "📚"
            }
          ],
          "default": "balanced",
          "help_text": "You can shift this anytime",
          "tooltip": "Best portfolio builders balance both"
        },
        {
          "field_name": "peer_group_interests",
          "field_type": "multi_select_pills",
          "label": "Group Types to Join",
          "description": "What types of investor groups interest you?",
          "required": true,
          "options": [
            { "value": "industry_specialists", "label": "Industry Specialists" },
            { "value": "regional_investors", "label": "Regional Groups" },
            { "value": "stage_focused", "label": "By Deal Stage" },
            { "value": "skill_level", "label": "By Skill Level" },
            { "value": "deal_sourcing", "label": "Deal Sourcing Circles" },
            { "value": "strategy_discussion", "label": "Strategy Discussions" }
          ],
          "max_selections": 4,
          "min_selections": 1,
          "help_text": "Start with 2-3 groups that resonate",
          "tooltip": "You'll be invited to matching groups automatically"
        },
        {
          "field_name": "community_notification_frequency",
          "field_type": "radio_options",
          "label": "Community Updates Frequency",
          "description": "How often do you want to hear from the community?",
          "required": true,
          "options": [
            { "value": "real_time", "label": "Real-time (instant notifications)" },
            { "value": "daily", "label": "Daily digest" },
            { "value": "weekly", "label": "Weekly digest" },
            { "value": "monthly", "label": "Monthly summary" }
          ],
          "default": "weekly",
          "help_text": "You can change this in settings anytime",
          "tooltip": "Weekly is most popular—stays informed without overload"
        },
        {
          "field_name": "profile_visibility",
          "field_type": "radio_options",
          "label": "Profile Visibility",
          "description": "Who can see your profile?",
          "required": true,
          "options": [
            { "value": "private", "label": "🔒 Private (only you)" },
            { "value": "network_only", "label": "🔐 Network Only (mutual follows)" },
            { "value": "public", "label": "🌐 Public (everyone)" }
          ],
          "default": "network_only",
          "help_text": "Recommended: Network Only for privacy + collaboration",
          "tooltip": "Start private and open up as you get comfortable"
        },
        {
          "field_name": "allow_collaboration_requests",
          "field_type": "toggle",
          "label": "Allow Collaboration Requests",
          "description": "Let investors reach out about partnering?",
          "required": false,
          "default": true,
          "help_text": "Some of the best deals come from collaboration",
          "tooltip": "You can still decline individual requests"
        }
      ],
      "microcopy": {
        "main_heading": "Join our investor community",
        "section_intro": "Connect with like-minded investors and unlock collaboration opportunities"
      },
      "ui_layout": "Radio cards for priority, multi-select pills for groups, radio options for frequency & visibility, toggle for collaborations",
      "validation": {
        "networking_vs_knowledge": "Required",
        "peer_group_interests": "At least 1 required",
        "community_notification_frequency": "Required",
        "profile_visibility": "Required"
      },
      "help_text": "Community connections often lead to better deals and faster learning"
    },
    {
      "step_id": "advanced_modules",
      "step_number": 5,
      "title": "Advanced Learning",
      "subtitle": "Accelerate your investment education",
      "description": "Optional: Unlock structured courses and expert resources",
      "duration_seconds": 45,
      "required": false,
      "optional": true,
      "conditional_show": null,
      "fields": [
        {
          "field_name": "interested_in_modules",
          "field_type": "multi_select_cards",
          "label": "Learning Paths",
          "description": "Which topics would you like to dive deeper into?",
          "required": false,
          "options": [
            {
              "value": "deal_analysis",
              "label": "Deal Analysis Mastery",
              "level": "Intermediate",
              "duration": "4 weeks",
              "description": "Learn to evaluate deals like a pro"
            },
            {
              "value": "portfolio_optimization",
              "label": "Portfolio Optimization",
              "level": "Advanced",
              "duration": "6 weeks",
              "description": "Rebalance for maximum returns"
            },
            {
              "value": "negotiation",
              "label": "Negotiation Tactics",
              "level": "Intermediate",
              "duration": "3 weeks",
              "description": "Get better deal terms"
            },
            {
              "value": "tax_planning",
              "label": "Tax Planning",
              "level": "Advanced",
              "duration": "5 weeks",
              "description": "Minimize taxes legally"
            },
            {
              "value": "automation",
              "label": "Portfolio Automation",
              "level": "Beginner",
              "duration": "2 weeks",
              "description": "Passive income on autopilot"
            }
          ],
          "max_selections": 3,
          "help_text": "Start with 0-2 courses. You can add more anytime.",
          "tooltip": "Modules are self-paced—start whenever you're ready"
        }
      ],
      "microcopy": {
        "main_heading": "Level up your investing skills (Optional)",
        "section_intro": "Structured courses from industry experts to accelerate results",
        "skip_text": "Skip for now—you can enable these anytime in settings"
      },
      "ui_layout": "Cards showing course title, level, duration, and description with checkboxes",
      "validation": {
        "interested_in_modules": "Optional—0 or more selections allowed"
      },
      "help_text": "Advanced modules are included with your account"
    },
    {
      "step_id": "review",
      "step_number": 6,
      "title": "Review Your Profile",
      "subtitle": "One more check before we dive in",
      "description": "Make sure everything looks good",
      "duration_seconds": 30,
      "required": true,
      "fields": [],
      "microcopy": {
        "main_heading": "Here's your investment profile",
        "summary_text": "We'll use these preferences to personalize your experience. You can update anything anytime.",
        "edit_cta": "Go Back to Edit"
      },
      "ui_layout": "Summary cards grouped by section (Deal Sourcing, Portfolio Goals, Community, etc.) with Edit buttons for each",
      "validation": "None—display only",
      "help_text": null,
      "display_sections": [
        {
          "title": "Deal Sourcing",
          "fields": ["target_industries", "investment_size_min", "investment_size_max", "preferred_deal_structures", "geo_preferences", "time_to_profitability_months"]
        },
        {
          "title": "Portfolio Goals",
          "fields": ["time_horizon", "target_return_percentage", "diversification_preference", "sector_priorities", "asset_class_priorities"]
        },
        {
          "title": "Community Preferences",
          "fields": ["networking_vs_knowledge", "peer_group_interests", "community_notification_frequency", "profile_visibility", "allow_collaboration_requests"]
        },
        {
          "title": "Advanced Learning",
          "fields": ["interested_in_modules"],
          "optional": true
        }
      ]
    },
    {
      "step_id": "complete",
      "step_number": 7,
      "title": "You're All Set!",
      "subtitle": "Your personalized investment journey begins now",
      "description": "FlashFusion is ready to help you find deals and optimize your portfolio",
      "duration_seconds": 0,
      "required": true,
      "fields": [],
      "microcopy": {
        "main_heading": "🎉 Welcome to FlashFusion!",
        "success_message": "Your profile is live. Here's what happens next:",
        "next_steps": [
          {
            "number": 1,
            "title": "AI Deal Discovery",
            "description": "Starting tomorrow, we'll source deals matching your criteria"
          },
          {
            "number": 2,
            "title": "Personalized Recommendations",
            "description": "Your AI Coach will suggest portfolio optimizations"
          },
          {
            "number": 3,
            "title": "Community Connections",
            "description": "You'll be added to relevant investor groups"
          },
          {
            "number": 4,
            "title": "Guided Setup",
            "description": "Tooltips & onboarding nudges throughout the app"
          }
        ],
        "cta_primary": "Go to Dashboard",
        "cta_secondary": "Explore AI Coach"
      },
      "ui_layout": "Hero success card with checkmark icon, numbered steps list, CTA buttons",
      "validation": "None"
    }
  ],
  "final_user_profile_schema": {
    "name": "UserPreferences",
    "type": "object",
    "description": "Complete user profile generated from onboarding wizard",
    "properties": {
      "has_completed_onboarding": {
        "type": "boolean",
        "description": "Flag indicating onboarding completion",
        "default": false
      },
      "onboarding_completed_at": {
        "type": "string",
        "format": "date-time",
        "description": "Timestamp when user completed onboarding"
      },
      "deal_sourcing_criteria": {
        "type": "object",
        "description": "Investment deal preferences",
        "properties": {
          "target_industries": {
            "type": "array",
            "items": { "type": "string" },
            "minItems": 1,
            "description": "Industries of interest"
          },
          "investment_size_min": {
            "type": "number",
            "minimum": 100,
            "description": "Minimum investment in USD"
          },
          "investment_size_max": {
            "type": "number",
            "description": "Maximum investment in USD"
          },
          "preferred_deal_structures": {
            "type": "array",
            "items": { "type": "string" },
            "enum": ["equity", "revenue_share", "affiliate", "licensing", "rental"],
            "minItems": 1,
            "description": "Preferred ways to earn returns"
          },
          "geo_preferences": {
            "type": "array",
            "items": { "type": "string" },
            "enum": ["us_only", "north_america", "english_speaking", "global"],
            "description": "Geographic focus"
          },
          "time_to_profitability_months": {
            "type": "number",
            "minimum": 1,
            "maximum": 60,
            "description": "Acceptable time horizon for profitability in months"
          }
        }
      },
      "portfolio_goals": {
        "type": "object",
        "description": "Investment strategy and performance targets",
        "properties": {
          "time_horizon": {
            "type": "string",
            "enum": ["short_term", "medium_term", "long_term"],
            "description": "Investment holding period"
          },
          "target_return_percentage": {
            "type": "number",
            "minimum": 5,
            "maximum": 100,
            "description": "Target annual ROI percentage"
          },
          "diversification_preference": {
            "type": "string",
            "enum": ["focused", "moderately_diversified", "highly_diversified"],
            "description": "Portfolio diversification strategy"
          },
          "sector_priorities": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Preferred investment sectors"
          },
          "asset_class_priorities": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Preferred asset types"
          }
        }
      },
      "community_preferences": {
        "type": "object",
        "description": "Social and collaboration settings",
        "properties": {
          "networking_vs_knowledge": {
            "type": "string",
            "enum": ["networking_focused", "balanced", "knowledge_focused"],
            "description": "Community interaction preference"
          },
          "peer_group_interests": {
            "type": "array",
            "items": { "type": "string" },
            "minItems": 1,
            "description": "Types of investor groups to join"
          },
          "community_notification_frequency": {
            "type": "string",
            "enum": ["real_time", "daily", "weekly", "monthly"],
            "description": "How often to receive community updates"
          },
          "profile_visibility": {
            "type": "string",
            "enum": ["private", "network_only", "public"],
            "description": "Who can see the user's profile"
          },
          "allow_collaboration_requests": {
            "type": "boolean",
            "description": "Allow other investors to request collaboration",
            "default": true
          }
        }
      },
      "learning_preferences": {
        "type": "object",
        "description": "Optional advanced learning preferences",
        "properties": {
          "interested_modules": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Learning paths user wants to pursue"
          },
          "preferred_learning_pace": {
            "type": "string",
            "enum": ["self_paced", "structured", "intensive"],
            "default": "self_paced",
            "description": "Preferred course pacing"
          }
        }
      }
    },
    "required": [
      "has_completed_onboarding",
      "deal_sourcing_criteria",
      "portfolio_goals",
      "community_preferences"
    ]
  },
  "branching_logic": {
    "description": "Conditional flow decisions",
    "rules": [
      {
        "condition": "User wants to skip advanced learning",
        "action": "Skip advanced_modules step",
        "result": "Go directly to review"
      },
      {
        "condition": "User returns to edit from review",
        "action": "Show 'Go back to edit' button per section",
        "result": "Jump back to specific step on click"
      },
      {
        "condition": "Investment size min > max",
        "action": "Show validation error",
        "result": "Block progression until corrected"
      },
      {
        "condition": "No sectors or industries selected",
        "action": "Show validation error",
        "result": "Block progression until at least 1 selected"
      }
    ]
  },
  "ux_best_practices": {
    "progress_visibility": "Show visual progress bar (0-100%) + step counter",
    "estimated_time": "Display estimated remaining time (5-7 minutes total)",
    "save_progress": "Auto-save to local storage every 10 seconds",
    "skip_paths": "Allow 'Skip to review' from steps 2-5, optional modules always skippable",
    "error_handling": "Inline validation with specific, helpful error messages",
    "accessibility": "Clear labels, ARIA attributes, keyboard navigation support",
    "mobile_optimization": "Single-column layout, touch-friendly buttons/inputs, readable text",
    "response_time": "All interactions respond within 200ms",
    "visual_feedback": "Button states (hover, active, disabled), loading spinners for saves"
  },
  "success_metrics": {
    "completion_rate": "% of users who finish onboarding",
    "average_time": "Time to complete entire wizard",
    "drop_off_rate": "% who abandon per step",
    "validation_errors": "# of form errors per user",
    "edit_frequency": "# of times users go back to edit"
  }
}