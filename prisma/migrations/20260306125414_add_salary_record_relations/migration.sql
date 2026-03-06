-- CreateTable
CREATE TABLE "SalaryRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "minimumWage" DECIMAL(10,2) NOT NULL,
    "salary" DECIMAL(10,2) NOT NULL,
    "period" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SalaryRecord_userId_idx" ON "SalaryRecord"("userId");

-- AddForeignKey
ALTER TABLE "SalaryRecord" ADD CONSTRAINT "SalaryRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
