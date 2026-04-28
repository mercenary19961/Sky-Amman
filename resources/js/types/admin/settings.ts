import type { PageProps } from '@/types';

export interface SettingRow {
    id: number;
    key: string;
    value: string;
    type: 'text' | 'textarea' | 'email' | 'url' | 'number' | 'boolean' | 'json';
    group: string;
}

export interface SettingsPageProps extends PageProps {
    settings: Record<string, SettingRow[]>;
}
