-- جدول ارزها (currencies)
CREATE TABLE currencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, name)
);

-- اضافه کردن فیلد status به جدول transactions
ALTER TABLE transactions 
ADD COLUMN transaction_status TEXT DEFAULT 'incomplete' 
CHECK (transaction_status IN ('incomplete', 'conditional', 'completed'));

-- بروزرسانی transaction_type برای اضافه کردن manual و loan
ALTER TABLE transactions
DROP CONSTRAINT transactions_transaction_type_check;

ALTER TABLE transactions
ADD CONSTRAINT transactions_transaction_type_check 
CHECK (transaction_type IN ('buy', 'sell', 'manual', 'loan'));

-- ایجاد index برای عملکرد بهتر
CREATE INDEX idx_currencies_user ON currencies(user_id);
CREATE INDEX idx_transactions_status ON transactions(transaction_status);

-- Row Level Security برای currencies
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own currencies"
  ON currencies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own currencies"
  ON currencies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own currencies"
  ON currencies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own currencies"
  ON currencies FOR DELETE
  USING (auth.uid() = user_id);

-- جدول جدید برای آمار ارز‌ها
CREATE TABLE currency_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  currency_id UUID REFERENCES currencies(id) ON DELETE CASCADE,
  total_transactions NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  total_received NUMERIC DEFAULT 0,
  total_remaining NUMERIC DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, currency_id)
);

CREATE INDEX idx_currency_statistics_user ON currency_statistics(user_id);

ALTER TABLE currency_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own currency statistics"
  ON currency_statistics FOR SELECT
  USING (auth.uid() = user_id);

-- یادداشت: اگر rate برای conditional است، نیاز به null باشد، میتوان این تغیر را اعمال کرد:
-- ALTER TABLE transactions ALTER COLUMN rate DROP NOT NULL;
