import React, {useContext} from 'react';
import {Context} from "../index";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {useNavigate} from "react-router-dom"
import './NavBar.css'

import {observer} from "mobx-react-lite";



const NavBar = observer(() => {
    const {user} = useContext(Context)
    const navigate = useNavigate()

    const logOut = () => {
        user.setUser({})
        user.setIsAuth(false)
        navigate("/login")
    }


    return (
        <Navbar fixed="top" collapseOnSelect expand="lg" className="bg-body-tertiary">
            <Container fluid className="ms-5">
                <Navbar.Brand href="/" className="me-auto">
                    SMDT
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" className="ms-auto" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto ms-5">
                        <Nav.Link className="ms-5 sidebar-link" href="/terminal">📻 Terminal</Nav.Link>
                        <Nav.Link className="sidebar-link" href="/servers">🖥️ Servers</Nav.Link>
                    </Nav>
                    <Nav>
                        {user.isAuth ? (
                            <>
                                {user.user.role === "ADMIN" ? (
                                    <Nav.Link className="sidebar-link" onClick={() => navigate('/admin')}>Admin Panel</Nav.Link>
                                ) : (
                                    <Nav.Link className="sidebar-link" onClick={() => navigate('/my')}>{user.user.email}</Nav.Link>
                                )}
                                <Nav.Link className="sidebar-link" onClick={() => logOut()}>Выйти</Nav.Link>
                            </>
                        ) : (
                            <Nav.Link className="sidebar-link" onClick={() => navigate('/login')}>Login</Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>

            <Nav
                className="flex-column bg-body-tertiary position-fixed sidebar-nav"
                style={{ height: '100vh', width: '200px', top: '54px', left: '0' }}
            >
                <Nav.Link className="sidebar-link" href="/dashboard">📊 Dashboard</Nav.Link>
                <Nav.Link className="sidebar-link" href="/servers">🖥️ Servers</Nav.Link>
                <Nav.Link className="sidebar-link" href="/loads">🧩 Loads</Nav.Link>
                <Nav.Link className="sidebar-link" href="/attack">💥 All Attacks</Nav.Link>
            </Nav>
        </Navbar>
    );
});

export default NavBar;