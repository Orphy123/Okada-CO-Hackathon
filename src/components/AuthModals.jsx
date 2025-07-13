import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const AuthModals = () => {
  const { login, signup } = useAuth();
  const { addNotification } = useNotification();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    company: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(loginForm.email, loginForm.password);
      if (result.success) {
        setShowLogin(false);
        addNotification('Welcome back! Login successful.', 'success');
        setLoginForm({ email: '', password: '' });
      } else {
        addNotification(result.error || 'Login failed. Please try again.', 'error');
      }
    } catch (error) {
      addNotification('Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signup(signupForm);
      if (result.success) {
        setShowSignup(false);
        addNotification('Account created successfully! Welcome to AI CRE Assistant.', 'success');
        setSignupForm({ name: '', email: '', company: '' });
      } else {
        addNotification(result.error || 'Signup failed. Please try again.', 'error');
      }
    } catch (error) {
      addNotification('Signup failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  // Add global click handlers to navbar buttons
  React.useEffect(() => {
    const handleNavbarClicks = (e) => {
      // Use closest() to find the actual button element, not just the clicked target
      const button = e.target.closest('button');
      if (!button) return;
      
      // Check data attribute first (more reliable), then fall back to text content
      const authAction = button.getAttribute('data-auth-action');
      const buttonText = button.textContent?.trim();
      
      if (authAction === 'login' || buttonText === 'Login') {
        setShowLogin(true);
      } else if (authAction === 'signup' || buttonText === 'Get Started') {
        setShowSignup(true);
      }
    };

    document.addEventListener('click', handleNavbarClicks);
    return () => document.removeEventListener('click', handleNavbarClicks);
  }, []);

  if (!showLogin && !showSignup) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-modal-slide-in">
        {/* Login Modal */}
        {showLogin && (
          <>
            <div className="flex justify-between items-center p-6 pb-0">
              <h3 className="text-xl font-semibold text-gray-900">Welcome Back</h3>
              <button
                onClick={closeModals}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleLogin}>
                <div className="mb-5">
                  <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="loginEmail"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-colors focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div className="mb-5">
                  <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="loginPassword"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-colors focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-full"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
              <div className="text-center mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setShowLogin(false);
                      setShowSignup(true);
                    }}
                    className="text-primary-600 font-medium hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          </>
        )}

        {/* Signup Modal */}
        {showSignup && (
          <>
            <div className="flex justify-between items-center p-6 pb-0">
              <h3 className="text-xl font-semibold text-gray-900">Get Started</h3>
              <button
                onClick={closeModals}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSignup}>
                <div className="mb-5">
                  <label htmlFor="signupName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="signupName"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-colors focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div className="mb-5">
                  <label htmlFor="signupEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="signupEmail"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-colors focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div className="mb-5">
                  <label htmlFor="signupCompany" className="block text-sm font-medium text-gray-700 mb-2">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    id="signupCompany"
                    value={signupForm.company}
                    onChange={(e) => setSignupForm({ ...signupForm, company: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-colors focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-full"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
              <div className="text-center mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setShowSignup(false);
                      setShowLogin(true);
                    }}
                    className="text-primary-600 font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModals;