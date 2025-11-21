import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const loginRes = await fetch(`${apiUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          // Do NOT call loginRes.json() here
          if (!loginRes.ok) {
            throw new Error("Invalid credentials");
          }

          //  Parse once only
          const data = await loginRes.json();
          const user = data.user;
          const token = data.token;

          if (!user || !token) {
            throw new Error("Login response missing token or user data");
          }

          if (
            user.roles.includes("superAdmin") ||
            user.roles.includes("subAdmin")
          ) {
            return {
              id: user.user_id.toString(),
              email: user.email,
              roles: user.roles,
              isActive: user.is_active,
              accessToken: token, // JWT
            };
          } else {
            throw new Error(
              "Access denied: Only SuperAdmin or SubAdmin allowed"
            );
          }
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // when user logs in, store token info
     
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.isActive = user.isActive;
        token.email = user.email;
        token.accessToken = user.accessToken; //  persist backend JWT
      }
      
      return token;
    },

    async session({ session, token }) {
      // expose token to frontend session
     
      session.user = {
        id: token.id,
        email: token.email,
        roles: token.roles,
        isActive: token.isActive,
      };
      session.accessToken = token.accessToken;
      
      return session;
    },
  },

  pages: {
    signIn: "/signin",
    error: "/signin",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
