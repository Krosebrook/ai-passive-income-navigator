import Bookmarks from './pages/Bookmarks';
import Community from './pages/Community';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import IdeaDetail from './pages/IdeaDetail';
import Learn from './pages/Learn';
import Portfolio from './pages/Portfolio';
import ProfileSettings from './pages/ProfileSettings';
import Trends from './pages/Trends';
import Admin from './pages/Admin';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Bookmarks": Bookmarks,
    "Community": Community,
    "Dashboard": Dashboard,
    "Home": Home,
    "IdeaDetail": IdeaDetail,
    "Learn": Learn,
    "Portfolio": Portfolio,
    "ProfileSettings": ProfileSettings,
    "Trends": Trends,
    "Admin": Admin,
}

export const pagesConfig = {
    mainPage: "Community",
    Pages: PAGES,
    Layout: __Layout,
};