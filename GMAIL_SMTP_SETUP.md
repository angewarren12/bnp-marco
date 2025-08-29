# Configuration Gmail SMTP pour l'envoi d'emails

## 🚀 **Solution : Gmail SMTP (Gratuit et fiable)**

Gmail permet d'envoyer des emails à n'importe quelle adresse via SMTP.

### **1. Activer l'authentification à 2 facteurs sur Gmail**

1. Allez sur [myaccount.google.com](https://myaccount.google.com)
2. Sécurité → Authentification à 2 facteurs → Activer
3. Notez votre mot de passe principal

### **2. Générer un mot de passe d'application**

1. Sécurité → Mots de passe d'application
2. Sélectionnez "Autre (nom personnalisé)"
3. Nom : "BNP Paribas App"
4. Copiez le mot de passe généré (16 caractères)

### **3. Fonction Edge avec Gmail SMTP**

Remplacez le code de votre fonction `send-email` par :

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

  try {
    const { to, subject, html, text, from, from_name } = await req.json();

    console.log("📧 GMAIL DEBUG: Tentative d'envoi email à:", to);

    const client = new SmtpClient();

    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 587,
      username: Deno.env.get("GMAIL_USERNAME"), // votre email Gmail
      password: Deno.env.get("GMAIL_APP_PASSWORD"), // mot de passe d'application
    });

    await client.send({
      from: Deno.env.get("GMAIL_USERNAME"), // votre email Gmail
      to: to,
      subject: subject,
      content: html,
      html: html,
    });

    await client.close();

    console.log("📧 GMAIL DEBUG: Email envoyé avec succès");

    return new Response(
      JSON.stringify({
        success: true,
        messageId: "gmail-" + Date.now(),
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
    console.error("❌ GMAIL DEBUG: Erreur:", error.message);

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

### **4. Configurer les variables d'environnement dans Supabase**

Dans Supabase Dashboard → Settings → Secrets :

```
GMAIL_USERNAME=votre_email@gmail.com
GMAIL_APP_PASSWORD=votre_mot_de_passe_application
```

### **5. Avantages de Gmail SMTP**

✅ **Gratuit** (500 emails/jour)  
✅ **Fiable** et stable  
✅ **Pas de domaine requis**  
✅ **Envoi à n'importe quelle adresse**  
✅ **Bonne délivrabilité**

### **6. Limites**

⚠️ **500 emails/jour** maximum  
⚠️ **Authentification à 2 facteurs requise**  
⚠️ **Adresse d'expédition = votre Gmail**
