# Configuration Supabase Mail pour l'envoi d'emails

## 🚀 **Solution recommandée : Resend (Gratuit)**

Resend offre **3,000 emails/mois gratuits** et est très simple à configurer.

### **1. Créer un compte Resend**

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit
3. Récupérez votre **API Key**

### **2. Fonction Edge avec Resend (Version optimisée anti-spam)**

Remplacez le code de votre fonction `send-email` par :

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  try {
    const { to, subject, html, text, from, from_name } = await req.json();

    console.log("📧 RESEND DEBUG: Tentative d'envoi email à:", to);

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("Clé API Resend manquante");
    }

    // Utiliser le domaine de test Resend avec nom d'expéditeur
    const fromEmail = "BNP Paribas <onboarding@resend.dev>";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: html,
        text: text,
        // Améliorations anti-spam
        reply_to: "service-client@bnpparibas.com",
        headers: {
          "X-Priority": "1",
          "X-MSMail-Priority": "High",
          Importance: "high",
          "X-Mailer": "BNP Paribas Banking System",
          "List-Unsubscribe": "<mailto:unsubscribe@bnpparibas.com>",
          Precedence: "bulk",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ RESEND DEBUG: Réponse complète:", errorData);
      throw new Error(
        `Resend error: ${errorData.message || response.statusText}`
      );
    }

    const result = await response.json();
    console.log("📧 RESEND DEBUG: Email envoyé avec succès, ID:", result.id);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.id,
        to: to,
        subject: subject,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      }
    );
  } catch (error) {
    console.error("❌ RESEND DEBUG: Erreur:", error.message);

    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      }
    );
  }
});
```

### **3. Configuration Resend**

Dans votre dashboard Supabase > Settings > Edge Functions, ajoutez :

```env
RESEND_API_KEY=re_votre_cle_api_ici
```

### **4. Vérifier votre domaine**

Dans Resend, ajoutez votre domaine ou utilisez un domaine de test.

## 🔧 **Fonction Edge corrigée pour Netlify (SMTP)**

Dans votre dashboard Supabase, remplacez le code de la fonction `send-email` par cette version simplifiée :

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

serve(async (req) => {
  // Gérer les requêtes CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  try {
    const { to, subject, html, text, from, from_name } = await req.json();

    console.log("📧 SMTP DEBUG: Tentative d'envoi email à:", to);

    // Vérifier les variables d'environnement
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = Deno.env.get("SMTP_PORT");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    const smtpFrom = Deno.env.get("SMTP_FROM");

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error("Variables SMTP manquantes");
    }

    const client = new SmtpClient();

    await client.connectTLS({
      hostname: smtpHost,
      port: parseInt(smtpPort || "587"),
      username: smtpUser,
      password: smtpPass,
    });

    console.log("📧 SMTP DEBUG: Connexion SMTP établie");

    await client.send({
      from: from || smtpFrom || "noreply@bnpparibas.com",
      to: to,
      subject: subject,
      content: html,
      html: html,
    });

    await client.close();

    console.log("📧 SMTP DEBUG: Email envoyé avec succès");

    return new Response(
      JSON.stringify({
        success: true,
        messageId: Date.now().toString(),
        to: to,
        subject: subject,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      }
    );
  } catch (error) {
    console.error("❌ SMTP DEBUG: Erreur:", error.message);

    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      }
    );
  }
});
```

## 🔧 **Version alternative (si l'erreur persiste)**

