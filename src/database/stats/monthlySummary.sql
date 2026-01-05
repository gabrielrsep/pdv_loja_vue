-- Monthly Summary
WITH salesStats as (
    SELECT
        SUM(total) as totalSales,
        COUNT(id) as orderCount
    FROM
        sales 
    WHERE 
        date >= :salesFirstDate AND date < :salesLastDate AND deleted_at IS NULL
),
checksStats as (
    SELECT
        SUM(amount) as totalChecksToExpire
    FROM
        checks
    WHERE
        status = 'pendente' AND due_date >= :checksFirstDate AND due_date < :checksLastDate
),
profitStats as (
    SELECT
        SUM((p.price - p.cost_price) * si.quantity) as balance
    FROM
        sale_items si
    JOIN 
        sales s ON si.sale_id = s.id
    JOIN 
        products p ON si.product_id = p.id
    WHERE
        s.date >= :salesFirstDate AND s.date < :salesLastDate AND s.deleted_at IS NULL
)
SELECT
    COALESCE(p.balance, 0) as balance,
    COALESCE(s.totalSales, 0) as totalSales,
    COALESCE(s.orderCount, 0) as orderCount,
    COALESCE(c.totalChecksToExpire, 0) as totalChecksToExpire
FROM
    salesStats s
CROSS JOIN checksStats c
CROSS JOIN profitStats p;