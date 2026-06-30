import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      state: string;
      city: string;
    } & DefaultSession["user"];
  }
}
