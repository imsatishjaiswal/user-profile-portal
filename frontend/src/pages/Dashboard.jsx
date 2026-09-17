import React from 'react'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Phone, Calendar } from 'lucide-react'

export const Dashboard = () => {
  const { user } = useAuth()

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    } catch (e) {
      return dateStr
    }
  }

  return (
    <div className="container py-5">
      {/* Header Banner */}
      <div
        className="p-4 p-md-5 rounded-4 mb-4 text-white position-relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f2038 0%, #1b365d 60%, #0284c7 100%)' }}
      >
        <div className="position-relative z-1">
          <h1 className="display-6 fw-bold brand-font mb-2">Welcome, {user?.name}!</h1>
        </div>
      </div>

      <div className="row justify-content-center">
        {/* User Details Card */}
        <div className="col-12 col-lg-9">
          <div className="auth-card">
            <div className="auth-header d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <User className="text-primary" size={20} />
                <h2 className="h5 fw-bold mb-0 brand-font">User Profile Information</h2>
              </div>
            </div>

            <div className="p-4">
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="text-muted small text-uppercase fw-semibold mb-1 d-flex align-items-center gap-1">
                      <User size={14} /> Full Name
                    </div>
                    <div className="fw-bold fs-6 text-dark">{user?.name}</div>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="text-muted small text-uppercase fw-semibold mb-1 d-flex align-items-center gap-1">
                      <Mail size={14} /> Email Address
                    </div>
                    <div className="fw-bold fs-6 text-dark text-break">{user?.email}</div>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="text-muted small text-uppercase fw-semibold mb-1 d-flex align-items-center gap-1">
                      <Phone size={14} /> Mobile Number
                    </div>
                    <div className="fw-bold fs-6 text-dark">+91 {user?.mobile}</div>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="text-muted small text-uppercase fw-semibold mb-1 d-flex align-items-center gap-1">
                      <Calendar size={14} /> Registration Date
                    </div>
                    <div className="fw-bold fs-6 text-dark">{formatDate(user?.created_at)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}





