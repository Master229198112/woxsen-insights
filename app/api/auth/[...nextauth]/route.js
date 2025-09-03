import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authOptions as baseAuthOptions } from '@/lib/auth-config';

// Create the authOptions with the credentials provider
export const authOptions = {
  ...baseAuthOptions,
  providers: [
    CredentialsProvider(baseAuthOptions.providers[0])
  ]
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
