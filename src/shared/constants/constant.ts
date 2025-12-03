export const modules = ['hr', 'sales'];

export const OAUTH_API_URL = process.env.OAUTH_API_URL;
export const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
export const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;

export const GRANT_TYPES = {
  AUTHORIZATION_CODE: 'authorization_code',
  REFRESH_TOKEN: 'refresh_token',
  CLIENT_CREDENTIALS: 'client_credentials',
};
