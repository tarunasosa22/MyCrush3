export const endPoints = {
  guestLogin: '/account/guest-login/',
  deleteAccount: '/account/delete-account/',
  updateProfile: '/account/profile/',
  updatePassword: '/account/password/change/',
  personaCategories: '/personas/categories/',
  createAvatar: '/personas/avatar-create/',
  updateAvatar: (avatar_id: any) => `/personas/avatar-update/${avatar_id}/`,
  generatePhoto: (avatarId: string, photoId: string | number) =>
    `/personas/${avatarId}/generate-photo/${photoId}`,
  generatePhotoFree: (avatarId: string, photoId: string | number) =>
    `/personas/${avatarId}/generate-photo-free/${photoId}`,
  listGlobalAvatars: (page: number) =>
    `/personas/avatar-list/global/?page=${page}`,
  avatarDetail: '/personas/avatar-detail/',
  listLikedAvatars: (page: number) => `/personas/avatar-list/?page=${page}`,
  startCall: '/voice/webrtc/start/',
  turnIce: '/voice/turn-ice/',
  stopCall: (id: any) => `/voice/webrtc/stop/${encodeURIComponent(id)}/`,
  listChats: (page: number) => `/chat/chats/?page=${page}`,
  createChat: '/chat/chats/',
  // CHAT_MESSAGES:'/chat/chats/${chatId}/messages/'
  getChatMessages: (chatId: string, page: number) =>
    `/chat/chats/${chatId}/messages/?page=${page}`,
  refreshToken: '/account/refresh/',
  registerAccount: '/account/register/',
  login: '/account/login/',
  resetPassword: '/account/password/reset/',
  logout: '/account/logout/',
  voiceCallSession: '/voice/session/',
  purchaseSubscription: '/transaction/subscription/buy/',
  purchaseTokens: '/transaction/purchase/tokens/',
  getUserSession: '/account/session/',
  getSettings: '/account/settings/',
  reportIssue: '/account/report/',
  googleSignIn: '/account/google/signin/',
  facebookSignIn: '/account/facebook/signin/',
  appleSignIn: '/account/apple/signin/',
  toggleAvatarLike: (avatarId: number) =>
    `personas/avatar-like/toggle/${avatarId}/`,
  getFavoriteAvatars: '/personas/avatar-list/favourite/',
  trackPlanVisit: '/account/subscription/visit/',
  trackEvent: '/account/events/',
  getTokenPricing: '/transaction/pricing/',
  cancelSubscription: '/transaction/subscription/cancel/',
  generateMessageImage: (messageId: string) =>
    `/chat/generate-message-image/${messageId}/`,
  generateMessageImageFree: (messageId: string) =>
    `/chat/generate-message-image-free/${messageId}/`,
};
