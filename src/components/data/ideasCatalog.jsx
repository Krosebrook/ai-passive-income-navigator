export const CATEGORIES = [
  { id: 'digital_products', name: 'Digital Products & Content', icon: 'FileText', color: 'from-blue-500 to-cyan-500' },
  { id: 'ai_services', name: 'AI-Powered Services', icon: 'Bot', color: 'from-violet-500 to-purple-500' },
  { id: 'ecommerce', name: 'E-commerce & Products', icon: 'ShoppingBag', color: 'from-orange-500 to-amber-500' },
  { id: 'affiliate', name: 'Affiliate Marketing', icon: 'Link', color: 'from-green-500 to-emerald-500' },
  { id: 'education', name: 'Online Education', icon: 'GraduationCap', color: 'from-pink-500 to-rose-500' },
  { id: 'software', name: 'Software & SaaS', icon: 'Code', color: 'from-indigo-500 to-blue-500' },
  { id: 'investing', name: 'Investing & Finance', icon: 'TrendingUp', color: 'from-emerald-500 to-teal-500' },
  { id: 'marketplace', name: 'Marketplace Businesses', icon: 'Store', color: 'from-purple-500 to-pink-500' },
  { id: 'automation', name: 'Automation & AI Tools', icon: 'Zap', color: 'from-amber-500 to-orange-500' },
  { id: 'rental', name: 'Rental Income & Assets', icon: 'Home', color: 'from-teal-500 to-cyan-500' }
];

