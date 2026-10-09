'use client';

import { useMemo } from 'react';

import { POLICIES, POLICY_DATE_TOKEN, getPolicyDate, type PolicyKey } from '@/lib/pose-app/policies';

type Props = {
  policy: PolicyKey;
  onClose: () => void;
};

/**
 * `#policyModal` + `showPolicy()` @44353.
 *
 * The documents are the app's own static copy, transcribed verbatim from the
 * legacy function, so they are injected the same way the legacy modal did it —
 * with `innerHTML`, which `dangerouslySetInnerHTML` is the React equivalent of.
 * No user input ever reaches this string.
 */
export function PolicyModal({ policy, onClose }: Props) {
  const entry = POLICIES[policy];
  // `getPolicyDate()` is date-based, so it must not be evaluated during render
  // on the server and again on the client with a different week boundary.
  const updated = useMemo(() => getPolicyDate(), []);
  const content = useMemo(
    () => entry.content.split(POLICY_DATE_TOKEN).join(updated),
    [entry, updated],
  );

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80">
      <div className="max-h-[80vh] w-[90%] max-w-[700px] overflow-y-auto rounded-[12px] bg-[#1a1a1a] shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
        <div className="sticky top-0 z-[1] flex items-center justify-between border-b border-[#2a2a2a] bg-[#1a1a1a] px-[20px] py-[15px]">
          <h2 className="m-0 text-[1.3rem] text-white">{entry.title}</h2>
          <button
            type="button"
            className="cursor-pointer border-none bg-none p-0 text-[1.5rem] leading-none text-[#999] hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div
          className="p-[20px] leading-[1.6] text-[#ddd] [&_h3]:mt-0 [&_h3]:text-[#9c27b0] [&_h4]:mb-[10px] [&_h4]:mt-[20px] [&_p]:mb-[15px]"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}
