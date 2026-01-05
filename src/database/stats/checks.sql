WITH checksSummary AS (
    SELECT
        COALESCE(SUM(CASE WHEN status = 'pendente' THEN amount ELSE 0 END), 0) AS pendingTotal,
        COALESCE(SUM(CASE WHEN status = 'pago' THEN amount ELSE 0 END), 0) AS paidTotal,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) AS pendingCount
    FROM checks
    WHERE due_date BETWEEN :startDate AND :endDate
)
SELECT
    pendingTotal,
    paidTotal,
    pendingCount,
    SUM(balance) AS customersDebt
FROM customers
CROSS JOIN checksSummary