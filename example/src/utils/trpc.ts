import { httpBatchLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import type { AppRouter } from '~/server/appRouter'
import { logLink } from './logLink'
import { tokenRefreshLink } from './tokenRefresh'

function getBaseUrl() {
	if (typeof window !== 'undefined') {
		// In the browser, we return a relative URL
		return ''
	}
	// When rendering on the server, we return an absolute URL

	// reference for vercel.com
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`
	}

	// assume localhost
	return `http://localhost:${process.env.PORT ?? 3000}`
}

export const trpc = createTRPCNext<AppRouter>({
	config() {
		return {
			links: [
				logLink,
				tokenRefreshLink,
				httpBatchLink({
					url: getBaseUrl() + '/api/trpc',
					headers: () => ({
						'x-access-token': typeof window != 'undefined' && localStorage.getItem('accessToken') || undefined,
					}),
				}),
			],
		}
	},
	ssr: true,
})
