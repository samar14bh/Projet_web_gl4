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


export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export const BUTTON_VARIANTS: Record<string, ButtonVariant> = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DANGER: 'danger',
  GHOST: 'ghost'
};
export const CLUB_CONFIG = {
  LOCALE: 'fr-FR',
  CURRENCY_LABEL: 'TND/an',
  FREE_LABEL: 'Gratuit',
  DEFAULT_VARIANT: BUTTON_VARIANTS["PRIMARY"]
};