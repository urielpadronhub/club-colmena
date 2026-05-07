# 🏗️ Módulo de Proyectos Institucionales

## Visión General

Sistema para gestionar contratos con gobernaciones y alcaldías, entregando **obras terminadas** en lugar de dinero, integrando a los beneficiarios al Club de La Colmena.

---

## 📊 Modelo de Base de Datos

### Nuevas Tablas

```sql
-- ============================================
-- 1. INSTITUCIONES (Gobiernos clientes)
-- ============================================
CREATE TABLE Institution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,              -- "Gobernación de Miranda"
  type VARCHAR(50) NOT NULL,               -- 'governor', 'mayor', 'ministry'
  region VARCHAR(100),                     -- "Miranda", "Caracas"
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  contact_name VARCHAR(255),               -- Persona de contacto principal
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',     -- 'active', 'inactive', 'pending'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PROYECTOS (Obras/Contratos)
-- ============================================
CREATE TABLE Project (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES Institution(id),
  
  -- Información básica
  title VARCHAR(255) NOT NULL,             -- "Reparación Escuela Bolívar"
  description TEXT,                        -- Descripción detallada
  category VARCHAR(100),                   -- 'education', 'health', 'infrastructure', 'sports'
  
  -- Ubicación
  location_address TEXT,
  location_region VARCHAR(100),
  location_coords VARCHAR(100),            -- Latitud,Longitud
  
  -- Presupuesto
  budget_approved DECIMAL(15,2),           -- Monto aprobado por el gobierno
  budget_spent DECIMAL(15,2) DEFAULT 0,    -- Monto ejecutado
  currency VARCHAR(10) DEFAULT 'USD',
  
  -- Fechas
  date_approved DATE,
  date_start DATE,
  date_end_planned DATE,                   -- Fecha planificada
  date_end_actual DATE,                    -- Fecha real de terminación
  
  -- Estado
  status VARCHAR(50) DEFAULT 'planning',   -- 'planning', 'approved', 'in_progress', 
                                            -- 'completed', 'paused', 'cancelled'
  progress_percentage INTEGER DEFAULT 0,   -- 0-100
  
  -- Integración con el Club
  beneficiaries_count INTEGER DEFAULT 0,   -- Personas integradas al Club
  members_integrated INTEGER DEFAULT 0,    -- Socios generados
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. AVANCES DEL PROYECTO
-- ============================================
CREATE TABLE ProjectProgress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES Project(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,             -- "Instalación de techos"
  description TEXT,
  progress_type VARCHAR(50),               -- 'milestone', 'payment', 'inspection', 'issue'
  
  percentage_before INTEGER,               -- 25%
  percentage_after INTEGER,                -- 35%
  
  amount_spent DECIMAL(15,2),              -- Si aplica un gasto
  
  notes TEXT,
  created_by UUID REFERENCES "User"(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. EVIDENCIAS (Fotos, documentos)
-- ============================================
CREATE TABLE ProjectEvidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES Project(id) ON DELETE CASCADE,
  progress_id UUID REFERENCES ProjectProgress(id),
  
  type VARCHAR(50) NOT NULL,               -- 'photo', 'document', 'video', 'receipt'
  title VARCHAR(255),
  description TEXT,
  file_url TEXT NOT NULL,                  -- URL del archivo
  file_name VARCHAR(255),
  file_size INTEGER,
  
  is_public BOOLEAN DEFAULT false,         -- Visible para ciudadanos
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. BENEFICIARIOS DEL PROYECTO
-- ============================================
CREATE TABLE ProjectBeneficiary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES Project(id) ON DELETE CASCADE,
  bee_id UUID REFERENCES Bee(id),          -- Si ya es socio del Club
  
  -- Datos del beneficiario
  name VARCHAR(255) NOT NULL,
  cedula VARCHAR(50),
  phone VARCHAR(50),
  email VARCHAR(255),
  role VARCHAR(100),                       -- 'student', 'teacher', 'worker', 'family'
  
  -- Integración al Club
  integrated_to_club BOOLEAN DEFAULT false,
  integration_date DATE,
  referral_code VARCHAR(50),               -- Código ADN asignado
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. CONTRATOS
-- ============================================
CREATE TABLE Contract (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES Project(id),
  institution_id UUID REFERENCES Institution(id),
  
  contract_number VARCHAR(100) NOT NULL,   -- "CONT-2025-001"
  title VARCHAR(255),
  
  -- Partes
  party_a VARCHAR(255) NOT NULL,           -- Gobierno/Gobernación
  party_b VARCHAR(255) NOT NULL,           -- Asociación Club de La Colmena
  
  -- Términos
  total_amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Estado
  status VARCHAR(50) DEFAULT 'draft',      -- 'draft', 'signed', 'active', 'completed', 'cancelled'
  
  -- Archivos
  contract_file_url TEXT,                  -- PDF del contrato
  
  -- Firmas
  signed_by_a_at TIMESTAMPTZ,              -- Fecha firma gobierno
  signed_by_b_at TIMESTAMPTZ,              -- Fecha firma asociación
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. PAGOS/PRESUPUESTO
-- ============================================
CREATE TABLE ProjectPayment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES Project(id),
  contract_id UUID REFERENCES Contract(id),
  
  payment_number INTEGER,                  -- Pago #1, #2, etc.
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  
  concept TEXT,                            -- Concepto del pago
  
  -- Estado
  status VARCHAR(50) DEFAULT 'pending',    -- 'pending', 'approved', 'paid', 'cancelled'
  
  -- Fechas
  date_requested DATE,
  date_approved DATE,
  date_paid DATE,
  
  -- Comprobantes
  receipt_url TEXT,
  approved_by UUID REFERENCES "User"(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. USUARIOS INSTITUCIONALES
-- ============================================
CREATE TABLE InstitutionUser (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES Institution(id),
  user_id UUID REFERENCES "User"(id),
  
  role VARCHAR(50) DEFAULT 'viewer',       -- 'admin', 'editor', 'viewer'
  permissions JSONB,                       -- Permisos específicos
  
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'pending',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA RENDIMIENTO
-- ============================================
CREATE INDEX idx_project_institution ON Project(institution_id);
CREATE INDEX idx_project_status ON Project(status);
CREATE INDEX idx_project_category ON Project(category);
CREATE INDEX idx_progress_project ON ProjectProgress(project_id);
CREATE INDEX idx_evidence_project ON ProjectEvidence(project_id);
CREATE INDEX idx_beneficiary_project ON ProjectBeneficiary(project_id);
CREATE INDEX idx_contract_institution ON Contract(institution_id);
CREATE INDEX idx_payment_project ON ProjectPayment(project_id);
```

