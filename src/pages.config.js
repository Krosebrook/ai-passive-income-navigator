import Admin from './pages/Admin';
import Bookmarks from './pages/Bookmarks';
import Collaborate from './pages/Collaborate';
import Community from './pages/Community';
import Dashboard from './pages/Dashboard';
import DealDiscovery from './pages/DealDiscovery';
import DealPipeline from './pages/DealPipeline';
import Documentation from './pages/Documentation';
import Forum from './pages/Forum';
import ForumPost from './pages/ForumPost';
import Home from './pages/Home';
import IdeaDetail from './pages/IdeaDetail';
import Learn from './pages/Learn';
import Portfolio from './pages/Portfolio';
import ProfileSettings from './pages/ProfileSettings';
import Trends from './pages/Trends';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "Bookmarks": Bookmarks,
    "Collaborate": Collaborate,
    "Community": Community,
    "Dashboard": Dashboard,
    "DealDiscovery": DealDiscovery,
    "DealPipeline": DealPipeline,
    "Documentation": Documentation,
    "Forum": Forum,
    "ForumPost": ForumPost,
    "Home": Home,
    "IdeaDetail": IdeaDetail,
    "Learn": Learn,
    "Portfolio": Portfolio,
    "ProfileSettings": ProfileSettings,
    "Trends": Trends,
}

export const pagesConfig = {
    mainPage: "Community",
    Pages: PAGES,
    Layout: __Layout,
};