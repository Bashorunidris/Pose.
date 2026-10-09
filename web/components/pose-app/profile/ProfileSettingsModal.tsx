'use client';

import { useCallback, useEffect, useState } from 'react';

import { POLICIES, type PolicyKey } from '@/lib/pose-app/policies';
import {
  VISIBILITY_OPTIONS,
  deactivateAccount,
  deleteAccount,
  loadProfileVisibility,
  saveProfileVisibility,
  type ProfileVisibility,
} from '@/lib/pose-app/profile-settings';
import { getPoseFirebase } from '@/lib/firebase';
import { signOutPose } from '@/lib/pose-app/session';

import { BlockedAccountsModal } from './BlockedAccountsModal';
import { ConfirmModal } from './ConfirmModal';
import { EditProfileModal } from './EditProfileModal';
import { HelpPopup } from './HelpPopup';
import { PolicyModal } from './PolicyModal';
import {
  SETTINGS_CONTENT,
  SETTING_ITEM,
  SETTING_ITEM_STATIC,
  SETTINGS_NAV,
  SETTINGS_PANEL,
  SETTINGS_SECTION,
  SETTINGS_SECTION_TITLE,
  SETTING_CHEVRON,
  SETTING_ICON,
  SETTING_ICON_DANGER,
  SETTING_INFO,
  SETTING_SELECT,
  SETTING_TEXT_DANGER,
} from './settings-ui';

type HelpView = 'help' | 'problem' | 'account' | 'appeal';

type View =
  | { kind: 'list' }
  | { kind: 'edit' }
  | { kind: 'blocked' }
  | { kind: 'policy'; policy: PolicyKey }
  | { kind: 'help'; view: HelpView }
  | { kind: 'confirm'; which: 'deactivate' | 'delete' };

type Props = {
  uid: string;
  email: string;
  onClose: () => void;
  onToast: (message: string) => void;
  /** Mirrors the legacy `location.href = 'index.html'` after a sign-out. */
  onSignedOut: () => void;
  /** The profile page re-pulls the user document after an edit. */
  onProfileChanged: () => void;
};

const CHEVRON = <i className={`fas fa-chevron-right ${SETTING_CHEVRON}`} />;

/**
 * `#profileSettingsModal` @24133 — the whole settings tree: the section list,
 * the Edit Profile form, the blocked-accounts panel, the four policy documents,
 * the Help & Support popup and the two account-teardown confirmations.
 *
 * The legacy page kept these as siblings in the DOM and slid the settings panel
 * over them; here the list is the root view and each row pushes a child.
 */
