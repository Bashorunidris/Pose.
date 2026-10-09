'use client';

import { useMemo, useState } from 'react';

import { HELP_CATEGORIES } from '@/lib/pose-app/help-content';
import { submitReport, type ReportInput } from '@/lib/pose-app/reports';

type View = 'help' | 'problem' | 'account' | 'appeal';

type Props = {
  view: View;
  reporter: { uid: string | null; email: string | null };
  onClose: () => void;
  onToast: (message: string) => void;
};

const TITLES: Record<View, string> = {
  help: 'Help Center',
  problem: 'Report a Problem',
  account: 'Report an Account',
  appeal: 'Appeal Account Decision',
};

const FIELD =
  'rounded-[5px] border border-[#444] bg-[#333] p-[10px] text-[0.9rem] text-white placeholder:text-[#999]';
const LABEL = 'text-[0.9rem] font-semibold text-[#ccc]';
const GROUP = 'flex flex-col gap-[5px]';
const SUBMIT =
  'w-full cursor-pointer rounded-[5px] border-none bg-[#8a2be2] px-[15px] py-[10px] text-[0.9rem] font-bold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-60';

const CONTACTS = [
  { icon: 'fas fa-envelope', title: 'Email', detail: 'support@pose.app', action: 'Email Us' },
  { icon: 'fas fa-comments', title: 'Live Chat', detail: '9am-5pm EST', action: 'Start Chat' },
  { icon: 'fab fa-twitter', title: 'Twitter', detail: '@PoseApp', action: 'Buzz Us' },
];

const APPEAL_STEPS = [
  'Review the violation notice sent to your email',
  'Gather any supporting documentation or evidence',
  'Fill out the appeal form below with details',
  'Submit your appeal and wait for our response',
];

/** Tags are stripped before searching, because the legacy filter read `textContent`. */
function textOf(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').toLowerCase();
}

/**
 * `#helpPopup` @24401 with `showHelpCenter()` @44726, `showReportProblem()`
 * @44859, `showReportAccount()` @44901, `showAppealAccount()` @44938 and
 * `submitReport()` @45043.
 *
 * The legacy popup swapped its `innerHTML` between four views; the port renders
 * the one it was opened with, which is what the four settings rows do.
 */
export function HelpPopup({ view, reporter, onClose, onToast }: Props) {
  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/70">
      <div className="flex max-h-[80vh] w-[90%] max-w-[600px] flex-col overflow-hidden rounded-[10px] bg-[#222] text-white">
        <div className="flex items-center justify-between border-b border-[#333] px-[20px] py-[15px]">
          <h3 className="m-0 text-[1.5rem] text-white">{TITLES[view]}</h3>
          <button
            type="button"
            className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border-none bg-none p-0 text-[24px] leading-none text-white transition-colors duration-200 hover:bg-white/10"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="max-h-[calc(80vh-120px)] grow overflow-y-auto p-[20px]">
          {view === 'help' ? (
            <HelpCenter
              onContact={() => {
                onToast('Thank you! We will contact you shortly.');
                onClose();
              }}
            />
          ) : (
            <ReportForm view={view} reporter={reporter} onClose={onClose} onToast={onToast} />
          )}
        </div>
      </div>
    </div>
  );
}

