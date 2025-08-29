-- Script d'initialisation pour PAOLA MARIE MADELEINE
-- À exécuter dans l'éditeur SQL de Supabase

-- IMPORTANT: Créez d'abord l'utilisateur PAOLA dans Supabase Auth
-- Puis remplacez l'UUID ci-dessous par l'UUID réel de l'utilisateur

-- UUID de l'utilisateur PAOLA (remplacez par l'UUID réel)
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Récupérer l'UUID de l'utilisateur PAOLA par email
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'paola.mariemadeleine@gmail.com';
    
    -- Si l'utilisateur n'existe pas, utiliser un UUID par défaut pour la démo
    IF user_uuid IS NULL THEN
        user_uuid := '00000000-0000-0000-0000-000000000000';
        RAISE NOTICE 'Utilisateur PAOLA non trouvé, utilisation de l''UUID par défaut: %', user_uuid;
    ELSE
        RAISE NOTICE 'Utilisateur PAOLA trouvé avec UUID: %', user_uuid;
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

-- Données de test pour PAOLA MARIE MADELEINE
INSERT INTO profiles (id, nom, prenom, email, telephone, numero_client, code_secret, localisation) VALUES
(user_uuid, 'MARIE MADELEINE', 'PAOLA', 'paola.mariemadeleine@example.com', '01 42 34 56 78', '3961515267', '52302', 'Paris, France')
ON CONFLICT (id) DO NOTHING;

-- Compte principal de PAOLA avec 770.000€
INSERT INTO comptes (type, numero, solde, devise, couleur, iban, statut, user_id) VALUES
('Compte Principal', '**** 1240', 770000.00, 'EUR', '#008854', 'FR76 3000 1000 1234 5678 9012 345', 'active', user_uuid)
ON CONFLICT DO NOTHING;

-- Bénéficiaire de PAOLA
INSERT INTO beneficiaires (nom, prenom, email, iban, bic, banque, alias, type, user_id) VALUES
('Dubois', 'Sophie', 'sophie.dubois@example.com', 'FR76 3000 1000 9876 5432 1098 765', 'BNPAFRPPXXX', 'BNP Paribas', 'Sophie D.', 'particulier', user_uuid)
ON CONFLICT DO NOTHING;

-- Transactions de PAOLA (transactions importantes pour quelqu'un avec 770k€)
INSERT INTO transactions (type, montant, description, categorie, date_transaction, heure_transaction, icone, localisation, statut, compte_id, user_id) VALUES
('credit', 50000.00, 'Virement reçu', 'Transfert', '2024-01-15', '14:30:00', 'fas fa-exchange-alt', 'Compte externe', 'completed', 1, user_uuid),
('debit', -2500.00, 'Achat immobilier', 'Investissement', '2024-01-10', '09:15:00', 'fas fa-home', 'Notaire Paris', 'completed', 1, user_uuid),
('debit', -15000.00, 'Voiture de luxe', 'Transport', '2024-01-08', '11:45:00', 'fas fa-car', 'Concessionnaire BMW', 'completed', 1, user_uuid),
('credit', 150000.00, 'Héritage', 'Revenus', '2024-01-05', '16:20:00', 'fas fa-hand-holding-usd', 'Notaire', 'completed', 1, user_uuid),
('debit', -5000.00, 'Voyage Maldives', 'Loisirs', '2024-01-03', '13:10:00', 'fas fa-plane', 'Agence de voyage', 'completed', 1, user_uuid),
('debit', -800.00, 'Restaurant gastronomique', 'Restaurant', '2024-01-12', '19:30:00', 'fas fa-utensils', 'Le Meurice, Paris', 'completed', 1, user_uuid),
('credit', 25000.00, 'Dividendes', 'Revenus', '2024-01-11', '10:20:00', 'fas fa-chart-line', 'Portefeuille actions', 'completed', 1, user_uuid),
('debit', -3000.00, 'Shopping de luxe', 'Shopping', '2024-01-09', '16:45:00', 'fas fa-shopping-bag', 'Champs-Élysées, Paris', 'completed', 1, user_uuid),
('debit', -12000.00, 'Rénovation appartement', 'Immobilier', '2024-01-07', '14:20:00', 'fas fa-tools', 'Entreprise de rénovation', 'completed', 1, user_uuid)
ON CONFLICT DO NOTHING;

-- Carte Visa de PAOLA
INSERT INTO cartes (type, numero, titulaire, date_expiration, cvv, statut, solde, limite, couleur, logo, fonctionnalites, derniere_transaction, date_derniere_transaction, compte_id, user_id) VALUES
('Visa Infinite', '**** **** **** 1234', 'PAOLA MARIE MADELEINE', '12/26', '123', 'active', 770000.00, 100000, 'blue', '💳', ARRAY['Paiement sans contact', 'Paiement en ligne', 'Retraits ATM', 'Assurance voyage', 'Conciergerie', 'Limite élevée'], 'Restaurant gastronomique - 800 EUR', '12/01 19:30', 1, user_uuid)
ON CONFLICT DO NOTHING;

-- Conseiller client pour PAOLA
INSERT INTO conseillers (nom, prenom, email, telephone, role, avatar_url) VALUES
('Dubois', 'Marie', 'marie.dubois@bnpparibas.fr', '01 42 34 56 78', 'Conseiller Client Premium', 'https://example.com/avatar.png')
ON CONFLICT DO NOTHING;

-- Notifications pour PAOLA
INSERT INTO notifications (titre, message, type, user_id) VALUES
('Connexion réussie', 'Vous vous êtes connecté avec succès à votre espace client.', 'info', user_uuid),
('Nouvelle transaction', 'Transaction Restaurant gastronomique de 800 EURO effectuée avec succès.', 'transaction', user_uuid),
('Sécurité renforcée', 'Votre compte est protégé par notre système de sécurité avancé.', 'security', user_uuid),
('Conseiller disponible', 'Votre conseiller Marie D. est disponible pour un rendez-vous.', 'info', user_uuid),
('Limite de carte', 'Votre carte Visa Infinite a une limite de 100000 EURO disponible.', 'info', user_uuid)
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
            CASE WHEN NEW.code_secret = '52302' THEN 'success' ELSE 'failed' END,
            CASE WHEN NEW.code_secret = '52302' THEN 'Connexion réussie' ELSE 'Code secret incorrect' END);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Base de données PAOLA MARIE MADELEINE créée avec succès!';
    RAISE NOTICE '💰 Solde: 770.000€';
    RAISE NOTICE '🏦 Numéro client: 3961515267';
    RAISE NOTICE '🔑 Code secret: 52302';
    RAISE NOTICE '💳 Carte: Visa Infinite avec limite 100.000€';
    RAISE NOTICE '👥 Bénéficiaire: Sophie Dubois';
    RAISE NOTICE '📊 10 transactions importantes';
    RAISE NOTICE '🔔 5 notifications';
END $$; 