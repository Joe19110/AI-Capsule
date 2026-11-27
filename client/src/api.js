// Thin fetch wrapper. All requests include credentials so the HttpOnly `token`
// cookie is sent with every protected API call.
async function request(method, url, body) {
  const opts = {
    method,
    credentials: 'include',
    headers: {},
  };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  const resp = await fetch(url, opts);
  if (resp.status === 204) return null;

  let data = null;
  try {
    data = await resp.json();
  } catch {
    data = null;
  }

  if (!resp.ok) {
    const err = new Error(data?.error || `Request failed (${resp.status})`);
    err.status = resp.status;
    throw err;
  }
  return data;
}

export const api = {
  me: () => request('GET', '/api/me'),
  logout: () => request('POST', '/api/auth/logout'),
  list: () => request('GET', '/api/capsules'),
  create: (data) => request('POST', '/api/capsules', data),
  update: (id, data) => request('PUT', `/api/capsules/${id}`, data),
  remove: (id) => request('DELETE', `/api/capsules/${id}`),
};