export const IDEAS_CATALOG = [
  // Digital Products & Content
  {
    id: 1,
    title: "AI-Generated Stock Photos",
    description: "Create and sell AI-generated stock images on platforms like Adobe Stock, Shutterstock, and your own website. Use tools like Midjourney or DALL-E to create unique, high-quality visuals.",
    category: "digital_products",
    difficulty: "beginner",
    estimated_income: "$500-$5,000/month",
    time_to_profit: "1-3 months",
    tools: ["Midjourney", "DALL-E 3", "Adobe Stock", "Shutterstock"],
    getting_started: [
      "Choose your niche (business, nature, lifestyle, etc.)",
      "Create an account on stock photo platforms",
      "Generate 50-100 high-quality images",
      "Upload with proper keywords and descriptions",
      "Scale based on what sells"
    ]
  },
  {
    id: 2,
    title: "Notion Template Store",
    description: "Design and sell Notion templates for productivity, project management, and personal organization. Create once, sell unlimited times.",
    category: "digital_products",
    difficulty: "beginner",
    estimated_income: "$200-$3,000/month",
    time_to_profit: "2-4 weeks",
    tools: ["Notion", "Gumroad", "Canva", "Twitter"],
    getting_started: [
      "Master Notion's advanced features",
      "Identify popular template categories",
      "Create 5-10 polished templates",
      "Set up Gumroad storefront",
      "Market on social media"
    ]
  },
  {
    id: 3,
    title: "AI Writing Assistant for Specific Niche",
    description: "Build a custom GPT or AI writing tool tailored to a specific industry like real estate, legal, or healthcare. Charge subscription fees.",
    category: "ai_services",
    difficulty: "intermediate",
    estimated_income: "$1,000-$10,000/month",
    time_to_profit: "2-4 months",
    tools: ["OpenAI API", "Custom GPTs", "Stripe", "Webflow"],
    getting_started: [
      "Choose a high-value niche",
      "Research industry-specific writing needs",
      "Build and train your custom GPT",
      "Create landing page and payment system",
      "Launch beta with early adopters"
    ]
  },
  {
    id: 4,
    title: "Print-on-Demand Art Business",
    description: "Create unique designs using AI art tools and sell them on print-on-demand products like t-shirts, mugs, and posters through Printify or Printful.",
    category: "ecommerce",
    difficulty: "beginner",
    estimated_income: "$500-$5,000/month",
    time_to_profit: "1-2 months",
    tools: ["Midjourney", "Printify", "Etsy", "Shopify"],
    getting_started: [
      "Find trending design niches",
      "Create 20-30 unique designs",
      "Connect Printify to Etsy or Shopify",
      "Optimize listings with keywords",
      "Run targeted ads"
    ]
  },
  {
    id: 5,
    title: "YouTube Faceless Channel",
    description: "Create automated YouTube content using AI for scripts, voiceovers, and video editing. Popular niches include facts, tutorials, and compilations.",
    category: "digital_products",
    difficulty: "intermediate",
    estimated_income: "$500-$20,000/month",
    time_to_profit: "6-12 months",
    tools: ["ChatGPT", "ElevenLabs", "Pictory", "Canva"],
    getting_started: [
      "Research profitable faceless niches",
      "Set up your AI content workflow",
      "Create 30 videos before launching",
      "Post consistently 3-5x per week",
      "Monetize at 1K subs / 4K hours"
    ]
  },
  {
    id: 6,
    title: "AI Chatbot Development Agency",
    description: "Build custom AI chatbots for businesses using no-code tools. Charge setup fees plus monthly maintenance.",
    category: "ai_services",
    difficulty: "intermediate",
    estimated_income: "$2,000-$15,000/month",
    time_to_profit: "1-3 months",
    tools: ["Botpress", "Voiceflow", "ChatGPT API", "Zapier"],
    getting_started: [
      "Learn chatbot development platforms",
      "Create portfolio of demo bots",
      "Target local businesses",
      "Offer free trials",
      "Upsell maintenance packages"
    ]
  },
  {
    id: 7,
    title: "Affiliate Review Website",
    description: "Create a niche review website with AI-generated content and earn commissions from affiliate links. Focus on high-ticket items.",
    category: "affiliate",
    difficulty: "intermediate",
    estimated_income: "$500-$10,000/month",
    time_to_profit: "4-8 months",
    tools: ["WordPress", "ChatGPT", "Ahrefs", "Amazon Associates"],
    getting_started: [
      "Choose a profitable niche",
      "Research keywords with buyer intent",
      "Create 50+ high-quality reviews",
      "Build backlinks for SEO",
      "Join multiple affiliate programs"
    ]
  },
  {
    id: 8,
    title: "Online Course with AI Content",
    description: "Create comprehensive online courses using AI for content creation, slide design, and even virtual tutoring assistance.",
    category: "education",
    difficulty: "intermediate",
    estimated_income: "$1,000-$20,000/month",
    time_to_profit: "2-4 months",
    tools: ["Teachable", "ChatGPT", "Canva", "Loom"],
    getting_started: [
      "Identify your expertise area",
      "Validate course idea with audience",
      "Create curriculum with AI assistance",
      "Record professional videos",
      "Launch with promotional pricing"
    ]
  },
  {
    id: 9,
    title: "AI Code Review SaaS",
    description: "Build a SaaS tool that uses AI to automatically review code, find bugs, and suggest improvements for developers.",
    category: "software",
    difficulty: "advanced",
    estimated_income: "$5,000-$50,000/month",
    time_to_profit: "4-8 months",
    tools: ["OpenAI API", "GitHub API", "React", "Node.js"],
    getting_started: [
      "Define target programming languages",
      "Build MVP with core features",
      "Beta test with developer communities",
      "Implement subscription billing",
      "Scale with enterprise features"
    ]
  },
  {
    id: 10,
    title: "Dividend Stock Portfolio",
    description: "Build a dividend-focused investment portfolio that generates passive income through quarterly payments. Use AI for stock analysis.",
    category: "investing",
    difficulty: "beginner",
    estimated_income: "$100-$2,000/month",
    time_to_profit: "12+ months",
    tools: ["Robinhood", "Seeking Alpha", "ChatGPT", "Dividend.com"],
    getting_started: [
      "Learn dividend investing basics",
      "Start with dividend ETFs",
      "Reinvest dividends initially",
      "Gradually build individual positions",
      "Aim for 3-5% annual yield"
    ]
  },
  {
    id: 11,
    title: "AI Art NFT Collection",
    description: "Create and sell unique AI-generated art as NFTs on platforms like OpenSea. Build a community around your collection.",
    category: "digital_products",
    difficulty: "intermediate",
    estimated_income: "$0-$50,000/month",
    time_to_profit: "1-6 months",
    tools: ["Midjourney", "OpenSea", "MetaMask", "Discord"],
    getting_started: [
      "Develop unique art style",
      "Create collection of 100+ pieces",
      "Build Discord community",
      "Launch with whitelist strategy",
      "Market on Twitter/X"
    ]
  },
  {
    id: 12,
    title: "Podcast Production Service",
    description: "Offer AI-powered podcast editing, transcription, and show notes creation. Scale by automating repetitive tasks.",
    category: "ai_services",
    difficulty: "intermediate",
    estimated_income: "$2,000-$10,000/month",
    time_to_profit: "1-2 months",
    tools: ["Descript", "Otter.ai", "ChatGPT", "Adobe Podcast"],
    getting_started: [
      "Learn audio editing basics",
      "Set up AI workflow for editing",
      "Create service packages",
      "Find clients on podcast communities",
      "Deliver consistent quality"
    ]
  },
  {
    id: 13,
    title: "Dropshipping Store with AI",
    description: "Run an e-commerce store without inventory using dropshipping. Use AI for product research, descriptions, and customer service.",
    category: "ecommerce",
    difficulty: "intermediate",
    estimated_income: "$500-$10,000/month",
    time_to_profit: "2-4 months",
    tools: ["Shopify", "Oberlo", "ChatGPT", "Canva"],
    getting_started: [
      "Research winning products",
      "Set up Shopify store",
      "Write AI-optimized descriptions",
      "Run Facebook/TikTok ads",
      "Automate customer support"
    ]
  },
  {
    id: 14,
    title: "Newsletter with Paid Subscriptions",
    description: "Build a valuable newsletter using AI for research and writing. Monetize through paid subscriptions and sponsors.",
    category: "digital_products",
    difficulty: "intermediate",
    estimated_income: "$500-$20,000/month",
    time_to_profit: "6-12 months",
    tools: ["Substack", "ChatGPT", "Beehiiv", "Twitter"],
    getting_started: [
      "Choose a focused niche",
      "Create content strategy",
      "Build free subscriber base first",
      "Launch paid tier at 1K+ subs",
      "Seek sponsorship deals"
    ]
  },
  {
    id: 15,
    title: "AI Photo Editing Service",
    description: "Offer professional photo editing services enhanced by AI tools. Serve real estate, e-commerce, and portrait photographers.",
    category: "ai_services",
    difficulty: "beginner",
    estimated_income: "$1,000-$5,000/month",
    time_to_profit: "2-4 weeks",
    tools: ["Photoshop", "Luminar AI", "Remove.bg", "Canva"],
    getting_started: [
      "Master AI editing tools",
      "Create before/after portfolio",
      "List on Fiverr and Upwork",
      "Target specific industries",
      "Offer bulk editing packages"
    ]
  },
  {
    id: 16,
    title: "Mobile App with AI Features",
    description: "Build a mobile app that leverages AI for unique functionality. Use no-code platforms to reduce development time.",
    category: "software",
    difficulty: "advanced",
    estimated_income: "$1,000-$30,000/month",
    time_to_profit: "3-6 months",
    tools: ["FlutterFlow", "OpenAI API", "Firebase", "RevenueCat"],
    getting_started: [
      "Identify app idea with AI angle",
      "Validate with potential users",
      "Build MVP with no-code tools",
      "Launch on App Store/Play Store",
      "Iterate based on feedback"
    ]
  },
  {
    id: 17,
    title: "Real Estate Crowdfunding",
    description: "Invest in real estate through crowdfunding platforms. Earn passive income from rental properties and property appreciation.",
    category: "investing",
    difficulty: "beginner",
    estimated_income: "$100-$1,000/month",
    time_to_profit: "3-12 months",
    tools: ["Fundrise", "CrowdStreet", "RealtyMogul", "Arrived"],
    getting_started: [
      "Research crowdfunding platforms",
      "Start with diversified REITs",
      "Reinvest dividends",
      "Gradually increase investment",
      "Monitor quarterly reports"
    ]
  },
  {
    id: 18,
    title: "Digital Asset Marketplace",
    description: "Create a marketplace for digital assets like templates, fonts, graphics, or code snippets. Earn from each transaction.",
    category: "marketplace",
    difficulty: "advanced",
    estimated_income: "$1,000-$20,000/month",
    time_to_profit: "6-12 months",
    tools: ["Sharetribe", "Stripe", "AWS", "Next.js"],
    getting_started: [
      "Choose specific asset niche",
      "Build marketplace MVP",
      "Recruit initial creators",
      "Handle payments securely",
      "Market to buyers and sellers"
    ]
  },
  {
    id: 19,
    title: "AI Email Marketing Automation",
    description: "Create automated email sequences for businesses using AI. Charge for setup and ongoing optimization.",
    category: "automation",
    difficulty: "intermediate",
    estimated_income: "$1,500-$8,000/month",
    time_to_profit: "1-2 months",
    tools: ["Mailchimp", "ChatGPT", "ConvertKit", "Zapier"],
    getting_started: [
      "Learn email marketing best practices",
      "Create AI prompt templates",
      "Build case studies",
      "Target e-commerce businesses",
      "Offer performance-based pricing"
    ]
  },
  {
    id: 20,
    title: "Rental Property Investment",
    description: "Purchase properties to rent out for passive income. Use AI for market analysis, pricing optimization, and tenant screening.",
    category: "rental",
    difficulty: "advanced",
    estimated_income: "$500-$5,000/month per property",
    time_to_profit: "6-12 months",
    tools: ["Zillow", "Rentometer", "Buildium", "ChatGPT"],
    getting_started: [
      "Save for down payment",
      "Research best rental markets",
      "Get pre-approved for mortgage",
      "Find undervalued properties",
      "Screen tenants carefully"
    ]
  },
  {
    id: 21,
    title: "AI-Powered Resume Service",
    description: "Offer resume writing and optimization using AI. Help job seekers stand out with tailored, ATS-optimized resumes.",
    category: "ai_services",
    difficulty: "beginner",
    estimated_income: "$1,000-$5,000/month",
    time_to_profit: "2-4 weeks",
    tools: ["ChatGPT", "Canva", "Grammarly", "LinkedIn"],
    getting_started: [
      "Learn ATS optimization",
      "Create resume templates",
      "Build AI writing workflow",
      "Market on LinkedIn",
      "Offer multiple packages"
    ]
  },
  {
    id: 22,
    title: "Kindle Direct Publishing",
    description: "Write and publish eBooks on Amazon using AI assistance. Cover non-fiction, how-to guides, and low-content books.",
    category: "digital_products",
    difficulty: "beginner",
    estimated_income: "$200-$5,000/month",
    time_to_profit: "2-4 months",
    tools: ["ChatGPT", "Canva", "Amazon KDP", "Publisher Rocket"],
    getting_started: [
      "Research profitable niches",
      "Write book with AI assistance",
      "Design professional cover",
      "Optimize keywords and description",
      "Publish and promote"
    ]
  },
  {
    id: 23,
    title: "Social Media Management Agency",
    description: "Manage social media for businesses using AI for content creation, scheduling, and analytics.",
    category: "ai_services",
    difficulty: "intermediate",
    estimated_income: "$2,000-$15,000/month",
    time_to_profit: "1-3 months",
    tools: ["Buffer", "ChatGPT", "Canva", "Later"],
    getting_started: [
      "Define service packages",
      "Build portfolio with case studies",
      "Start with local businesses",
      "Automate content creation",
      "Scale with team members"
    ]
  },
  {
    id: 24,
    title: "AI Voice-Over Business",
    description: "Create professional voice-overs using AI text-to-speech technology. Serve video creators, advertisers, and businesses.",
    category: "ai_services",
    difficulty: "beginner",
    estimated_income: "$500-$3,000/month",
    time_to_profit: "2-4 weeks",
    tools: ["ElevenLabs", "Play.ht", "Murf AI", "Audacity"],
    getting_started: [
      "Test different AI voice tools",
      "Create demo reel",
      "List services on Fiverr",
      "Specialize in specific niches",
      "Offer quick turnaround"
    ]
  },
  {
    id: 25,
    title: "WordPress Theme/Plugin Shop",
    description: "Create and sell WordPress themes or plugins. Earn from one-time sales or annual renewals.",
    category: "software",
    difficulty: "advanced",
    estimated_income: "$1,000-$20,000/month",
    time_to_profit: "3-6 months",
    tools: ["WordPress", "PHP", "JavaScript", "Envato"],
    getting_started: [
      "Identify market gaps",
      "Build polished product",
      "Create documentation",
      "Submit to marketplaces",
      "Provide excellent support"
    ]
  },
  {
    id: 26,
    title: "AI Data Analysis Consulting",
    description: "Help businesses make sense of their data using AI tools. Provide insights, reports, and strategic recommendations.",
    category: "ai_services",
    difficulty: "advanced",
    estimated_income: "$3,000-$20,000/month",
    time_to_profit: "2-4 months",
    tools: ["Python", "ChatGPT", "Tableau", "Google Analytics"],
    getting_started: [
      "Build data analysis skills",
      "Create analysis templates",
      "Network with business owners",
      "Offer discovery calls",
      "Deliver actionable insights"
    ]
  },
  {
    id: 27,
    title: "Digital Download Etsy Shop",
    description: "Sell digital downloads like planners, wall art, and invitations on Etsy. Create once, sell unlimited times.",
    category: "ecommerce",
    difficulty: "beginner",
    estimated_income: "$300-$5,000/month",
    time_to_profit: "1-3 months",
    tools: ["Canva", "Etsy", "ChatGPT", "Pinterest"],
    getting_started: [
      "Research trending products",
      "Create quality templates",
      "Optimize Etsy listings",
      "Use Pinterest for traffic",
      "Expand product catalog"
    ]
  },
  {
    id: 28,
    title: "AI Music Creation Service",
    description: "Create royalty-free music and sound effects using AI. Sell licenses on stock audio platforms.",
    category: "digital_products",
    difficulty: "intermediate",
    estimated_income: "$200-$3,000/month",
    time_to_profit: "2-4 months",
    tools: ["Soundraw", "AIVA", "Mubert", "AudioJungle"],
    getting_started: [
      "Explore AI music generators",
      "Create genre-specific tracks",
      "Upload to multiple platforms",
      "Build catalog of 50+ tracks",
      "Target video creators"
    ]
  },
  {
    id: 29,
    title: "Micro-SaaS Tool",
    description: "Build a small, focused software tool that solves one specific problem. Charge monthly subscriptions.",
    category: "software",
    difficulty: "intermediate",
    estimated_income: "$500-$10,000/month",
    time_to_profit: "2-4 months",
    tools: ["No-code tools", "Stripe", "Crisp", "Notion"],
    getting_started: [
      "Find annoying problem to solve",
      "Build minimal viable product",
      "Launch to small audience",
      "Iterate based on feedback",
      "Grow through content marketing"
    ]
  },
  {
    id: 30,
    title: "AI Translation Service",
    description: "Offer professional translation services enhanced by AI. Focus on specific language pairs and industries.",
    category: "ai_services",
    difficulty: "intermediate",
    estimated_income: "$1,000-$8,000/month",
    time_to_profit: "1-2 months",
    tools: ["DeepL", "ChatGPT", "Grammarly", "MemoQ"],
    getting_started: [
      "Choose language specialization",
      "Test AI translation tools",
      "Create quality assurance process",
      "Target specific industries",
      "Build client relationships"
    ]
  }
];

export const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-700 border-green-200',
  intermediate: 'bg-amber-100 text-amber-700 border-amber-200',
  advanced: 'bg-red-100 text-red-700 border-red-200'
};

export const STATUS_COLORS = {
  exploring: 'bg-slate-100 text-slate-700',
  planning: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  launched: 'bg-green-100 text-green-700',
  paused: 'bg-gray-100 text-gray-500'
};

export const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-red-100 text-red-600'
};

export const GRADIENT_OPTIONS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-pink-500 to-rose-500',
  'from-indigo-500 to-blue-500',
  'from-fuchsia-500 to-pink-500',
  'from-cyan-500 to-blue-500'
];