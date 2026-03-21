ALTER TABLE "SalaryRecord"
ADD COLUMN "importSource" TEXT,
ADD COLUMN "importHash" TEXT,
ADD COLUMN "externalTransactionId" TEXT;

CREATE UNIQUE INDEX "SalaryRecord_importHash_key" ON "SalaryRecord"("importHash");
