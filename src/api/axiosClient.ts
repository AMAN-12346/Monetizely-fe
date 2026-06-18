import axios from 'axios';

/**
 * Axios instance — all API calls in this app go through this client.
 *
 * Base URL is set from NEXT_PUBLIC_API_URL in .env.local.
 * Response interceptor unwraps the `data` field from our standard
 * { success, data } API envelope so callers get the payload directly.
 */
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10s timeout
});

// ---- Response interceptor -----------------------------------
// Unwrap the { success, data } envelope automatically.
// On error, forward the server's error message if available.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      'An unexpected error occurred';

    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
