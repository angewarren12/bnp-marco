# 🧪 Guide de Test - Intégration Supabase

## ✅ **Vérification de l'intégration Supabase**

### **1. Test de l'authentification**

#### **Identifiants PAOLA :**

- **Numéro client** : `3961515267`
- **Code secret** : `52302`

#### **Étapes de test :**

1. **Ouvrir l'application**

   ```bash
   npm start
   ```

2. **Tester la connexion**

   - Saisir le numéro client : `3961515267`
   - Cliquer sur "Continuer"
   - Saisir le code secret : `52302`
   - Cliquer sur "Accéder au compte"

3. **Vérifications attendues :**
   - ✅ Redirection vers le dashboard
   - ✅ Affichage du nom : "PAOLA MARIE MADELEINE"
   - ✅ Solde affiché : 770.000€
   - ✅ Compte principal visible
   - ✅ Transactions récentes affichées

### **2. Test des données Supabase**

#### **Vérifier dans le dashboard :**

1. **Informations utilisateur :**

   - Nom : PAOLA MARIE MADELEINE
   - Localisation : Paris, France
   - Dernière connexion : Aujourd'hui

2. **Compte bancaire :**

   - Type : Compte Principal
   - Solde : 770.000,00€
   - Numéro : \*\*\*\* 1240

3. **Transactions :**

   - 10 transactions importantes
   - Héritage : +150.000€
   - Vente d'actions : +75.000€
   - Voiture de luxe : -15.000€

4. **Carte bancaire :**
   - Type : Visa Infinite
   - Limite : 100.000€
   - Dernière transaction : Restaurant gastronomique

### **3. Test des fonctionnalités**

#### **Actions rapides :**

1. **Virement** : Cliquer sur "Virement"

   - ✅ Modal s'ouvre
   - ✅ Bénéficiaire Sophie Dubois visible

2. **Bénéficiaires** : Cliquer sur "Bénéficiaires"

   - ✅ Modal s'ouvre
   - ✅ Sophie Dubois dans la liste

3. **Historique** : Cliquer sur "Historique"

   - ✅ Transactions affichées
   - ✅ Filtres fonctionnels

4. **Cartes** : Cliquer sur "Cartes"
   - ✅ Visa Infinite affichée
   - ✅ Détails de la carte

### **4. Test de sécurité**

#### **Verrouillage de compte :**

1. **Tentatives échouées :**

   - Saisir un mauvais code secret 3 fois
   - ✅ Compte verrouillé pendant 30 secondes
   - ✅ Message d'erreur affiché

2. **Déverrouillage :**
   - Attendre 30 secondes
   - ✅ Compte déverrouillé automatiquement

### **5. Test des notifications**

#### **Vérifier les notifications :**

1. **Dans le dashboard :**
   - Cliquer sur l'icône de notification
   - ✅ 5 notifications affichées
   - ✅ Types : info, transaction, security

### **6. Test de déconnexion**

#### **Déconnexion :**

1. **Cliquer sur l'avatar utilisateur**
2. **Sélectionner "Déconnexion"**
3. **Vérifications :**
   - ✅ Redirection vers la page de login
   - ✅ Session supprimée
   - ✅ localStorage nettoyé

## 🔍 **Vérifications techniques**

### **Console du navigateur :**

1. **Ouvrir les outils de développement**
2. **Aller dans l'onglet Console**
3. **Vérifier les logs :**
   - ✅ Pas d'erreurs Supabase
   - ✅ Requêtes réussies
   - ✅ Authentification fonctionnelle

### **Réseau (Network) :**

1. **Ouvrir l'onglet Network**
2. **Effectuer une connexion**
3. **Vérifier les requêtes :**
   - ✅ Requêtes vers Supabase
   - ✅ Authentification réussie
   - ✅ Données récupérées

## 🐛 **Dépannage**

### **Problèmes courants :**

#### **1. Erreur "Numéro client incorrect"**

- **Cause** : Utilisateur non créé dans Supabase
- **Solution** : Créer l'utilisateur PAOLA dans Supabase Auth

#### **2. Erreur "Code secret incorrect"**

- **Cause** : Code secret différent dans la base
- **Solution** : Vérifier le code secret dans la table `profiles`

#### **3. Erreur "Compte verrouillé"**

- **Cause** : Trop de tentatives échouées
- **Solution** : Attendre 30 secondes ou réinitialiser dans Supabase

#### **4. Données non affichées**

- **Cause** : Tables non créées ou vides
- **Solution** : Exécuter le script SQL `init_paola.sql`

#### **5. Erreur de connexion Supabase**

- **Cause** : Variables d'environnement incorrectes
- **Solution** : Vérifier `src/config/supabase.js`

## 📊 **Résultats attendus**

### **✅ Succès complet :**

- 🔐 **Authentification** : Connexion réussie avec PAOLA
- 💰 **Solde** : 770.000€ affiché correctement
- 📊 **Transactions** : 10 transactions importantes
- 💳 **Carte** : Visa Infinite avec limite 100.000€
- 👥 **Bénéficiaire** : Sophie Dubois visible
- 🔔 **Notifications** : 5 notifications affichées
- 🛡️ **Sécurité** : Verrouillage fonctionnel
- 🔄 **Déconnexion** : Session nettoyée

### **❌ Échec :**

- Impossible de se connecter
- Données non affichées
- Erreurs dans la console
- Fonctionnalités non disponibles

## 🎯 **Conclusion**

Si tous les tests passent, l'intégration Supabase est **100% fonctionnelle** !

L'application utilise maintenant :

- ✅ **Authentification sécurisée** avec Supabase Auth
- ✅ **Base de données PostgreSQL** pour toutes les données
- ✅ **Services fonctionnels** pour toutes les opérations
- ✅ **Sécurité avancée** avec verrouillage de compte
- ✅ **Notifications en temps réel**
- ✅ **Gestion des sessions**

L'application bancaire est prête pour la production ! 🚀🏦
