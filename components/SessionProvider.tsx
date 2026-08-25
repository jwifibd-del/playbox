'use client'

import { SessionProvider } from 'next-auth/react'
import React from 'react'

type NextAuthLogger = {
  error: (code: string | any, metadata?: any) => void
  warn: (code: string | any, metadata?: any) => void
  debug: (code: string | any, metadata?: any) => void
}

const nextAuthLogger: NextAuthLogger = {
  error(code: any, metadata?: any) {
    if (code === 'CLIENT_FETCH_ERROR') {
      const err = (metadata as any)?.error
      const isAbort =
        err?.name === 'AbortError' ||
        err?.code === 20 ||
        String(err?.message || '').includes('Abort') ||
        String((metadata as any)?.message || '').includes('Abort')
      if (isAbort) return
    }
    ;(console as any).error('[next-auth][error]', code, metadata)
  },
  warn(code: any, metadata?: any) {
    if (process.env.NODE_ENV === 'production') return
    ;(console as any).warn('[next-auth][warn]', code, metadata)
  },
  debug(code: any, metadata?: any) {
    if (process.env.NODE_ENV === 'production') return
    ;(console as any).debug('[next-auth][debug]', code, metadata)
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={typeof window !== 'undefined' ? window.location.protocol === 'https:' : false}
      {...({ logger: nextAuthLogger } as any)}
    >
      {children}
    </SessionProvider>
  )
}
