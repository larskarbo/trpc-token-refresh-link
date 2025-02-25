import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { isFuture } from "date-fns";
import { getAccessTokenExpiration } from "~/utils/tokenRefresh";

export const createContext = (opts?: trpcNext.CreateNextContextOptions) => {
	const req = opts?.req;
	const res = opts?.res;

	const accessToken = req?.headers["x-access-token"];
	const isValid =
		typeof accessToken === "string" &&
		typeof Date.parse(accessToken) === "number";
	const expiration = isValid
		? getAccessTokenExpiration(accessToken)
		: undefined;

	const isAuthenticated =
		(expiration && isFuture(new Date(expiration))) || false;

	return {
		req,
		res,
		isAuthenticated,
	};
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
