'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import {
  authenticateWithGoogle,
  friendlyAuthError,
  isPasswordStrong,
  loginPersonal,
  PASSWORD_RULES,
  persistLegacySession,
  sendPasswordReset,
  signUpPersonal,
} from '@/lib/pose-app/auth';
import { enterGuestMode } from '@/lib/pose-app/session';

import { cx } from './styles';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Runs after a sign-in or sign-up succeeds, so the feeds re-pull for the new uid. */
  onAuthenticated: () => void;
};

type FormMode = 'signup' | 'login';
type Banner = { text: string; kind: 'error' | 'success' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * `#auth-screen` @461. Legacy centres with `align-items:center`, which clips the
 * top of a card taller than the viewport and leaves it unreachable — the card
 * carries `m-auto` instead so it centres when it fits and scrolls when it does not.
 */
const OVERLAY =
  'fixed inset-0 z-[2000] flex min-h-[100dvh] w-full animate-app-fade-in overflow-y-auto ' +
  'bg-[linear-gradient(135deg,hsla(285,24%,75%,0.658),hsla(286,92%,14%,0.458))] p-[clamp(15px,3vw,20px)] ' +
  '[-webkit-overflow-scrolling:touch] [scroll-snap-type:y_mandatory]';

/** `.auth-container` @482. */
const CONTAINER =
  'm-auto w-[min(90%,400px)] animate-app-slide-up rounded-[clamp(15px,4vw,20px)] border border-white/10 bg-white/10 ' +
  'p-[clamp(20px,5vw,30px)] shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-[10px] [-webkit-backdrop-filter:blur(10px)]';

const BRAND = 'mb-[22px] flex flex-col items-center gap-[10px]';
const BRAND_TITLE = 'text-center text-[22px] font-extrabold tracking-[-0.3px] text-white';
const BRAND_SUBTITLE = 'mt-[2px] text-center text-[12px] text-white/55';

/** `.auth-tabs` @494 / `.tab-btn` @502 / `.tab-btn.active` @514. */
const TABS = 'mb-[clamp(20px,5vw,30px)] flex rounded-[10px] bg-[#333333] p-[5px]';
const TAB_BTN =
  'flex-1 cursor-pointer rounded-[8px] border-0 p-[clamp(12px,3vw,15px)] ' +
  'text-[clamp(14px,4vw,16px)] text-white transition-all duration-300';
const TAB_BTN_ACTIVE = 'bg-[hsla(286,92%,14%,1)]';

/** `.guest-btn` @680, which overrides `.tab-btn` for the Guest chip. */
const GUEST_TAB =
  'flex-1 cursor-pointer overflow-hidden rounded-[8px] border-0 bg-[linear-gradient(45deg,#f0f0f0,#e0e0e0)] ' +
  'p-[clamp(12px,3vw,15px)] text-[clamp(14px,4vw,16px)] text-[#666] transition-all duration-300 ' +
  'hover:-translate-y-[2px] hover:shadow-[0_5px_15px_rgba(0,0,0,0.2)]';

/** `.auth-toggle` @533 / `.toggle-btn` @541 / `.toggle-btn.active` @551. */
const MODE_TOGGLE = 'mb-[clamp(15px,4vw,20px)] flex rounded-[8px] bg-[#333333] p-[4px]';
const MODE_BTN =
  'flex-1 cursor-pointer border-0 p-[clamp(10px,3vw,12px)] text-white transition-all duration-300';
const MODE_BTN_ACTIVE = 'scale-[1.02] rounded-[6px] bg-[hsla(286,92%,14%,0.858)] text-white';
const MODE_BTN_IDLE = 'bg-transparent';

/** `.auth-form input` @567. */
const INPUT =
  'mb-[clamp(12px,3vw,15px)] w-full rounded-[8px] border border-white/10 bg-white/5 p-[clamp(12px,3vw,15px)] ' +
  'text-[clamp(14px,4vw,16px)] text-white transition-all duration-300 placeholder:text-white/60 ' +
  'focus:border-[hsla(286,92%,14%,1)] focus:bg-white/[0.08] focus:outline-none';

/** `.submit-btn` @589. */
const SUBMIT =
  'mb-[clamp(12px,3vw,15px)] w-full cursor-pointer rounded-[8px] border-0 bg-[hsla(286,92%,14%,0.858)] ' +
  'p-[clamp(12px,3vw,15px)] text-[clamp(14px,4vw,16px)] font-medium text-white transition-all duration-300 ' +
  'hover:scale-[1.03] hover:bg-[hsla(286,92%,14%,1)] disabled:cursor-not-allowed disabled:opacity-60';

/** `.google-btn` @608. */
const GOOGLE =
  'flex w-full cursor-pointer items-center justify-center gap-[clamp(8px,2vw,10px)] rounded-[8px] border-0 bg-white ' +
  'p-[clamp(12px,3vw,15px)] font-medium text-[#333] transition-all duration-300 ' +
  'hover:scale-[1.03] hover:shadow-[0_5px_15px_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-60';
const GOOGLE_ICON = 'text-[clamp(16px,4vw,20px)] text-[#4285F4]';

/** `.password-container` @635 / `.toggle-password` @641. */
const PW_WRAP = 'relative mb-[clamp(12px,3vw,15px)] w-full';
const PW_INPUT = cx(INPUT, 'm-0 pr-[42px]');
const PW_TOGGLE =
  'absolute right-[clamp(8px,2vw,10px)] top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent ' +
  'p-[clamp(4px,1vw,5px)] text-[16px] text-white/60 transition-all duration-300 ' +
  'hover:scale-110 hover:text-[hsla(286,92%,14%,1)]';

/** `.password-requirements` @421. The met/idle colours are picked one-at-a-time
 *  because two `text-*` utilities of equal specificity resolve by stylesheet
 *  order, not by the order they appear in the class attribute. */
const REQUIREMENTS =
  '-mt-[6px] mb-[12px] grid grid-cols-2 gap-x-[10px] gap-y-[4px] rounded-[8px] bg-black/[0.03] p-[10px_12px]';
const REQUIREMENT = 'flex items-center gap-[6px] text-[12px] transition-colors duration-200';
const REQUIREMENT_MET = 'text-[#4CAF50]';
const REQUIREMENT_IDLE = 'text-white/55';
const REQUIREMENT_ICON = 'fas transition-colors duration-200';
const REQUIREMENT_ICON_MET = 'text-[10px] text-[#4CAF50]';
const REQUIREMENT_ICON_IDLE = 'text-[6px] text-[#cccccc]';

/** `.error-msg` @406 and its `.success` variant @417. */
// No background on BANNER: bg-[#e74c3c] sorts after bg-[#4CAF50] in the generated
// stylesheet, so an additive success class would lose and render red.
const BANNER =
  'mb-[15px] rounded-[8px] p-[10px] text-[14px] text-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] animate-app-fade-in';
const BANNER_ERROR = 'bg-[#e74c3c]';
const BANNER_SUCCESS = 'bg-[#4CAF50]';

/** `.forgot-password` @660. */
const FORGOT =
  'mt-[clamp(12px,3vw,15px)] w-full cursor-pointer border-0 bg-transparent px-[clamp(15px,4vw,20px)] ' +
  'py-[clamp(10px,2.5vw,12px)] text-[clamp(12px,3.5vw,14px)] font-medium text-white/70 transition-all duration-300 ' +
  'hover:tracking-[0.5px] hover:text-white disabled:cursor-not-allowed disabled:opacity-60';

const EMPTY = { name: '', username: '', email: '', password: '', loginEmail: '', loginPassword: '' };

export function AuthModal({ open, onClose, onAuthenticated }: Props) {
  const [mode, setMode] = useState<FormMode>('signup');
  const [fields, setFields] = useState(EMPTY);
  const [revealPassword, setRevealPassword] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [pending, setPending] = useState<null | 'email' | 'google' | 'reset'>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const set = (key: keyof typeof EMPTY) => (event: { target: { value: string } }) =>
    setFields((previous) => ({ ...previous, [key]: event.target.value }));

  const fail = (error: unknown) => setBanner({ text: friendlyAuthError(error), kind: 'error' });

  const run = async (task: () => Promise<void>) => {
    setBanner(null);
    setPending('email');
    try {
      await task();
      await persistLegacySession();
      onAuthenticated();
    } catch (error) {
      fail(error);
      setPending(null);
    }
  };

  const submitSignup = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const { name, username, email, password } = fields;
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setBanner({ text: 'Please fill in all fields', kind: 'error' });
      return;
    }
    if (!isPasswordStrong(password)) {
      setBanner({
        text: 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a symbol.',
        kind: 'error',
      });
      return;
    }
    void run(() => signUpPersonal({ name: name.trim(), username: username.trim(), email: email.trim(), password }));
  };

  const submitLogin = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const email = fields.loginEmail.trim();
    const password = fields.loginPassword;
    if (!email || !password) {
      setBanner({ text: 'Please fill in all fields', kind: 'error' });
      return;
    }
    void run(() => loginPersonal(email, password));
  };

  const withGoogle = (formMode: FormMode) => {
    setBanner(null);
    setPending('google');
    void (async () => {
      try {
        await authenticateWithGoogle(formMode, 'personal');
        await persistLegacySession();
        onAuthenticated();
      } catch (error) {
        fail(error);
      } finally {
        setPending(null);
      }
    })();
  };

  const forgotPassword = async () => {
    const email = fields.loginEmail.trim();
    if (!email) {
      setBanner({ text: 'Please enter your email address above first, then tap "Forgot Password?" again.', kind: 'error' });
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setBanner({ text: 'That email address looks invalid. Please check it and try again.', kind: 'error' });
      return;
    }
    setBanner(null);
    setPending('reset');
    try {
      await sendPasswordReset(email);
      setBanner({ text: `Password reset link sent to ${email}. Check your inbox (and spam folder).`, kind: 'success' });
    } catch (error) {
      fail(error);
    } finally {
      setPending(null);
    }
  };

  const switchMode = (next: FormMode) => {
    setMode(next);
    setBanner(null);
  };

  const busy = pending !== null;

  return (
    <div className={OVERLAY} role="dialog" aria-modal="true" aria-label="Sign in to Pose">
      <div className={CONTAINER}>
        <div className={BRAND}>
          <Image
            src="/logo.png"
            alt="Pose"
            width={72}
            height={72}
            unoptimized
            className="block h-[72px] w-[72px] rounded-[18px] object-cover"
          />
          <div>
            <div className={BRAND_TITLE}>Pose</div>
            <div className={BRAND_SUBTITLE}>African Creator Platform</div>
          </div>
        </div>

        <div className={TABS}>
          <button type="button" className={cx(TAB_BTN, TAB_BTN_ACTIVE)}>
            Personal
          </button>
          <button
            type="button"
            className={GUEST_TAB}
            onClick={() => {
              enterGuestMode();
              onClose();
            }}
          >
            <i className="fas fa-user-secret" aria-hidden="true" /> Guest
          </button>
        </div>

        <div className={MODE_TOGGLE}>
          <button
            type="button"
            className={cx(MODE_BTN, mode === 'signup' ? MODE_BTN_ACTIVE : MODE_BTN_IDLE)}
            onClick={() => switchMode('signup')}
          >
            Sign Up
          </button>
          <button
            type="button"
            className={cx(MODE_BTN, mode === 'login' ? MODE_BTN_ACTIVE : MODE_BTN_IDLE)}
            onClick={() => switchMode('login')}
          >
            Login
          </button>
        </div>

        {mode === 'signup' ? (
          <form onSubmit={submitSignup} noValidate>
            {banner ? (
              <div className={cx(BANNER, banner.kind === 'success' ? BANNER_SUCCESS : BANNER_ERROR)}>
                {banner.text}
              </div>
            ) : null}
            <input className={INPUT} type="text" placeholder="Full Name" value={fields.name} onChange={set('name')} />
            <input
              className={INPUT}
              type="text"
              placeholder="Username"
              value={fields.username}
              onChange={set('username')}
            />
            <input
              className={INPUT}
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={fields.email}
              onChange={set('email')}
            />
            <div className={PW_WRAP}>
              <input
                className={PW_INPUT}
                type={revealPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="new-password"
                value={fields.password}
                onChange={set('password')}
              />
              <button
                type="button"
                className={PW_TOGGLE}
                aria-label={revealPassword ? 'Hide password' : 'Show password'}
                onClick={() => setRevealPassword((previous) => !previous)}
              >
                <i className={cx('fas', revealPassword ? 'fa-eye-slash' : 'fa-eye')} aria-hidden="true" />
              </button>
            </div>
            <ul className={REQUIREMENTS}>
              {(
                [
                  ['length', 'At least 8 characters'],
                  ['upper', 'One uppercase letter'],
                  ['lower', 'One lowercase letter'],
                  ['number', 'One number'],
                  ['symbol', 'One symbol (e.g. !@#$%)'],
                ] as const
              ).map(([rule, label]) => {
                const met = PASSWORD_RULES[rule](fields.password);
                return (
                  <li key={rule} className={cx(REQUIREMENT, met ? REQUIREMENT_MET : REQUIREMENT_IDLE)}>
                    <i
                      className={cx(
                        REQUIREMENT_ICON,
                        met ? 'fa-check' : 'fa-circle',
                        met ? REQUIREMENT_ICON_MET : REQUIREMENT_ICON_IDLE,
                      )}
                      aria-hidden="true"
                    />{' '}
                    {label}
                  </li>
                );
              })}
            </ul>
            <button type="submit" className={SUBMIT} disabled={busy}>
              {pending === 'email' ? 'Signing up...' : 'Sign Up'}
            </button>
            <button type="button" className={GOOGLE} disabled={busy} onClick={() => withGoogle('signup')}>
              <i className={cx('fa-brands fa-google', GOOGLE_ICON)} aria-hidden="true" />
              Continue with Google
            </button>
          </form>
        ) : (
          <form onSubmit={submitLogin} noValidate>
            {banner ? (
              <div className={cx(BANNER, banner.kind === 'success' ? BANNER_SUCCESS : BANNER_ERROR)}>
                {banner.text}
              </div>
            ) : null}
            <input
              className={INPUT}
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={fields.loginEmail}
              onChange={set('loginEmail')}
            />
            <div className={PW_WRAP}>
              <input
                className={PW_INPUT}
                type={revealPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="current-password"
                value={fields.loginPassword}
                onChange={set('loginPassword')}
              />
              <button
                type="button"
                className={PW_TOGGLE}
                aria-label={revealPassword ? 'Hide password' : 'Show password'}
                onClick={() => setRevealPassword((previous) => !previous)}
              >
                <i className={cx('fas', revealPassword ? 'fa-eye-slash' : 'fa-eye')} aria-hidden="true" />
              </button>
            </div>
            <button type="submit" className={SUBMIT} disabled={busy}>
              {pending === 'email' ? 'Logging in...' : 'Login'}
            </button>
            <button type="button" className={GOOGLE} disabled={busy} onClick={() => withGoogle('login')}>
              <i className={cx('fa-brands fa-google', GOOGLE_ICON)} aria-hidden="true" />
              Continue with Google
            </button>
            <button type="button" className={FORGOT} disabled={pending === 'reset'} onClick={() => void forgotPassword()}>
              {pending === 'reset' ? 'Sending...' : 'Forgot Password?'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
