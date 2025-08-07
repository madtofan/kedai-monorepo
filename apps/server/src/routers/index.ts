import {
  protectedProcedure, publicProcedure,
  router,
} from "../lib/trpc";
import menuRouter from "./menu";
import menuGroupRouter from "./menuGroup";
import orderRouter from "./order";
import organizationRouter from "./organization";
import roleRouter from "./role";
import storeRouter from "./store";
import userRouter from "./user";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  menu: menuRouter,
  menuGroup: menuGroupRouter,
  order: orderRouter,
  organization: organizationRouter,
  role: roleRouter,
  store: storeRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
