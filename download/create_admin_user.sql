-- ============================================
-- Script para crear un usuario administrador
-- El Club de La Colmena - Supabase
-- ============================================
-- Ejecuta esto en el SQL Editor de Supabase:
-- https://supabase.com/dashboard/project/axfvkozvcctfjirhgpwo/sql/new

-- Crear usuario admin
-- Email: admin@clubcolmena.org
-- Contraseña: Colmena2025!

INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@clubcolmena.org',
  '0bd122e75055ff0432fb8553a575532336fecf963d1f562ddc2008265bff9724',
  'Administrador',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password = '0bd122e75055ff0432fb8553a575532336fecf963d1f562ddc2008265bff9724',
  role = 'admin';

-- Verificar que se creó el usuario
SELECT id, email, name, role, "createdAt" FROM "User" WHERE email = 'admin@clubcolmena.org';

-- Si quieres crear otro usuario con diferentes credenciales:
-- Cambia el email, password hash, y name según necesites
-- Para generar un nuevo hash de contraseña, usa:
-- echo -n "tu_contraseña" | sha256sum
