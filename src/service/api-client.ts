
import userService from '@/service/user-service';
import { accessTokenStorage, refreshTokenStorage, userStorage } from '@/store/main-store';
import axiosBase, { AxiosError, type AxiosRequestConfig, type AxiosInstance } from 'axios';
import { urlTemplateInterceptor } from 'axios-url-template';
import dayjs from 'dayjs';

const axios: AxiosInstance = axiosBase.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT
});

axios.interceptors.request.use(urlTemplateInterceptor() as any);
axios.interceptors.request.use((config) => {
  config.headers = config.headers || {};

  if (config._noAuth !== true) {
    if (!config.headers.Authorization) {
      const accessToken = accessTokenStorage.value;

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
  }

  const user = userStorage.value;

  if (user && user.lastReset) {
    config.headers['X-Password-Last-Reset'] = dayjs(user.lastReset).unix();
  }

  return config;
});

axios.interceptors.response.use(
  (res) => {
    return res;
  },
  async function (e) {
    const errCode = e.response?.data?.code || 0;

    if (errCode === 40101) {
      const originalRequest = e.config;

      if (!originalRequest._retry) {
        // Refresh Token
        return await refreshAndRetry(originalRequest);
      }
    }

    // Password may be changed,
    if (errCode === 40105) {
      const originalRequest = e.config;

      if (!originalRequest._newPass) {
        return await askNewPasswordAndRetry(originalRequest);
      }
    }

    // User not found or force logout.
    if (errCode === 40106 || errCode === 40102) {
      return userService.logoutAndRedirect();
    }

    const json = e.response?.data;

    if (json?.message) {
      e.message = json.message;
    }

    return Promise.reject(e);
  }
);

export default axios;

export async function refreshAccessToken() {
  const refreshToken = refreshTokenStorage.value;

  if (!refreshToken) {
    throw new Error('Access Token expired but has no Refresh Token')
  }

  const res = await axios.get(
    'auth/refreshToken',
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`
      },
      _retry: true,
    }
  );

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data.data;

  accessTokenStorage.value = newAccessToken;
  refreshTokenStorage.value = newRefreshToken;

  return newAccessToken;
}

async function refreshAndRetry(originalRequest: AxiosRequestConfig) {
  originalRequest._retry = true;

  try {
    const token = await refreshAccessToken();
    originalRequest.headers = originalRequest.headers || {};
    originalRequest.headers.Authorization = 'Bearer ' + token;
    return axios(originalRequest);
  } catch (e: any) {
    if (e instanceof AxiosError && e.response?.data?.code === 40102) {
      userService.logoutAndRedirect();
      return;
    }

    throw e;
  }
}

async function askNewPasswordAndRetry(originalRequest: AxiosRequestConfig) {
  originalRequest._newPass = true;

  try {
    originalRequest.headers = originalRequest.headers || {};
    await userService.askNewPasswordOrLogout();
    return axios(originalRequest);
  } catch (e: any) {
    if (e instanceof AxiosError) {
      userService.logoutAndRedirect();
      return;
    }

    throw e;
  }
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    _noAuth?: boolean;
    _retry?: boolean;
    _newPass?: boolean;
  }
}
