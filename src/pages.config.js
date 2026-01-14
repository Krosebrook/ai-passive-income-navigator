import { lazy } from 'react';
import Home from './pages/Home';
import Bookmarks from './pages/Bookmarks';
import Trends from './pages/Trends';
import Community from './pages/Community';

// Safe addition: Lazy load largest pages to improve initial load time
// Reduces main bundle size by code-splitting heavy pages
// Pages load on-demand when user navigates to them
// Smallest pages (Home, Bookmarks, Trends, Community) remain eagerly loaded for fast initial render
const IdeaDetail = lazy(() => import('./pages/IdeaDetail'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));


export const PAGES = {
    "Home": Home,
    "IdeaDetail": IdeaDetail,
    "Portfolio": Portfolio,
    "Bookmarks": Bookmarks,
    "Trends": Trends,
    "Dashboard": Dashboard,
    "Community": Community,
    "ProfileSettings": ProfileSettings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};