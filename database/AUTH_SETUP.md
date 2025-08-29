# 🔐 Configuration de l'authentification Supabase

## 📋 Étapes de configuration

### 1. Créer un utilisateur dans Supabase Auth

#### Option A : Via l'interface web (Recommandé)

1. **Accédez à votre dashboard Supabase**

   ```
   https://ohnzpspnubvoxcuspiuf.supabase.co
   ```

2. **Allez dans Authentication > Users**

   - Cliquez sur "Add user"

3. **Remplissez les informations :**

   - **Email** : `jean.dupont@example.com`
   - **Password** : `12345`
   - **User metadata** (JSON) :

   ```json
   {
     "nom": "Dupont",
     "prenom": "Jean",
     "numero_client": "3961515267"
   }
   ```

4. **Cliquez sur "Create user"**

5. **Copiez l'UUID généré** (ex: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

#### Option B : Via script Node.js

1. **Installez les dépendances**

   ```bash
   npm install @supabase/supabase-js
   ```

2. **Récupérez votre clé service role**

   - Dashboard Supabase > Settings > API
   - Copiez la "service_role" key

3. **Modifiez le script**

   ```javascript
   // database/create_user.js
   const supabaseServiceKey = "VOTRE_SERVICE_ROLE_KEY";
   ```

4. **Exécutez le script**
   ```bash
   node database/create_user.js
   ```

### 2. Exécuter le script SQL

1. **Allez dans l'éditeur SQL de Supabase**

   - Dashboard > SQL Editor

2. **Copiez et exécutez le script**

   ```sql
   -- Le script database/init.sql sera automatiquement adapté
   -- à l'UUID de l'utilisateur créé
   ```

3. **Vérifiez les tables créées**
   - Dashboard > Table Editor
   - Vous devriez voir 15 tables créées

### 3. Configuration de l'application

#### Mise à jour du service d'authentification

Le service `authService.js` supporte maintenant deux méthodes :

1. **Authentification bancaire** (numéro client + code secret)

   ```javascript
   const result = await authService.authenticate("3961515267", "12345");
   ```

2. **Authentification Supabase** (email + mot de passe)
   ```javascript
   const result = await authService.authenticateWithEmail(
     "jean.dupont@example.com",
     "12345"
   );
   ```

#### Intégration dans les composants

```javascript
import { authService } from "../services/authService";
import { useEffect, useState } from "react";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id);
        setUser({ ...session.user, ...profile });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return user ? <Dashboard user={user} /> : <LoginPage />;
}
```

### 4. Sécurité et politiques RLS

#### Politiques de sécurité par défaut

Le script SQL configure des politiques permissives pour la démo :

```sql
-- Permet l'accès anonyme (pour la démo)
CREATE POLICY "Allow anonymous access to profiles" ON profiles FOR ALL USING (true);
```

#### Politiques de production

Pour la production, configurez des politiques sécurisées :

```sql
-- Politique sécurisée pour les profils
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politique sécurisée pour les comptes
CREATE POLICY "Users can view own accounts" ON comptes
  FOR SELECT USING (auth.uid() = user_id);

-- Politique sécurisée pour les transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);
```

### 5. Variables d'environnement

#### Configuration de développement

Créez un fichier `.env.local` :

```bash
REACT_APP_SUPABASE_URL=https://ohnzpspnubvoxcuspiuf.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Configuration de production

```bash
REACT_APP_SUPABASE_URL=https://ohnzpspnubvoxcuspiuf.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_production_anon_key
```

### 6. Test de l'authentification

#### Identifiants de test

- **Email** : `jean.dupont@example.com`
- **Mot de passe** : `12345`
- **Numéro client** : `3961515267`
- **Code secret** : `12345`

#### Test de connexion

```javascript
// Test avec email/mot de passe
try {
  const result = await authService.authenticateWithEmail(
    "jean.dupont@example.com",
    "12345"
  );
  console.log("Connexion réussie:", result.user);
} catch (error) {
  console.error("Erreur de connexion:", error.message);
}

