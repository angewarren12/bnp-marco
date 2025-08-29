# Configuration de l'envoi d'emails pour les virements

## Vue d'ensemble

Le système d'envoi d'emails a été implémenté pour notifier automatiquement les utilisateurs lors des virements. L'email est envoyé **au moment exact où le montant est déduit du compte**, conformément aux exigences de conformité bancaire.

## Fonctionnalités implémentées

### 1. Email de confirmation de virement

- **Déclenchement** : Au moment de la déduction du montant du compte
- **Contenu** :
  - Montant du virement
  - Informations du bénéficiaire (nom, IBAN masqué)
  - Date et heure de l'opération
  - Référence unique du virement
  - Motif (si renseigné)
  - Message de sécurité

### 2. Email d'erreur de virement

- **Déclenchement** : En cas d'erreur lors du traitement
- **Contenu** : Description de l'erreur et instructions de contact

## Configuration requise

### Option 1 : Supabase Edge Functions (Recommandé)

1. **Créer une Edge Function Supabase** :

```bash
supabase functions new send-email
```

2. **Contenu de la fonction** (`supabase/functions/send-email/index.ts`) :

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

const client = new SmtpClient();

serve(async (req) => {
  try {
    const { to, subject, html, text } = await req.json();

    await client.connectTLS({
      hostname: Deno.env.get("SMTP_HOST"),
      port: parseInt(Deno.env.get("SMTP_PORT")),
      username: Deno.env.get("SMTP_USER"),
      password: Deno.env.get("SMTP_PASS"),
    });

    await client.send({
      from: Deno.env.get("SMTP_FROM"),
      to: to,
      subject: subject,
      content: html,
      html: html,
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

3. **Variables d'environnement** (dans Supabase Dashboard) :

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
SMTP_FROM=noreply@votre-banque.com
```

### Option 2 : Service d'email externe (SendGrid, Mailgun, etc.)

1. **Installer le package** :

```bash
npm install @sendgrid/mail
```

2. **Modifier `emailService.js`** :

```javascript
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Dans la méthode sendEmail :
const msg = {
  to: to,
  from: "noreply@votre-banque.com",
  subject: subject,
  html: html,
  text: text,
};

const response = await sgMail.send(msg);
return response;
```

### Option 3 : Utiliser les fonctions d'email intégrées de Supabase

Si vous utilisez Supabase Auth avec email confirmé, vous pouvez utiliser les fonctions intégrées :

```javascript
// Dans emailService.js
const { data, error } = await supabase.auth.admin.sendRawEmail({
  to: to,
  subject: subject,
  html: html,
  text: text,
});
```

## Message de conformité

Le message d'email inclut automatiquement :

1. **Informations de sécurité** :

   - Avertissement en cas d'opération non autorisée
   - Numéro de contact du service client
   - IBAN partiellement masqué pour la sécurité

2. **Conformité bancaire** :
   - Référence unique de transaction
   - Horodatage précis
   - Informations complètes du bénéficiaire
   - Montant exact déduit

## Exemple de message envoyé

```
Sujet : Virement traité - 500,00€ vers Jean Dupont

Bonjour Marie Dupont,

Nous confirmons que votre virement a été traité avec succès.

500,00€

Bénéficiaire : Jean Dupont
IBAN : FR76****1234
Date et heure : 15/01/2025 à 14:30
Référence : VIR-12345678-ABCD
Motif : Remboursement prêt

🔒 Informations de sécurité :
Ce virement a été effectué depuis votre compte sécurisé.
Si vous n'êtes pas à l'origine de cette opération,
contactez immédiatement notre service client au 0800 123 456.

Votre solde a été mis à jour en conséquence.

Cordialement,
L'équipe BNP Paribas
```

## Gestion des erreurs

Le système gère les erreurs d'envoi d'email de manière robuste :

1. **L'échec d'envoi d'email ne fait pas échouer le virement**
2. **Les erreurs sont loggées pour diagnostic**
3. **Les emails peuvent être renvoyés ultérieurement**
4. **Notifications in-app en complément des emails**

## Tests

Pour tester l'envoi d'emails :

1. **Mode développement** : Les emails sont simulés (voir les logs console)
2. **Mode production** : Configurez un service d'email réel
3. **Test unitaire** : Vérifiez que `emailService.sendVirementNotification()` est appelé

## Sécurité

- **IBAN masqué** : Seuls les 4 premiers et 4 derniers caractères sont visibles
- **Pas de données sensibles** dans les emails
- **Authentification requise** pour accéder aux fonctions d'email
- **Rate limiting** recommandé pour éviter le spam

## Monitoring

Surveillez les logs pour :

- ✅ Emails envoyés avec succès
- ❌ Erreurs d'envoi d'email
- ⚠️ Utilisateurs sans email configuré
- 📊 Statistiques d'envoi
