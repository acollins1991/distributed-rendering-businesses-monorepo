import validateBearerToken from "./validateBearerToken";

export default async (event: any): Promise<
  NonNullable<Awaited<ReturnType<typeof validateBearerToken>>
  >['user']> => {
  const token = event.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid token'
    })
  }

  const { valid, user } = await validateBearerToken(token)

  if (!valid || !user) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid token'
    })
  }

  return user
}