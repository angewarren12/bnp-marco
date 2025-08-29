-- Script d'initialisation de la base de données BNP Paribas
-- À exécuter dans l'éditeur SQL de Supabase

-- IMPORTANT: Créez d'abord un utilisateur dans Supabase Auth via le dashboard
-- ou via l'API, puis remplacez l'UUID ci-dessous par l'UUID réel de l'utilisateur

-- Pour créer un utilisateur via SQL (si vous avez les permissions admin):
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token)
-- VALUES (
--   gen_random_uuid(),
--   'jean.dupont@example.com',
--   crypt('12345', gen_salt('bf')),
--   now(),
--   now(),
--   now(),
--   '{"provider":"email","providers":["email"]}',
--   '{"nom":"Dupont","prenom":"Jean","numero_client":"3961515267"}',
--   false,
--   '',
--   '',
--   '',
--   ''
-- );

-- UUID de l'utilisateur de test (remplacez par l'UUID réel de votre utilisateur)
-- Vous pouvez récupérer cet UUID depuis le dashboard Supabase > Authentication > Users
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Récupérer l'UUID de l'utilisateur par email
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'jean.dupont@example.com';
    
    -- Si l'utilisateur n'existe pas, utiliser un UUID par défaut pour la démo
    IF user_uuid IS NULL THEN
        user_uuid := '00000000-0000-0000-0000-000000000000';
        RAISE NOTICE 'Utilisateur non trouvé, utilisation de l''UUID par défaut: %', user_uuid;
    ELSE
        RAISE NOTICE 'Utilisateur trouvé avec UUID: %', user_uuid;
    END IF;

-- Table des profils utilisateurs (extension de auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telephone VARCHAR(20),
  date_naissance DATE,
  adresse TEXT,
  ville VARCHAR(100),
  code_postal VARCHAR(10),
  pays VARCHAR(100) DEFAULT 'France',
  numero_client VARCHAR(20) UNIQUE NOT NULL,
  code_secret VARCHAR(255) NOT NULL,
  derniere_connexion TIMESTAMP,
  localisation VARCHAR(255),
  statut VARCHAR(50) DEFAULT 'active',
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  date_creation TIMESTAMP DEFAULT NOW(),
  date_modification TIMESTAMP DEFAULT NOW()
);

-- Table des comptes
CREATE TABLE IF NOT EXISTS comptes (
  id SERIAL PRIMARY KEY,
  type VARCHAR(100) NOT NULL,
  numero VARCHAR(50) NOT NULL,
  solde DECIMAL(10,2) NOT NULL DEFAULT 0,
  devise VARCHAR(3) DEFAULT 'EUR',
  couleur VARCHAR(7) DEFAULT '#008854',
  iban VARCHAR(34) NOT NULL,
  statut VARCHAR(50) DEFAULT 'active',
  limite_credit DECIMAL(10,2),
  taux_interet DECIMAL(5,2) DEFAULT 0,
  date_ouverture DATE DEFAULT CURRENT_DATE,
  user_id UUID REFERENCES auth.users(id),
  date_creation TIMESTAMP DEFAULT NOW()
);

