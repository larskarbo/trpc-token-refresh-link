import { TRPCLink } from '@trpc/client'
import { observable } from '@trpc/server/observable'
import { AppRouter } from '~/server/appRouter'

export const logLink: TRPCLink<AppRouter> = () => {
	return ({ next, op }) => {
		console.log(op.path)
		// each link needs to return an observable which propagates results
		return observable((observer) => {
			const unsubscribe = next(op).subscribe({
				next(value) {
					observer.next(value)
				},
				error(error) {
					console.log(op.path + ' ❌')
					observer.error(error)
				},
				complete() {
					console.log(op.path + ' ✅')
					observer.complete()
				},
			})
			return unsubscribe
		})
	}
}
