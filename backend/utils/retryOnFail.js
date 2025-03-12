import { sleep } from "./sleep.js"
import { MAX_NUMBER_OF_RETRIES } from "../config/constant.js"

export const retryOnFail = async ({promise, attemptCount, methodName}) => {
    try {
        // if attempt count is not mentioned, we take MAX
        if (!attemptCount) attemptCount = MAX_NUMBER_OF_RETRIES
        // call the promise
        const res = await promise
        // return success result
        return res
    } catch (err) {
        const attemptsLeft = attemptCount - 1
        if (!attemptsLeft)
            throw err
        // awaiting for some time
        await sleep({ reason: `${methodName} Call failed, ${attemptsLeft} attempts left`, ms: 500 })
        // recursion
        return await retryOnFail({promise, attemptCount: attemptsLeft, methodName})
    }
}