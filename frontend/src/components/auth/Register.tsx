import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/api';
import toast from 'react-hot-toast';
import './Auth.scss';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /\d/.test(p) },
  { label: 'One special character (@$!%*?&)', test: (p: string) => /[@$!%*?&]/.test(p) },
];

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailChecking, setEmailChecking] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  }, []);

  const validatePassword = useCallback((password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)';
    }
    return '';
  }, []);

  // Debounced email existence check (300ms)
  useEffect(() => {
    const formatErr = validateEmail(email);
    if (formatErr || !email.trim()) {
      return;
    }
    const timer = setTimeout(async () => {
      setEmailChecking(true);
      try {
        const { data } = await authApi.checkEmail(email);
        if (data.data?.exists) {
          setEmailError('Email already registered. Please log in instead.');
        } else {
          setEmailError(validateEmail(email));
        }
      } catch {
        // Ignore network errors for check-email; submit will still validate
      } finally {
        setEmailChecking(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [email, validateEmail]);

  const handleEmailBlur = () => {
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setPasswordError(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    if (emailErr || passwordErr) {
      setEmailError(emailErr);
      setPasswordError(passwordErr);
      return;
    }

    try {
      const { data } = await authApi.checkEmail(email);
      if (data.data?.exists) {
        setEmailError('Email already registered. Please log in instead.');
        return;
      }
    } catch {
      // Proceed; server will reject if duplicate
    }

    try {
      await register(name, email, password);
      toast.success('Registration successful!');
      navigate('/boards');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const passwordRuleChecks = PASSWORD_RULES.map((rule) => ({
    ...rule,
    met: rule.test(password),
  }));

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src="/logo.svg" alt="FlowBoard" className="auth-logo" />
        <h1 className="auth-title">FlowBoard</h1>
        <h2 className="auth-subtitle">Create your account</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError && !e.target.value) setEmailError('');
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
              placeholder="Enter your password (min 8 characters)"
              required
              minLength={8}
              className={passwordError ? 'error' : ''}
            />
            <div className="password-strength">
              {passwordRuleChecks.map(({ label, met }) => (
                <span key={label} className={met ? 'met' : ''}>
                  {met ? '✓' : '○'} {label}
                </span>
              ))}
            </div>
            {passwordError && <span className="error-message">{passwordError}</span>}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || !!emailError || emailChecking}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
        <div className="auth-playground-link">
          <Link to="/playground">Try without account (Playground)</Link>
        </div>
      </div>
    </div>
  );
};
