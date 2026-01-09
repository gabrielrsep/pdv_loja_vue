-- Clean up existing data
DELETE FROM sale_items;
DELETE FROM sales;
DELETE FROM products;
DELETE FROM customers;
DELETE FROM checks;
DELETE FROM users;
INSERT INTO users (id, username, password_hash, role, recovery_question, recovery_answer, created_at) VALUES 
(1, 'admin', '$2a$12$4oE0jvph.BzQ2hYjPJmOcuSuwXLG1DYX.kvvXLzVmRCDVgYMpyJzi', 'administrador', 'Qual o nome da sua mãe?', 'Maria', '2025-01-01T00:00:00.000Z'),
(2, 'vendedor', '$2a$12$4oE0jvph.BzQ2hYjPJmOcuSuwXLG1DYX.kvvXLzVmRCDVgYMpyJzi', 'vendedor', 'Qual sua cor favorita?', 'Azul', '2025-01-01T00:00:00.000Z'),
(3, 'gerente', '$2a$12$4oE0jvph.BzQ2hYjPJmOcuSuwXLG1DYX.kvvXLzVmRCDVgYMpyJzi', 'gerente', 'Nome do seu pet?', 'Rex', '2025-01-01T00:00:00.000Z');


DELETE FROM categories;

-- Reset Auto-increment counters
DELETE FROM sqlite_sequence WHERE name IN ('sale_items', 'sales', 'products', 'customers', 'checks', 'users', 'categories');

-- Insert Categories
INSERT INTO categories (id, name, color, icon) VALUES
(1, 'Camisas', '#3B82F6', 'shirt'),
(2, 'Calças', '#10B981', 'pants'),
(3, 'Calçados', '#F59E0B', 'footprints'),
(4, 'Acessórios', '#8B5CF6', 'watch'),
(5, 'Casacos', '#EF4444', 'jacket'),
(6, 'Camisetas', '#06B6D4', 'tshirt'),
(7, 'Bermudas', '#F97316', 'shorts');

-- Insert Products (20 items)
INSERT INTO products (id, name, category_id, size, price, cost_price, stock, gender) VALUES 
(1, 'Camisa Polo Classic Blue', 1, 'M', 89.90, 69.90, 45, 'Masculino'),
(2, 'Camisa Polo Classic Black', 1, 'G', 89.90, 69.90, 30, 'Masculino'),
(3, 'Calça Jeans Skinny', 2, '42', 149.90, 109.90, 25, 'Unissex'),
(4, 'Calça Jeans Slim Fit', 2, '40', 159.90, 119.90, 20, 'Masculino'),
(5, 'Tênis Running Air', 3, '41', 299.90, 199.90, 15, 'Unissex'),
(6, 'Sapato Social Couro', 3, '42', 249.90, 199.90, 10, 'Masculino'),
(7, 'Boné Heritage', 4, 'U', 59.90, 59.90, 50, 'Unissex'),
(8, 'Cinto de Couro Marrom', 4, '100', 79.90, 69.90, 15, 'Masculino'),
(9, 'Jaqueta Bomber Nylon', 5, 'M', 199.90, 129.90, 12, 'Unissex'),
(10, 'Blazer Modern Grey', 5, 'GG', 349.90, 299.90, 8, 'Masculino'),
(11, 'Camiseta Basic White', 6, 'P', 39.90, 29.90, 100, 'Unissex'),
(12, 'Camiseta Basic Black', 6, 'M', 39.90, 29.90, 80, 'Unissex'),
(13, 'Bermuda Cargo Sand', 7, '44', 99.90, 79.90, 22, 'Masculino'),
(14, 'Bermuda Sarja Navy', 7, '42', 109.90, 89.90, 18, 'Masculino'),
(15, 'Moletom Hoodie Navy', 5, 'G', 129.90, 99.90, 30, 'Unissex'),
(16, 'Meia Esportiva (Par)', 4, 'U', 19.90, 19.90, 200, 'Unissex'),
(17, 'Carteira de Couro Slim', 4, 'U', 89.90, 69.90, 20, 'Unissex'),
(18, 'Vestido Floral Summer', 1, 'M', 159.90, 129.90, 15, 'Feminino'),
(19, 'Saia Plissada Black', 2, 'P', 119.90, 109.90, 10, 'Feminino'),
(20, 'Blusa de Lã Soft', 5, 'G', 139.90, 129.90, 5, 'Feminino');

