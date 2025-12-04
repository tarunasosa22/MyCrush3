export const endpoints = {
  GUEST_LOGIN: '/account/guest-login/',
  DELETE_ACCOUNT: '/account/delete-account/',
  UPDATE_PROFILE: '/account/profile/',
  UPDATE_PASSWORD: '/account/password/change/',
  GENDER_CATEGORIES: '/personas/categories/',
  AVATAR_CREATE: '/personas/avatar-create/',
  AVATAR_UPDATE: (avatar_id: any) => `/personas/avatar-update/${avatar_id}/`,
  PHOTO_GENEATE: (avatarId: string, photoId: string | number) =>
    `/personas/${avatarId}/generate-photo/${photoId}`,
  PHOTO_GENEATE_FREE: (avatarId: string, photoId: string | number) =>
    `/personas/${avatarId}/generate-photo-free/${photoId}`,
  USER_LIST_GLOBAL_AVATAR: (page: number) =>
    `/personas/avatar-list/global/?page=${page}`,
  AVATAR_DETAIL: '/personas/avatar-detail/',
  LIKE_USERLIST: (page: number) => `/personas/avatar-list/?page=${page}`,
  START_CALL: '/voice/webrtc/start/',
  TURN_ICE: '/voice/turn-ice/',
  STOP_CALL: (id: any) => `/voice/webrtc/stop/${encodeURIComponent(id)}/`,
  CHAT_LIST: (page: number) => `/chat/chats/?page=${page}`,
  CREATE_CHAT: '/chat/chats/',
  // CHAT_MESSAGES:'/chat/chats/${chatId}/messages/'
  CHAT_MESSAGES: (chatId: string, page: number) =>
    `/chat/chats/${chatId}/messages/?page=${page}`,
  REFRESH_TOKEN: '/account/refresh/',
  ACCOUNT_REGISTER: '/account/register/',
  USER_LOGIN: '/account/login/',
  RESET_PASSWORD: '/account/password/reset/',
  LOG_OUT: '/account/logout/',
  VOICE_CALL_URL: '/voice/session/',
  POST_PURCHASE_URL: '/transaction/subscription/buy/',
  POST_IAP_PURCHASE_URL: '/transaction/purchase/tokens/',
  GET_USER_DETAIL: '/account/session/',
  GET_ADMIN_SETTING: '/account/settings/',
  REPORT_ISSUE_URL: '/account/report/',
  GOOGLE_SIGNIN_URL: '/account/google/signin/',
  FACEBOOK_SIGNIN_URL: '/account/facebook/signin/',
  APPLE_SIGNIN_URL: '/account/apple/signin/',
  LIKE_DISLIKE_AVATAR_URL: (avatarId: number) =>
    `personas/avatar-like/toggle/${avatarId}/`,
  GET_FAV_AVATAR_URL: '/personas/avatar-list/favourite/',
  SET_PLAN_VISIT: '/account/subscription/visit/',
  SET_EVENT_TRACK: '/account/events/',
  GET_TOKEN_INFO: '/transaction/pricing/',
  SET_CANCEL_MESSAGE: '/transaction/subscription/cancel/',
  GENERATE_MESSAGE_IMAGE: (messageId: string) =>
    `/chat/generate-message-image/${messageId}/`,
  GENERATE_MESSAGE_IMAGE_FREE: (messageId: string) =>
    `/chat/generate-message-image-free/${messageId}/`,
};
