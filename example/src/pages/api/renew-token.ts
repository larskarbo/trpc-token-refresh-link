import { NextApiRequest, NextApiResponse } from 'next'
import { createAccessToken } from '~/server/appRouter'

async function renewToken(req: NextApiRequest, res: NextApiResponse) {
	await new Promise((resolve) => setTimeout(resolve, 2000))

	return res.status(200).json({
		accessToken: createAccessToken(),
	})
}

export default renewToken
