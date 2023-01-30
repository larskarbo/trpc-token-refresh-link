import type { Operation, TRPCLink } from '@trpc/client'
import type { AnyRouter } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import PQueue from 'p-queue'

const queue = new PQueue({ concurrency: 1 })

export type TokenRefreshProperties = {
	tokenRefreshNeeded: (op: Operation) => boolean
	fetchAccessToken: (op: Operation) => Promise<void>
}

export const tokenRefreshLink = <AppRouter extends AnyRouter>({
	tokenRefreshNeeded,
	fetchAccessToken,
}: TokenRefreshProperties): TRPCLink<AppRouter> =>
() => {
	return ({ next, op }) => {
		// each link needs to return an observable which propagates results
		return observable((observer) => {
			void queue.add(async () => {
				const shouldRenew = tokenRefreshNeeded(op)
				if (shouldRenew) {
					// ok we need to refresh the token
					await fetchAccessToken(op)
				}

				next(op).subscribe({
					next(value) {
						observer.next(value)
					},
					error(error) {
						observer.error(error)
					},
					complete() {
						observer.complete()
					},
				})
			})
		})
	}
}
