export const ROLES = {
  USER: 'user',
  HOSPITAL: 'hospital',
  DRIVER: 'driver',
  ADMIN: 'admin',
} as const;

export const USER_MODES = {
  PATIENT: 'patient',
  DONOR: 'donor',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
export type UserMode = typeof USER_MODES[keyof typeof USER_MODES];