-- Table des bénéficiaires
CREATE TABLE IF NOT EXISTS beneficiaires (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  iban VARCHAR(34) NOT NULL,
  bic VARCHAR(11) NOT NULL,
  banque VARCHAR(255),
  alias VARCHAR(255),
  type VARCHAR(50) DEFAULT 'particulier',
  date_creation TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Table des transactions
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'credit' ou 'debit'
  montant DECIMAL(10,2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  categorie VARCHAR(100) NOT NULL,
  date_transaction DATE NOT NULL,
  heure_transaction TIME NOT NULL,
  icone VARCHAR(100),
  localisation VARCHAR(255),
  statut VARCHAR(50) DEFAULT 'completed',
  reference VARCHAR(100),
  compte_id INTEGER REFERENCES comptes(id),
  user_id UUID REFERENCES auth.users(id),
  date_creation TIMESTAMP DEFAULT NOW()
);

-- Table des cartes bancaires
CREATE TABLE IF NOT EXISTS cartes (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'Visa', 'Mastercard', etc.
  numero VARCHAR(50) NOT NULL,
  titulaire VARCHAR(255) NOT NULL,
  date_expiration VARCHAR(5) NOT NULL, -- 'MM/YY'
  cvv VARCHAR(3) NOT NULL,
  statut VARCHAR(50) DEFAULT 'active',
  solde DECIMAL(10,2) DEFAULT 0,
  limite DECIMAL(10,2) NOT NULL,
  couleur VARCHAR(100),
  logo VARCHAR(100),
  fonctionnalites TEXT[], -- Array des fonctionnalités
  derniere_transaction VARCHAR(255),
  date_derniere_transaction VARCHAR(100),
  compte_id INTEGER REFERENCES comptes(id),
  user_id UUID REFERENCES auth.users(id),
  date_creation TIMESTAMP DEFAULT NOW()
);

-- Table des virements
CREATE TABLE IF NOT EXISTS virements (
  id SERIAL PRIMARY KEY,
  montant DECIMAL(10,2) NOT NULL,
  beneficiaire_id INTEGER REFERENCES beneficiaires(id),
  compte_source_id INTEGER REFERENCES comptes(id),
  motif VARCHAR(255),
  statut VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  reference VARCHAR(100),
  frais DECIMAL(10,2) DEFAULT 0,
  date_virement TIMESTAMP DEFAULT NOW(),
  date_execution TIMESTAMP,
  user_id UUID REFERENCES auth.users(id)
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS paiements (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'mobile', 'transport', 'energie', 'internet'
  montant DECIMAL(10,2) NOT NULL,
  operateur VARCHAR(100),
  numero VARCHAR(50),
  reference VARCHAR(100),
  statut VARCHAR(50) DEFAULT 'pending',
  compte_source_id INTEGER REFERENCES comptes(id),
  user_id UUID REFERENCES auth.users(id),
  date_creation TIMESTAMP DEFAULT NOW()
);

-- Table des recharges
CREATE TABLE IF NOT EXISTS recharges (
  id SERIAL PRIMARY KEY,
  service VARCHAR(50) NOT NULL, -- 'mobile', 'transport', 'energie', 'internet'
  montant DECIMAL(10,2) NOT NULL,
  operateur VARCHAR(100),
  numero VARCHAR(50),
  reference VARCHAR(100),
  statut VARCHAR(50) DEFAULT 'pending',
  compte_source_id INTEGER REFERENCES comptes(id),
  user_id UUID REFERENCES auth.users(id),
  date_creation TIMESTAMP DEFAULT NOW()
);

-- Table des épargnes
CREATE TABLE IF NOT EXISTS epargnes (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'Livret A', 'LDDS', 'PEA', 'Assurance Vie'
  montant DECIMAL(10,2) NOT NULL,
  taux_interet DECIMAL(5,2),
  plafond DECIMAL(10,2),
  compte_source_id INTEGER REFERENCES comptes(id),
  duree INTEGER, -- en mois
  statut VARCHAR(50) DEFAULT 'active',
  user_id UUID REFERENCES auth.users(id),
  date_creation TIMESTAMP DEFAULT NOW()
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'security', 'transaction', 'info', 'warning'
  lu BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id),
  date_creation TIMESTAMP DEFAULT NOW()
);

-- Table des sessions de connexion
CREATE TABLE IF NOT EXISTS sessions_connexion (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  localisation VARCHAR(255),
  statut VARCHAR(50) DEFAULT 'active',
  date_connexion TIMESTAMP DEFAULT NOW(),
  date_deconnexion TIMESTAMP
);

-- Table des tentatives de connexion
CREATE TABLE IF NOT EXISTS tentatives_connexion (
  id SERIAL PRIMARY KEY,
  numero_client VARCHAR(20),
  ip_address INET,
  user_agent TEXT,
  statut VARCHAR(50), -- 'success', 'failed', 'locked'
  raison VARCHAR(255),
  date_tentative TIMESTAMP DEFAULT NOW()
);

-- Table des conseillers clients
CREATE TABLE IF NOT EXISTS conseillers (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telephone VARCHAR(20) NOT NULL,
  role VARCHAR(100) DEFAULT 'Conseiller Client',
  avatar_url TEXT,
  statut VARCHAR(50) DEFAULT 'active',
  specialite VARCHAR(100),
  date_creation TIMESTAMP DEFAULT NOW()
);

-- Table des conversations avec les conseillers
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  conseiller_id INTEGER REFERENCES conseillers(id),
  sujet VARCHAR(255),
  statut VARCHAR(50) DEFAULT 'open', -- 'open', 'closed', 'pending'
  date_creation TIMESTAMP DEFAULT NOW(),
  date_fermeture TIMESTAMP
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id),
  expediteur_type VARCHAR(20) NOT NULL, -- 'user' ou 'conseiller'
  expediteur_id UUID, -- user_id ou conseiller_id
  contenu TEXT NOT NULL,
  lu BOOLEAN DEFAULT FALSE,
  date_creation TIMESTAMP DEFAULT NOW()
);

