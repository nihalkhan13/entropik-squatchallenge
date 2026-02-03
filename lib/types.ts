export type User = {
    id: string;
    username: string;
    created_at: string;
    is_admin: boolean;
    notification_settings?: {
        reminders: boolean;
        social: boolean;
    };
    timezone?: string;
};

export type Activity = {
    id: string;
    user_id: string;
    event_type: 'completed' | 'missed' | 'streak_milestone' | 'finished';
    metadata: {
        day?: number;
        date?: string;
        streak_count?: number;
    };
    created_at: string;
    user?: User;
    reactions?: Reaction[];
};

export type Reaction = {
    id: string;
    activity_id: string;
    user_id: string;
    emoji: string;
    created_at: string;
    user?: User;
};
