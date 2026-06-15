import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api',
  // NOTE: Do NOT set Content-Type here. Setting it at the instance level
  // overrides axios's automatic multipart/form-data+boundary detection for
  // FormData requests, which causes multer to report "No file uploaded".
  withCredentials: true,
  timeout: 10000,
});

//mm

api.interceptors.request.use((config) => {
  // Auth token
  const token = Cookies.get('ll_access_token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Content-Type handling:
  // - FormData → delete header so axios auto-sets multipart/form-data + boundary
  // - Everything else → set application/json
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});


api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        Cookies.set('ll_access_token', data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        Cookies.remove('ll_access_token');
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
