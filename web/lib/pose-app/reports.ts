'use client';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';

/**
 * `submitReport()` @45043 — the Help & Support forms.
 *
 * Each form has its own collection and its own "you cannot send this yet" rule,
 * and the legacy code read the fields out of the DOM in document order. The port
 * passes the values in with their names, so the field order is no longer load
 * bearing, but the collections, the validation messages and the payload keys are
 * kept as they were.
 */

export type ReportInput =
  | {
      kind: 'problem';
      problemType: string;
      title: string;
      description: string;
      reproSteps: string;
      device: string;
    }
  | {
      kind: 'account';
      reportedUsername: string;
      violationType: string;
      details: string;
    }
  | {
      kind: 'appeal';
      email: string;
      username: string;
      violationReason: string;
      appealStatement: string;
    };

export type ReportResult = { ok: true } | { ok: false; message: string };

const COLLECTIONS: Record<ReportInput['kind'], string> = {
  problem: 'reports_problems',
  account: 'reports_accounts',
  appeal: 'reports_appeals',
};

/** The legacy guard for each form, in the order it ran. */
function validate(input: ReportInput): string | null {
  if (input.kind === 'problem') {
    return input.title.trim() || input.description.trim() ? null : 'Please add a title or description';
  }
  if (input.kind === 'account') {
    return input.reportedUsername.trim() ? null : 'Please enter the username to report';
  }
  return input.email.trim() && input.appealStatement.trim()
    ? null
    : 'Please fill email and appeal statement';
}

export async function submitReport(
  input: ReportInput,
  reporter: { uid: string | null; email: string | null },
): Promise<ReportResult> {
  const invalid = validate(input);
  if (invalid) return { ok: false, message: invalid };

  const { db } = getPoseFirebase();
  const trimmed = Object.fromEntries(
    Object.entries(input)
      .filter(([key]) => key !== 'kind')
      .map(([key, value]) => [key, String(value ?? '').trim()]),
  );

  try {
    await addDoc(collection(db, COLLECTIONS[input.kind]), {
      type: input.kind,
      submittedBy: reporter.uid,
      submittedByEmail: reporter.email,
      status: 'open',
      ...trimmed,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, message: `Failed to submit: ${message}` };
  }

  return { ok: true };
}
