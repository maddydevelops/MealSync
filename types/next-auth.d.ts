// types/next-auth.d.ts
import NextAuth from "next-auth";
import { Server } from "socket.io";
import { NextApiResponse } from "next";

// Socket.IO type for Next.js API routes
export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: {
      io?: Server;
    };
  };
};

// Extend NextAuth session and user types
declare module "next-auth" {
  interface Session {
    user: {
      restaurant_id: string;
      name: string;
      phoneNumber: string;
      company_name: string;
      address: string;
      cnic: string;
      shopLocation: string;
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      role: string;
    };
  }

  interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  }
}

// Extend NextAuth JWT types
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  }
}

// Allow importing JSON files
declare module "*.json" {
  const value: any;
  export default value;
}