-- Insert Customers (10 items)
INSERT INTO customers (id, name, age, phone, address, balance, last_payment_date) VALUES 
(1, 'João Silva', 32, '(11) 98765-4321', 'Rua das Flores, 123', 0, '2025-12-20T10:00:00.000Z'),
(2, 'Maria Oliveira', 28, '(11) 91234-5678', 'Av. Central, 500', 150.00, '2025-12-15T14:30:00.000Z'),
(3, 'Carlos Santos', 45, '(11) 97777-8888', 'Rua Augusta, 1500', 0, '2025-12-28T16:00:00.000Z'),
(4, 'Ana Costa', 24, '(11) 96666-5555', 'Al. Jau, 200', 45.90, '2025-12-05T09:00:00.000Z'),
(5, 'Pedro Rocha', 50, '(11) 95555-4444', 'Rua Mato Grosso, 88', 0, '2025-11-20T11:00:00.000Z'),
(6, 'Fernanda Lima', 35, '(11) 94444-3333', 'Rua Oscar Freire, 10', 320.00, NULL),
(7, 'Ricardo Alves', 38, '(11) 93333-2222', 'Av. Paulista, 1000', 0, '2025-12-30T17:00:00.000Z'),
(8, 'Juliana Souza', 29, '(11) 92222-1111', 'Rua Bela Cintra, 450', 89.90, '2025-12-10T15:00:00.000Z'),
(9, 'Marcos Pereira', 42, '(11) 91111-0000', 'Rua Haddock Lobo, 300', 0, '2025-12-25T13:00:00.000Z'),
(10, 'Beatriz Mendes', 31, '(11) 90000-9999', 'Av. Brigadeiro, 2500', 0, '2025-12-29T10:00:00.000Z');

-- Insert Sales (November and December 2025)
-- December 2025
INSERT INTO sales (id, total, customer_id, to_account, date) VALUES (1, 179.80, 1, 0, '2025-12-01T10:00:00.000Z');
INSERT INTO sales (id, total, customer_id, to_account, date) VALUES (2, 299.90, 2, 0, '2025-12-05T14:30:00.000Z');
INSERT INTO sales (id, total, customer_id, to_account, date) VALUES (3, 159.90, 3, 0, '2025-12-10T16:00:00.000Z');
INSERT INTO sales (id, total, customer_id, to_account, date) VALUES (4, 45.90, 4, 0, '2025-12-15T09:00:00.000Z');
INSERT INTO sales (id, total, customer_id, to_account, date) VALUES (5, 599.80, 5, 0, '2025-12-20T11:00:00.000Z');
INSERT INTO sales (id, total, customer_id, to_account, date) VALUES (6, 349.90, 6, 0, '2025-12-22T14:00:00.000Z');
INSERT INTO sales (id, total, customer_id, to_account, date) VALUES (7, 89.90, 7, 1, '2025-12-25T17:00:00.000Z');
INSERT INTO sales (id, total, customer_id, to_account, date) VALUES (8, 119.80, 8, 1, '2025-12-28T15:00:00.000Z');
INSERT INTO sales (id, total, customer_id, to_account, date) VALUES (9, 239.70, 9, 1, '2025-12-30T13:00:00.000Z');
INSERT INTO sales (id, total, customer_id, to_account, date) VALUES (10, 49.90, 10, 1, '2025-12-31T10:00:00.000Z'); -- Today