Si vous continuez à avoir l'erreur `bufio`, essayez cette version alternative avec une gestion d'erreur plus robuste :

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  let client = null;

  try {
    const { to, subject, html, text, from, from_name } = await req.json();

    console.log("📧 SMTP DEBUG: Tentative d'envoi email à:", to);

    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = Deno.env.get("SMTP_PORT");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    const smtpFrom = Deno.env.get("SMTP_FROM");

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error("Variables SMTP manquantes");
    }

    client = new SmtpClient();

    // Connexion avec timeout et retry
    let connected = false;
    let attempts = 0;
    const maxAttempts = 3;

    while (!connected && attempts < maxAttempts) {
      try {
        await client.connectTLS({
          hostname: smtpHost,
          port: parseInt(smtpPort || "587"),
          username: smtpUser,
          password: smtpPass,
        });
        connected = true;
        console.log("📧 SMTP DEBUG: Connexion SMTP établie");
      } catch (connError) {
        attempts++;
        console.log(
          `📧 SMTP DEBUG: Tentative ${attempts}/${maxAttempts} échouée:`,
          connError.message
        );
        if (attempts >= maxAttempts) {
          throw new Error(
            `Échec de connexion SMTP après ${maxAttempts} tentatives: ${connError.message}`
          );
        }
        // Attendre avant de réessayer
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    await client.send({
      from: from || smtpFrom || "noreply@bnpparibas.com",
      to: to,
      subject: subject,
      content: html,
      html: html,
    });

    console.log("📧 SMTP DEBUG: Email envoyé avec succès");

    return new Response(
      JSON.stringify({
        success: true,
        messageId: Date.now().toString(),
        to: to,
        subject: subject,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      }
    );
  } catch (error) {
    console.error("❌ SMTP DEBUG: Erreur:", error.message);

    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      }
    );
  } finally {
    // Fermer la connexion dans tous les cas
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.log(
          "📧 SMTP DEBUG: Erreur lors de la fermeture:",
          closeError.message
        );
      }
    }
  }
});
```

## 🔧 **Configuration des variables d'environnement**

Dans votre dashboard Supabase > Settings > Edge Functions, ajoutez ces variables :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
SMTP_FROM=noreply@bnpparibas.com
```

## 🔧 **Configuration Gmail pour l'envoi**

1. **Activez l'authentification à 2 facteurs** sur votre compte Gmail
2. **Générez un mot de passe d'application** :
   - Allez dans Paramètres Google > Sécurité
   - Cliquez sur "Mots de passe d'application"
   - Générez un mot de passe pour "Mail"
   - Utilisez ce mot de passe dans `SMTP_PASS`

## 🔧 **Configuration Netlify**

Dans votre fichier `netlify.toml` :

```toml
[build]
  publish = "build"
  command = "npm run build"

[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "*"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## ✅ **Étapes de déploiement**

### **1. Redéployer la fonction Edge**

1. Dans votre dashboard Supabase, allez dans la fonction `send-email`
2. Remplacez le code par celui ci-dessus
3. Cliquez sur **"Deploy"**

### **2. Vérifier les variables d'environnement**

Assurez-vous que toutes les variables SMTP sont configurées dans Supabase.

### **3. Tester en local**

```bash
npm start
```

### **4. Déployer sur Netlify**

```bash
npm run build
```

## 🔍 **Dépannage**

### **Erreur 500 - Variables manquantes**

Si vous voyez "Variables SMTP manquantes", vérifiez que toutes les variables sont configurées dans Supabase.

### **Erreur de connexion SMTP**

- Vérifiez que le mot de passe d'application Gmail est correct
- Assurez-vous que l'authentification à 2 facteurs est activée

### **Erreur CORS**

La fonction inclut maintenant les bons headers CORS pour Netlify.

## 📧 **Résultat attendu**

Après correction, vous devriez voir :

```
📧 EMAIL DEBUG: Envoi email avec Supabase Mail
📧 EMAIL DEBUG: À: angedesirecamara@gmail.com
📧 EMAIL DEBUG: Sujet: Virement reçu - 5000.00€ - Frais de conformité requis
✅ EMAIL DEBUG: Email envoyé avec succès via Supabase Mail
```

Et dans les logs de la fonction Edge :

```
📧 SMTP DEBUG: Tentative d'envoi email à: angedesirecamara@gmail.com
📧 SMTP DEBUG: Connexion SMTP établie
📧 SMTP DEBUG: Email envoyé avec succès
```

Le bénéficiaire recevra alors l'email avec le message des frais de conformité ! 🎉
