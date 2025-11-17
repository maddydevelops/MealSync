import { NextAuthOptions } from "next-auth";
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

        return {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
           restaurant_id: user.restaurants[0]?.id ?? null,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? "";
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.role = user.role;
        token.name = user.name ?? "";
        token.phoneNumber = (user as any).phoneNumber ?? "";
        token.company_name = (user as any).company_name ?? "";
        token.address = (user as any).address ?? "";
        token.cnic = (user as any).cnic ?? "";
        token.shopLocation = (user as any).shopLocation ?? "";
        token.restaurant_id = (user as any).restaurant_id ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.first_name = token.first_name as string;
        session.user.last_name = token.last_name as string;
        session.user.role = token.role as string;
        session.user.name = (token.name ?? "") as string;
        session.user.phoneNumber = (token.phoneNumber ?? "") as string;
        session.user.company_name = (token.company_name ?? "") as string;
        session.user.address = (token.address ?? "") as string;
        session.user.cnic = (token.cnic ?? "") as string;
        session.user.shopLocation = (token.shopLocation ?? "") as string;
        session.user.restaurant_id = token.restaurant_id as string; 
      }
      return session;
    },
  },
};
