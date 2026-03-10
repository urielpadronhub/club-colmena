-- El Club de La Colmena - Creación de Tablas
-- Ejecutar en SQL Editor de Supabase

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT DEFAULT 'bee',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Tabla de Abejas (Socios)
CREATE TABLE IF NOT EXISTS "Bee" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "cedula" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "address" TEXT,
  "birthDate" TIMESTAMP(3),
  "memberType" TEXT DEFAULT 'formal',
  "eliteNumber" INTEGER,
  "founderNumber" INTEGER,
  "parentEliteId" TEXT,
  "parentFounderId" TEXT,
  "totalDownline" INTEGER DEFAULT 0,
  "affiliationNumber" TEXT NOT NULL,
  "referredByCode" TEXT,
  "referredByBeeId" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "activationDate" TIMESTAMP(3),
  "activationPaid" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Bee_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Bee_userId_key" ON "Bee"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Bee_cedula_key" ON "Bee"("cedula");
CREATE UNIQUE INDEX IF NOT EXISTS "Bee_affiliationNumber_key" ON "Bee"("affiliationNumber");

-- Tabla de Acciones
CREATE TABLE IF NOT EXISTS "Action" (
  "id" TEXT NOT NULL,
  "beeId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "quantity" INTEGER DEFAULT 1,
  "referenceId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- Tabla de Acciones de Regalo
CREATE TABLE IF NOT EXISTS "GiftAction" (
  "id" TEXT NOT NULL,
  "giverBeeId" TEXT NOT NULL,
  "receiverBeeId" TEXT,
  "giftCode" TEXT NOT NULL,
  "status" TEXT DEFAULT 'available',
  "activatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GiftAction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "GiftAction_giftCode_key" ON "GiftAction"("giftCode");

-- Tabla de Pagos
CREATE TABLE IF NOT EXISTS "Payment" (
  "id" TEXT NOT NULL,
  "beeId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "amount" DOUBLE PRECISION DEFAULT 2.0,
  "status" TEXT DEFAULT 'pending',
  "periodMonth" INTEGER,
  "periodYear" INTEGER,
  "paymentReference" TEXT,
  "dueDate" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- Tabla de Cuentas Bancarias
CREATE TABLE IF NOT EXISTS "BankAccount" (
  "id" TEXT NOT NULL,
  "beeId" TEXT NOT NULL,
  "bankName" TEXT NOT NULL,
  "accountType" TEXT NOT NULL,
  "accountNumber" TEXT NOT NULL,
  "cedula" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BankAccount_beeId_key" ON "BankAccount"("beeId");

-- Tabla de Sorteos
CREATE TABLE IF NOT EXISTS "Raffle" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "type" TEXT NOT NULL,
  "prizeAmount" DOUBLE PRECISION NOT NULL,
  "prizeDescription" TEXT,
  "numberOfWinners" INTEGER DEFAULT 1,
  "status" TEXT DEFAULT 'scheduled',
  "scheduledDate" TIMESTAMP(3) NOT NULL,
  "executedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Raffle_pkey" PRIMARY KEY ("id")
);

-- Tabla de Tickets de Sorteo
CREATE TABLE IF NOT EXISTS "RaffleTicket" (
  "id" TEXT NOT NULL,
  "raffleId" TEXT NOT NULL,
  "beeId" TEXT NOT NULL,
  "ticketCount" INTEGER DEFAULT 1,
  "ticketNumbers" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RaffleTicket_pkey" PRIMARY KEY ("id")
);

-- Tabla de Ganadores de Sorteo
CREATE TABLE IF NOT EXISTS "RaffleWinner" (
  "id" TEXT NOT NULL,
  "raffleId" TEXT NOT NULL,
  "beeId" TEXT NOT NULL,
  "prizeAmount" DOUBLE PRECISION NOT NULL,
  "prizePosition" INTEGER DEFAULT 1,
  "paymentStatus" TEXT DEFAULT 'pending',
  "paymentReference" TEXT,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RaffleWinner_pkey" PRIMARY KEY ("id")
);

-- Tabla de Niños Beneficiados
CREATE TABLE IF NOT EXISTS "Child" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "cedula" TEXT,
  "birthDate" TIMESTAMP(3),
  "grade" TEXT,
  "school" TEXT,
  "representativeName" TEXT NOT NULL,
  "representativePhone" TEXT NOT NULL,
  "representativeEmail" TEXT,
  "status" TEXT DEFAULT 'active',
  "monthlyBenefit" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- Tabla de Configuración
CREATE TABLE IF NOT EXISTS "Setting" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "description" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Setting_key_key" ON "Setting"("key");

-- Tabla de Log de Actividades
CREATE TABLE IF NOT EXISTS "ActivityLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "details" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys
ALTER TABLE "Bee" ADD CONSTRAINT "Bee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Bee" ADD CONSTRAINT "Bee_referredByBeeId_fkey" FOREIGN KEY ("referredByBeeId") REFERENCES "Bee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Action" ADD CONSTRAINT "Action_beeId_fkey" FOREIGN KEY ("beeId") REFERENCES "Bee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GiftAction" ADD CONSTRAINT "GiftAction_giverBeeId_fkey" FOREIGN KEY ("giverBeeId") REFERENCES "Bee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GiftAction" ADD CONSTRAINT "GiftAction_receiverBeeId_fkey" FOREIGN KEY ("receiverBeeId") REFERENCES "Bee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_beeId_fkey" FOREIGN KEY ("beeId") REFERENCES "Bee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_beeId_fkey" FOREIGN KEY ("beeId") REFERENCES "Bee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RaffleTicket" ADD CONSTRAINT "RaffleTicket_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "Raffle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RaffleTicket" ADD CONSTRAINT "RaffleTicket_beeId_fkey" FOREIGN KEY ("beeId") REFERENCES "Bee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RaffleWinner" ADD CONSTRAINT "RaffleWinner_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "Raffle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RaffleWinner" ADD CONSTRAINT "RaffleWinner_beeId_fkey" FOREIGN KEY ("beeId") REFERENCES "Bee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Insertar Usuario Admin
INSERT INTO "User" ("id", "email", "password", "name", "role", "createdAt", "updatedAt")
VALUES ('admin-id-001', 'admin@clubcolmena.org', '$2a$10$rQZ9QxZQxZQxZQxZQxZQxOZ9QxZQxZQxZQxZQxZQxZQxZQxZQxZQ', 'Administrador', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insertar Presidenta
INSERT INTO "User" ("id", "email", "password", "name", "role", "createdAt", "updatedAt")
VALUES ('presidente-id-001', 'yanixa@clubcolmena.org', '$2a$10$rQZ9QxZQxZQxZQxZQxZQxOZ9QxZQxZQxZQxZQxZQxZQxZQxZQxZQ', 'Yanixa Maribi Hernández Churinos', 'bee', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insertar Abeja Presidenta
INSERT INTO "Bee" ("id", "userId", "cedula", "phone", "memberType", "eliteNumber", "founderNumber", "affiliationNumber", "isActive", "createdAt", "updatedAt")
VALUES ('bee-presidente-001', 'presidente-id-001', 'V-00000001', '04140000001', 'presidente', 1, 1, '001-001-V-00000001', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
