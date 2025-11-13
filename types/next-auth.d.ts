// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      restaurant_id: string;
      name: any;
      phoneNumber: string;
      companyName: string;
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

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  }
  declare module "*.json" {
  const value: any;
  export default value;
}

}
