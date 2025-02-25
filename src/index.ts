import { type Operation, TRPCClientError, type TRPCLink } from "@trpc/client";
import type { AnyRouter } from "@trpc/server";
import { observable } from "@trpc/server/observable";

export type TokenRefreshProperties = {
	tokenRefreshNeeded: (op: Operation) => boolean;
	fetchAccessToken: (op: Operation) => Promise<void>;
};
export const tokenRefreshLink =
	<AppRouter extends AnyRouter>({
		tokenRefreshNeeded,
		fetchAccessToken,
	}: TokenRefreshProperties): TRPCLink<AppRouter> =>
	() => {
		let refreshPromise: Promise<void> | undefined;
		return (options) => {
			const { next, op } = options;

			return observable((observer) => {
				if (!tokenRefreshNeeded(op)) {
					return next(op).subscribe(observer);
				}

				refreshPromise ??= fetchAccessToken(op);

				refreshPromise
					.then(() => {
						next(op).subscribe(observer);
					})
					.catch((error) => {
						observer.error(TRPCClientError.from(error));
					})
					.finally(() => {
						refreshPromise = undefined;
					});
			});
		};
	};
