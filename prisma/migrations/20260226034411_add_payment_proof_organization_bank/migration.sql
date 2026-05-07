-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'bee',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Bee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "birthDate" DATETIME,
    "affiliationNumber" TEXT NOT NULL,
    "referredByCode" TEXT,
    "referredByBeeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "activationDate" DATETIME,
    "activationPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bee_referredByBeeId_fkey" FOREIGN KEY ("referredByBeeId") REFERENCES "Bee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "beeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "referenceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Action_beeId_fkey" FOREIGN KEY ("beeId") REFERENCES "Bee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GiftAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "giverBeeId" TEXT NOT NULL,
    "receiverBeeId" TEXT,
    "giftCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "activatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GiftAction_giverBeeId_fkey" FOREIGN KEY ("giverBeeId") REFERENCES "Bee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GiftAction_receiverBeeId_fkey" FOREIGN KEY ("receiverBeeId") REFERENCES "Bee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "beeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 2.0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "periodMonth" INTEGER,
    "periodYear" INTEGER,
    "referenceNumber" TEXT,
    "payerName" TEXT,
    "paymentProofImage" TEXT,
    "bcvRate" REAL,
    "amountVes" REAL,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "rejectionReason" TEXT,
    "dueDate" DATETIME,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_beeId_fkey" FOREIGN KEY ("beeId") REFERENCES "Bee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrganizationBankAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountHolder" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "rif" TEXT NOT NULL,
    "accountType" TEXT NOT NULL DEFAULT 'corriente',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "beeId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BankAccount_beeId_fkey" FOREIGN KEY ("beeId") REFERENCES "Bee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Raffle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "prizeAmount" REAL NOT NULL,
    "prizeDescription" TEXT,
    "numberOfWinners" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "scheduledDate" DATETIME NOT NULL,
    "executedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RaffleTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raffleId" TEXT NOT NULL,
    "beeId" TEXT NOT NULL,
    "ticketCount" INTEGER NOT NULL DEFAULT 1,
    "ticketNumbers" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RaffleTicket_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "Raffle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RaffleTicket_beeId_fkey" FOREIGN KEY ("beeId") REFERENCES "Bee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RaffleWinner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raffleId" TEXT NOT NULL,
    "beeId" TEXT NOT NULL,
    "prizeAmount" REAL NOT NULL,
    "prizePosition" INTEGER NOT NULL DEFAULT 1,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentReference" TEXT,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RaffleWinner_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "Raffle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RaffleWinner_beeId_fkey" FOREIGN KEY ("beeId") REFERENCES "Bee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cedula" TEXT,
    "birthDate" DATETIME,
    "grade" TEXT,
    "school" TEXT,
    "representativeName" TEXT NOT NULL,
    "representativePhone" TEXT NOT NULL,
    "representativeEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "monthlyBenefit" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rate" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'bcv',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Bee_userId_key" ON "Bee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Bee_cedula_key" ON "Bee"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "Bee_affiliationNumber_key" ON "Bee"("affiliationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "GiftAction_giftCode_key" ON "GiftAction"("giftCode");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_beeId_key" ON "BankAccount"("beeId");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");
