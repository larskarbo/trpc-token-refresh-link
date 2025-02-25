import { Operation, TRPCClientError, TRPCClientRuntime } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { expect, test, vi } from "vitest";
import { TokenRefreshProperties, tokenRefreshLink } from "./index";

test("should refresh token when needed", async () => {
	const mockTokenRefreshNeeded = vi.fn().mockReturnValue(true);
	const mockFetchAccessToken = vi.fn().mockResolvedValue(async () => {
		await new Promise((resolve) => setTimeout(resolve, 1));
		return "supersecret";
	});

	const properties: TokenRefreshProperties = {
		tokenRefreshNeeded: mockTokenRefreshNeeded,
		fetchAccessToken: mockFetchAccessToken,
	};

	const link = tokenRefreshLink(properties)({} as TRPCClientRuntime);

	const mockNext = vi.fn().mockReturnValue(
		observable((observer) => {
			observer.next({ result: "success" });
			observer.complete();
		}),
	);

	const mockOperation: Operation = {
		id: 1,
		type: "query",
		path: "test",
		input: {},
		context: {},
	};

	const obs = link({ op: mockOperation, next: mockNext });

	await Promise.all([
		new Promise<void>((resolve) => {
			obs.subscribe({
				next: (value) => {
					expect(value).toEqual({ result: "success" });
				},
				complete: () => {
					resolve();
				},
			});
		}),
	]);

	expect(mockTokenRefreshNeeded).toHaveBeenCalledWith(mockOperation);
	expect(mockFetchAccessToken).toHaveBeenCalledWith(mockOperation);
	expect(mockNext).toHaveBeenCalledWith(mockOperation);

	expect(mockFetchAccessToken).toHaveBeenCalledTimes(1);
});

test("tokenRefreshLink should not refresh token if not needed", async () => {
	const mockTokenRefreshNeeded = vi.fn().mockReturnValue(false);
	const mockFetchAccessToken = vi.fn();

	const properties: TokenRefreshProperties = {
		tokenRefreshNeeded: mockTokenRefreshNeeded,
		fetchAccessToken: mockFetchAccessToken,
	};

	const link = tokenRefreshLink(properties)({} as TRPCClientRuntime);

	const mockNext = vi.fn().mockReturnValue(
		observable((observer) => {
			observer.next({ result: "success" });
			observer.complete();
		}),
	);

	const mockOperation: Operation = {
		id: 1,
		type: "query",
		path: "test",
		input: {},
		context: {},
	};

	const obs = link({ op: mockOperation, next: mockNext });

	await new Promise<void>((resolve) => {
		obs.subscribe({
			next: (value) => {
				expect(value).toEqual({ result: "success" });
			},
			complete: () => {
				resolve();
			},
		});
	});

	expect(mockTokenRefreshNeeded).toHaveBeenCalledWith(mockOperation);
	expect(mockFetchAccessToken).not.toHaveBeenCalled();
	expect(mockNext).toHaveBeenCalledWith(mockOperation);
});

test("tokenRefreshLink should handle token refresh error", async () => {
	const mockTokenRefreshNeeded = vi.fn().mockReturnValue(true);
	const mockFetchAccessToken = vi
		.fn()
		.mockRejectedValue(new Error("Token refresh failed"));

	const properties: TokenRefreshProperties = {
		tokenRefreshNeeded: mockTokenRefreshNeeded,
		fetchAccessToken: mockFetchAccessToken,
	};

	const link = tokenRefreshLink(properties)({} as TRPCClientRuntime);

	const mockNext = vi.fn();

	const mockOperation: Operation = {
		id: 1,
		type: "query",
		path: "test",
		input: {},
		context: {},
	};

	const obs = link({ op: mockOperation, next: mockNext });

	await new Promise<void>((resolve) => {
		obs.subscribe({
			error: (error) => {
				expect(error).toBeInstanceOf(TRPCClientError);
				expect(error.message).toBe("Token refresh failed");
				resolve();
			},
		});
	});

	expect(mockTokenRefreshNeeded).toHaveBeenCalledWith(mockOperation);
	expect(mockFetchAccessToken).toHaveBeenCalledWith(mockOperation);
	expect(mockNext).not.toHaveBeenCalled();
});

test("tokenRefreshLink should only refresh token once for multiple concurrent operations", async () => {
	const mockTokenRefreshNeeded = vi.fn().mockReturnValue(true);
	const mockFetchAccessToken = vi.fn().mockResolvedValue(async () => {
		await new Promise((resolve) => setTimeout(resolve, 1));
	});

	const properties: TokenRefreshProperties = {
		tokenRefreshNeeded: mockTokenRefreshNeeded,
		fetchAccessToken: mockFetchAccessToken,
	};

	const link = tokenRefreshLink(properties)({} as TRPCClientRuntime);

	const mockNext = vi.fn().mockReturnValue(
		observable((observer) => {
			observer.next({ result: "success" });
			observer.complete();
		}),
	);

	const mockOperation1: Operation = {
		id: 1,
		type: "query",
		path: "test1",
		input: {},
		context: {},
	};

	const mockOperation2: Operation = {
		id: 2,
		type: "query",
		path: "test2",
		input: {},
		context: {},
	};

	const obs1 = link({ op: mockOperation1, next: mockNext });
	const obs2 = link({ op: mockOperation2, next: mockNext });

	await Promise.all([
		new Promise<void>((resolve) => {
			obs1.subscribe({
				next: (value) => {
					expect(value).toEqual({ result: "success" });
				},
				complete: () => {
					resolve();
				},
			});
		}),
		new Promise<void>((resolve) => {
			obs2.subscribe({
				next: (value) => {
					expect(value).toEqual({ result: "success" });
				},
				complete: () => {
					resolve();
				},
			});
		}),
	]);

	expect(mockTokenRefreshNeeded).toHaveBeenCalledTimes(2);
	expect(mockFetchAccessToken).toHaveBeenCalledTimes(1);
	expect(mockNext).toHaveBeenCalledTimes(2);
});
