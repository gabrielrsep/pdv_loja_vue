SELECT
    p.id,
    p.name,
    p.stock,
    c.name AS category_name,
    c.color AS category_color,
    p."size",
    p.gender,
    p.price,
    CASE
        WHEN pm.id IS NOT NULL AND pm.active = 1 THEN
            CASE 
                WHEN pm.discount_type = 'percentage' 
                    THEN p.price * (1 - (pm.value / 100.0))
                ELSE p.price - pm.value
            END
        ELSE p.price
    END AS promotional_price
FROM
    products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN promotion_targets pt ON pt.target_id = p.id
LEFT JOIN promotions pm ON pt.promotion_id = pm.id 
    AND pm.active = 1 
    AND DATETIME('now') BETWEEN pm.start_date AND pm.end_date