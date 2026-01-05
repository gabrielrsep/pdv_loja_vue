-- Daily Sales Trend (Current Month)
SELECT
    strftime('%Y-%m-%d', date) as day,
    SUM(total) as dailyTotal 
FROM sales 
WHERE
    date >= :salesFirstDate AND date < :salesLastDate AND deleted_at IS NULL
GROUP BY
    day 
ORDER BY
    day ASC