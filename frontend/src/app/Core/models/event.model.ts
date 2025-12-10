/**
 * Énumérations pour les événements
 */
export enum EventStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum EventType {
  AG = 'AG',
  HACKATHON = 'HACKATHON',
  MEET = 'MEET',
  TEAM_BUILDING = 'TEAM_BUILDING',
  OTHER = 'OTHER',
}

export enum RegistrationStatus {
  REGISTERED = 'REGISTERED',
  WAITLIST = 'WAITLIST',
  CANCELLED = 'CANCELLED',
}

/**
 * Interface représentant un club (simplifié pour les événements)
 */
export interface Club {
  id: number;
  name: string;
  logo?: string;
  slug: string;
}

/**
 * Interface représentant un utilisateur inscrit
 */
export interface Registration {
  id: number;
  date: Date;
  status: RegistrationStatus;
  user: {
    id: number;
    name: string;
    lastName: string;
    email: string;
    image?: string;
  };
}

/**
 * Interface principale représentant un événement
 */
export interface Event {
  id: number;
  title: string;
  description?: string;
  coverImage?: string;
  startDate: Date;
  endDate: Date;
  address?: string;
  capacity?: number;
  memberOnly: boolean;
  status: EventStatus;
  sPaid: EventType;
  subscriptionFees: number;
  club: Club;
  registrations?: Registration[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO pour créer/modifier un événement
 */
export interface CreateEventDto {
  title: string;
  description?: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  address?: string;
  capacity?: number;
  memberOnly?: boolean;
  status?: EventStatus;
  sPaid?: EventType;
  subscriptionFees?: number;
  clubId: number;
}

/**
 * DTO pour filtrer les événements
 */
export interface EventFilters {
  status?: EventStatus;
  type?: EventType;
  clubId?: number;
  search?: string;
  startDateFrom?: string;
  startDateTo?: string;
  sortBy?: 'date' | 'title' | 'capacity' | 'registrations';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Réponse paginée du backend
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Statistiques d'un événement
 */
export interface EventStats {
  totalRegistrations: number;
  confirmedRegistrations: number;
  waitlistRegistrations: number;
  cancelledRegistrations: number;
  capacity: number;
  availableSpots: number;
  totalRevenue: number;
}
