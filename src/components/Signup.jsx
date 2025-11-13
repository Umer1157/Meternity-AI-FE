import { useState } from 'react'
import { signup as signupAPI } from '../utils/auth'
import './Auth.css'
import ReCAPTCHA from 'react-google-recaptcha';

function Signup({ onSwitchToLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const onRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!recaptchaToken) {
      alert('Please complete the reCAPTCHA!');
      return;
    }

    setLoading(true)

    try {
      const response = await signupAPI(email, password, recaptchaToken)
      // After successful signup, switch to login page
      onSwitchToLogin()
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Maternal Health Assistant</h1>
        <h2 className="auth-subtitle">Sign Up</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          <div className="auth-input-group">
            <label htmlFor="signup-email">Email</label>
            <input
              type="email"
              id="signup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
              placeholder="Enter your email"
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="signup-password">Password</label>
            <input
              type="password"
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
              placeholder="Enter your password (min 6 characters)"
              minLength={6}
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="auth-input"
              placeholder="Confirm your password"
            />
          </div>

          <ReCAPTCHA
	          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
	          onChange={onRecaptchaChange}
	        />

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <button 
            type="button" 
            onClick={onSwitchToLogin}
            className="auth-link-button"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  )
}

export default Signup

