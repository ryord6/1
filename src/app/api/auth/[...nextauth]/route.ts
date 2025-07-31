import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Definisikan opsi autentikasi Anda di sini
export const authOptions: NextAuthOptions = {
  // Gunakan Prisma Adapter untuk menghubungkan NextAuth dengan database Anda
  adapter: PrismaAdapter(prisma),
  
  // Konfigurasi provider login (saat ini hanya Google)
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  // Gunakan strategi session JWT (JSON Web Tokens)
  session: {
    strategy: 'jwt',
  },
  
  // Callbacks untuk kustomisasi, salah satunya menambahkan user.id ke session
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  
  // Halaman kustom jika diperlukan (opsional)
  pages: {
    signIn: '/', // Arahkan ke homepage untuk login
    signOut: '/',
    error: '/', 
    verifyRequest: '/', 
  },
};

// Buat handler NextAuth
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };