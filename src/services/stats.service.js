import { ipcMain } from 'electron';
import { getStats } from '../database/database.js';

const formatDate = date => {
    const [year, month] = date.split('-');
    const nextMonth = new Date(year, month, 1);
    const firstDayOfMonth = new Date(year, month - 1, 1);

    return [firstDayOfMonth, nextMonth].map(date => date.toISOString().split('T')[0]);
}

function registerStatsHandlers(db) {
    // Get Statistics
    ipcMain.handle('stats:get', (_, { month, year }) => {
        const firstDayOfMonth = new Date(year, month - 1, 1).toISOString();
        const nextMonth = new Date(year, month, 1).toISOString();


        const monthlySummary = getStats('monthlySummary', {
            salesFirstDate: firstDayOfMonth,
            salesLastDate: nextMonth,
            checksFirstDate: firstDayOfMonth,
            checksLastDate: nextMonth
        }).get();

        const topCustomers = getStats('topCustomers', {
            salesFirstDate: firstDayOfMonth,
            salesLastDate: nextMonth
        }).all();

        const topProducts = getStats('topProducts', {
            salesFirstDate: firstDayOfMonth,
            salesLastDate: nextMonth
        }).all();

        const dailyTrend = getStats('dailyTrend', {
            salesFirstDate: firstDayOfMonth,
            salesLastDate: nextMonth
        }).all();

        return {
            summary: monthlySummary,
            topCustomers,
            topProducts,
            dailyTrend
        };
    });

    ipcMain.handle('stats:get-checks', (_, date) => {
        const [firstDayOfMonth, nextMonth] = formatDate(date);

        return getStats('checks', {
            startDate: firstDayOfMonth,
            endDate: nextMonth
        }).get();
    });
}

export { registerStatsHandlers };
