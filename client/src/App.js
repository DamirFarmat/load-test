import React, {useContext, useEffect, useState} from "react";
import {BrowserRouter} from "react-router-dom";
import AppRouter from "./components/AppRouter";
import Navbar from "./components/NavBar";
import {observer} from "mobx-react-lite";
import {Context} from "./index";
import {Spinner} from "react-bootstrap";
import { check } from "./http/userAPI";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = observer(() => {
    const {user} = useContext(Context);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        check().then(data => {
            user.setUser(data);
            user.setIsAuth(true);
        }).catch(() => {
            user.setUser({});
            user.setIsAuth(false);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <Spinner animation={"grow"}/>;
    }

    return (
        <BrowserRouter>
            <Navbar />
            <div className="main-content">
                <AppRouter />
                <ToastContainer position="top-right" autoClose={3000} />
            </div>
        </BrowserRouter>
    );
});

export default App;
