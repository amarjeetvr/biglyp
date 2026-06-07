import { SignJWT, jwtVerify } from 'jose';

const getJwtSecret = (secret: string): Uint8Array => {
  return new TextEncoder().encode(secret);
};

export const signToken = async (
  sub: string,
  secret: string
): Promise<string> => {
  const token = await new SignJWT({ sub })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(getJwtSecret(secret));
  return token;
};

export const verifyToken = async (
  token: string,
  secret: string
): Promise<{ sub: string }> => {
  const { payload } = await jwtVerify(token, getJwtSecret(secret));
  return { sub: payload.sub as string };
};
