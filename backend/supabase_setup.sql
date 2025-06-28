-- SatuPay Payment Switch Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    primary_wallet VARCHAR(50) NOT NULL DEFAULT 'tng',
    linked_wallets JSONB DEFAULT '[]'::jsonb,
    kyc_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
    risk_score INTEGER DEFAULT 0, -- 0-100 risk score
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on phone_number for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);

-- QR Codes table
CREATE TABLE IF NOT EXISTS qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_code_id VARCHAR(100) UNIQUE NOT NULL,
    qr_type VARCHAR(50) NOT NULL, -- merchant, payment, transfer, tng, boost
    merchant_id VARCHAR(100),
    amount DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'MYR',
    payload JSONB NOT NULL,
    qr_image_url TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, scanned, expired, cancelled
    scanned_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for QR codes
CREATE INDEX IF NOT EXISTS idx_qr_codes_qr_code_id ON qr_codes(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_merchant_id ON qr_codes(merchant_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_qr_codes_expires_at ON qr_codes(expires_at);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    txn_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MYR',
    original_amount DECIMAL(15, 2),
    original_currency VARCHAR(3),
    merchant_id VARCHAR(100),
    merchant_name VARCHAR(255),
    payment_method VARCHAR(50) NOT NULL, -- qr, nfc, online, etc.
    payment_rail VARCHAR(50) NOT NULL, -- duitnow, paynow, boost, tng
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed, refunded
    qr_code_id UUID REFERENCES qr_codes(id),
    transaction_metadata JSONB DEFAULT '{}'::jsonb,
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_txn_id ON transactions(txn_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_rail ON transactions(payment_rail);

-- Plugin Logs table
CREATE TABLE IF NOT EXISTS plugin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    plugin_name VARCHAR(100) NOT NULL,
    plugin_version VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL, -- success, error, warning, skipped
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for plugin logs
CREATE INDEX IF NOT EXISTS idx_plugin_logs_transaction_id ON plugin_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_plugin_logs_plugin_name ON plugin_logs(plugin_name);
CREATE INDEX IF NOT EXISTS idx_plugin_logs_status ON plugin_logs(status);
CREATE INDEX IF NOT EXISTS idx_plugin_logs_created_at ON plugin_logs(created_at);

-- Offline Tokens table
CREATE TABLE IF NOT EXISTS offline_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MYR',
    status VARCHAR(20) DEFAULT 'active', -- active, redeemed, expired, cancelled
    redeemed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for offline tokens
CREATE INDEX IF NOT EXISTS idx_offline_tokens_token_id ON offline_tokens(token_id);
CREATE INDEX IF NOT EXISTS idx_offline_tokens_user_id ON offline_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_tokens_status ON offline_tokens(status);
CREATE INDEX IF NOT EXISTS idx_offline_tokens_expires_at ON offline_tokens(expires_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo data for testing
INSERT INTO users (phone_number, email, full_name, primary_wallet, linked_wallets, kyc_status) VALUES
    ('+60123456789', 'alice@example.com', 'Alice Tan', 'tng', '[{"type": "boost", "linked_at": "2024-01-01T00:00:00Z"}]'::jsonb, 'verified'),
    ('+60123456790', 'bob@example.com', 'Bob Lee', 'boost', '[{"type": "tng", "linked_at": "2024-01-01T00:00:00Z"}]'::jsonb, 'verified'),
    ('+60123456791', 'charlie@example.com', 'Charlie Wong', 'duitnow', '[]'::jsonb, 'pending')
ON CONFLICT (phone_number) DO NOTHING;

-- Insert demo transactions
INSERT INTO transactions (txn_id, user_id, amount, currency, merchant_id, merchant_name, payment_method, payment_rail, status, completed_at) VALUES
    ('TXN_001', (SELECT id FROM users WHERE phone_number = '+60123456789'), 25.50, 'MYR', 'MERCHANT_001', 'Starbucks KLCC', 'qr', 'tng', 'completed', NOW() - INTERVAL '1 hour'),
    ('TXN_002', (SELECT id FROM users WHERE phone_number = '+60123456790'), 75.00, 'MYR', 'MERCHANT_002', 'McDonald''s SS15', 'qr', 'boost', 'completed', NOW() - INTERVAL '2 hours'),
    ('TXN_003', (SELECT id FROM users WHERE phone_number = '+60123456789'), 120.00, 'MYR', 'MERCHANT_003', 'AEON Mall', 'nfc', 'duitnow', 'pending', NULL),
    ('TXN_004', (SELECT id FROM users WHERE phone_number = '+60123456791'), 45.80, 'MYR', 'PAYHACK_DEMO_001', 'PayHack Demo Merchant', 'qr', 'tng', 'completed', NOW() - INTERVAL '30 minutes')
ON CONFLICT (txn_id) DO NOTHING;

-- Insert demo QR codes
INSERT INTO qr_codes (qr_code_id, qr_type, merchant_id, amount, currency, payload, status, expires_at) VALUES
    ('QR_001', 'merchant', 'MERCHANT_001', 25.50, 'MYR', '{"merchant": "Starbucks KLCC", "ref": "QR_001"}'::jsonb, 'scanned', NOW() + INTERVAL '15 minutes'),
    ('QR_002', 'payment', 'PAYHACK_DEMO_001', 75.50, 'MYR', '{"demo": "tng-boost", "ref": "QR_002"}'::jsonb, 'active', NOW() + INTERVAL '15 minutes'),
    ('QR_003', 'merchant', 'MERCHANT_003', NULL, 'MYR', '{"merchant": "AEON Mall", "dynamic": true}'::jsonb, 'active', NOW() + INTERVAL '1 day')
ON CONFLICT (qr_code_id) DO NOTHING;

-- Insert demo plugin logs
INSERT INTO plugin_logs (transaction_id, plugin_name, plugin_version, status, input_data, output_data, execution_time_ms) VALUES
    ((SELECT id FROM transactions WHERE txn_id = 'TXN_001'), 'fx_converter', '1.0.0', 'success', '{"amount": 25.50, "from": "MYR", "to": "MYR"}'::jsonb, '{"converted_amount": 25.50, "rate": 1.0}'::jsonb, 50),
    ((SELECT id FROM transactions WHERE txn_id = 'TXN_001'), 'risk_checker', '1.0.0', 'success', '{"amount": 25.50, "user_risk_score": 10}'::jsonb, '{"risk_level": "low", "approved": true}'::jsonb, 120),
    ((SELECT id FROM transactions WHERE txn_id = 'TXN_002'), 'fx_converter', '1.0.0', 'success', '{"amount": 75.00, "from": "MYR", "to": "MYR"}'::jsonb, '{"converted_amount": 75.00, "rate": 1.0}'::jsonb, 45),
    ((SELECT id FROM transactions WHERE txn_id = 'TXN_004'), 'token_handler', '1.0.0', 'success', '{"token_type": "payment"}'::jsonb, '{"token_id": "TOK_001", "expires_at": "2024-12-31T23:59:59Z"}'::jsonb, 80);

-- Create RLS (Row Level Security) policies for better security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_tokens ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you can customize these based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON users FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable read access for all users" ON transactions FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON transactions FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable read access for all users" ON qr_codes FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON qr_codes FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable read access for all users" ON plugin_logs FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON plugin_logs FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable read access for all users" ON offline_tokens FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON offline_tokens FOR ALL USING (auth.role() = 'service_role');

-- Final verification queries
SELECT 'Database setup complete!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name; 
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    primary_wallet VARCHAR(50) NOT NULL DEFAULT 'tng',
    linked_wallets JSONB DEFAULT '[]'::jsonb,
    kyc_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
    risk_score INTEGER DEFAULT 0, -- 0-100 risk score
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on phone_number for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);

-- QR Codes table
CREATE TABLE IF NOT EXISTS qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_code_id VARCHAR(100) UNIQUE NOT NULL,
    qr_type VARCHAR(50) NOT NULL, -- merchant, payment, transfer, tng, boost
    merchant_id VARCHAR(100),
    amount DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'MYR',
    payload JSONB NOT NULL,
    qr_image_url TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, scanned, expired, cancelled
    scanned_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for QR codes
CREATE INDEX IF NOT EXISTS idx_qr_codes_qr_code_id ON qr_codes(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_merchant_id ON qr_codes(merchant_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_qr_codes_expires_at ON qr_codes(expires_at);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    txn_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MYR',
    original_amount DECIMAL(15, 2),
    original_currency VARCHAR(3),
    merchant_id VARCHAR(100),
    merchant_name VARCHAR(255),
    payment_method VARCHAR(50) NOT NULL, -- qr, nfc, online, etc.
    payment_rail VARCHAR(50) NOT NULL, -- duitnow, paynow, boost, tng
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed, refunded
    qr_code_id UUID REFERENCES qr_codes(id),
    transaction_metadata JSONB DEFAULT '{}'::jsonb,
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_txn_id ON transactions(txn_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_rail ON transactions(payment_rail);

-- Plugin Logs table
CREATE TABLE IF NOT EXISTS plugin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    plugin_name VARCHAR(100) NOT NULL,
    plugin_version VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL, -- success, error, warning, skipped
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for plugin logs
CREATE INDEX IF NOT EXISTS idx_plugin_logs_transaction_id ON plugin_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_plugin_logs_plugin_name ON plugin_logs(plugin_name);
CREATE INDEX IF NOT EXISTS idx_plugin_logs_status ON plugin_logs(status);
CREATE INDEX IF NOT EXISTS idx_plugin_logs_created_at ON plugin_logs(created_at);

-- Offline Tokens table
CREATE TABLE IF NOT EXISTS offline_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MYR',
    status VARCHAR(20) DEFAULT 'active', -- active, redeemed, expired, cancelled
    redeemed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for offline tokens
CREATE INDEX IF NOT EXISTS idx_offline_tokens_token_id ON offline_tokens(token_id);
CREATE INDEX IF NOT EXISTS idx_offline_tokens_user_id ON offline_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_tokens_status ON offline_tokens(status);
CREATE INDEX IF NOT EXISTS idx_offline_tokens_expires_at ON offline_tokens(expires_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo data for testing
INSERT INTO users (phone_number, email, full_name, primary_wallet, linked_wallets, kyc_status) VALUES
    ('+60123456789', 'alice@example.com', 'Alice Tan', 'tng', '[{"type": "boost", "linked_at": "2024-01-01T00:00:00Z"}]'::jsonb, 'verified'),
    ('+60123456790', 'bob@example.com', 'Bob Lee', 'boost', '[{"type": "tng", "linked_at": "2024-01-01T00:00:00Z"}]'::jsonb, 'verified'),
    ('+60123456791', 'charlie@example.com', 'Charlie Wong', 'duitnow', '[]'::jsonb, 'pending')
ON CONFLICT (phone_number) DO NOTHING;

-- Insert demo transactions
INSERT INTO transactions (txn_id, user_id, amount, currency, merchant_id, merchant_name, payment_method, payment_rail, status, completed_at) VALUES
    ('TXN_001', (SELECT id FROM users WHERE phone_number = '+60123456789'), 25.50, 'MYR', 'MERCHANT_001', 'Starbucks KLCC', 'qr', 'tng', 'completed', NOW() - INTERVAL '1 hour'),
    ('TXN_002', (SELECT id FROM users WHERE phone_number = '+60123456790'), 75.00, 'MYR', 'MERCHANT_002', 'McDonald''s SS15', 'qr', 'boost', 'completed', NOW() - INTERVAL '2 hours'),
    ('TXN_003', (SELECT id FROM users WHERE phone_number = '+60123456789'), 120.00, 'MYR', 'MERCHANT_003', 'AEON Mall', 'nfc', 'duitnow', 'pending', NULL),
    ('TXN_004', (SELECT id FROM users WHERE phone_number = '+60123456791'), 45.80, 'MYR', 'PAYHACK_DEMO_001', 'PayHack Demo Merchant', 'qr', 'tng', 'completed', NOW() - INTERVAL '30 minutes')
ON CONFLICT (txn_id) DO NOTHING;

-- Insert demo QR codes
INSERT INTO qr_codes (qr_code_id, qr_type, merchant_id, amount, currency, payload, status, expires_at) VALUES
    ('QR_001', 'merchant', 'MERCHANT_001', 25.50, 'MYR', '{"merchant": "Starbucks KLCC", "ref": "QR_001"}'::jsonb, 'scanned', NOW() + INTERVAL '15 minutes'),
    ('QR_002', 'payment', 'PAYHACK_DEMO_001', 75.50, 'MYR', '{"demo": "tng-boost", "ref": "QR_002"}'::jsonb, 'active', NOW() + INTERVAL '15 minutes'),
    ('QR_003', 'merchant', 'MERCHANT_003', NULL, 'MYR', '{"merchant": "AEON Mall", "dynamic": true}'::jsonb, 'active', NOW() + INTERVAL '1 day')
ON CONFLICT (qr_code_id) DO NOTHING;

-- Insert demo plugin logs
INSERT INTO plugin_logs (transaction_id, plugin_name, plugin_version, status, input_data, output_data, execution_time_ms) VALUES
    ((SELECT id FROM transactions WHERE txn_id = 'TXN_001'), 'fx_converter', '1.0.0', 'success', '{"amount": 25.50, "from": "MYR", "to": "MYR"}'::jsonb, '{"converted_amount": 25.50, "rate": 1.0}'::jsonb, 50),
    ((SELECT id FROM transactions WHERE txn_id = 'TXN_001'), 'risk_checker', '1.0.0', 'success', '{"amount": 25.50, "user_risk_score": 10}'::jsonb, '{"risk_level": "low", "approved": true}'::jsonb, 120),
    ((SELECT id FROM transactions WHERE txn_id = 'TXN_002'), 'fx_converter', '1.0.0', 'success', '{"amount": 75.00, "from": "MYR", "to": "MYR"}'::jsonb, '{"converted_amount": 75.00, "rate": 1.0}'::jsonb, 45),
    ((SELECT id FROM transactions WHERE txn_id = 'TXN_004'), 'token_handler', '1.0.0', 'success', '{"token_type": "payment"}'::jsonb, '{"token_id": "TOK_001", "expires_at": "2024-12-31T23:59:59Z"}'::jsonb, 80);

-- Create RLS (Row Level Security) policies for better security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_tokens ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you can customize these based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON users FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable read access for all users" ON transactions FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON transactions FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable read access for all users" ON qr_codes FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON qr_codes FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable read access for all users" ON plugin_logs FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON plugin_logs FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable read access for all users" ON offline_tokens FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON offline_tokens FOR ALL USING (auth.role() = 'service_role');

-- Final verification queries
SELECT 'Database setup complete!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name; 