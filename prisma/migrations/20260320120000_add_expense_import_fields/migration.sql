ALTER TABLE "Expense"
ADD COLUMN "importSource" TEXT,
ADD COLUMN "importHash" TEXT,
ADD COLUMN "externalTransactionId" TEXT;

CREATE UNIQUE INDEX "Expense_importHash_key" ON "Expense"("importHash");