-- Top Products
SELECT
    p.name,
    SUM(si.quantity) as totalSold 
FROM sale_items si 
JOIN products p
    ON si.product_id = p.id 
JOIN sales s
    ON si.sale_id = s.id 
WHERE
    s.date >= :salesFirstDate AND s.date < :salesLastDate AND s.deleted_at IS NULL
GROUP BY
    p.id 
ORDER BY
    totalSold DESC 
LIMIT 5