import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  logout,
  selectCurrentUser,
  selectAuthLoading,
} from '../features/auth/authSlice';
import {
  fetchToken,
  generateToken,
  clearTokenError,
  selectToken,
  selectTokenStatus,
  selectTokenError,
  selectTokenDetails,
} from '../features/token/tokenSlice';
import AppLayout from '../components/AppLayout';

export default function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);
  const authLoading = useSelector(selectAuthLoading);

  const tokenValue = useSelector(selectToken);
  const tokenStatus = useSelector(selectTokenStatus);
  const tokenError = useSelector(selectTokenError);
  const tokenDetails = useSelector(selectTokenDetails);

  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load existing token once on mount
  useEffect(() => {
    dispatch(fetchToken());
  }, [dispatch]);

  // If backend flags showOnce, show revealed on initial receipt
  useEffect(() => {
    if (tokenDetails?.showOnceRevealed) {
      setRevealed(true);
    }
  }, [tokenDetails?.showOnceRevealed]);

  // Handle Copy to Clipboard with fallback
  const handleCopy = async () => {
    if (!tokenValue) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(tokenValue);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = tokenValue;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  // Handle Token Generation / Regeneration
  const handleGenerateClick = () => {
    dispatch(clearTokenError());
    if (tokenValue) {
      setShowConfirmModal(true);
    } else {
      dispatch(generateToken(false));
    }
  };

  const handleConfirmRegenerate = async () => {
    setShowConfirmModal(false);
    await dispatch(generateToken(true));
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch {
      // If 401 or other error, client.js & extraReducers handle clear
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const isGenerating = tokenStatus === 'loading';
  const MASKED_STRING = '••••••••••••••••••••••••';

  return (
    <AppLayout title="Settings">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* CARD A: API TOKEN */}
        <section
          aria-labelledby="api-token-heading"
          className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200"
        >
          <div className="mb-6">
            <h2
              id="api-token-heading"
              className="text-lg font-semibold text-[#14142B] dark:text-[#FFFFFF]"
            >
              API token
            </h2>
            <p className="text-sm text-[#55557A] dark:text-[#9A9AB8] mt-1">
              Use this token to connect your apps to LimitGuard.
            </p>
          </div>

          <div className="space-y-4">
            {/* Read-Only Token Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="api-token-field"
                className="block text-xs font-semibold text-[#3B3B55] dark:text-[#9A9AB8] uppercase tracking-wider"
              >
                Extension & Integration Secret
              </label>

              <div className="relative flex items-center">
                <input
                  id="api-token-field"
                  type="text"
                  readOnly
                  value={tokenValue ? (revealed ? tokenValue : MASKED_STRING) : 'No token generated yet'}
                  className={`h-12 w-full rounded-xl bg-[#F7F7FB] dark:bg-[#0D0D10] border border-[#DCDCE6] dark:border-[#26262E] text-sm font-mono pr-24 pl-4 select-all outline-none transition-colors duration-200 ${
                    tokenValue
                      ? 'text-[#14142B] dark:text-[#FFFFFF]'
                      : 'text-[#8B8BA3] dark:text-[#5A5A5A] italic'
                  }`}
                  aria-label="API token field"
                />

                {/* Inside Right Action Buttons */}
                <div className="absolute right-2 flex items-center gap-1">
                  {/* Eye / Eye-off Button */}
                  <button
                    type="button"
                    onClick={() => setRevealed(!revealed)}
                    disabled={!tokenValue}
                    aria-label={revealed ? 'Hide token' : 'Show token'}
                    aria-pressed={revealed}
                    title={revealed ? 'Hide token' : 'Show token'}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#55557A] dark:text-[#9A9AB8] hover:text-[#14142B] dark:hover:text-[#FFFFFF] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#8B7CF6]"
                  >
                    {revealed ? (
                      // Eye-off icon
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      // Eye icon
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!tokenValue}
                    aria-label="Copy token to clipboard"
                    title="Copy token"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#55557A] dark:text-[#9A9AB8] hover:text-[#14142B] dark:hover:text-[#FFFFFF] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#8B7CF6]"
                  >
                    {copied ? (
                      // Check icon
                      <svg className="w-4 h-4 text-emerald-500 animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      // Copy icon
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Copied Toast Indicator */}
              {copied && (
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied to clipboard!
                </p>
              )}

              {/* Error text under the field on failure */}
              {tokenError && (
                <div role="alert" className="text-xs font-medium text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{tokenError}</span>
                </div>
              )}
            </div>

            {/* Generate / Regenerate Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateClick}
                disabled={isGenerating}
                className="h-11 px-5 rounded-xl bg-[#6D5AE6] hover:bg-[#5B48D6] active:bg-[#4F3DC4] dark:bg-[#8B7CF6] dark:hover:bg-[#7A6AF0] dark:active:bg-[#6D5AE6] text-white font-semibold text-sm shadow-[0_4px_12px_-4px_rgba(109,90,230,0.5)] dark:shadow-[0_4px_12px_-4px_rgba(139,124,246,0.45)] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-[rgba(109,90,230,0.25)] dark:focus:ring-[rgba(139,124,246,0.3)] inline-flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generating token...</span>
                  </>
                ) : tokenValue ? (
                  'Regenerate token'
                ) : (
                  'Generate token'
                )}
              </button>
            </div>
          </div>
        </section>

        {/* CARD B: ACCOUNT */}
        <section
          aria-labelledby="account-heading"
          className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200"
        >
          <div className="mb-6">
            <h2
              id="account-heading"
              className="text-lg font-semibold text-[#14142B] dark:text-[#FFFFFF]"
            >
              Account
            </h2>
            <p className="text-sm text-[#55557A] dark:text-[#9A9AB8] mt-1">
              Your registered LimitGuard identity.
            </p>
          </div>

          <div className="space-y-6">
            {/* User Info Details */}
            <div className="p-4 rounded-xl bg-[#F7F7FB] dark:bg-[#0D0D10] border border-[#E7E7EF] dark:border-[#26262E] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#6D5AE6] to-[#8B7CF6] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#14142B] dark:text-[#FFFFFF] truncate">
                  {user?.name || 'LimitGuard User'}
                </p>
                <p className="text-xs font-medium text-[#55557A] dark:text-[#9A9AB8] truncate mt-0.5">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>

            {/* Logout Action Button (Outline / Danger Style) */}
            <div className="pt-2 border-t border-[#E7E7EF] dark:border-[#26262E]">
              <button
                type="button"
                onClick={handleLogout}
                disabled={authLoading}
                className="h-11 px-5 rounded-xl border border-red-500/40 hover:border-red-500 dark:border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-500/10 active:bg-red-500/15 font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-red-500/20 inline-flex items-center gap-2"
              >
                {authLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Log out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* CONFIRM REGENERATION MODAL DIALOG */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 id="confirm-modal-title" className="text-base font-bold text-[#14142B] dark:text-[#FFFFFF]">
                Regenerate API Token?
              </h3>
            </div>

            <p className="text-sm text-[#55557A] dark:text-[#9A9AB8] leading-relaxed">
              Regenerating will invalidate your current token. Continue?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#55557A] dark:text-[#9A9AB8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRegenerate}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#6D5AE6] hover:bg-[#5B48D6] dark:bg-[#8B7CF6] dark:hover:bg-[#7A6AF0] text-white shadow-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8B7CF6]"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
