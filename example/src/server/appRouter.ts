import { addSeconds } from 'date-fns'
import { protectedProcedure, publicProcedure, router } from '~/server/trpc'

export const appRouter = router({
	publicTest: publicProcedure
		.mutation(() => {
			return {
				message: `hello world ${Math.random()}`,
			}
		}),
	login: publicProcedure
		.mutation(() => {
			const accessToken = addSeconds(new Date(), 10).toISOString()
			const refreshToken = addSeconds(new Date(), 30).toISOString()
			return {
				accessToken,
				refreshToken,
			}
		}),
	privateTest: protectedProcedure
		.mutation(() => {
			return {
				message: `hello protected world ${Math.random()}`,
			}
		}),
	// 💡 Tip: Try adding a new procedure here and see if you can use it in the client!
	// getUser: t.procedure.query(() => {
	//   return { id: '1', name: 'bob' };
	// }),
})

export type AppRouter = typeof appRouter
