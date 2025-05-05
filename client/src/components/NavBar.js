import React, { useContext } from 'react';
import { Context } from "../index";
import Nav from 'react-bootstrap/Nav';
import { useNavigate } from "react-router-dom";
import './NavBar.css';

const NavBar = () => {
  const { user } = useContext(Context);
  const navigate = useNavigate();

  const logOut = () => {
    user.setUser({});
    user.setIsAuth(false);
    navigate("/login");
  };

  return (
    <div className="sidebar-nav">
      <div className="sidebar-header">
        <img src="/ddos.png" alt="icon" className="sidebar-logo" />
        <span className="sidebar-title">SMDT</span>
      </div>
      <Nav className="flex-column sidebar-links">
        <Nav.Link href="/dashboard">📊 Dashboard</Nav.Link>
        <Nav.Link href="/servers">🖥️ Servers</Nav.Link>
        <Nav.Link href="/loads">🧩 Loads</Nav.Link>
        <Nav.Link href="/attack">💥 All Attacks</Nav.Link>
        <Nav.Link href="/terminal">📻 Terminal</Nav.Link>
      </Nav>
      <div className="sidebar-footer">
        {user.isAuth ? (
          <>
            <div
              className="sidebar-user"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (user.user.role === 'ADMIN') {
                  navigate('/admin');
                } else {
                  navigate('/my');
                }
              }}
            >
              {user.user.email}
            </div >
            <Nav.Link className="sidebar-user" onClick={logOut}>Выйти</Nav.Link>
          </>
        ) : (
          <Nav.Link className="sidebar-user" onClick={() => navigate('/login')}>Login</Nav.Link>
        )}
      </div>
    </div>
  );
};

export default NavBar;