import * as trpc from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'

export const createContext = (opts?: trpcNext.CreateNextContextOptions) => {
	const req = opts?.req
	const res = opts?.res

	const header = req?.headers['x-access-token']
	console.log('header: ', header)

	const isAuthenticated = false

	return {
		req,
		res,
		isAuthenticated,
	}
}

export type Context = trpc.inferAsyncReturnType<typeof createContext>
