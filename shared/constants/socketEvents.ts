export const SOCKET_EVENTS = {
  USER_JOIN:                 'user:join',
  USER_LOCATION_UPDATE:      'user:location:update',
  DONOR_AVAILABILITY:        'donor:availability',
  CHAT_MESSAGE_SEND:         'chat:message:send',
  CHAT_TYPING:               'chat:typing',
  AMBULANCE_LOCATION:        'ambulance:location',
  EMERGENCY_SOS:             'emergency:sos',
  REQUEST_NEW:               'request:new',
  REQUEST_ACCEPTED:          'request:accepted',
  REQUEST_STATUS_UPDATE:     'request:status:update',
  AMBULANCE_ASSIGNED:        'ambulance:assigned',
  AMBULANCE_LOCATION_UPDATE: 'ambulance:location:update',
  CHAT_MESSAGE_RECEIVE:      'chat:message:receive',
  NOTIFICATION_NEW:          'notification:new',
  EMERGENCY_ALERT:           'emergency:alert',
  VERIFICATION_RESULT:       'verification:result',
} as const;

export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
