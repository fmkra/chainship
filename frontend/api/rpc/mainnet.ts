import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(request: VercelRequest, response: VercelResponse) {
    const res = await fetch('https://eth-mainnet.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY, {
        method: 'POST',
        body: request.body,
        headers: {
            'Content-Type': 'application/json',
        },
    })
    let status = res.status

    let data
    try {
        data = await res.json()
    } catch (error: unknown) {
        status = 500
        if (error instanceof Error) {
            data = { error: error.message }
        } else {
            data = { error: 'Unknown error' }
        }
    }
    response.status(status).json(data)
}
