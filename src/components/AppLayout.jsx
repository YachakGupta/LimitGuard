import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import {
  fetchDashboard,
  selectDashboardStatus,
} from '../features/dashboard/dashboardSlice';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

export default function AppLayout({
  children,
  title,
  subtitle,
  onRefresh,
  contentClassName = 'p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto',
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();
  const dispatch = useDispatch();
  const dashboardStatus = useSelector(selectDashboardStatus);
  const isRefreshing = dashboardStatus === 'loading';

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: (
        <svg
          className="w-5 h-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      ),
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: (
        <svg
          className="w-5 h-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
  ];

  const pageTitle = title || (location.pathname === '/settings' ? 'Settings' : 'Security Overview');
  const isDashboard = location.pathname === '/';

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');

  return (
    <div className="min-h-screen w-full flex bg-[#F7F7FB] dark:bg-[#0A0A0A] text-[#14142B] dark:text-[#FFFFFF] transition-colors duration-200">
      {/* DESKTOP SIDEBAR */}
      <aside
        className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-[#FFFFFF] dark:bg-[#111114] border-r border-[#E7E7EF] dark:border-[#26262E] z-30 transition-colors duration-200"
        aria-label="Sidebar navigation"
      >
        {/* Brand / Logo */}
        <div className="h-16 px-6 flex items-center border-b border-[#E7E7EF] dark:border-[#26262E]">
          <Logo />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#6D5AE6]/10 text-[#6D5AE6] dark:bg-[#8B7CF6]/15 dark:text-[#8B7CF6] font-semibold shadow-sm'
                    : 'text-[#55557A] dark:text-[#9A9AB8] hover:text-[#14142B] dark:hover:text-[#FFFFFF] hover:bg-black/5 dark:hover:bg-white/5'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info Card at Sidebar Bottom */}
        <div className="p-4 border-t border-[#E7E7EF] dark:border-[#26262E]">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#F7F7FB] dark:bg-[#0D0D10] border border-[#E7E7EF] dark:border-[#26262E]">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#6D5AE6] to-[#8B7CF6] text-white flex items-center justify-center font-semibold text-sm shrink-0 shadow-sm">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#14142B] dark:text-[#FFFFFF] truncate">
                {user?.name || 'LimitGuard User'}
              </p>
              <p className="text-[11px] text-[#55557A] dark:text-[#9A9AB8] truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER BACKDROP & SIDEBAR */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div
            className="relative w-4/5 max-w-xs bg-[#FFFFFF] dark:bg-[#111114] border-r border-[#E7E7EF] dark:border-[#26262E] flex flex-col h-full shadow-2xl z-10 transition-transform duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation drawer"
          >
            {/* Header with Logo and Close button */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-[#E7E7EF] dark:border-[#26262E]">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-[#55557A] dark:text-[#9A9AB8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B7CF6]"
                aria-label="Close navigation menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#6D5AE6]/10 text-[#6D5AE6] dark:bg-[#8B7CF6]/15 dark:text-[#8B7CF6] font-semibold'
                        : 'text-[#55557A] dark:text-[#9A9AB8] hover:text-[#14142B] dark:hover:text-[#FFFFFF]'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>

            {/* Mobile User Info */}
            <div className="p-4 border-t border-[#E7E7EF] dark:border-[#26262E]">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F7F7FB] dark:bg-[#0D0D10] border border-[#E7E7EF] dark:border-[#26262E]">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#6D5AE6] to-[#8B7CF6] text-white flex items-center justify-center font-semibold text-sm shrink-0">
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#14142B] dark:text-[#FFFFFF] truncate">
                    {user?.name || 'LimitGuard User'}
                  </p>
                  <p className="text-[11px] text-[#55557A] dark:text-[#9A9AB8] truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 min-h-screen">
        {/* TOP BAR */}
        <header className="sticky top-0 z-20 h-16 bg-[#FFFFFF]/85 dark:bg-[#0A0A0A]/85 backdrop-blur-md border-b border-[#E7E7EF] dark:border-[#26262E] px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors duration-200">
          <div className="flex items-center gap-3">
            {/* Hamburger button on mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-[#E7E7EF] dark:border-[#26262E] bg-[#FFFFFF] dark:bg-[#111114] text-[#14142B] dark:text-[#FFFFFF] hover:border-[#BDBDD3] dark:hover:border-[#3E3E4B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B7CF6]"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page Title */}
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#14142B] dark:text-[#FFFFFF]">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Refresh Button on Dashboard Header */}
            {isDashboard && (
              <button
                type="button"
                onClick={onRefresh || (() => dispatch(fetchDashboard()))}
                disabled={isRefreshing}
                aria-label="Refresh dashboard data"
                title="Refresh dashboard data"
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#E7E7EF] dark:border-[#26262E] bg-[#FFFFFF] dark:bg-[#111114] text-[#55557A] dark:text-[#9A9AB8] hover:text-[#14142B] dark:hover:text-[#FFFFFF] hover:border-[#BDBDD3] dark:hover:border-[#3E3E4B] shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#6D5AE6]/25 dark:focus:ring-[#8B7CF6]/30"
              >
                <svg
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#6D5AE6] dark:text-[#8B7CF6]' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
              </button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Main Page Viewport */}
        <main className={`flex-1 ${contentClassName}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
