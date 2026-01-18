/**
 * Interface pour un club
 */
export interface Club {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo: string;
  coverImage: string;
  contactEmail: string;
  isPublic: boolean;
  membershipFeeAmount: number;
  isActive: boolean;
  creationDate: Date;
  categoryId: number;
  categoryName?: string;
  // Statistiques calculées (du backend)
  members?: number;
  events?: number;
  revenue?: number;
  isMember?: boolean;
}

/**
 * Interface pour une catégorie
 */
export interface Category {
  id: number;
  name: string;
  icon: string;
}

/**
 * Interface pour les filtres de clubs
 */
export interface ClubFilters {
  status?: 'all' | 'active' | 'inactive';
  categoryId?: number | 'all';
  search?: string;
  sortBy?: 'name' | 'members' | 'events' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Interface pour la réponse paginée de clubs
 */
export interface PaginatedClubs {
  data: Club[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Interface pour les statistiques des clubs
 */
export interface ClubsStats {
  total: number;
  active: number;
  inactive: number;
  totalMembers: number;
  totalEvents: number;
  totalRevenue: number;
}

/**
 * DTO pour créer/modifier un club
 */
export interface CreateClubDto {
  name: string;
  description: string;
  logo?: string;
  coverImage?: string;
  contactEmail: string;
  isPublic: boolean;
  membershipFeeAmount: number;
  categoryId: number;
}

export interface UpdateClubDto extends Partial<CreateClubDto> {
  isActive?: boolean;
}
