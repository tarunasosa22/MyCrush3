import axiosClient from '.';
import { endpoints } from './endpoints';

export type GuestUserBody = {
  device_id: string;
  device_type: string;
  fcm_token: string;
};

export type VoiceCallBody = {
  avatar_id: number;
};

export type puchaseInBody = {
  product_id: string;
  transaction_id: string;
  receipt: string;
  transaction_date: string;
  app_platform: string;
  credit: string;
  subscription_payload: {};
};

export type puchaseIAPBody = {
  product_id: string;
  onetime_payload: {};
};

export type puchase = {};

export const guestUserLogin = async (data: FormData) => {
  return axiosClient.post(endpoints.GUEST_LOGIN, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const socialSignUpAPI = async (
  data: FormData,
  isGoogle?: boolean,
  isApple?: boolean,
) => {
  return axiosClient.post(
    isApple
      ? endpoints.APPLE_SIGNIN_URL
      : isGoogle
      ? endpoints.GOOGLE_SIGNIN_URL
      : endpoints.FACEBOOK_SIGNIN_URL,
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
};

export const deleteAccount = async () => {
  return axiosClient.delete(endpoints.DELETE_ACCOUNT);
};

export const UpdateUserProfile = async (formData: FormData) => {
  return axiosClient.patch(endpoints.UPDATE_PROFILE, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const UpdatePassword = async (formData: FormData) => {
  return axiosClient.patch(endpoints.UPDATE_PASSWORD, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const genderCategories = async (gender?: string) => {
  return axiosClient.get(
    endpoints.GENDER_CATEGORIES + (gender ? `?code=${gender}` : ''),
  );
};

export const avatarcreate = async (payload: any) => {
  return await axiosClient.post(endpoints.AVATAR_CREATE, payload);
};

export const updateAvatarCreate = async (data: any) => {
  return axiosClient.put(endpoints.AVATAR_UPDATE(data.avatarId), {
    sub_categories: data.sub_categories, //  MUST be inside an object
  });
};

export const userListGlobalAvatar = async (page: number) => {
  return axiosClient.get(endpoints.USER_LIST_GLOBAL_AVATAR(page));
};

export const UserAvatarDetail = async (id: number) => {
  return axiosClient.get(endpoints.AVATAR_DETAIL + id + '/');
};

export const myAvatarList = async (page: number) => {
  return axiosClient.get(endpoints.LIKE_USERLIST(page));
};

export const ChateScreen = async (formData: FormData) => {
  return axiosClient.post(endpoints.CREATE_CHAT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const likeDislikeAPI = async (id: number) => {
  return axiosClient.post(endpoints.LIKE_DISLIKE_AVATAR_URL(id));
};

export const startVoiceCall = async (payload: any, token: string | null) => {
  try {
    return await axiosClient.post(endpoints.START_CALL, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error in startVoiceCall:', error);
    throw error;
  }
};

export async function getTurnIce(accessToken: string | null) {
  const res = await fetch('https://api.my-girl.online/voice/webrtc/turn-ice/', {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`turn-ice failed: ${res.status}`);

  // Parse JSON body
  const data = await res.json();

  return data;
}

export const stopVoiceCall = async (bridgeId: string, token: string | null) => {
  try {
    return await axiosClient.post(
      endpoints.STOP_CALL(bridgeId),
      null, // no body
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
  } catch (error) {
    console.error('Error in stopVoiceCall:', error);
    throw error;
  }
};

export const ChatList = async (page: number) => {
  try {
    const response = await axiosClient.get(endpoints.CHAT_LIST(page));

    return response.data;
  } catch (error) {
    console.error('❌ ChatList API Error:', error);
    throw error;
  }
};

export const ChatMessages = async (chatId: string, page: number) => {
  try {
    const response = await axiosClient.get(
      endpoints.CHAT_MESSAGES(chatId, page),
    );

    return response.data;
  } catch (error) {
    console.error('❌ ChatMessages API error:', error);
    throw error;
  }
};

export const RefreshToken = async (data: FormData) => {
  return axiosClient.post(endpoints.REFRESH_TOKEN, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const AccountRegister = async (formData: FormData) => {
  return axiosClient.post(endpoints.ACCOUNT_REGISTER, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const UserLogin = async (formData: FormData) => {
  return axiosClient.post(endpoints.USER_LOGIN, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const ResetPassword = async (formData: FormData) => {
  return axiosClient.post(endpoints.RESET_PASSWORD, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const LogOut = async (formData: FormData) => {
  return axiosClient.post(endpoints.LOG_OUT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const SetVoiceCall = async (body: VoiceCallBody) => {
  return axiosClient.post(endpoints.VOICE_CALL_URL, body);
};

export const setPurchase = (body: puchaseInBody) => {
  return axiosClient.post(endpoints.POST_PURCHASE_URL, body);
};

export const setIAPPurchase = (body: puchaseIAPBody) => {
  return axiosClient.post(endpoints.POST_IAP_PURCHASE_URL, body);
};

export const getUserDetail = () => {
  return axiosClient.get(endpoints.GET_USER_DETAIL);
};

export const getAdminSetting = () => {
  return axiosClient.get(endpoints.GET_ADMIN_SETTING);
};

export const getFavouriteAvatar = () => {
  return axiosClient.get(endpoints.GET_FAV_AVATAR_URL);
};

export const reportIssue = (body: { id?: string; issue: string }) => {
  return axiosClient.post(endpoints.REPORT_ISSUE_URL, body);
};

export const setPlanVisit = () => {
  return axiosClient.post(endpoints.SET_PLAN_VISIT);
};

export const setEventTrackinig = (body: { event_type: string }) => {
  return axiosClient.post(endpoints.SET_EVENT_TRACK, body);
};

export const generateAvatarPhoto = (
  avatarId: string | number,
  photoId: string | number,
) => {
  return axiosClient.post(
    endpoints.PHOTO_GENEATE(avatarId.toString(), photoId.toString()),
  );
};

export const generateAvatarPhotoFree = (
  avatarId: string | number,
  photoId: string | number,
) => {
  return axiosClient.post(
    endpoints.PHOTO_GENEATE_FREE(avatarId.toString(), photoId.toString()),
  );
};

export const getTokensInfo = () => {
  return axiosClient.get(endpoints.GET_TOKEN_INFO);
};

export const setCancelMessage = (body: { cancel_reason: string }) => {
  return axiosClient.post(endpoints.SET_CANCEL_MESSAGE, body);
};

export const generateBlurImage = (messageId: string) => {
  return axiosClient.post(endpoints.GENERATE_MESSAGE_IMAGE(messageId));
};

export const generateBlurImageFree = (messageId: string) => {
  return axiosClient.post(endpoints.GENERATE_MESSAGE_IMAGE_FREE(messageId));
};
