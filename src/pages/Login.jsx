import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  login,
  clearError,
  selectCurrentUser,
  selectAuthLoading,
  selectAuthError,
} from '../features/auth/authSlice';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import PasswordInput from '../components/PasswordInput';
import VisualPanel from '../components/VisualPanel';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);
  const loading = useSelector(selectAuthLoading);
  const backendError = useSelector(selectAuthError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientError, setClientError] = useState('');

  // Clear previous auth errors when mounting the page
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // If already logged in, navigate to home
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClientError('');
    dispatch(clearError());

    // Client-side validation
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      setClientError('Please enter your email address.');
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setClientError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setClientError('Please enter your password.');
      return;
    }

    try {
      await dispatch(login({ email: trimmedEmail, password })).unwrap();
      navigate('/', { replace: true });
    } catch {
      // Backend error is stored in redux auth.error and displayed via backendError
    }
  };

  const errorMessage = clientError || backendError;
  const isButtonDisabled = loading || !email.trim() || !password;

  return (
    <div className="min-h-screen w-full flex flex-col md:grid md:grid-cols-2 bg-[#F7F7FB] dark:bg-[#0A0A0A] text-[#14142B] dark:text-[#FFFFFF] transition-colors duration-200">
      {/* LEFT COLUMN: Form Section */}
      <div className="flex flex-col justify-between min-h-screen p-6 sm:p-8 lg:p-12">
        {/* Top Header Bar: Logo & ThemeToggle */}
        <header className="flex items-center justify-between w-full max-w-sm mx-auto">
          <Logo />
          <ThemeToggle />
        </header>

        {/* Center: Main Login Form Card */}
        <main className="w-full max-w-sm mx-auto my-auto py-6">
          <div className="bg-transparent sm:bg-[#FFFFFF] dark:sm:bg-[#111114] border-0 sm:border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-0 sm:p-8 shadow-none sm:shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:sm:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200">
            <div className="mb-6">
              <h1 className="text-3xl font-semibold tracking-tight text-[#14142B] dark:text-[#FFFFFF]">
                Welcome!
              </h1>
              <p className="mt-1.5 text-sm text-[#55557A] dark:text-[#9A9AB8]">
                Log in to LimitGuard to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-[13px] font-medium text-[#3B3B55] dark:text-[#9A9AB8]"
                >
                  Email
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (clientError) setClientError('');
                    if (backendError) dispatch(clearError());
                  }}
                  placeholder="Your email address"
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-[#FFFFFF] dark:bg-[#0D0D10] border border-[#DCDCE6] dark:border-[#26262E] hover:border-[#BDBDD3] dark:hover:border-[#3E3E4B] focus:border-[#6D5AE6] dark:focus:border-[#8B7CF6] focus:ring-4 focus:ring-[rgba(109,90,230,0.15)] dark:focus:ring-[rgba(139,124,246,0.2)] text-[#14142B] dark:text-[#FFFFFF] placeholder-[#8B8BA3] dark:placeholder-[#5A5A5A] px-4 text-sm outline-none transition-all duration-200 disabled:opacity-60"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-[13px] font-medium text-[#3B3B55] dark:text-[#9A9AB8]"
                >
                  Password
                </label>
                <PasswordInput
                  id="login-password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (clientError) setClientError('');
                    if (backendError) dispatch(clearError());
                  }}
                  placeholder="Your password"
                  required
                  disabled={loading}
                />
              </div>

              {/* Error Alert Box */}
              {errorMessage && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="flex items-start gap-2.5 p-3 rounded-xl text-sm bg-[#FEF2F2] dark:bg-[#450A0A]/30 border border-[#FECACA] dark:border-[#991B1B]/40 text-[#B42318] dark:text-[#F87171] transition-all duration-150"
                >
                  <svg
                    className="w-4 h-4 mt-0.5 shrink-0 text-[#B42318] dark:text-[#F87171]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1 break-words">{errorMessage}</div>
                </div>
              )}

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isButtonDisabled}
                className="h-12 w-full flex items-center justify-center rounded-xl bg-[#6D5AE6] hover:bg-[#5B48D6] active:bg-[#4F3DC4] dark:bg-[#8B7CF6] dark:hover:bg-[#7A6AF0] dark:active:bg-[#6D5AE6] text-white font-semibold text-sm shadow-[0_6px_16px_-6px_rgba(109,90,230,0.55)] dark:shadow-[0_6px_16px_-6px_rgba(139,124,246,0.5)] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-[rgba(109,90,230,0.25)] dark:focus:ring-[rgba(139,124,246,0.3)]"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Logging in...</span>
                  </span>
                ) : (
                  'Log in'
                )}
              </button>
            </form>

            {/* Bottom Switch Link */}
            <div className="mt-6 text-center text-sm text-[#55557A] dark:text-[#9A9AB8]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#5B48D6] dark:text-[#8B7CF6] font-medium hover:underline transition-colors duration-150"
              >
                Sign up
              </Link>
            </div>
          </div>
        </main>

        {/* Footer spacer */}
        <footer className="w-full max-w-sm mx-auto text-xs text-center text-transparent select-none">
          LimitGuard Auth
        </footer>
      </div>

      {/* RIGHT COLUMN: Redesigned Visual Panel */}
      <VisualPanel actionLabel="Join Now" actionTo="/register" />
    </div>
  );
}
