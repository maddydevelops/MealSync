import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "superadmin" | "owner" | "staff" | "customer";
      first_name: string;
      last_name: string;
      email: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "superadmin" | "owner" | "staff" | "customer";
    first_name: string;
    last_name: string;
  }
}
