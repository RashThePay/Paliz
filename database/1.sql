-- جدول مشتریان
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL
);

-- جدول معاملات
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  -- اطلاعات معامله
  transaction_date TEXT NOT NULL, -- تاریخ شمسی به صورت string مثل "1404/11/05"
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  
  -- اطلاعات مالی
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  rate NUMERIC NOT NULL,
  total_value NUMERIC GENERATED ALWAYS AS (amount * rate) STORED,
  
  -- وضعیت
  goods_delivered BOOLEAN DEFAULT false,
  payment_received BOOLEAN DEFAULT false,
  amount_received NUMERIC DEFAULT 0,
  amount_remaining NUMERIC GENERATED ALWAYS AS ((amount * rate) - COALESCE(amount_received, 0)) STORED,
  
  -- توضیحات
  description TEXT,
  
  -- تاریخ‌های سیستمی
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- جدول تاریخچه تغییرات
CREATE TABLE transaction_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index ها برای سرعت
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_customers_user ON customers(user_id);

-- Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_updates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own customers"
  ON customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customers"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers"
  ON customers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers"
  ON customers FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view updates for their transactions"
  ON transaction_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_updates.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert updates for their transactions"
  ON transaction_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_updates.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

-- Function برای بروزرسانی updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();