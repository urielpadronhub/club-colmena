-- ============================================
-- SCRIPT SQL PARA CREAR TABLAS DEL MÓDULO DE PROYECTOS
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================

-- 1. TABLA DE INSTITUCIONES
CREATE TABLE IF NOT EXISTS Institution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  region VARCHAR(100),
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  contact_name VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE PROYECTOS
CREATE TABLE IF NOT EXISTS Project (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES Institution(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  location_address TEXT,
  location_region VARCHAR(100),
  location_coords VARCHAR(100),
  budget_approved DECIMAL(15,2),
  budget_spent DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  date_approved DATE,
  date_start DATE,
  date_end_planned DATE,
  date_end_actual DATE,
  status VARCHAR(50) DEFAULT 'planning',
  progress_percentage INTEGER DEFAULT 0,
  beneficiaries_count INTEGER DEFAULT 0,
  members_integrated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE AVANCES
CREATE TABLE IF NOT EXISTS ProjectProgress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES Project(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  progress_type VARCHAR(50),
  percentage_before INTEGER,
  percentage_after INTEGER,
  amount_spent DECIMAL(15,2),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE EVIDENCIAS
CREATE TABLE IF NOT EXISTS ProjectEvidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES Project(id) ON DELETE CASCADE,
  progress_id UUID REFERENCES ProjectProgress(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE BENEFICIARIOS
CREATE TABLE IF NOT EXISTS ProjectBeneficiary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES Project(id) ON DELETE CASCADE,
  bee_id UUID,
  name VARCHAR(255) NOT NULL,
  cedula VARCHAR(50),
  phone VARCHAR(50),
  email VARCHAR(255),
  role VARCHAR(100),
  integrated_to_club BOOLEAN DEFAULT false,
  integration_date DATE,
  referral_code VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE CONTRATOS
CREATE TABLE IF NOT EXISTS Contract (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES Project(id),
  institution_id UUID REFERENCES Institution(id),
  contract_number VARCHAR(100) NOT NULL,
  title VARCHAR(255),
  party_a VARCHAR(255) NOT NULL,
  party_b VARCHAR(255) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  contract_file_url TEXT,
  signed_by_a_at TIMESTAMPTZ,
  signed_by_b_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA DE PAGOS
CREATE TABLE IF NOT EXISTS ProjectPayment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES Project(id),
  contract_id UUID REFERENCES Contract(id),
  payment_number INTEGER,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  concept TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  date_requested DATE,
  date_approved DATE,
  date_paid DATE,
  receipt_url TEXT,
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA DE USUARIOS INSTITUCIONALES
CREATE TABLE IF NOT EXISTS InstitutionUser (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES Institution(id),
  user_id UUID,
  role VARCHAR(50) DEFAULT 'viewer',
  permissions JSONB,
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- ============================================
CREATE INDEX IF NOT EXISTS idx_project_institution ON Project(institution_id);
CREATE INDEX IF NOT EXISTS idx_project_status ON Project(status);
CREATE INDEX IF NOT EXISTS idx_project_category ON Project(category);
CREATE INDEX IF NOT EXISTS idx_progress_project ON ProjectProgress(project_id);
CREATE INDEX IF NOT EXISTS idx_evidence_project ON ProjectEvidence(project_id);
CREATE INDEX IF NOT EXISTS idx_beneficiary_project ON ProjectBeneficiary(project_id);
CREATE INDEX IF NOT EXISTS idx_contract_institution ON Contract(institution_id);
CREATE INDEX IF NOT EXISTS idx_payment_project ON ProjectPayment(project_id);

-- ============================================
-- HABILITAR RLS (ROW LEVEL SECURITY)
-- ============================================
ALTER TABLE Institution ENABLE ROW LEVEL SECURITY;
ALTER TABLE Project ENABLE ROW LEVEL SECURITY;
ALTER TABLE ProjectProgress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ProjectEvidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE ProjectBeneficiary ENABLE ROW LEVEL SECURITY;
ALTER TABLE Contract ENABLE ROW LEVEL SECURITY;
ALTER TABLE ProjectPayment ENABLE ROW LEVEL SECURITY;
ALTER TABLE InstitutionUser ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir todo (ajustar según necesidad)
CREATE POLICY "Allow all for authenticated users" ON Institution FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON Project FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON ProjectProgress FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON ProjectEvidence FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON ProjectBeneficiary FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON Contract FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON ProjectPayment FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON InstitutionUser FOR ALL USING (true);

-- ============================================
-- LISTO! 🎉
-- ============================================
-- Las tablas están creadas y listas para usar.
-- Accede a: /admin/projects para gestionar proyectos.
