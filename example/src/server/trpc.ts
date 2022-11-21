/**
 * This is your entry point to setup the root configuration for tRPC on the server.
 * - `initTRPC` should only be used once per app.
 * - We export only the functionality that we use so we can enforce which base procedures should be used
 *
 * Learn how to create protected base procedures and other things below:
 * @see https://trpc.io/docs/v10/router
 * @see https://trpc.io/docs/v10/procedures
 */
import { initTRPC, TRPCError } from '@trpc/server'
import { Context } from './context'

const t = initTRPC.context<Context>().create()

const baseProcedure = t.procedure.use(t.middleware(async ({ ctx, next }) => {
	// add delay to simulate a slow request
	await new Promise(resolve => setTimeout(resolve, 500))

	return next()
}))

/**
 * Unprotected procedure
 */
export const publicProcedure = baseProcedure

export const protectedProcedure = baseProcedure.use(t.middleware(async ({ ctx, next }) => {
	if (!ctx.isAuthenticated) {
		throw new TRPCError({ code: 'UNAUTHORIZED' })
	}
	return next()
}))

export const router = t.router
export const middleware = t.middleware
