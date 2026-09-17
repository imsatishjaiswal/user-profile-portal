import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserCheck, LogOut, User, LogIn, UserPlus } from 'lucide-react'

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark portal-navbar py-2 px-3 sticky-top">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
          <div className="emblem-icon">
            <UserCheck size={20} color="#1b365d" />
          </div>
          <div>
            <span className="fw-bold d-block brand-font lh-1" style={{ fontSize: '1.2rem', color: '#ffffff' }}>
              USER PROFILE
            </span>
          </div>
        </Link>

        <div className="d-flex align-items-center gap-2">
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="btn btn-sm btn-outline-light d-lg-none d-flex align-items-center gap-1 px-2 py-1"
              title="Logout from session"
            >
              <LogOut size={15} />
              <span className="small">Logout</span>
            </button>
          )}

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto align-items-center gap-2 mt-2 mt-lg-0">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link text-light fw-medium d-flex align-items-center gap-1">
                    <User size={16} />
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li className="nav-item d-flex align-items-center ms-lg-2">
                  <span className="badge badge-portal me-3 d-none d-md-inline-block">
                    {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-sm btn-outline-light d-flex align-items-center gap-1"
                    title="Logout from session"
                  >
                    <LogOut size={15} />
                    <span>Logout</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link text-light d-flex align-items-center gap-1">
                    <LogIn size={16} />
                    <span>Login</span>
                  </Link>
                </li>
                <li className="nav-item ms-lg-1">
                  <Link to="/register" className="btn btn-sm btn-warning text-dark fw-bold d-flex align-items-center gap-1 px-3">
                    <UserPlus size={16} />
                    <span>Register</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