/** `showHelpCenter()` — accordion, live search and the three contact cards. */
function HelpCenter({ onContact }: { onContact: () => void }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const term = query.trim().toLowerCase();
  const categories = useMemo(
    () =>
      HELP_CATEGORIES.map((category) => ({
        title: category.title,
        items: term
          ? category.items.filter(
              (item) =>
                item.question.toLowerCase().includes(term) || textOf(item.answer).includes(term),
            )
          : category.items,
      })).filter((category) => category.items.length > 0),
    [term],
  );

  return (
    <div>
      <input
        type="text"
        className="mb-[20px] w-full rounded-[5px] border border-[#444] bg-[#333] px-[15px] py-[10px] text-[14px] text-white placeholder:text-[#999]"
        placeholder="Search for help..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {categories.map((category) => (
        <div key={category.title} className="mb-[20px]">
          <h4 className="m-0 mb-[10px] text-[1.1rem] font-semibold text-[#8a2be2]">{category.title}</h4>
          {category.items.map((item) => {
            const key = `${category.title}:${item.question}`;
            const isOpen = open === key;
            return (
              <div
                key={key}
                className={`mb-[8px] overflow-hidden rounded-[5px] transition-colors duration-200 ${
                  isOpen ? 'bg-[#3a3a3a]' : 'bg-[#333] hover:bg-[#3a3a3a]'
                }`}
              >
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between border-none bg-none p-[12px] text-left font-medium text-white"
                  onClick={() => setOpen(isOpen ? null : key)}
                >
                  <span>{item.question}</span>
                  <i className={isOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-down'} />
                </button>
                {/* `.help-item-content` was zero-height until its item opened. The
                    answer keeps its markup — it is the app's own static copy. */}
                <div
                  className={`px-[12px] text-[0.9rem] leading-[1.5] text-[#ccc] ${
                    isOpen ? 'max-h-[300px] pb-[12px]' : 'max-h-0 overflow-hidden'
                  } transition-all duration-300`}
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              </div>
            );
          })}
        </div>
      ))}

      {categories.length === 0 ? (
        <p className="mb-[20px] text-center text-[0.9rem] text-[#999]">No results for “{query}”.</p>
      ) : null}

      <div className="mb-[20px]">
        <h4 className="m-0 mb-[10px] text-[1.1rem] font-semibold text-[#8a2be2]">Contact Us</h4>
        <div className="mt-[15px] grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-[12px]">
          {CONTACTS.map((contact) => (
            <div
              key={contact.title}
              className="flex flex-col items-center rounded-[5px] bg-[#333] p-[15px] text-center transition-all duration-200 hover:-translate-y-[2px] hover:bg-[#3a3a3a]"
            >
              <i className={`${contact.icon} mb-[8px] text-[24px] text-[#8a2be2]`} />
              <h5 className="m-0 mb-[5px] text-[0.95rem] font-semibold">{contact.title}</h5>
              <p className="m-0 mb-[10px] text-[0.75rem] text-[#bbb]">{contact.detail}</p>
              <button
                type="button"
                className="w-full cursor-pointer rounded-[5px] border-none bg-[#8a2be2] px-[15px] py-[10px] text-[0.9rem] font-bold text-white transition-opacity duration-200 hover:opacity-90"
                onClick={onContact}
              >
                {contact.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** `showReportProblem()` / `showReportAccount()` / `showAppealAccount()` forms. */
function ReportForm({
  view,
  reporter,
  onClose,
  onToast,
}: {
  view: Exclude<View, 'help'>;
  reporter: { uid: string | null; email: string | null };
  onClose: () => void;
  onToast: (message: string) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const field = (key: string) => values[key] ?? '';
  const set = (key: string) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const send = async () => {
    const input: ReportInput =
      view === 'problem'
        ? {
            kind: 'problem',
            problemType: field('problemType') || 'Bug or Technical Issue',
            title: field('title'),
            description: field('description'),
            reproSteps: field('reproSteps'),
            device: field('device'),
          }
        : view === 'account'
          ? {
              kind: 'account',
              reportedUsername: field('reportedUsername'),
              violationType: field('violationType') || 'Harassment or bullying',
              details: field('details'),
            }
          : {
              kind: 'appeal',
              email: field('email'),
              username: field('username'),
              violationReason: field('violationReason'),
              appealStatement: field('appealStatement'),
            };

    setBusy(true);
    try {
      const result = await submitReport(input, reporter);
      if (!result.ok) {
        onToast(result.message);
        return;
      }
      onToast('Report submitted successfully. Our team will review it shortly.');
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const submitLabel = view === 'appeal' ? 'Submit Appeal' : 'Submit Report';

  return (
    <form
      className="flex flex-col gap-[12px]"
      onSubmit={(event) => {
        event.preventDefault();
        void send();
      }}
    >
      {view === 'account' ? (
        <p className="m-0 mb-[15px] text-[#ccc]">
          Help us keep Pose safe by reporting accounts that violate our community guidelines.
        </p>
      ) : null}

      {view === 'appeal' ? (
        <div className="mb-[20px] text-[#ccc]">
          <p className="mb-[15px]">
            If you believe your account has been suspended or restricted in error, you can appeal the
            decision.
          </p>
          <div className="my-[15px] flex flex-col gap-[12px]">
            {APPEAL_STEPS.map((step, index) => (
              <div key={step} className="flex items-start gap-[12px]">
                <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-[#8a2be2] text-[0.9rem] font-bold text-white">
                  {index + 1}
                </div>
                <div className="text-[0.9rem] leading-[1.5] text-[#ccc]">{step}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {view === 'problem' ? (
        <>
          <div className={GROUP}>
            <label className={LABEL} htmlFor="reportProblemType">Problem Type</label>
            <select id="reportProblemType" className={FIELD} value={field('problemType')} onChange={set('problemType')}>
              <option>Bug or Technical Issue</option>
              <option>Performance Issue</option>
              <option>Feature Request</option>
              <option>Payment Issue</option>
              <option>Other</option>
            </select>
          </div>
          <div className={GROUP}>
            <label className={LABEL} htmlFor="reportProblemTitle">Title</label>
            <input id="reportProblemTitle" className={FIELD} placeholder="Brief title of the issue" value={field('title')} onChange={set('title')} />
          </div>
          <div className={GROUP}>
            <label className={LABEL} htmlFor="reportProblemDescription">Description</label>
            <textarea
              id="reportProblemDescription"
              className={`${FIELD} min-h-[100px] resize-y`}
              placeholder="Describe the problem in detail..."
              value={field('description')}
              onChange={set('description')}
            />
          </div>
          <div className={GROUP}>
            <label className={LABEL} htmlFor="reportProblemSteps">How to Reproduce (if applicable)</label>
            <textarea
              id="reportProblemSteps"
              className={`${FIELD} min-h-[100px] resize-y`}
              placeholder="Steps to reproduce the issue..."
              value={field('reproSteps')}
              onChange={set('reproSteps')}
            />
          </div>
          <div className={GROUP}>
            <label className={LABEL} htmlFor="reportProblemDevice">Device &amp; OS</label>
            <input id="reportProblemDevice" className={FIELD} placeholder="e.g., iPhone 13 Pro, iOS 15" value={field('device')} onChange={set('device')} />
          </div>
        </>
      ) : null}

      {view === 'account' ? (
        <>
          <div className={GROUP}>
            <label className={LABEL} htmlFor="reportAccountUser">Account Username</label>
            <input id="reportAccountUser" className={FIELD} placeholder="@username" value={field('reportedUsername')} onChange={set('reportedUsername')} />
          </div>
          <div className={GROUP}>
            <label className={LABEL} htmlFor="reportAccountViolation">Violation Type</label>
            <select id="reportAccountViolation" className={FIELD} value={field('violationType')} onChange={set('violationType')}>
              <option>Harassment or bullying</option>
              <option>Inappropriate content</option>
              <option>Hate speech</option>
              <option>Spam</option>
              <option>Impersonation</option>
              <option>Copyright infringement</option>
              <option>Other</option>
            </select>
          </div>
          <div className={GROUP}>
            <label className={LABEL} htmlFor="reportAccountDetails">Details</label>
            <textarea
              id="reportAccountDetails"
              className={`${FIELD} min-h-[100px] resize-y`}
              placeholder="Provide details about why you're reporting this account..."
              value={field('details')}
              onChange={set('details')}
            />
          </div>
        </>
      ) : null}

      {view === 'appeal' ? (
        <>
          <div className={GROUP}>
            <label className={LABEL} htmlFor="appealEmail">Email Associated with Account</label>
            <input id="appealEmail" type="email" className={FIELD} placeholder="your@email.com" value={field('email')} onChange={set('email')} />
          </div>
          <div className={GROUP}>
            <label className={LABEL} htmlFor="appealUsername">Your Username</label>
            <input id="appealUsername" className={FIELD} placeholder="@username" value={field('username')} onChange={set('username')} />
          </div>
          <div className={GROUP}>
            <label className={LABEL} htmlFor="appealReason">Violation Reason</label>
            <input
              id="appealReason"
              className={FIELD}
              placeholder="What was the stated reason for suspension?"
              value={field('violationReason')}
              onChange={set('violationReason')}
            />
          </div>
          <div className={GROUP}>
            <label className={LABEL} htmlFor="appealStatement">Appeal Statement</label>
            <textarea
              id="appealStatement"
              className={`${FIELD} min-h-[100px] resize-y`}
              placeholder="Explain why you believe this decision was made in error..."
              value={field('appealStatement')}
              onChange={set('appealStatement')}
            />
          </div>
        </>
      ) : null}

      <button type="submit" className={SUBMIT} disabled={busy}>
        {busy ? <i className="fa-solid fa-spinner fa-spin" /> : submitLabel}
      </button>
    </form>
  );
}
