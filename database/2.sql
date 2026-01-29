-- جدول جدید برای پرداخت‌ها
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card_to_card', 'pos')),
  payment_date TEXT NOT NULL, -- تاریخ شمسی
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index برای سرعت
CREATE INDEX idx_payments_transaction ON payments(transaction_id);

-- RLS Policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payments for their transactions"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = payments.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert payments for their transactions"
  ON payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = payments.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update payments for their transactions"
  ON payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = payments.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete payments for their transactions"
  ON payments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = payments.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

-- Function برای آپدیت خودکار amount_received
CREATE OR REPLACE FUNCTION update_transaction_received_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE transactions
  SET amount_received = (
    SELECT COALESCE(SUM(amount), 0)
    FROM payments
    WHERE transaction_id = COALESCE(NEW.transaction_id, OLD.transaction_id)
  )
  WHERE id = COALESCE(NEW.transaction_id, OLD.transaction_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger برای محاسبه خودکار
CREATE TRIGGER update_received_on_payment_insert
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_received_amount();

CREATE TRIGGER update_received_on_payment_update
  AFTER UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_received_amount();

CREATE TRIGGER update_received_on_payment_delete
  AFTER DELETE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_received_amount();