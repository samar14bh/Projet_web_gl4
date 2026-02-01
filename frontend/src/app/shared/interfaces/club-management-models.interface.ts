/**
 * Shared interfaces for Club Management presentational components
 */

export interface ClubDetailCard {
    label: string;
    value: string | number;
    badgeType?: 'sky' | 'violet';
}

export interface ClubEvent {
    id: number;
    title: string;
    date: string;
    participants: number;
}

export interface SettingsSection {
    title: string;
    description: string;
    icon: string;
    color: 'blue' | 'sky' | 'violet';
}
