import Community from './pages/Community';
import IdeaDetail from './pages/IdeaDetail';
import Learn from './pages/Learn';
import ProfileSettings from './pages/ProfileSettings';
import Trends from './pages/Trends';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Community": Community,
    "IdeaDetail": IdeaDetail,
    "Learn": Learn,
    "ProfileSettings": ProfileSettings,
    "Trends": Trends,
}

export const pagesConfig = {
    mainPage: "Community",
    Pages: PAGES,
    Layout: __Layout,
};