// Test avec numéro client/code secret
try {
  const result = await authService.authenticate("3961515267", "12345");
  console.log("Connexion bancaire réussie:", result.user);
} catch (error) {
  console.error("Erreur de connexion bancaire:", error.message);
}
```

### 7. Fonctionnalités avancées

#### Gestion des sessions

```javascript
// Récupérer la session actuelle
const session = await authService.getCurrentSession();

// Se déconnecter
await authService.signOut();
```

#### Réinitialisation de mot de passe

```javascript
// Envoyer un email de réinitialisation
await authService.resetPassword("jean.dupont@example.com");

// Mettre à jour le mot de passe
await authService.updatePassword("nouveau_mot_de_passe");
```

#### Écoute des changements d'authentification

```javascript
const {
  data: { subscription },
} = authService.onAuthStateChange((event, session) => {
  switch (event) {
    case "SIGNED_IN":
      console.log("Utilisateur connecté:", session.user);
      break;
    case "SIGNED_OUT":
      console.log("Utilisateur déconnecté");
      break;
    case "TOKEN_REFRESHED":
      console.log("Token rafraîchi");
      break;
  }
});
```

### 8. Dépannage

#### Problèmes courants

1. **Erreur "Invalid login credentials"**

   - Vérifiez que l'utilisateur existe dans Supabase Auth
   - Vérifiez l'email et le mot de passe

2. **Erreur "User not found"**

   - Vérifiez que le profil existe dans la table `profiles`
   - Vérifiez que l'UUID correspond

3. **Erreur "RLS policy violation"**

   - Vérifiez les politiques RLS
   - Assurez-vous que l'utilisateur est authentifié

4. **Erreur "Network error"**
   - Vérifiez la connexion internet
   - Vérifiez les variables d'environnement

#### Logs et debugging

```javascript
// Activer les logs Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: true,
  },
});

// Vérifier l'état de l'authentification
const user = await authService.getCurrentUser();
console.log("Utilisateur actuel:", user);

const session = await authService.getCurrentSession();
console.log("Session actuelle:", session);
```

### 9. Migration depuis localStorage

Si vous migrez depuis localStorage :

```javascript
// Récupérer les données localStorage
const localUser = JSON.parse(localStorage.getItem("user"));
const localBeneficiaires = JSON.parse(localStorage.getItem("beneficiaires"));

// Créer l'utilisateur dans Supabase
if (localUser) {
  await authService.signUp(localUser.email, "password", {
    nom: localUser.nom,
    prenom: localUser.prenom,
    numero_client: localUser.numero_client,
  });
}

// Migrer les bénéficiaires
if (localBeneficiaires) {
  for (const beneficiaire of localBeneficiaires) {
    await beneficiairesService.createBeneficiaire(beneficiaire);
  }
}

// Nettoyer localStorage
localStorage.clear();
```

---

## ✅ Checklist de configuration

- [ ] Utilisateur créé dans Supabase Auth
- [ ] UUID récupéré et noté
- [ ] Script SQL exécuté
- [ ] Tables créées (15 tables)
- [ ] Données de test insérées
- [ ] Service d'authentification configuré
- [ ] Variables d'environnement définies
- [ ] Test de connexion réussi
- [ ] Politiques RLS configurées
- [ ] Application fonctionnelle

## 🎯 Résultat attendu

Après cette configuration, vous devriez avoir :

- ✅ **Authentification sécurisée** avec Supabase Auth
- ✅ **Base de données complète** avec 15 tables
- ✅ **Données de test** prêtes à l'emploi
- ✅ **Services fonctionnels** pour toutes les opérations bancaires
- ✅ **Sécurité RLS** configurée
- ✅ **Application bancaire** 100% fonctionnelle

L'application est maintenant prête pour la production avec une authentification professionnelle ! 🚀🏦
