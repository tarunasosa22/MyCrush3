// export const API_DOMAIN = 'http://192.168.0.144:8008';

export const LIVE_SERVER_URL = 'api.my-girl.online';
export const LOCAL_SERVER_URL = '192.168.0.144:8008';
export const SERVER_URL = `${LIVE_SERVER_URL}`;
export const API_DOMAIN =
  SERVER_URL === LIVE_SERVER_URL
    ? `https://${SERVER_URL}`
    : `http://${SERVER_URL}`;
export const CHAT_SOCKET_URL =
  SERVER_URL === LIVE_SERVER_URL
    ? `wss://${SERVER_URL}/ws/chat/`
    : `ws://${SERVER_URL}/ws/chat/`;
export const AVATAR_SOCKET_URL =
  SERVER_URL === LIVE_SERVER_URL
    ? `wss://${SERVER_URL}/ws/image-generation/`
    : `ws://${SERVER_URL}/ws/image-generation/`;