-- Données de test pour les profils (utilisateur de démo)
INSERT INTO profiles (id, nom, prenom, email, telephone, numero_client, code_secret, localisation) VALUES
(user_uuid, 'Dupont', 'Jean', 'jean.dupont@example.com', '01 42 34 56 78', '3961515267', '$2a$10$hashed_password_12345', 'Paris, France')
ON CONFLICT (id) DO NOTHING;

-- Données de test pour les comptes
INSERT INTO comptes (type, numero, solde, devise, couleur, iban, statut, user_id) VALUES
('Compte Principal', '**** 1240', 1847.50, 'EUR', '#008854', 'FR76 3000 1000 1234 5678 9012 345', 'active', user_uuid),
('Épargne en ligne', '**** 5678', 1000.00, 'EUR', '#FF6B35', 'FR76 3000 1000 1234 5678 9012 346', 'active', user_uuid)
ON CONFLICT DO NOTHING;

-- Données de test pour les bénéficiaires
INSERT INTO beneficiaires (nom, prenom, email, iban, bic, banque, alias, type, user_id) VALUES
('Dupont', 'Marie', 'marie.dupont@example.com', 'FR76 3000 1000 1234 5678 9012 345', 'BNPAFRPPXXX', 'BNP Paribas', 'Marie D.', 'particulier', user_uuid),
('Martin', 'Pierre', 'pierre.martin@example.com', 'FR76 3000 1000 9876 5432 1098 765', 'BNPAFRPPXXX', 'BNP Paribas', 'Pierre M.', 'particulier', user_uuid),
('Entreprise', 'SARL', 'contact@entreprise.com', 'FR76 3000 1000 1111 2222 3333 444', 'BNPAFRPPXXX', 'BNP Paribas', 'Mon Entreprise', 'professionnel', user_uuid)
ON CONFLICT DO NOTHING;

-- Données de test pour les transactions
INSERT INTO transactions (type, montant, description, categorie, date_transaction, heure_transaction, icone, localisation, statut, compte_id, user_id) VALUES
('debit', -45.20, 'Carrefour', 'Courses', '2024-01-15', '14:30:00', 'fas fa-shopping-cart', 'Paris, France', 'completed', 1, user_uuid),
('credit', 2500.00, 'Salaire', 'Revenus', '2024-01-10', '09:15:00', 'fas fa-briefcase', 'Entreprise SA', 'completed', 1, user_uuid),
('debit', -120.00, 'EDF', 'Factures', '2024-01-08', '11:45:00', 'fas fa-bolt', 'EDF France', 'pending', 1, user_uuid),
('debit', -89.99, 'Amazon', 'Shopping', '2024-01-05', '16:20:00', 'fas fa-box', 'Amazon France', 'completed', 1, user_uuid),
('credit', 500.00, 'Virement', 'Transfert', '2024-01-03', '13:10:00', 'fas fa-dollar-sign', 'Compte externe', 'completed', 1, user_uuid),
('debit', -35.50, 'McDonald''s', 'Restaurant', '2024-01-12', '19:30:00', 'fas fa-utensils', 'Paris, France', 'completed', 1, user_uuid),
('credit', 150.00, 'Remboursement', 'Revenus', '2024-01-11', '10:20:00', 'fas fa-hand-holding-usd', 'Assurance', 'completed', 1, user_uuid),
('debit', -65.00, 'Total', 'Essence', '2024-01-09', '16:45:00', 'fas fa-gas-pump', 'Paris, France', 'completed', 1, user_uuid)
ON CONFLICT DO NOTHING;

