import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import './Auth.scss';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleEmailBlur = () => {
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    if (!password.trim()) {
      setPasswordError('Password is required');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    if (emailErr) {
      setEmailError(emailErr);
      return;
    }
    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }
    setPasswordError('');

    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/boards');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src="/logo.svg" alt="FlowBoard" className="auth-logo" />
        <h1 className="auth-title">FlowBoard</h1>
        <h2 className="auth-subtitle">Log in to continue</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              onBlur={handleEmailBlur}
              placeholder="Enter your email"
              required
              className={emailError ? 'error' : ''}
            />
            {emailError && <span className="error-message">{emailError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              onBlur={handlePasswordBlur}
              placeholder="Enter your password"
              required
              className={passwordError ? 'error' : ''}
            />
            {passwordError && <span className="error-message">{passwordError}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
        <div className="auth-playground-link">
          <Link to="/playground">Try without account (Playground)</Link>
        </div>
      </div>
    </div>
  );
};
