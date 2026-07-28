'use client';

import { useEffect, useState } from 'react';

type RegState =
  | { kind: 'idle' }
  | { kind: 'registering' }
  | { kind: 'ready'; reg: ServiceWorkerRegistration; isOnline: boolean }
  | { kind: 'update'; reg: ServiceWorkerRegistration; isOnline: boolean }
  | { kind: 'error'; message: string; isOnline: boolean };

export function PWARegistrar() {
  const [state, setState] = useState<RegState>({ kind: 'idle' });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (window.location.hostname === 'localhost') {
      // Register anyway on localhost so dev env behaves like production
    }

    setState({ kind: 'registering' });

    let currentReg: ServiceWorkerRegistration | undefined;

    const onOnline = () =>
      setState((s) =>
        'reg' in s ? { ...s, isOnline: navigator.onLine } : s,
      );
    const onOffline = () =>
      setState((s) =>
        'reg' in s ? { ...s, isOnline: navigator.onLine } : s,
      );

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    (async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'imports',
        });
        currentReg = reg;

        const initialState: RegState = {
          kind: 'ready',
          reg,
          isOnline: navigator.onLine,
        };
        setState(initialState);

        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', () => {
            if (
              (nw.state === 'installed' || nw.state === 'activating') &&
              navigator.serviceWorker.controller
            ) {
              setState({
                kind: 'update',
                reg,
                isOnline: navigator.onLine,
              });
            }
          });
        });

        if (reg.waiting) {
          setState({ kind: 'update', reg, isOnline: navigator.onLine });
        }

        try {
          await reg.update();
        } catch {
          /* ignore periodic update errors */
        }
      } catch (error) {
        setState({
          kind: 'error',
          message: error instanceof Error ? error.message : String(error),
          isOnline: navigator.onLine,
        });
      }
    })();

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      if (currentReg && typeof currentReg.unregister === 'function') {
        // We intentionally do NOT unregister on unmount to keep SW live.
      }
    };
  }, []);

  return null;
}
