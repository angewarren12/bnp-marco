# 🏦 Application Bancaire BNP Paribas

Une application bancaire moderne et responsive développée avec React, simulant l'interface de BNP Paribas avec toutes les fonctionnalités essentielles d'une banque en ligne.

## ✨ Fonctionnalités

### 🔐 Authentification

- **Connexion en deux étapes** : Numéro client puis code secret
- **Clavier virtuel** pour la saisie sécurisée du mot de passe
- **Gestion des erreurs** et messages d'information
- **Intégration Supabase Auth** pour l'authentification

### 📊 Dashboard Principal

- **Solde total** avec évolution mensuelle (+2.5%)
- **Actions rapides** : Virement, Paiement, Épargne, Bénéficiaires
- **Comptes multiples** avec gestion des soldes
- **Dernières transactions** avec statuts en temps réel
- **Épargne & Investissements** : Livret A, PEA, LDDS
- **Conseiller client** avec informations de contact

### 💰 Gestion des Virements

- **Création de bénéficiaires** avec validation IBAN
- **Virements sécurisés** avec limite de 100.000€
- **Statuts de validation** : En cours, Terminé, En attente
- **Notifications automatiques** pour les frais de conformité
- **Historique complet** des opérations

### 📱 Interface Mobile

- **Design responsive** optimisé pour mobile
- **Menu de navigation** fixe en bas d'écran
- **Animations fluides** et transitions
- **Interface tactile** avec feedback haptique

### 🎨 Design & UX

- **Identité visuelle BNP Paribas** avec le vert #008854
- **Icônes Font Awesome** pour une expérience cohérente
- **Thème moderne** avec glassmorphism et ombres
- **Accessibilité** optimisée

## 🛠️ Technologies Utilisées

- **Frontend** : React 18, CSS3, JavaScript ES6+
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth
- **Icônes** : Font Awesome
- **Routing** : React Router DOM
- **Déploiement** : Prêt pour Vercel/Netlify

## 📋 Prérequis

- Node.js (version 16 ou supérieure)
- npm ou yarn
- Compte Supabase (gratuit)

## 🚀 Installation

1. **Cloner le repository**

```bash
git clone https://github.com/votre-username/banque-app.git
cd banque-app
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configuration Supabase**

   - Créez un projet sur [Supabase](https://supabase.com)
   - Copiez votre Project URL et API Key
   - Mettez à jour `src/config/supabase.js`

4. **Configuration de la base de données**

   - Exécutez les scripts SQL dans le dossier `database/`
   - Suivez le guide `SUPABASE_SETUP.md`

5. **Lancer l'application**

```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 📁 Structure du Projet

```
banque-app/
├── src/
│   ├── components/          # Composants React
│   │   ├── LoginPage.js     # Page de connexion
│   │   ├── Dashboard.js     # Dashboard principal
│   │   ├── VirementPage.js  # Gestion des virements
│   │   └── ...
│   ├── services/            # Services Supabase
│   │   ├── authService.js   # Authentification
│   │   ├── comptesService.js # Gestion des comptes
│   │   └── ...
│   ├── config/
│   │   └── supabase.js      # Configuration Supabase
│   └── ...
├── database/                # Scripts SQL et documentation
├── public/                  # Assets statiques
└── README.md
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
REACT_APP_SUPABASE_URL=votre_project_url
REACT_APP_SUPABASE_ANON_KEY=votre_api_key
```

### Base de données

Le projet utilise Supabase avec les tables suivantes :

- `profiles` : Profils utilisateurs
- `comptes` : Comptes bancaires
- `transactions` : Historique des transactions
- `virements` : Virements effectués
- `beneficiaires` : Bénéficiaires enregistrés
- `notifications` : Notifications système

## 👤 Compte de Test

Pour tester l'application, utilisez ces identifiants :

- **Numéro client** : `3961515267`
- **Code secret** : `52302`

## 🎯 Fonctionnalités Détaillées

### Authentification

- Validation du numéro client
- Vérification du code secret
- Gestion des comptes verrouillés
- Session persistante

### Dashboard

- Affichage du solde total en temps réel
- Actions rapides pour les opérations courantes
- Historique des dernières transactions
- Gestion des comptes multiples

### Virements

- Création et gestion des bénéficiaires
- Validation IBAN en temps réel
- Limites de sécurité configurées
- Notifications automatiques

### Épargne

- Gestion des livrets (A, LDDS)
- Plan d'épargne en actions (PEA)
- Calcul des intérêts et évolutions
- Interface de gestion dédiée

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Netlify

1. Connectez votre repository GitHub à Netlify
2. Configurez les variables d'environnement
3. Déployez avec `npm run build`

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :

- Ouvrez une issue sur GitHub
- Consultez la documentation Supabase
- Vérifiez les logs de la console

## 🙏 Remerciements

- BNP Paribas pour l'inspiration du design
- Supabase pour l'infrastructure backend
- React et la communauté open source

---

**Développé avec ❤️ pour l'innovation bancaire**
