import type { TRPCLink } from '@trpc/client'
import type { AnyRouter } from '@trpc/server'
import PQueue from 'p-queue'

const queue = new PQueue({ concurrency: 1 })

export type TokenRefreshProperties = {
	tokenRefreshNeeded: () => boolean
	fetchAccessToken: () => Promise<void>
}

export const tokenRefresh = <AppRouter extends AnyRouter>({
	tokenRefreshNeeded,
	fetchAccessToken,
}: TokenRefreshProperties): TRPCLink<AppRouter> =>
() => {
	return ({ prev, next, op }) => {
		void queue.add(async () => {
			const shouldRenew = tokenRefreshNeeded()

			if (shouldRenew) {
				// ok we need to refresh the token
				await fetchAccessToken()
			}

			next(op, (result) => {
				prev(result)
			})
		})
	}
}
