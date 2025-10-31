import NextAuth, { NextAuthOptions, Session, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      role: "superadmin" | "owner" | "staff" | "customer";
    };
  }

  interface User {
    id: string;
    first_name: string;
    last_name: string;
    role: "superadmin" | "owner" | "staff" | "customer";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    first_name: string;
    last_name: string;
    role: "superadmin" | "owner" | "staff" | "customer";
  }
}

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
        });

        if (!user || !user.is_active || user.is_blocked) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        let role: "superadmin" | "owner" | "staff" | "customer";
        switch (user.role) {
          case "superadmin":
            role = "superadmin";
            break;
          case "admin":
            role = "owner";
            break;
          default:
            role = "customer";
        }

        return {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: any }) {
      if (token) {
        session.user = {
          id: token.id,
          email: session.user?.email || "",
          first_name: token.first_name,
          last_name: token.last_name,
          role: token.role,
        };
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
