
export const DEMO_SETTINGS = [
    { key: 'start_date', value: '2026-01-31' }
];

export const DEMO_USERS = [
    { id: 'u1', username: 'Nihal', created_at: '2026-01-31T10:00:00Z', is_admin: true },
    { id: 'u2', username: 'Nick', created_at: '2026-01-31T10:00:00Z', is_admin: false },
    { id: 'u3', username: 'Eddie', created_at: '2026-01-31T10:00:00Z', is_admin: false },
    { id: 'u4', username: 'Jordan', created_at: '2026-01-31T10:00:00Z', is_admin: false },
];

export const DEMO_CHECKINS = [
    // Nihal (3/3)
    { id: 'c1', user_id: 'u1', date: '2026-01-31' },
    { id: 'c2', user_id: 'u1', date: '2026-02-01' },
    { id: 'c3', user_id: 'u1', date: '2026-02-02' },

    // Nick (2/3)
    { id: 'c4', user_id: 'u2', date: '2026-01-31' },
    { id: 'c5', user_id: 'u2', date: '2026-02-01' },

    // Eddie (2/3) - Updated: Completed Day 2 (Feb 1), Missed Day 3 (Feb 2)
    { id: 'c6', user_id: 'u3', date: '2026-01-31' },
    { id: 'c_eddie_2', user_id: 'u3', date: '2026-02-01' },

    // Jordan (1/3)
    { id: 'c8', user_id: 'u4', date: '2026-01-31' },
];
