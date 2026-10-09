'use client';

import { useCallback, useEffect, useState } from 'react';

import { loadBlockedAccounts, unblockUser, type BlockedAccount } from '@/lib/pose-app/profile-settings';

type Props = {
  uid: string;
  onClose: () => void;
  onToast: (message: string) => void;
};

/**
 * `#blockedAccountsModal` + `openBlockedAccountsModal()` @45225 and
 * `unblockUser()` @45285.
 *
 * The legacy panel sat at `z-index:2147483640` — above every other overlay in
 * the page, including the settings panel that opens it — so that value is kept
 * rather than tidied into the app's scale.
 */
export function BlockedAccountsModal({ uid, onClose, onToast }: Props) {
  const [rows, setRows] = useState<BlockedAccount[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const list = await loadBlockedAccounts(uid);
      setRows(list);
      setError('');
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(`Failed to load. ${message}`);
    }
  }, [uid]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const unblock = async (blockedUid: string) => {
    try {
      await unblockUser(uid, blockedUid);
      onToast('User unblocked');
      await load();
    } catch (cause) {
      console.error('❌ unblocking:', cause);
      onToast('Failed to unblock');
    }
  };

  return (
    <div className="fixed inset-0 z-[2147483640] flex h-[100dvh] w-screen flex-col bg-[#0c0c0c]">
      <div className="flex items-center border-b border-[#2a2a2a] bg-[#111] px-[16px] py-[14px] text-white">
        <button
          type="button"
          className="mr-[12px] cursor-pointer border-none bg-none text-[22px] text-white"
          onClick={onClose}
          aria-label="Back"
        >
          &larr;
        </button>
        <h2 className="m-0 flex-1 text-[18px] text-white">Blocked Accounts</h2>
      </div>

      <div className="flex-1 overflow-auto bg-[#0c0c0c] p-[12px] text-[#eee]">
        {error ? (
          <div className="p-[20px] text-center text-[#f66]">{error}</div>
        ) : rows === null ? (
          <div className="p-[20px] text-center text-[#aaa]">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="p-[30px] text-center text-[#aaa]">You haven&apos;t blocked anyone yet.</div>
        ) : (
          rows.map((row) => (
            <div
              key={row.uid}
              className="flex items-center gap-[12px] border-b border-[#222] p-[12px]"
            >
              <div
                className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#333] bg-cover bg-center font-semibold text-white"
                style={row.pic ? { backgroundImage: `url('${row.pic}')` } : undefined}
              >
                {row.pic ? null : (row.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-white">{row.name}</div>
              <button
                type="button"
                className="cursor-pointer rounded-[18px] border-none bg-[#4C1D95] px-[14px] py-[6px] text-[13px] text-white"
                onClick={() => void unblock(row.uid)}
              >
                Unblock
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
