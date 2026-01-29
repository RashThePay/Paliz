-- جدول موجودی‌ها (balances)
CREATE TABLE balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  currency_id UUID REFERENCES currencies(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, currency_id)
);

-- Index برای عملکرد بهتر
CREATE INDEX idx_balances_user ON balances(user_id);
CREATE INDEX idx_balances_currency ON balances(currency_id);

-- Row Level Security
ALTER TABLE balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own balances"
  ON balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own balances"
  ON balances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own balances"
  ON balances FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own balances"
  ON balances FOR DELETE
  USING (auth.uid() = user_id);
