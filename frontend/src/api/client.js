import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const apiOrigin = new URL(
  apiClient.defaults.baseURL,
  window.location.origin
).origin;

let refreshPromise = null;

const clearAuthentication = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.assign("/login");
};

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token && !config.skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (Array.isArray(response.data?.results)) {
      response.data = response.data.results;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem("refreshToken");

    if (
      error.response?.status !== 401 ||
      originalRequest?.skipAuthRefresh ||
      originalRequest?._retry ||
      !refreshToken
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= apiClient
        .post(
          "user/token/refresh/",
          { refresh: refreshToken },
          { skipAuth: true, skipAuthRefresh: true }
        )
        .then(({ data }) => {
          localStorage.setItem("authToken", data.access);
          if (data.refresh) {
            localStorage.setItem("refreshToken", data.refresh);
          }
          return data.access;
        })
        .finally(() => {
          refreshPromise = null;
        });

      const accessToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearAuthentication();
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
