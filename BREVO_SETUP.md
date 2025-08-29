# Configuration Brevo pour l'envoi d'emails

## 🚀 **Solution : Brevo (Gratuit - 300 emails/jour)**

Brevo offre un plan gratuit avec 300 emails/jour et un domaine gratuit.

### **1. Créer un compte Brevo**

1. Allez sur [brevo.com](https://brevo.com)
2. Créez un compte gratuit
3. Vérifiez votre email

### **2. Obtenir votre clé API**

1. Settings → API Keys
2. Cliquez sur "Generate a new API key"
3. Copiez la clé API

### **3. Fonction Edge avec Brevo**

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

    console.log("📧 BREVO DEBUG: Tentative d'envoi email à:", to);

    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) {
      throw new Error("Clé API Brevo manquante");
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "BNP Paribas",
          email: "noreply@bnpparibas.com", // ou votre domaine Brevo
        },
        to: [
          {
            email: to,
            name: to.split("@")[0],
          },
        ],
        subject: subject,
        htmlContent: html,
        textContent: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ BREVO DEBUG: Réponse d'erreur:", errorData);
      throw new Error(
        `Brevo error: ${errorData.message || response.statusText}`
      );
    }

    const result = await response.json();
    console.log(
      "📧 BREVO DEBUG: Email envoyé avec succès, ID:",
      result.messageId
    );

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.messageId,
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
    console.error("❌ BREVO DEBUG: Erreur:", error.message);

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
BREVO_API_KEY=votre_cle_api_brevo
```

### **5. Avantages de Brevo**

✅ **Gratuit** (300 emails/jour)  
✅ **Domaine gratuit inclus**  
✅ **API simple**  
✅ **Bonne délivrabilité**  
✅ **Pas de configuration complexe**

### **6. Limites**

⚠️ **300 emails/jour** maximum  
⚠️ **Domaine d'expédition Brevo** (peut être personnalisé)
