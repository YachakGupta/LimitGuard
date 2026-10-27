import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  register,
  clearError,
  selectCurrentUser,
  selectAuthLoading,
  selectAuthError,
} from '../features/auth/authSlice';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import PasswordInput from '../components/PasswordInput';
import VisualPanel from '../components/VisualPanel';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);
  const loading = useSelector(selectAuthLoading);
  const backendError = useSelector(selectAuthError);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientError, setClientError] = useState('');

  // Clear previous errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // If already logged in, navigate to home
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Live password validation checklist
  const passwordChecks = useMemo(() => {
    return [
      {
        id: 'length',
        label: '8–72 characters',
        valid: password.length >= 8 && password.length <= 72,
      },
      {
        id: 'lowercase',
        label: 'At least one lowercase letter',
        valid: /[a-z]/.test(password),
      },
      {
        id: 'uppercase',
        label: 'At least one uppercase letter',
        valid: /[A-Z]/.test(password),
      },
      {
        id: 'digit',
        label: 'At least one digit',
        valid: /[0-9]/.test(password),
      },
      {
        id: 'special',
        label: 'At least one special character',
        valid: /[^A-Za-z0-9]/.test(password),
      },
    ];
  }, [password]);

  const allPasswordRulesMet = passwordChecks.every((check) => check.valid);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClientError('');
    dispatch(clearError());

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName) {
      setClientError('Please enter your name.');
      return;
    }
    if (!trimmedEmail) {
      setClientError('Please enter your email address.');
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setClientError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setClientError('Please enter a password.');
      return;
    }
    if (!allPasswordRulesMet) {
      setClientError('Please satisfy all password criteria before submitting.');
      return;
    }

    try {
      await dispatch(
        register({
          name: trimmedName,
          email: trimmedEmail,
          password,
        })
      ).unwrap();
      navigate('/', { replace: true });
    } catch {
      // Backend error is stored in redux auth.error and displayed via backendError
    }
  };

  const errorMessage = clientError || backendError;
  const isButtonDisabled =
    loading ||
    !name.trim() ||
    !email.trim() ||
    !password ||
    !allPasswordRulesMet;

  return (
    <div className="min-h-screen w-full flex flex-col md:grid md:grid-cols-2 bg-[#F7F7FB] dark:bg-[#0A0A0A] text-[#14142B] dark:text-[#FFFFFF] transition-colors duration-200">
      {/* LEFT COLUMN: Form Section */}
      <div className="flex flex-col justify-between min-h-screen p-6 sm:p-8 lg:p-12">
        {/* Top Header Bar: Logo & ThemeToggle */}
        <header className="flex items-center justify-between w-full max-w-sm mx-auto">
          <Logo />
          <ThemeToggle />
        </header>

        {/* Center: Register Form Card */}
        <main className="w-full max-w-sm mx-auto my-auto py-6">
          <div className="bg-transparent sm:bg-[#FFFFFF] dark:sm:bg-[#111114] border-0 sm:border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-0 sm:p-8 shadow-none sm:shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:sm:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200">
            <div className="mb-6">
              <h1 className="text-3xl font-semibold tracking-tight text-[#14142B] dark:text-[#FFFFFF]">
                Create your account
              </h1>
              <p className="mt-1.5 text-sm text-[#55557A] dark:text-[#9A9AB8]">
                Get started with LimitGuard today.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Name Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="register-name"
                  className="block text-[13px] font-medium text-[#3B3B55] dark:text-[#9A9AB8]"
                >
                  Name
                </label>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (clientError) setClientError('');
                    if (backendError) dispatch(clearError());
                  }}
                  placeholder="Your full name"
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-[#FFFFFF] dark:bg-[#0D0D10] border border-[#DCDCE6] dark:border-[#26262E] hover:border-[#BDBDD3] dark:hover:border-[#3E3E4B] focus:border-[#6D5AE6] dark:focus:border-[#8B7CF6] focus:ring-4 focus:ring-[rgba(109,90,230,0.15)] dark:focus:ring-[rgba(139,124,246,0.2)] text-[#14142B] dark:text-[#FFFFFF] placeholder-[#8B8BA3] dark:placeholder-[#5A5A5A] px-4 text-sm outline-none transition-all duration-200 disabled:opacity-60"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="register-email"
                  className="block text-[13px] font-medium text-[#3B3B55] dark:text-[#9A9AB8]"
                >
                  Email
                </label>
                <input
                  id="register-email"
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
                  htmlFor="register-password"
                  className="block text-[13px] font-medium text-[#3B3B55] dark:text-[#9A9AB8]"
                >
                  Password
                </label>
                <PasswordInput
                  id="register-password"
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (clientError) setClientError('');
                    if (backendError) dispatch(clearError());
                  }}
                  placeholder="Create a strong password"
                  required
                  disabled={loading}
                />
              </div>

              {/* Live Password Rules Checklist */}
              <div className="p-3.5 rounded-xl bg-[#F7F7FB] dark:bg-[#0D0D10] border border-[#E7E7EF] dark:border-[#26262E] space-y-2">
                <p className="text-xs font-medium text-[#55557A] dark:text-[#9A9AB8]">
                  Password Requirements:
                </p>
                <ul className="space-y-1 text-xs" aria-live="polite">
                  {passwordChecks.map((check) => {
                    return (
                      <li
                        key={check.id}
                        className={`flex items-center gap-2 transition-colors duration-150 ${
                          check.valid
                            ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                            : 'text-[#55557A] dark:text-[#9A9AB8]'
                        }`}
                      >
                        {check.valid ? (
                          <svg
                            className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#DCDCE6] dark:bg-[#3E3E4B] mx-1 shrink-0" />
                        )}
                        <span>{check.label}</span>
                      </li>
                    );
                  })}
                </ul>
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

              {/* Submit Button */}
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
                    <span>Creating account...</span>
                  </span>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            {/* Bottom Switch Link */}
            <div className="mt-6 text-center text-sm text-[#55557A] dark:text-[#9A9AB8]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#5B48D6] dark:text-[#8B7CF6] font-medium hover:underline transition-colors duration-150"
              >
                Log in
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
      <VisualPanel actionLabel="Log In" actionTo="/login" />
    </div>
  );
}
