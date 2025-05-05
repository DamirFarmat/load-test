import React, { useContext, useState } from 'react';
import { Context } from "../index";
import Nav from 'react-bootstrap/Nav';
import { useNavigate } from "react-router-dom";
import './NavBar.css';

const NavBar = () => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logOut = () => {
    user.setUser({});
    user.setIsAuth(false);
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <div className="mobile-header">
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <span className="menu-icon"></span>
        </button>
        <div className="mobile-logo">
          <img src="/ddos.png" alt="icon" className="sidebar-logo" />
          <span className="sidebar-title">SMDT</span>
        </div>
      </div>
      <div className={`sidebar-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <img src="/ddos.png" alt="icon" className="sidebar-logo" />
          <span className="sidebar-title">SMDT</span>
        </div>
        <Nav className="flex-column sidebar-links">
          <Nav.Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>📊 Dashboard</Nav.Link>
          <Nav.Link href="/servers" onClick={() => setIsMobileMenuOpen(false)}>🖥️ Servers</Nav.Link>
          <Nav.Link href="/loads" onClick={() => setIsMobileMenuOpen(false)}>🧩 Loads</Nav.Link>
          <Nav.Link href="/attack" onClick={() => setIsMobileMenuOpen(false)}>💥 All Attacks</Nav.Link>
          <Nav.Link href="/terminal" onClick={() => setIsMobileMenuOpen(false)}>📻 Terminal</Nav.Link>
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
                  setIsMobileMenuOpen(false);
                }}
              >
                {user.user.email}
              </div>
              <Nav.Link className="sidebar-user" onClick={() => {
                logOut();
                setIsMobileMenuOpen(false);
              }}>Выйти</Nav.Link>
            </>
          ) : (
            <Nav.Link className="sidebar-user" onClick={() => {
              navigate('/login');
              setIsMobileMenuOpen(false);
            }}>Login</Nav.Link>
          )}
        </div>
      </div>
    </>
  );
};

export default NavBar;