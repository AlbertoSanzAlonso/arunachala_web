/**
 * Checks if the current date is within the Christmas season.
 * By default: December 1st to January 10th.
 */
export const isChristmasSeason = (): boolean => {
    const now = new Date();
    const month = now.getMonth(); // 0 = Jan, 11 = Dec
    const day = now.getDate();

    // From December 1 (month 11) to January 10 (month 0)
    if (month === 11) {
        return day >= 1;
    }
    if (month === 0) {
        return day <= 10;
    }
    return false;
};
