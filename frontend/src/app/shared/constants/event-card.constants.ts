export const PAYMENT_STATUS = {
  PAID: 'payé',
  FREE: 'gratuit',
  PENDING: 'en attente' 
} as const;

export const STATUS_CONFIG = {
  [PAYMENT_STATUS.PAID]: {
    class: 'status-paid',
    icon: 'fa-check-circle'
  },
  [PAYMENT_STATUS.FREE]: {
    class: 'status-free',
    icon: 'fa-tag'
  },
  DEFAULT: {
    class: 'status-pending',
    icon: 'fa-clock'
  }
};

export const CURRENCY_CONFIG = {
  LOCALE: 'fr-FR',
  CODE: 'TND',
  LABEL_FREE: 'Gratuit'
};