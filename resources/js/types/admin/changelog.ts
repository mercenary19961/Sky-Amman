import type { PageProps, Paginator } from '@/types';

export type ChangeAction = 'create' | 'update' | 'delete' | 'restore';

export interface ChangeEntry {
    label: string;
    old: string;
    new: string;
}

export interface ChangeLogItem {
    id: number;
    model_type: string;
    section: string;
    action: ChangeAction;
    label: string | null;
    changes: ChangeEntry[];
    changed_by: string | null;
    created_ago: string;
    created_at: string;
    revertable: boolean;
    reverted: boolean;
    reverted_by: string | null;
    reverted_ago: string | null;
}

export interface ChangeLogPageProps extends PageProps {
    logs: Paginator<ChangeLogItem>;
    users: Array<{ id: number; name: string }>;
    sectionLabels: Record<string, string>;
    filters: {
        model_type?: string;
        changed_by?: string;
        period?: string;
    };
}

/** Shared one-shot payload for the post-save Undo toast. */
export interface UndoPayload {
    id: number;
    section: string;
    action: ChangeAction;
    label: string | null;
}
