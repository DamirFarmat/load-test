import {
    ABOUT_ROUTE,
    ADMIN_ROUTE,
    ATTACK_ROUTE,
    DASHBOARD_ROUTE,
    LOGIN_ROUTE,
    REGISTRATION_ROUTE,
    SERVERS_ROUTE,
    TERMINAL_ROUTE,
    LOADS_ROUTE,
    MY_ROUTE
} from "./utils/consts";
import Admin from "./pages/Admin.js";
import Dashboard from "./pages/Dashboard";
import Attack from "./pages/Attack";
import AttackDetails from "./pages/AttackDetails";
import Terminal from "./pages/Terminal";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Servers from "./pages/Servers";
import ServerDetails from "./pages/ServerDetails";
import Loads from "./pages/Loads";
import MyProfile from "./pages/MyProfile";



export const authRoutes = [
    {
        path: ADMIN_ROUTE,
        Component: <Admin />
    },
    {
        path: MY_ROUTE,
        Component: <MyProfile />
    },
    {
        path: DASHBOARD_ROUTE,
        Component: <Dashboard />
    },
    {
        path: ATTACK_ROUTE,
        Component: <Attack />
    },
    {
        path: ATTACK_ROUTE + "/:id",
        Component: <AttackDetails />
    },
    {
        path: TERMINAL_ROUTE,
        Component: <Terminal />
    },
    {
        path: SERVERS_ROUTE,
        Component: <Servers />
    },
    {
        path: SERVERS_ROUTE + "/:id",
        Component: <ServerDetails />
    },
    {
        path: LOADS_ROUTE,
        Component: <Loads />
    },

]

export const publicRoutes = [
    {
        path: REGISTRATION_ROUTE,
        Component: <Auth />
    },
    {
        path: LOGIN_ROUTE,
        Component: <Auth />
    },
    {
        path: ABOUT_ROUTE,
        Component: <About />
    },
]