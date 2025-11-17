import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { restaurants: true },
        });

        if (!user || !user.is_active || user.is_blocked) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        const restaurant_id = user.restaurants[0]?.id ?? null;

        return {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          company_name: user.company_name,
          address: user.address,
          cnic: user.cnic,
          shopLocation: user.address,
          restaurant_id,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as Record<string, any>;
        token.id = u.id;
        token.email = u.email ?? "";
        token.first_name = u.first_name ?? "";
        token.last_name = u.last_name ?? "";
        token.role = u.role ?? "";
        token.company_name = u.company_name ?? "";
        token.address = u.address ?? "";
        token.cnic = u.cnic ?? "";
        token.shopLocation = u.shopLocation ?? "";
        token.restaurant_id = u.restaurant_id ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          first_name: token.first_name as string,
          last_name: token.last_name as string,
          role: token.role as string,
          name: `${token.first_name ?? ""} ${token.last_name ?? ""}`,
          phoneNumber: (token.phoneNumber as string) ?? "",
          company_name: (token.company_name as string) ?? "",
          address: (token.address as string) ?? "",
          cnic: (token.cnic as string) ?? "",
          shopLocation: (token.shopLocation as string) ?? "",
          restaurant_id: (token.restaurant_id as string) ?? "",
        };
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
