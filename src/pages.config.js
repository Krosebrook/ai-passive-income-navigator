import Bookmarks from './pages/Bookmarks';
import bookmarksTest from './pages/Bookmarks.test';
import Community from './pages/Community';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import IdeaDetail from './pages/IdeaDetail';
import Portfolio from './pages/Portfolio';
import portfolioTest from './pages/Portfolio.test';
import ProfileSettings from './pages/ProfileSettings';
import Trends from './pages/Trends';
import Learn from './pages/Learn';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Bookmarks": Bookmarks,
    "Bookmarks.test": bookmarksTest,
    "Community": Community,
    "Dashboard": Dashboard,
    "Home": Home,
    "IdeaDetail": IdeaDetail,
    "Portfolio": Portfolio,
    "Portfolio.test": portfolioTest,
    "ProfileSettings": ProfileSettings,
    "Trends": Trends,
    "Learn": Learn,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};