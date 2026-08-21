import loginHandler from './_lib/auth-login.js';
import meHandler from './_lib/auth-me.js';
import logoutHandler from './_lib/auth-logout.js';
import changePasswordHandler from './_lib/auth-change-password.js';

export default async function handler(req, res) {
  const rawUrl = req.url || '';
  const url = new URL(rawUrl, `http://${req.headers.host || 'localhost'}`);
  const route = url.searchParams.get('route') || req.query?.route;

  if (route === 'login' || rawUrl.includes('/api/auth-login')) {
    return loginHandler(req, res);
  }
  if (route === 'me' || rawUrl.includes('/api/auth-me')) {
    return meHandler(req, res);
  }
  if (route === 'logout' || rawUrl.includes('/api/auth-logout')) {
    return logoutHandler(req, res);
  }
  if (route === 'change-password' || rawUrl.includes('/api/auth-change-password')) {
    return changePasswordHandler(req, res);
  }

  return res.status(404).json({ error: 'Auth route not found' });
}
