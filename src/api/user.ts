import axiosClient from './api';
import { endPoints } from './endpoints';

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
  return axiosClient.post(endPoints.guestLogin, data, {
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
      ? endPoints.appleSignIn
      : isGoogle
      ? endPoints.googleSignIn
      : endPoints.facebookSignIn,
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
};

export const deleteAccount = async () => {
  return axiosClient.delete(endPoints.deleteAccount);
};

export const UpdateUserProfile = async (formData: FormData) => {
  return axiosClient.patch(endPoints.updateProfile, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const UpdatePassword = async (formData: FormData) => {
  return axiosClient.patch(endPoints.updatePassword, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const genderCategories = async (gender?: string) => {
  return axiosClient.get(
    endPoints.personaCategories + (gender ? `?code=${gender}` : ''),
  );
};

export const avatarcreate = async (payload: any) => {
  return await axiosClient.post(endPoints.createAvatar, payload);
};

export const updateAvatarCreate = async (data: any) => {
  return axiosClient.put(endPoints.updateAvatar(data.avatarId), {
    sub_categories: data.sub_categories, //  MUST be inside an object
  });
};

export const userListGlobalAvatar = async (page: number) => {
  return axiosClient.get(endPoints.listGlobalAvatars(page));
};

export const UserAvatarDetail = async (id: number) => {
  return axiosClient.get(endPoints.avatarDetail + id + '/');
};

export const myAvatarList = async (page: number) => {
  return axiosClient.get(endPoints.listLikedAvatars(page));
};

export const ChateScreen = async (formData: FormData) => {
  return axiosClient.post(endPoints.createChat, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const likeDislikeAPI = async (id: number) => {
  return axiosClient.post(endPoints.toggleAvatarLike(id));
};

export const startVoiceCall = async (payload: any, token: string | null) => {
  try {
    return await axiosClient.post(endPoints.startCall, payload, {
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
      endPoints.stopCall(bridgeId),
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
    const response = await axiosClient.get(endPoints.listChats(page));

    return response.data;
  } catch (error) {
    console.error('❌ ChatList API Error:', error);
    throw error;
  }
};

export const ChatMessages = async (chatId: string, page: number) => {
  try {
    const response = await axiosClient.get(
      endPoints.getChatMessages(chatId, page),
    );

    return response.data;
  } catch (error) {
    console.error('❌ ChatMessages API error:', error);
    throw error;
  }
};

export const RefreshToken = async (data: FormData) => {
  return axiosClient.post(endPoints.refreshToken, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const AccountRegister = async (formData: FormData) => {
  return axiosClient.post(endPoints.registerAccount, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const UserLogin = async (formData: FormData) => {
  return axiosClient.post(endPoints.login, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const ResetPassword = async (formData: FormData) => {
  return axiosClient.post(endPoints.resetPassword, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const LogOut = async (formData: FormData) => {
  return axiosClient.post(endPoints.logout, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const SetVoiceCall = async (body: VoiceCallBody) => {
  return axiosClient.post(endPoints.voiceCallSession, body);
};

export const setPurchase = (body: puchaseInBody) => {
  return axiosClient.post(endPoints.purchaseSubscription, body);
};

export const setIAPPurchase = (body: puchaseIAPBody) => {
  return axiosClient.post(endPoints.purchaseTokens, body);
};

export const getUserDetail = () => {
  return axiosClient.get(endPoints.getUserSession);
};

export const getAdminSetting = () => {
  return axiosClient.get(endPoints.getSettings);
};

export const getFavouriteAvatar = () => {
  return axiosClient.get(endPoints.getFavoriteAvatars);
};

export const reportIssue = (body: { id?: string; issue: string }) => {
  return axiosClient.post(endPoints.reportIssue, body);
};

export const setPlanVisit = () => {
  return axiosClient.post(endPoints.trackPlanVisit);
};

export const setEventTrackinig = (body: { event_type: string }) => {
  return axiosClient.post(endPoints.trackEvent, body);
};

export const generateAvatarPhoto = (
  avatarId: string | number,
  photoId: string | number,
) => {
  return axiosClient.post(
    endPoints.generatePhoto(avatarId.toString(), photoId.toString()),
  );
};

export const generateAvatarPhotoFree = (
  avatarId: string | number,
  photoId: string | number,
) => {
  return axiosClient.post(
    endPoints.generatePhotoFree(avatarId.toString(), photoId.toString()),
  );
};

export const getTokensInfo = () => {
  return axiosClient.get(endPoints.getTokenPricing);
};

export const setCancelMessage = (body: { cancel_reason: string }) => {
  return axiosClient.post(endPoints.cancelSubscription, body);
};

export const generateBlurImage = (messageId: string) => {
  return axiosClient.post(endPoints.generateMessageImage(messageId));
};

export const generateBlurImageFree = (messageId: string) => {
  return axiosClient.post(endPoints.generateMessageImageFree(messageId));
};
