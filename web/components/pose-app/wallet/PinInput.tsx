'use client';

import { useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';

import { PIN_LENGTH } from '@/lib/pose-app/wallet';

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  /** `togglePinVisibility()` @63884 flipped every box's `type`. */
  reveal?: boolean;
  /** The confirm row carries the `confirm` modifier in the legacy stylesheet. */
  variant?: 'default' | 'confirm';
  autoFocus?: boolean;
  ariaLabel: string;
};

/**
 * The six one-digit boxes behind `handlePinInput()` @63791 /
 * `handleConfirmPinInput()` @63818 / `woHandlePinInput()` @64200: digits only,
 * a filled box auto-advances, and backspace walks back into the previous box.
 */
export function PinInput({ value, onChange, reveal = false, variant = 'default', autoFocus = false, ariaLabel }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const setDigit = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, '');
    const next = [...value];
    next[index] = digits ? digits.slice(-1) : '';
    onChange(next);
    if (digits && index < PIN_LENGTH - 1) refs.current[index + 1]?.focus();
  };

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Backspace') return;
    if (value[index]) return;
    if (index === 0) return;
    event.preventDefault();
    const next = [...value];
    next[index - 1] = '';
    onChange(next);
    refs.current[index - 1]?.focus();
  };

  return (
    <div className="pin-input-group">
      {Array.from({ length: PIN_LENGTH }).map((_, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          type={reveal ? 'text' : 'password'}
          className={`pin-input${variant === 'confirm' ? ' confirm' : ''}${value[index] ? ' filled' : ''}`}
          value={value[index] ?? ''}
          onChange={(event) => setDigit(index, event.target.value)}
          onKeyDown={(event) => onKeyDown(index, event)}
          inputMode="numeric"
          autoComplete="off"
          maxLength={1}
          placeholder="•"
          aria-label={`${ariaLabel} digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
