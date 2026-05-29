/**
 * 知客 KnowClient — NextAuth 认证配置
 *
 * 邮箱 + 密码登录（Credentials Provider）
 * 注册通过 /api/auth/register 单独处理
 *
 * 注意：DB 导入放在 authorize 内部动态加载，避免 Edge Runtime（middleware）报错
 */
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "邮箱密码",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // 动态导入 DB：只在 Node.js Runtime 执行
        const [{ getDb, schema }, { verifyPassword }] = await Promise.all([
          import("@/lib/db"),
          import("@/lib/auth/password"),
        ]);
        const db = getDb();

        const user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, credentials.email as string),
        });

        if (!user || !user.password) return null;

        const valid = await verifyPassword(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      // update() 触发时同步最新 name
      if (trigger === "update" && user?.name) {
        token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
});
