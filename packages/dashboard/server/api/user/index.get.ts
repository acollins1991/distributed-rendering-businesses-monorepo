export default defineEventHandler(async (event) => {
    const user = validateTokenAndGetUser(event)
    return user
})

