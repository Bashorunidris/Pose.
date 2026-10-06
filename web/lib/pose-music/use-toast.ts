'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ToastType } from './types';

export type ToastState = {
  id: number;
  message: string;
  type: ToastType;
  leaving: boolean;
} | null;

const TOAST_DURATION_MS = 3000;
const TOAST_FADE_MS = 250;

/** Mirrors the legacy showToast(): the toast plays its entrance, then reverses it before removal. */
export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    clearTimers();
    const id = Date.now();
    setToast({ id, message, type, leaving: false });
    timersRef.current.push(
      setTimeout(() => setToast((prev) => (prev?.id === id ? { ...prev, leaving: true } : prev)), TOAST_DURATION_MS),
      setTimeout(() => setToast((prev) => (prev?.id === id ? null : prev)), TOAST_DURATION_MS + TOAST_FADE_MS),
    );
  }, [clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  return { toast, showToast };
}