-- Données de test pour les cartes
INSERT INTO cartes (type, numero, titulaire, date_expiration, cvv, statut, solde, limite, couleur, logo, fonctionnalites, derniere_transaction, date_derniere_transaction, compte_id, user_id) VALUES
('Visa', '**** **** **** 1234', 'Jean Dupont', '12/25', '123', 'active', 1847.50, 5000, 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '💳', ARRAY['Paiement sans contact', 'Paiement en ligne', 'Retraits ATM'], 'Carrefour - 45,20€', 'Aujourd''hui 14:30', 1, user_uuid),
('Mastercard', '**** **** **** 5678', 'Jean Dupont', '08/26', '456', 'inactive', 0, 3000, 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', '💳', ARRAY['Paiement sans contact', 'Paiement en ligne'], 'Aucune transaction récente', '-', 1, user_uuid),
('Visa Business', '**** **** **** 9012', 'Jean Dupont', '03/27', '789', 'active', 2500.00, 10000, 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', '💳', ARRAY['Paiement sans contact', 'Paiement en ligne', 'Retraits ATM', 'Assurance voyage'], 'Amazon - 89,99€', '05/01 16:20', 1, user_uuid)
ON CONFLICT DO NOTHING;

-- Données de test pour les conseillers
INSERT INTO conseillers (nom, prenom, email, telephone, role, avatar_url) VALUES
('Dubois', 'Marie', 'marie.dubois@bnpparibas.fr', '01 42 34 56 78', 'Conseiller Client', 'https://cdn-icons-png.flaticon.com/512/6676/6676023.png')
ON CONFLICT DO NOTHING;

-- Données de test pour les notifications
INSERT INTO notifications (titre, message, type, user_id) VALUES
('Connexion réussie', 'Vous vous êtes connecté avec succès à votre espace client.', 'info', user_uuid),
('Nouvelle transaction', 'Transaction Carrefour de 45,20€ effectuée avec succès.', 'transaction', user_uuid),
('Sécurité renforcée', 'Votre compte est protégé par notre système de sécurité avancé.', 'security', user_uuid)
ON CONFLICT DO NOTHING;

END $$;

-- Politiques de sécurité RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comptes ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartes ENABLE ROW LEVEL SECURITY;
ALTER TABLE virements ENABLE ROW LEVEL SECURITY;
ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;
ALTER TABLE recharges ENABLE ROW LEVEL SECURITY;
ALTER TABLE epargnes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions_connexion ENABLE ROW LEVEL SECURITY;
ALTER TABLE tentatives_connexion ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politiques pour permettre l'accès anonyme (pour la démo)
CREATE POLICY "Allow anonymous access to profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to comptes" ON comptes FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to beneficiaires" ON beneficiaires FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to cartes" ON cartes FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to virements" ON virements FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to paiements" ON paiements FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to recharges" ON recharges FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to epargnes" ON epargnes FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to notifications" ON notifications FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to sessions_connexion" ON sessions_connexion FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to tentatives_connexion" ON tentatives_connexion FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to conversations" ON conversations FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to messages" ON messages FOR ALL USING (true);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date_transaction DESC);
CREATE INDEX IF NOT EXISTS idx_beneficiaires_user ON beneficiaires(user_id);
CREATE INDEX IF NOT EXISTS idx_comptes_user ON comptes(user_id);
CREATE INDEX IF NOT EXISTS idx_cartes_user ON cartes(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_lu ON notifications(user_id, lu);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_numero_client ON profiles(numero_client);

-- Fonction pour mettre à jour la date de modification
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement la date de modification
CREATE TRIGGER update_profiles_modification 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_modified_column();

-- Fonction pour logger les tentatives de connexion
CREATE OR REPLACE FUNCTION log_connexion_attempt()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO tentatives_connexion (numero_client, ip_address, user_agent, statut, raison)
    VALUES (NEW.numero_client, inet_client_addr(), current_setting('request.headers')::json->>'user-agent', 
            CASE WHEN NEW.code_secret = '12345' THEN 'success' ELSE 'failed' END,
            CASE WHEN NEW.code_secret = '12345' THEN 'Connexion réussie' ELSE 'Code secret incorrect' END);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour logger les tentatives de connexion (à implémenter côté application)
-- CREATE TRIGGER log_connexion_attempts
--     AFTER INSERT ON tentatives_connexion
--     FOR EACH ROW
--     EXECUTE FUNCTION log_connexion_attempt(); 