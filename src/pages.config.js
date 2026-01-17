import Admin from './pages/Admin';
import Bookmarks from './pages/Bookmarks';
import Community from './pages/Community';
import Dashboard from './pages/Dashboard';
import Documentation from './pages/Documentation';
import Home from './pages/Home';
import IdeaDetail from './pages/IdeaDetail';
import Learn from './pages/Learn';
import Portfolio from './pages/Portfolio';
import ProfileSettings from './pages/ProfileSettings';
import Trends from './pages/Trends';
import Forum from './pages/Forum';
import ForumPost from './pages/ForumPost';
import DealPipeline from './pages/DealPipeline';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "Bookmarks": Bookmarks,
    "Community": Community,
    "Dashboard": Dashboard,
    "Documentation": Documentation,
    "Home": Home,
    "IdeaDetail": IdeaDetail,
    "Learn": Learn,
    "Portfolio": Portfolio,
    "ProfileSettings": ProfileSettings,
    "Trends": Trends,
    "Forum": Forum,
    "ForumPost": ForumPost,
    "DealPipeline": DealPipeline,
}

export const pagesConfig = {
    mainPage: "Community",
    Pages: PAGES,
    Layout: __Layout,
};