import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatApiError } from '../services/api'
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle } from 'lucide-react'

export const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const registeredMessage = location.state?.registeredMessage || ''

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address format'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (serverError) setServerError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setServerError('')

    try {
      await login(formData.email.trim(), formData.password)
      navigate('/dashboard')
    } catch (err) {
      setServerError(formatApiError(err, 'Invalid email or password. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="auth-card">
            <div className="auth-header text-center">
              <h2 className="h4 fw-bold mb-1 brand-font" style={{ color: '#1b365d' }}>
                Portal Login
              </h2>
              <p className="text-muted small mb-0">
                Enter your credentials to access your account
              </p>
            </div>

            <div className="p-4">
              {registeredMessage && (
                <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
                  <CheckCircle size={18} />
                  <div className="small">{registeredMessage}</div>
                </div>
              )}

              {serverError && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
                  <AlertCircle size={18} />
                  <div className="small">{serverError}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <div className="mb-3">
                  <label className="form-label fw-medium small">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="e.g. amit@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="form-label fw-medium small">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-portal w-100 d-flex align-items-center justify-content-center gap-2 mb-3"
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={18} />
                      <span>Login to Account</span>
                    </>
                  )}
                </button>

                <div className="text-center">
                  <span className="text-muted small">Don't have an account yet? </span>
                  <Link to="/register" className="fw-semibold text-decoration-none" style={{ color: '#1b365d' }}>
                    Register Here
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
