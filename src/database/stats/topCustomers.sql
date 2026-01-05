-- Top Customers
SELECT 
    c.name,
    SUM(s.total) as totalSpent 
FROM sales s 
JOIN
    customers c ON
    s.customer_id = c.id 
WHERE
    s.date >= :salesFirstDate AND s.date < :salesLastDate AND s.deleted_at IS NULL
GROUP BY
    c.id 
ORDER BY
    totalSpent DESC 
LIMIT 5