/**
 * Shared component interfaces
 */

export interface StatCardData {
    title: string;
    value: string | number;
    icon: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
    footer?: string;
}

export interface TabItem {
    id: string;
    label: string;
    icon?: string;
    badge?: number;
}
