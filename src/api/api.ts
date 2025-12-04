import axios from 'axios';
import * as config from '../config/config';
import qs from 'qs';
import { Alert } from 'react-native';
import { userState } from '../store/useUserStore';
import { endPoints } from './endpoints';
import { AppAlert } from '../utils/AppAlert';

const axiosClient = axios.create({
  baseURL: config.API_DOMAIN,
  paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' }),
});

axiosClient.defaults.headers.common['Content-Type'] = 'application/json';

// REQUEST INTERCEPTOR
axiosClient.interceptors.request.use(
  requestConfig => {
    const token = userState.getState().userData.access_token;
    const encryptedKey = userState.getState().encryptedKey;

    if (token && requestConfig.url !== endPoints.guestLogin) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    if (encryptedKey) {
      requestConfig.headers['X-Package-Token'] = encryptedKey;
    }

    // ✅ Log API request
    console.log(
      `🔵 [API REQUEST] ${requestConfig.method?.toUpperCase()} ${
        requestConfig.baseURL
      }${requestConfig.url}`,
      requestConfig,
    );

    return requestConfig;
  },
  error => {
    console.error('❌ [API REQUEST ERROR]', error);
    return Promise.reject(error);
  },
);

// RESPONSE INTERCEPTOR
axiosClient.interceptors.response.use(
  response => handleSuccess(response),
  async error => handleError(error),
);

const handleSuccess = (response: any) => {
  const { config, status } = response;

  console.log(
    `🟢 [API RESPONSE] ${config.method?.toUpperCase()} ${config.baseURL}${
      config.url
    } → ${status}`,
    response,
  );

  return response;
};

const handleError = (error: any) => {
  console.log(
    '❌ ERROR',
    error.response,
    error?.config?.url,
    error?.response?.status === 401,
  );

  console.log(
    'DTATATATAT---->',
    error,
    // error?.response?.status === 401,
    // !userState.getState()?.isTokenExpire,
    // error?.config?.url !== '/auth/signin/',
  );

  if (
    error?.response?.status === 401 &&
    !userState.getState()?.isTokenExpire &&
    error?.config?.url !== '/account/login/' &&
    error?.config?.url !== '/account/register/'
  ) {
    userState.getState().setUserTokenExpire(true);
    return Promise.reject({ ...error });
  } else if (error.response && !userState.getState()?.isTokenExpire) {
    if (
      (error?.config?.url === '/account/login/' &&
        error?.response?.status === 401) ||
      (error?.config?.url === '/personas/avatar-create/' &&
        error?.response?.status === 403 &&
        (error.response.message === 'Not enough tokens. Minimum 5 required.' ||
          'Free avatar limit reached. Subscribe to create more.' ||
          'Guest limit reached: only 1 free avatar allowed. Please sign up.'))
    ) {
      return Promise.reject({ ...error });
    }

    const serverMessage =
      error.response.data?.error ||
      error.response.data?.message ||
      'Something went wrong on our server. Please try again later.';

    console.log(
      '🔴 API ERROR:',
      userState.getState()?.isTokenExpire,
      error.response,
    );
    AppAlert('Oops!!!', serverMessage);

    const { config } = error.response;
    console.log(
      `🔴 [API ERROR RESPONSE] ${config.method?.toUpperCase()} ${
        config.baseURL
      }${config.url}`,
      error,
    );
  } else if (error.request) {
    console.log('🔴 [NO RESPONSE RECEIVED]', error);
  } else {
    console.log('🔴 [GENERAL ERROR]', error);
  }

  return Promise.reject(error);
};

// export const showErrorAlert = (
//   title: string = 'Error',
//   error: any,
//   fallbackMessage: string = 'Something went wrong. Please try again later.',
// ) => {
//   let message = fallbackMessage;

//   try {
//     // Handle different types of errors
//     if (typeof error === 'string') {
//       message = error;
//     } else if (error?.response?.data?.message) {
//       message = error.response.data.message;
//     } else if (error?.message) {
//       message = error.message;
//     } else if (typeof error?.response?.data === 'string') {
//       // Might be an HTML response
//       message = error.response.data;
//     }
//   } catch (e) {
//     console.error('Failed to parse error:', e);
//   }

//   console.log('❌ Error Alert:', {title, error, message});

//   Alert.alert(title, message);
// };
// export const getApiErrorStatusCode = (error: unknown): number | null => {
//   if (
//     typeof error === 'object' &&
//     error !== null &&
//     'response' in error &&
//     typeof (error as any).response === 'object'
//   ) {
//     const response = (error as any).response;
//     if ('status' in response && typeof response.status === 'number') {
//       return response.status;
//     }
//   }

//   return null;
// };

// export const apiRefreshToken = async () => {
//   try {
//     const refresh_token = userState.getState().access_token;
//     if (refresh_token) {
//       const response = await axiosClient.post(endpoints.REFRESH_TOKEN);
//       if (response.data.data.accessToken) {
//         if (
//           userState.getState().refresh_token !== null &&
//           userState.getState().user_id !== null
//         ) {
//           userState.getState().setUserData({
//             access_token: response.data.data.accessToken,
//             refresh_token: userState.getState().refresh_token,
//             user_id: userState.getState().user_id,
//           });
//         }
//       } else {
//         try {
//           userState.getState().resetToInitialState();
//           await UserGuestLogin(
//             userState.getState().setUserData,
//             userState.getState().setUserType,
//           ); // guest login
//           appNavigationRef.current?.reset({
//             routes: [{name: 'Login'}],
//           });
//         } catch (error) {}
//       }
//     }
//   } catch (error) {
//     const statusCode = getApiErrorStatusCode(error);
//     console.log('apiRefreshToken called', statusCode);
//     if (statusCode == 401) {
//       showErrorAlert('Session expired, please login again', error);
//       userState.getState().resetToInitialState();
//       await UserGuestLogin(
//         userState.getState().setUserData,
//         userState.getState().setUserType,
//       ); // guest login
//       appNavigationRef.current?.reset({routes: [{name: 'Login'}]});
//     }
//   }
// };

export default axiosClient;
