async function request(path, options = {}) {
  const res = await fetch(`/api${path.startsWith('/') ? path : '/' + path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export const get = (path) => request(path);
export const post = (path, body = {}) => request(path, { method: 'POST', body: JSON.stringify(body) });