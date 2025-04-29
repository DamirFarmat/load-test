import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import UserStore from './store/UserStore';
import ServerStore from "./store/ServerStore";
import AttackStore from "./store/AttackStore";
import LoadStore from "./store/LoadStore";
import { createContext } from 'react';

export const Context = createContext(null);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <Context.Provider value={{
            user: new UserStore(),
            servers: new ServerStore(),
            attack: new AttackStore(),
            load: new LoadStore(),
        }}>
            <App />
        </Context.Provider>
    </React.StrictMode>
);
