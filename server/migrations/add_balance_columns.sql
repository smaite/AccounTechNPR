-- Add outstandingBalance columns to customers and suppliers tables
ALTER TABLE customers ADD COLUMN outstanding_balance TEXT NOT NULL DEFAULT '0';
ALTER TABLE suppliers ADD COLUMN outstanding_balance TEXT NOT NULL DEFAULT '0';
