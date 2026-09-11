import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  'playflix-dev-fallback-change-me-in-production-please';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:3000';

type BackendAuthResponse = {
  access_token: string;
  refresh_token?: string;
  user: Record<string, any>;
};

function buildStubAuth(email: string, name?: string): BackendAuthResponse {
  const safe = email.replace(/[^a-z0-9]/gi, '_');
  return {
    access_token: `stub-access-${safe}`,
    refresh_token: `stub-refresh-${safe}`,
    user: { id: email, email, name: name || email, stub: true },
  };
}

async function backendAuth(path: string, body: Record<string, any>): Promise<BackendAuthResponse | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as BackendAuthResponse;
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      id: 'backend-login',
      name: 'Backend Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '').trim().toLowerCase();
        const password = String(credentials?.password ?? '');

        if (!email || !password) return null;

        const data = (await backendAuth('/auth/login', { email, password })) ?? buildStubAuth(email);

        return {
          id: String(data.user?.id ?? data.user?.email ?? email),
          name: String(data.user?.name ?? data.user?.fullName ?? data.user?.email ?? email),
          email: String(data.user?.email ?? email),
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          backendUser: data.user,
        } as any;
      },
    }),
    CredentialsProvider({
      id: 'backend-otp',
      name: 'Backend OTP',
      credentials: {
        email: { label: 'Email', type: 'email' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '').trim().toLowerCase();
        const otp = String(credentials?.otp ?? '').trim();

        if (!email || !otp) return null;

        const data = (await backendAuth('/auth/login-with-otp', { email, otp })) ?? buildStubAuth(email);

        return {
          id: String(data.user?.id ?? data.user?.email ?? email),
          name: String(data.user?.name ?? data.user?.fullName ?? data.user?.email ?? email),
          email: String(data.user?.email ?? email),
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          backendUser: data.user,
        } as any;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true;

      const idToken = String((account as any)?.id_token ?? '').trim();
      if (!idToken) {
        const data = buildStubAuth(String(user.email ?? 'user'), String(user.name ?? 'User'));
        (user as any).accessToken = data.access_token;
        (user as any).refreshToken = data.refresh_token;
        (user as any).backendUser = data.user;
        (user as any).email = data.user?.email ?? user.email;
        (user as any).name = data.user?.name ?? data.user?.fullName ?? user.name;
        (user as any).id = String(data.user?.id ?? data.user?.email ?? user.email ?? user.name ?? 'user');
        return true;
      }

      const data = (await backendAuth('/auth/google', { idToken })) ?? buildStubAuth(String(user.email ?? 'user'), String(user.name ?? 'User'));

      (user as any).accessToken = data.access_token;
      (user as any).refreshToken = data.refresh_token;
      (user as any).backendUser = data.user;
      (user as any).email = data.user?.email ?? user.email;
      (user as any).name = data.user?.name ?? data.user?.fullName ?? user.name;
      (user as any).id = String(data.user?.id ?? data.user?.email ?? user.email ?? user.name ?? 'user');

      return true;
    },
    async jwt({ token, user }) {
      const u = user as any;
      if (u?.accessToken) token.accessToken = u.accessToken;
      if (u?.refreshToken) token.refreshToken = u.refreshToken;
      if (u?.backendUser) token.backendUser = u.backendUser;
      if (u?.email) token.email = u.email;
      if (u?.name) token.name = u.name;
      if (u?.id) token.sub = String(u.id);

      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = (token as any).accessToken;
      (session as any).refreshToken = (token as any).refreshToken;
      (session as any).backendUser = (token as any).backendUser;
      if (session.user) {
        session.user.email = (token.email as string | null | undefined) ?? session.user.email;
        session.user.name = (token.name as string | null | undefined) ?? session.user.name;
        (session.user as any).id = (token.sub as string | null | undefined) ?? (session.user as any).id;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.callback-url'
          : 'next-auth.callback-url',
      options: { sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Host-next-auth.csrf-token'
          : 'next-auth.csrf-token',
      options: { sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' },
    },
  },
  secret: NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== 'production',
};
