-- Script pour corriger la table virements
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier la structure actuelle de la table virements
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'virements' 
ORDER BY ordinal_position;

-- 2. Ajouter la colonne iban_destinataire si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'virements' AND column_name = 'iban_destinataire'
    ) THEN
        ALTER TABLE virements ADD COLUMN iban_destinataire VARCHAR(34);
        RAISE NOTICE 'Colonne iban_destinataire ajoutée';
    ELSE
        RAISE NOTICE 'Colonne iban_destinataire existe déjà';
    END IF;
END $$;

-- 3. Mettre à jour les statuts existants si nécessaire
UPDATE virements 
SET statut = 'en_validation' 
WHERE statut = 'pending';

-- 4. Vérifier le résultat
SELECT id, montant, statut, date_virement, iban_destinataire 
FROM virements 
ORDER BY date_virement DESC 
LIMIT 5; 