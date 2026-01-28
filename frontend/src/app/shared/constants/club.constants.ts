export const CLUB_STATUS = {
  NON_MEMBER: 'non membre',
  REJECTED: 'rejetée',
  OLD_MEMBER: 'ancien membre',
} as const;

export const CLUB_ROUTES = {
  DETAILS: '/my-clubs',
  JOIN: '/join-club',
  RENEW: '/clubs', 
  LOGIN: '/login'
} as const;

export const CLUB_CONFIG = {
  LOCALE: 'fr-FR',
  CURRENCY_LABEL: 'TND/an',
  FREE_LABEL: 'Gratuit'
};