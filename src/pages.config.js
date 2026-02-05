/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AICoach from './pages/AICoach';
import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import Bookmarks from './pages/Bookmarks';
import Collaborate from './pages/Collaborate';
import Community from './pages/Community';
import Dashboard from './pages/Dashboard';
import DataManagement from './pages/DataManagement';
import DealDiscovery from './pages/DealDiscovery';
import DealPipeline from './pages/DealPipeline';
import Documentation from './pages/Documentation';
import Forum from './pages/Forum';
import ForumPost from './pages/ForumPost';
import Gamification from './pages/Gamification';
import Home from './pages/Home';
import IdeaDetail from './pages/IdeaDetail';
import Integrations from './pages/Integrations';
import Landing from './pages/Landing';
import Learn from './pages/Learn';
import Portfolio from './pages/Portfolio';
import PortfolioManagement from './pages/PortfolioManagement';
import ProfileSettings from './pages/ProfileSettings';
import Splash from './pages/Splash';
import Trends from './pages/Trends';
import UserPreferences from './pages/UserPreferences';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AICoach": AICoach,
    "Admin": Admin,
    "Analytics": Analytics,
    "Bookmarks": Bookmarks,
    "Collaborate": Collaborate,
    "Community": Community,
    "Dashboard": Dashboard,
    "DataManagement": DataManagement,
    "DealDiscovery": DealDiscovery,
    "DealPipeline": DealPipeline,
    "Documentation": Documentation,
    "Forum": Forum,
    "ForumPost": ForumPost,
    "Gamification": Gamification,
    "Home": Home,
    "IdeaDetail": IdeaDetail,
    "Integrations": Integrations,
    "Landing": Landing,
    "Learn": Learn,
    "Portfolio": Portfolio,
    "PortfolioManagement": PortfolioManagement,
    "ProfileSettings": ProfileSettings,
    "Splash": Splash,
    "Trends": Trends,
    "UserPreferences": UserPreferences,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};