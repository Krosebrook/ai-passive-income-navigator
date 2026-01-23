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
    "Trends": Trends,
    "UserPreferences": UserPreferences,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};