---

## 🔌 API Endpoints

### Instituciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/institutions` | Lista instituciones |
| POST | `/api/institutions` | Crear institución |
| GET | `/api/institutions/:id` | Detalle de institución |
| PUT | `/api/institutions/:id` | Actualizar institución |

### Proyectos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/projects` | Lista proyectos |
| POST | `/api/projects` | Crear proyecto |
| GET | `/api/projects/:id` | Detalle de proyecto |
| PUT | `/api/projects/:id` | Actualizar proyecto |
| GET | `/api/projects/:id/progress` | Avances del proyecto |
| POST | `/api/projects/:id/progress` | Agregar avance |
| GET | `/api/projects/:id/evidence` | Evidencias |
| POST | `/api/projects/:id/evidence` | Subir evidencia |
| GET | `/api/projects/:id/beneficiaries` | Beneficiarios |
| POST | `/api/projects/:id/beneficiaries` | Agregar beneficiario |

### Contratos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/contracts` | Lista contratos |
| POST | `/api/contracts` | Crear contrato |
| GET | `/api/contracts/:id` | Detalle de contrato |
| PUT | `/api/contracts/:id` | Actualizar contrato |

### Portal Público (Transparencia)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/public/projects` | Proyectos públicos |
| GET | `/api/public/projects/:id` | Detalle público |
| GET | `/api/public/institutions/:id/stats` | Estadísticas |

