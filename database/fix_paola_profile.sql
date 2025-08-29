-- Script pour corriger le profil de PAOLA
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. D'abord, vérifier l'UUID de PAOLA
SELECT id, nom, prenom, email FROM profiles WHERE email = 'paola.mariemadeleine@gmail.com';

-- 2. Mettre à jour le profil avec le numéro client manquant
UPDATE profiles 
SET 
  numero_client = '3961515267',
  code_secret = '52302',
  localisation = 'Paris, France',
  statut = 'active'
WHERE email = 'paola.mariemadeleine@gmail.com';

-- 3. Vérifier que la mise à jour a fonctionné
SELECT id, nom, prenom, email, numero_client, code_secret, localisation, statut 
FROM profiles 
WHERE email = 'paola.mariemadeleine@gmail.com';

-- 4. Si la colonne numero_client n'existe pas, la créer
-- (Exécuter seulement si l'erreur indique que la colonne n'existe pas)
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS numero_client VARCHAR(20);
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS code_secret VARCHAR(255);
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS localisation VARCHAR(255);
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS statut VARCHAR(50) DEFAULT 'active';

-- 5. Puis réexécuter la mise à jour
-- UPDATE profiles 
-- SET 
--   numero_client = '3961515267',
--   code_secret = '52302',
--   localisation = 'Paris, France',
--   statut = 'active'
-- WHERE email = 'paola.mariemadeleine@gmail.com'; 