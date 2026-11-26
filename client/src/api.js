
const API_URL = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const normalizedPath = path.startsWith('/')
    ? path
    : `/${path}`;

  const res = await fetch(
    `${API_URL}/api${normalizedPath}`,
    {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const get = (path) => request(path);

export const post = (path, body = {}) =>
  request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
