import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const isOwnerRoute = nextUrl.pathname.startsWith("/owner");
      const isCustomerRoute = nextUrl.pathname.startsWith("/customer");

      if (isOwnerRoute) {
        if (!isLoggedIn) return false;
        if (role !== "OWNER") {
          return Response.redirect(new URL("/login", nextUrl));
        }
      }

      if (isCustomerRoute) {
        if (!isLoggedIn) return false;
        if (role !== "CUSTOMER") {
          return Response.redirect(new URL("/login", nextUrl));
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id as string;
        if (token.role) session.user.role = token.role as "OWNER" | "CUSTOMER";
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
