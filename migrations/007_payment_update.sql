-- Adjusting the payments table for manual UPI flow

-- Drop constraints related to razorpay which might make manual submission fail
ALTER TABLE payments ALTER COLUMN razorpay_order_id DROP NOT NULL;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_razorpay_order_id_key;

-- We don't strictly need to drop the constraint on razorpay_payment_id if we aren't adding a row with a null value, but it's safe to drop uniqueness if multiple might have NULL, wait Postgres ignores NULLs for unique sometimes, let's just make sure.
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_razorpay_payment_id_key;

-- Add new columns for manual payment tracking
ALTER TABLE payments ADD COLUMN IF NOT EXISTS upi_transaction_id VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- Add uniqueness safely to upi_transaction_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'payments_upi_transaction_id_key'
    ) THEN
        ALTER TABLE payments ADD CONSTRAINT payments_upi_transaction_id_key UNIQUE (upi_transaction_id);
    END IF;
END $$;
