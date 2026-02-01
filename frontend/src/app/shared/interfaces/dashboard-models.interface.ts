/**
 * Shared data models for presentational dashboard components
 * These are used by dumb components in shared/components/
 */

/**
 * Member model for display in lists
 */
export interface Member {
    id: number;
    name: string;
    lastName: string;
    email: string;
    joinDate: string;
    status?: string;
    image?: string;
}

/**
 * Event model for display in lists
 */
export interface Event {
    id: number;
    name: string;
    startDate: string;
    endDate?: string;
    description?: string;
}

/**
 * Quick stat display model
 */
export interface QuickStat {
    icon: string;
    label: string;
    value: number | string;
}