export function ProfileSettingsModal({
  uid,
  email,
  onClose,
  onToast,
  onSignedOut,
  onProfileChanged,
}: Props) {
  const [view, setView] = useState<View>({ kind: 'list' });
  const [visibility, setVisibility] = useState<ProfileVisibility | null>(null);
  const [busy, setBusy] = useState(false);

  const loadVisibility = useCallback(async () => {
    try {
      setVisibility(await loadProfileVisibility(uid));
    } catch (error) {
      console.error('❌ loading the profile visibility:', error);
      setVisibility('public');
    }
  }, [uid]);

  useEffect(() => {
    void Promise.resolve().then(() => loadVisibility());
  }, [loadVisibility]);

  const changeVisibility = async (value: ProfileVisibility) => {
    setVisibility(value);
    try {
      await saveProfileVisibility(uid, value);
      onToast('Profile visibility updated');
    } catch (error) {
      console.error('❌ saving the profile visibility:', error);
      onToast('Could not update profile visibility');
      await loadVisibility();
    }
  };

  const logout = async () => {
    await signOutPose();
    onClosedByAuth();
  };

  /** Both teardown flows end the session and drop the whole settings stack. */
  const onClosedByAuth = () => {
    onSignedOut();
  };

  const confirmDeactivate = async () => {
    setBusy(true);
    try {
      await deactivateAccount(uid);
      onToast('Account deactivated. Logging you out...');
      // The legacy flow gave the toast 1.5s to read before signing out.
      setTimeout(() => {
        void signOutPose().then(onClosedByAuth);
      }, 1500);
    } catch (error) {
      console.error('❌ deactivating the account:', error);
      const message = error instanceof Error ? error.message : String(error);
      onToast(`Error: ${message}`);
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      const { auth } = getPoseFirebase();
      const result = await deleteAccount(uid, auth.currentUser);

      if (result.requiresRecentLogin) {
        onToast('Your session expired. Please log in again and try deleting your account.');
        await signOutPose();
        onClosedByAuth();
        return;
      }
      if (result.error) {
        onToast(`Error deleting account: ${result.error}`);
        setBusy(false);
        return;
      }

      onToast('Account permanently deleted.');
      setTimeout(() => {
        void signOutPose({ clearAll: true }).then(onClosedByAuth);
      }, 1500);
    } catch (error) {
      console.error('❌ deleting the account:', error);
      const message = error instanceof Error ? error.message : String(error);
      onToast(`Error deleting account: ${message}`);
      setBusy(false);
    }
  };

  return (
    <>
      <div className={SETTINGS_PANEL}>
        <nav className={SETTINGS_NAV}>
          <div className="flex items-center gap-[15px]">
            <button
              type="button"
              className="cursor-pointer rounded-full border-none bg-none p-[8px] text-[1.2rem] text-[#9c27b0] transition-colors duration-200 hover:bg-[#9c27b0]/20"
              onClick={onClose}
              aria-label="Back"
            >
              <i className="fas fa-arrow-left" />
            </button>
            <h1 className="m-0 text-[1.5rem] text-white">Settings</h1>
          </div>
        </nav>

        <main className={SETTINGS_CONTENT}>
          {/* Account Settings */}
          <section className={SETTINGS_SECTION}>
            <h2 className={SETTINGS_SECTION_TITLE}>Account Settings</h2>
            <button
              type="button"
              className={SETTING_ITEM}
              onClick={() => setView({ kind: 'edit' })}
            >
              <span className={SETTING_INFO}>
                <i className={`fas fa-user ${SETTING_ICON}`} />
                <span>Edit Profile</span>
              </span>
              {CHEVRON}
            </button>
          </section>

          {/* Privacy & Security */}
          <section className={SETTINGS_SECTION}>
            <h2 className={SETTINGS_SECTION_TITLE}>Privacy &amp; Security</h2>
            <div className={SETTING_ITEM_STATIC}>
              <span className={SETTING_INFO}>
                <i className={`fas fa-eye ${SETTING_ICON}`} />
                <span>Profile Visibility</span>
              </span>
              <select
                className={SETTING_SELECT}
                aria-label="Profile Visibility"
                value={visibility ?? 'public'}
                onChange={(event) => void changeVisibility(event.target.value as ProfileVisibility)}
              >
                {VISIBILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className={SETTING_ITEM}
              onClick={() => setView({ kind: 'blocked' })}
            >
              <span className={SETTING_INFO}>
                <i className={`fas fa-user-slash ${SETTING_ICON}`} />
                <span>Blocked Accounts</span>
              </span>
              {CHEVRON}
            </button>
          </section>

          {/* Monetization — a plain row in the legacy page, with nothing attached. */}
          <section className={SETTINGS_SECTION}>
            <h2 className={SETTINGS_SECTION_TITLE}>Monetization &amp; Ads</h2>
            <div className={SETTING_ITEM_STATIC}>
              <span className={SETTING_INFO}>
                <i className={`fas fa-money-bill ${SETTING_ICON}`} />
                <span>Monetization Dashboard</span>
              </span>
              {CHEVRON}
            </div>
          </section>

          {/* Notifications — both switches were visual-only in the legacy page too. */}
          <section className={SETTINGS_SECTION}>
            <h2 className={SETTINGS_SECTION_TITLE}>Notifications</h2>
            <div className={SETTING_ITEM_STATIC}>
              <span className={SETTING_INFO}>
                <i className={`fas fa-bell ${SETTING_ICON}`} />
                <span>Push Notifications</span>
              </span>
              <ToggleSwitch defaultChecked label="Push Notifications" />
            </div>
            <div className={SETTING_ITEM_STATIC}>
              <span className={SETTING_INFO}>
                <i className={`fas fa-envelope ${SETTING_ICON}`} />
                <span>Email Notifications</span>
              </span>
              <ToggleSwitch label="Email Notifications" />
            </div>
          </section>

          {/* Help & Support */}
          <section className={SETTINGS_SECTION}>
            <h2 className={SETTINGS_SECTION_TITLE}>Help &amp; Support</h2>
            {(
              [
                { view: 'help', icon: 'fa-question-circle', label: 'Help Center' },
                { view: 'problem', icon: 'fa-bug', label: 'Report a Problem' },
                { view: 'account', icon: 'fa-exclamation-circle', label: 'Report an account' },
                { view: 'appeal', icon: 'fa-redo', label: 'Appeal for an account' },
              ] as { view: HelpView; icon: string; label: string }[]
            ).map((row) => (
              <button
                key={row.view}
                type="button"
                className={SETTING_ITEM}
                onClick={() => setView({ kind: 'help', view: row.view })}
              >
                <span className={SETTING_INFO}>
                  <i className={`fas ${row.icon} ${SETTING_ICON}`} />
                  <span>{row.label}</span>
                </span>
                {CHEVRON}
              </button>
            ))}
          </section>

          {/* Privacy & Legal */}
          <section className={SETTINGS_SECTION}>
            <h2 className={SETTINGS_SECTION_TITLE}>Privacy &amp; Legal</h2>
            {(Object.keys(POLICIES) as PolicyKey[]).map((key) => (
              <button
                key={key}
                type="button"
                className={SETTING_ITEM}
                onClick={() => setView({ kind: 'policy', policy: key })}
              >
                <span className={SETTING_INFO}>
                  <i className={`fas ${POLICY_ICONS[key]} ${SETTING_ICON}`} />
                  <span>{POLICIES[key].title}</span>
                </span>
                {CHEVRON}
              </button>
            ))}
          </section>

          {/* Account Management */}
          <section className={SETTINGS_SECTION}>
            <h2 className={SETTINGS_SECTION_TITLE}>Account Management</h2>
            <button type="button" className={SETTING_ITEM} onClick={() => void logout()}>
              <span className={SETTING_INFO}>
                <i className={`fas fa-sign-out-alt ${SETTING_ICON_DANGER}`} />
                <span>Logout</span>
              </span>
              {CHEVRON}
            </button>
            <button
              type="button"
              className={SETTING_ITEM}
              onClick={() => setView({ kind: 'confirm', which: 'deactivate' })}
            >
              <span className={SETTING_INFO}>
                <i className={`fas fa-power-off ${SETTING_ICON_DANGER}`} />
                <span>Deactivate Account</span>
              </span>
              {CHEVRON}
            </button>
            <button
              type="button"
              className={SETTING_ITEM}
              onClick={() => setView({ kind: 'confirm', which: 'delete' })}
            >
              <span className={SETTING_INFO}>
                <i className={`fas fa-trash ${SETTING_ICON_DANGER}`} />
                <span className={SETTING_TEXT_DANGER}>Delete Account</span>
              </span>
              {CHEVRON}
            </button>
          </section>
        </main>
      </div>

      {view.kind === 'edit' ? (
        <EditProfileModal
          uid={uid}
          email={email}
          onClose={() => setView({ kind: 'list' })}
          onToast={onToast}
          onSaved={onProfileChanged}
        />
      ) : null}

      {view.kind === 'blocked' ? (
        <BlockedAccountsModal
          uid={uid}
          onClose={() => setView({ kind: 'list' })}
          onToast={onToast}
        />
      ) : null}

      {view.kind === 'policy' ? (
        <PolicyModal policy={view.policy} onClose={() => setView({ kind: 'list' })} />
      ) : null}

      {view.kind === 'help' ? (
        <HelpPopup
          view={view.view}
          reporter={{ uid, email: email || null }}
          onClose={() => setView({ kind: 'list' })}
          onToast={onToast}
        />
      ) : null}

      {view.kind === 'confirm' && view.which === 'deactivate' ? (
        <ConfirmModal
          variant="warning"
          title="Deactivate Account?"
          message="Your account will be temporarily disabled. You can reactivate it anytime by logging back in."
          confirmLabel="Yes, Deactivate"
          busy={busy}
          onConfirm={() => void confirmDeactivate()}
          onCancel={() => setView({ kind: 'list' })}
        />
      ) : null}

      {view.kind === 'confirm' && view.which === 'delete' ? (
        <ConfirmModal
          variant="danger"
          title="Delete Account?"
          message={
            <>
              <strong>WARNING:</strong> This action cannot be undone. All your data, posts, and
              followers will be permanently deleted.
            </>
          }
          confirmLabel="Yes, Delete Permanently"
          busy={busy}
          onConfirm={() => void confirmDelete()}
          onCancel={() => setView({ kind: 'list' })}
        />
      ) : null}
    </>
  );
}

const POLICY_ICONS: Record<PolicyKey, string> = {
  privacy: 'fa-shield-alt',
  terms: 'fa-file-contract',
  data: 'fa-database',
  community: 'fa-users',
};

/** `.switch` / `.slider.round` @17832 — 50×24 track, 18px knob, purple when on. */
function ToggleSwitch({ defaultChecked, label }: { defaultChecked?: boolean; label: string }) {
  const [on, setOn] = useState(Boolean(defaultChecked));

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`relative inline-block h-[24px] w-[50px] shrink-0 cursor-pointer rounded-full border-none transition-colors duration-300 ${
        on ? 'bg-[#9c27b0]' : 'bg-[#333]'
      }`}
      onClick={() => setOn((current) => !current)}
    >
      <span
        className={`absolute bottom-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white transition-transform duration-300 ${
          on ? 'translate-x-[26px]' : ''
        }`}
      />
    </button>
  );
}