-- November 2025 (Historical data)
INSERT INTO sales (id, total, customer_id, to_account, date) VALUES (11, 250.00, 1, 0, '2025-11-05T10:00:00.000Z');
INSERT INTO sales (id, total, customer_id, to_account, date) VALUES (12, 120.00, 2, 0, '2025-11-12T14:30:00.000Z');
INSERT INTO sales (id, total, customer_id, to_account, date) VALUES (13, 300.00, 3, 0, '2025-11-18T16:00:00.000Z');

-- Insert Sale Items
INSERT INTO sale_items (sale_id, product_id, quantity, subtotal) VALUES (1, 1, 2, 179.80);
INSERT INTO sale_items (sale_id, product_id, quantity, subtotal) VALUES (2, 5, 1, 299.90);
INSERT INTO sale_items (sale_id, product_id, quantity, subtotal) VALUES (3, 4, 1, 159.90);
INSERT INTO sale_items (sale_id, product_id, quantity, subtotal) VALUES (4, 11, 1, 39.90), (4, 16, 1, 19.90);
INSERT INTO sale_items (sale_id, product_id, quantity, subtotal) VALUES (5, 5, 2, 599.80);
INSERT INTO sale_items (sale_id, product_id, quantity, subtotal) VALUES (6, 10, 1, 349.90);
INSERT INTO sale_items (sale_id, product_id, quantity, subtotal) VALUES (7, 2, 1, 89.90);
INSERT INTO sale_items (sale_id, product_id, quantity, subtotal) VALUES (8, 7, 2, 119.80);
INSERT INTO sale_items (sale_id, product_id, quantity, subtotal) VALUES (9, 1, 1, 89.90), (9, 3, 1, 149.90);
INSERT INTO sale_items (sale_id, product_id, quantity, subtotal) VALUES (10, 12, 1, 39.90);

-- Insert Checks/Costs (Financial Control)
-- Dec 2025
INSERT INTO checks (id, amount, due_date, status, type, description, created_at) VALUES 
(1, 1200.00, '2025-12-05', 'pago', 'boleto', 'Aluguel do Salão', '2025-12-01T08:00:00.000Z'),
(2, 450.00, '2025-12-10', 'pago', 'boleto', 'Energia Elétrica', '2025-12-01T08:00:00.000Z'),
(3, 150.00, '2025-12-15', 'pago', 'outro', 'Assinatura Software (ERP)', '2025-12-01T08:00:00.000Z'),
(4, 2500.00, '2025-12-20', 'pendente', 'cheque', 'Fornecedor de Tecidos ABC', '2025-12-01T08:00:00.000Z'),
(5, 800.00, '2025-12-25', 'pago', 'boleto', 'Marketing Digital (Ads)', '2025-12-01T08:00:00.000Z');

-- Jan 2026 (Future)
INSERT INTO checks (id, amount, due_date, status, type, description, created_at) VALUES 
(6, 1200.00, '2026-01-05', 'pendente', 'boleto', 'Aluguel do Salão (Janeiro)', '2025-12-30T08:00:00.000Z'),
(7, 3000.00, '2026-01-15', 'pendente', 'cheque', 'Compra Coleção Outono', '2025-12-30T08:00:00.000Z'),
(8, 200.00, '2026-01-20', 'pendente', 'outro', 'Manutenção Ar Condicionado', '2025-12-30T08:00:00.000Z');

-- Feb 2026 (Future)
INSERT INTO checks (id, amount, due_date, status, type, description, created_at) VALUES 
(9, 1200.00, '2026-02-05', 'pendente', 'boleto', 'Aluguel do Salão (Fevereiro)', '2025-12-30T08:00:00.000Z'),
(10, 500.00, '2026-02-10', 'pendente', 'boleto', 'Internet e Telefone', '2025-12-30T08:00:00.000Z');
