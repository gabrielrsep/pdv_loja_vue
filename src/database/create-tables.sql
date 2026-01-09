CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#3B82F6', -- blue-500 default
    icon TEXT DEFAULT 'tag',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category_id INTEGER,
    size TEXT,
    price REAL NOT NULL,
    cost_price REAL NOT NULL,
    stock INTEGER NOT NULL,
    -- image_path TEXT,
    gender TEXT, -- Masculino, Feminino, Unissex (Opcional)
    FOREIGN KEY(category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    phone TEXT,
    address TEXT,
    balance REAL NOT NULL DEFAULT 0,
    last_payment_date TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'vendedor', -- administrador, vendedor, gerente
    recovery_question TEXT NOT NULL,
    recovery_answer TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total REAL NOT NULL,
    customer_id INTEGER,
    to_account INTEGER, -- registra se a venda foi para a conta do cliente
    date TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY(customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY(sale_id) REFERENCES sales(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
);
CREATE TABLE IF NOT EXISTS checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente', -- pendente, pago, cancelado
    type TEXT NOT NULL DEFAULT 'cheque', -- cheque, boleto, outro
    description TEXT,
    created_at TEXT NOT NULL
);

-- Indexes for performance
-- Sales: Optimized for general listing (latest first)
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date DESC);
-- Sales: Optimized for stats/history filtering by deleted_at and date
CREATE INDEX IF NOT EXISTS idx_sales_deleted_at_date ON sales(deleted_at, date);
-- Sales: Optimized for customer specific stats
CREATE INDEX IF NOT EXISTS idx_sales_customer_id_deleted_at ON sales(customer_id, deleted_at);

-- Sale Items: Foreign keys
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

-- Checks: Optimized for "pendente" checks by due_date (financial dashboard)
CREATE INDEX IF NOT EXISTS idx_checks_status_due_date ON checks(status, due_date);
-- Checks: Optimized for date range queries (financial extract)
CREATE INDEX IF NOT EXISTS idx_checks_due_date ON checks(due_date);

-- Products: Name search (partial support)
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Customers: Optimized for default listing order (High debt first)
CREATE INDEX IF NOT EXISTS idx_customers_balance ON customers(balance DESC);

-- Triggers
-- Triggers para sincronizar o saldo do cliente na venda
CREATE TRIGGER IF NOT EXISTS sync_customer_balance_insert
AFTER INSERT ON sales
FOR EACH ROW
BEGIN
    UPDATE customers
    SET balance = balance + NEW.total
    WHERE id = NEW.customer_id;
END;

-- Trigger para sincronizar o saldo (Soft Delete: Reverter saldo)
CREATE TRIGGER IF NOT EXISTS sync_customer_balance_soft_delete
AFTER UPDATE OF deleted_at ON sales
FOR EACH ROW
WHEN NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL
BEGIN
    UPDATE customers
    SET balance = balance - OLD.total
    WHERE id = OLD.customer_id;
END;   

-- Triggers para sincronizar o estoque do produto na venda
CREATE TRIGGER IF NOT EXISTS sync_product_stock
AFTER INSERT ON sale_items
FOR EACH ROW
BEGIN
    UPDATE products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;
END;

-- Trigger para devolver estoque ao desfazer venda (Soft Delete)
CREATE TRIGGER IF NOT EXISTS sync_product_stock_soft_delete
AFTER UPDATE OF deleted_at ON sales
FOR EACH ROW
WHEN NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL
BEGIN
    UPDATE products
    SET stock = stock + (
        SELECT quantity FROM sale_items WHERE sale_items.product_id = products.id AND sale_items.sale_id = NEW.id
    )
    WHERE id IN (SELECT product_id FROM sale_items WHERE sale_id = NEW.id);
END;

-- Promotions
CREATE TABLE IF NOT EXISTS promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    discount_type TEXT NOT NULL, -- 'percentage', 'fixed'
    value REAL NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promotion_targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    promotion_id INTEGER NOT NULL,
    target_type TEXT NOT NULL, -- 'product', 'category'
    target_id INTEGER NOT NULL,
    FOREIGN KEY(promotion_id) REFERENCES promotions(id) ON DELETE CASCADE
);