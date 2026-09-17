import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatApiError } from '../services/api'
import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, CheckCircle, AlertCircle } from 'lucide-react'

export const Register = () => {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirm_password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const calculatePasswordStrength = (pass) => {
    let score = 0
    if (!pass) return { score: 0, label: 'None', color: '#e2e8f0', percent: 0 }
    if (pass.length >= 8) score += 20
    if (/[A-Z]/.test(pass)) score += 20
    if (/[a-z]/.test(pass)) score += 20
    if (/\d/.test(pass)) score += 20
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score += 20

    if (score <= 40) return { score, label: 'Weak', color: '#ef4444', percent: score }
    if (score <= 80) return { score, label: 'Moderate', color: '#f59e0b', percent: score }
    return { score, label: 'Strong', color: '#10b981', percent: score }
  }

  const passwordStrength = calculatePasswordStrength(formData.password)

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address format'
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = '10-digit mobile number is required'
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits starting with 6, 7, 8, or 9'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (passwordStrength.score < 100) {
      newErrors.password = 'Password must have min 8 chars, uppercase, lowercase, digit, & special char'
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match'
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
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password,
      })
      navigate('/login', { state: { registeredMessage: 'Registration successful! Please login with your credentials.' } })
    } catch (err) {
      setServerError(formatApiError(err, 'Registration failed. Please verify your details.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="auth-card">
            <div className="auth-header text-center">
              <h2 className="h4 fw-bold mb-1 brand-font" style={{ color: '#1b365d' }}>
                User Registration
              </h2>
              <p className="text-muted small mb-0">
                Create an account to access official portal services
              </p>
            </div>

            <div className="p-4">
              {serverError && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
                  <AlertCircle size={18} />
                  <div>{serverError}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Name */}
                <div className="mb-3">
                  <label className="form-label fw-medium small">Full Name *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      name="name"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      placeholder="e.g. Amit Kumar"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label fw-medium small">Email Address *</label>
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

                {/* Mobile */}
                <div className="mb-3">
                  <label className="form-label fw-medium small">Mobile Number *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">+91</span>
                    <input
                      type="tel"
                      name="mobile"
                      maxLength={10}
                      className={`form-control ${errors.mobile ? 'is-invalid' : ''}`}
                      placeholder="10-digit mobile number"
                      value={formData.mobile}
                      onChange={handleChange}
                    />
                    {errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
                  </div>
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label className="form-label fw-medium small">Password *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Min 8 chars (Uppercase, Lowercase, Number, Symbol)"
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

                  {formData.password && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Password Strength: <strong style={{ color: passwordStrength.color }}>{passwordStrength.label}</strong>
                        </small>
                      </div>
                      <div className="strength-meter">
                        <div
                          className="strength-meter-fill"
                          style={{
                            width: `${passwordStrength.percent}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label className="form-label fw-medium small">Confirm Password *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirm_password"
                      className={`form-control ${errors.confirm_password ? 'is-invalid' : ''}`}
                      placeholder="Re-enter password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                    />
                    {errors.confirm_password && (
                      <div className="invalid-feedback">{errors.confirm_password}</div>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-portal w-100 d-flex align-items-center justify-content-center gap-2 mb-3"
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      <span>Register Account</span>
                    </>
                  )}
                </button>

                <div className="text-center">
                  <span className="text-muted small">Already have a registered account? </span>
                  <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: '#1b365d' }}>
                    Login Here
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
