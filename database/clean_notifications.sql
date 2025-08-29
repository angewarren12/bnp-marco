-- Script pour nettoyer les notifications incorrectes
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Supprimer les notifications incorrectes
DELETE FROM notifications 
WHERE message LIKE '%Compte débloqué%' 
   OR message LIKE '%frais post-déblocage%'
   OR message LIKE '%5000€%';

-- 2. Vérifier les notifications restantes
SELECT id, titre, message, type, date_creation 
FROM notifications 
ORDER BY date_creation DESC 
LIMIT 10;

-- 3. Ajouter des notifications correctes pour PAOLA
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Récupérer l'UUID de PAOLA
    SELECT id INTO user_uuid FROM profiles WHERE email = 'paola.mariemadeleine@gmail.com';
    
    -- Ajouter des notifications correctes
    INSERT INTO notifications (titre, message, type, user_id, lu, date_creation) VALUES
    ('Bienvenue sur votre espace client', 'Votre compte est maintenant actif. Profitez de tous nos services en ligne.', 'info', user_uuid, false, NOW()),
    ('Carte Visa Infinite activée', 'Votre carte Visa Infinite a été activée avec succès. Limite disponible : 100000€.', 'success', user_uuid, false, NOW()),
    ('Conseiller disponible', 'Votre conseiller Marie D. est disponible pour un rendez-vous.', 'info', user_uuid, false, NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Notifications ajoutées pour l''utilisateur: %', user_uuid;
END $$;

-- 4. Vérifier le résultat
SELECT id, titre, message, type, date_creation 
FROM notifications 
ORDER BY date_creation DESC 
LIMIT 10; 