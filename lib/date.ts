
/**
 * Challenge Start Date
 * Set to January 31, 2026 at midnight PST
 */
export const CHALLENGE_START_DATE = '2026-01-31T00:00:00-08:00';

/**
 * Calculates the day number relative to the challenge start date.
 * Day 1 is CHALLENGE_START_DATE.
 */
export function getDayNumber(date: string | Date): number {
    const start = new Date(CHALLENGE_START_DATE);
    let target: Date;

    if (typeof date === 'string' && date.includes('-') && !date.includes('T')) {
        // If it's a "YYYY-MM-DD" string, force to PST midnight
        target = new Date(`${date}T00:00:00-08:00`);
    } else {
        target = new Date(date);
    }

    if (isNaN(target.getTime())) return NaN;

    // Use UTC midnight of the target in PST to get stable diff
    // We want the difference in absolute days from Jan 31 PST
    const diffMs = target.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(1, diffDays + 1);
}

/**
 * Returns the current day number of the challenge.
 */
export function getCurrentDay(): number {
    const now = new Date();
    // Ensure we are calculating based on PST time
    const pstDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    return getDayNumber(pstDate);
}

/**
 * Formats a date to YYYY-MM-DD in PST.
 */
export function formatDate(date: Date): string {
    const pstDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    const year = pstDate.getFullYear();
    const month = String(pstDate.getMonth() + 1).padStart(2, '0');
    const day = String(pstDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Returns today's date string in YYYY-MM-DD (PST).
 */
export function getTodayPST(): string {
    return formatDate(new Date());
}
