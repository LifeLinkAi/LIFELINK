import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleIdToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Verification failed. Empty payload returned.');
  }
  return {
    email: payload.email?.toLowerCase().trim() || '',
    name: payload.name || '',
    avatar: payload.picture || '',
  };
}
