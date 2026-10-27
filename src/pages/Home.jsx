import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  logout,
  selectCurrentUser,
  selectAuthLoading,
  selectAuthError,
} from '../features/auth/authSlice';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';

export default function Home() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F7F7FB] dark:bg-[#0A0A0A] text-[#14142B] dark:text-[#FFFFFF] transition-colors duration-200">
      {/* Minimal Top Bar */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[#E7E7EF] dark:border-[#26262E]">
        <Logo linked={false} />
        <ThemeToggle />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-2xl bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] text-center space-y-6 transition-all duration-200">
          {/* User Icon Badge */}
          <div className="w-16 h-16 mx-auto rounded-full bg-[#6D5AE6]/10 dark:bg-purple-500/10 border border-[#6D5AE6]/20 dark:border-purple-500/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#6D5AE6] dark:text-[#8B7CF6]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#14142B] dark:text-[#FFFFFF]">
              Welcome, {user?.name || 'User'}
            </h1>
            <p className="text-sm font-medium text-[#55557A] dark:text-[#9A9AB8]">
              {user?.email}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl text-sm bg-[#FEF2F2] dark:bg-[#450A0A]/30 border border-[#FECACA] dark:border-[#991B1B]/40 text-[#B42318] dark:text-[#F87171]"
            >
              {error}
            </div>
          )}

          {/* Logout Action Button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="w-full h-12 flex items-center justify-center rounded-xl bg-[#6D5AE6] hover:bg-[#5B48D6] active:bg-[#4F3DC4] dark:bg-[#8B7CF6] dark:hover:bg-[#7A6AF0] dark:active:bg-[#6D5AE6] text-white font-semibold text-sm shadow-[0_6px_16px_-6px_rgba(109,90,230,0.55)] dark:shadow-[0_6px_16px_-6px_rgba(139,124,246,0.5)] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-[rgba(109,90,230,0.25)] dark:focus:ring-[rgba(139,124,246,0.3)]"
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
                <span>Logging out...</span>
              </span>
            ) : (
              'Log out'
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