---

## 🖥️ Interfaces de Usuario

### 1. Panel Admin (Club de La Colmena)

```
/admin/projects
├── Dashboard de proyectos
│   ├── Resumen por estado
│   ├── Presupuesto total vs ejecutado
│   ├── Beneficiarios integrados
│   └── Próximos vencimientos
│
├── Lista de Instituciones
│   ├── Gobernaciones
│   ├── Alcaldías
│   └── Ministerios
│
├── Gestión de Proyectos
│   ├── Crear/Editar proyectos
│   ├── Subir avances y evidencias
│   ├── Gestionar beneficiarios
│   └── Reportes
│
└── Contratos
    ├── Lista de contratos
    ├── Firma digital
    └── Pagos
```

### 2. Portal de Instituciones (Gobiernos)

```
/institution/dashboard
├── Resumen de proyectos
├── Estado de obras
├── Evidencias fotográficas
├── Reportes de transparencia
└── Descarga de documentos
```

### 3. Portal Ciudadano (Transparencia)

```
/public/transparency
├── Mapa de proyectos
├── Estado de obras en tu zona
├── Fotos de avances
└── Denuncias/Comentarios
```

---

## 🔄 Flujos de Trabajo

### Flujo 1: Crear Proyecto

```
Gobierno contacta a la Asociación
        ↓
Reunión de evaluación
        ↓
Propuesta de proyecto (Admin crea en sistema)
        ↓
Aprobación del gobierno
        ↓
Firma de contrato
        ↓
Inicio de obra
        ↓
Seguimiento con evidencias
        ↓
Integración de beneficiarios al Club
        ↓
Entrega de obra terminada
        ↓
Informe final
```

### Flujo 2: Reporte de Avance

```
Supervisor en obra toma fotos
        ↓
Sube al sistema con descripción
        ↓
Sistema actualiza porcentaje
        ↓
Notificación a institución
        ↓
Visible en portal ciudadano
```

---

## 📱 Notificaciones

- **Email** a institución cuando hay nuevo avance
- **WhatsApp** a supervisores de obra
- **Alertas** de proyectos próximos a vencer
- **Reportes** semanales automáticos

---

## 📈 Métricas y Reportes

### Para la Asociación
- Total de proyectos activos
- Presupuesto gestionado
- Beneficiarios integrados al Club
- Nuevos socios generados
- Tiempo promedio de ejecución

### Para Instituciones
- Avance por proyecto
- Presupuesto ejecutado
- Evidencias fotográficas
- Cumplimiento de plazos

### Para Ciudadanos
- Obras en su zona
- Estado de proyectos
- Transparencia de gastos

---

## 🚀 Fases de Implementación

### Fase 1: Fundamentos
- [ ] Tablas de base de datos
- [ ] APIs básicas CRUD
- [ ] Panel admin de proyectos

### Fase 2: Gestión Completa
- [ ] Sistema de evidencias (fotos)
- [ ] Gestión de beneficiarios
- [ ] Integración con códigos ADN

### Fase 3: Portal Institucional
- [ ] Login para gobiernos
- [ ] Dashboard por institución
- [ ] Descarga de reportes

### Fase 4: Transparencia Ciudadana
- [ ] Portal público
- [ ] Mapa interactivo
- [ ] Notificaciones

---

## 💡 Consideraciones Técnicas

### Almacenamiento de Archivos
- Usar Supabase Storage para fotos y documentos
- Thumbnails automáticos para galería
- URLs firmadas para seguridad

### Seguridad
- RLS (Row Level Security) en Supabase
- Usuarios institucionales con permisos limitados
- Auditoría de cambios

### Rendimiento
- Índices en columnas frecuentes
- Paginación en listas largas
- Cache de estadísticas

---

*Documento preparado para el Club de La Colmena - 2025*
