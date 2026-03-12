-- ============================================
-- EL CLUB DE LA COLMENA - TABLAS DE CÓDIGOS
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- TABLA: EliteCode (100 códigos Elite)
CREATE TABLE IF NOT EXISTS "EliteCode" (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  elite_number INTEGER UNIQUE NOT NULL,
  status TEXT DEFAULT 'available',
  assigned_to_bee_id TEXT,
  assigned_to_name TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: FounderCode (500 códigos Fundador)
CREATE TABLE IF NOT EXISTS "FounderCode" (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  elite_number INTEGER NOT NULL,
  founder_number INTEGER NOT NULL,
  adn_prefix TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  assigned_to_bee_id TEXT,
  assigned_to_name TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE,
  actions_granted INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_elite_code_status ON "EliteCode"(status);
CREATE INDEX IF NOT EXISTS idx_founder_code_status ON "FounderCode"(status);
CREATE INDEX IF NOT EXISTS idx_founder_elite_number ON "FounderCode"(elite_number);

-- ============================================
-- INSERTAR CÓDIGOS ELITE (100)
-- ============================================
INSERT INTO "EliteCode" (id, code, elite_number, status, created_at, updated_at)
SELECT 
  'elite-' || LPAD(i::text, 3, '0'),
  'ELITE-' || LPAD(i::text, 3, '0'),
  i,
  'available',
  NOW(),
  NOW()
FROM generate_series(1, 100) AS i
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- INSERTAR CÓDIGOS FUNDADOR BECAS (200)
-- Elite 000 - Directos del Club para Becas
-- ============================================
INSERT INTO "FounderCode" (id, code, elite_number, founder_number, adn_prefix, status, actions_granted, created_at, updated_at)
SELECT 
  'founder-000-' || LPAD(i::text, 3, '0'),
  'FUND-000-' || LPAD(i::text, 3, '0'),
  0,
  i,
  '000-' || LPAD(i::text, 3, '0'),
  'available',
  50,
  NOW(),
  NOW()
FROM generate_series(1, 200) AS i
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- INSERTAR CÓDIGOS FUNDADOR COMERCIALES (300)
-- Elites 001-100, 3 fundadores por elite
-- ============================================
INSERT INTO "FounderCode" (id, code, elite_number, founder_number, adn_prefix, status, actions_granted, created_at, updated_at)
SELECT 
  'founder-' || LPAD(e::text, 3, '0') || '-' || LPAD(f::text, 3, '0'),
  'FUND-' || LPAD(e::text, 3, '0') || '-' || LPAD(f::text, 3, '0'),
  e,
  f,
  LPAD(e::text, 3, '0') || '-' || LPAD(f::text, 3, '0'),
  'available',
  50,
  NOW(),
  NOW()
FROM generate_series(1, 100) AS e, generate_series(201, 203) AS f
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- VERIFICAR DATOS INSERTADOS
-- ============================================
SELECT 'ELITE' as tipo, COUNT(*) as total, 
       SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as disponibles
FROM "EliteCode"
UNION ALL
SELECT 'FUNDADOR' as tipo, COUNT(*) as total,
       SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as disponibles
FROM "FounderCode";

-- ============================================
-- RESULTADO ESPERADO:
-- ELITE: 100 total, 100 disponibles
-- FUNDADOR: 500 total, 500 disponibles
-- ============================================
