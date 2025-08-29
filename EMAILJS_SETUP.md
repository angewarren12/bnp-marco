# Configuration EmailJS pour l'envoi d'emails

## 🚀 **Configuration EmailJS (Gratuit - 200 emails/mois)**

EmailJS permet d'envoyer des emails directement depuis le frontend sans serveur.

### **1. Créer un compte EmailJS**

1. Allez sur [emailjs.com](https://emailjs.com)
2. Créez un compte gratuit
3. Vérifiez votre email

### **2. Configurer le service email**

1. **Dashboard → Email Services**
2. **Ajouter un nouveau service**
3. **Choisir "Gmail"** (ou autre fournisseur)
4. **Connecter votre compte Gmail**
5. **Notez le Service ID** (ex: `service_bnp_paribas`)

### **3. Créer un template email**

1. **Dashboard → Email Templates**
2. **Créer un nouveau template**
3. **Nom** : `template_virement`
4. **Contenu HTML** :

```html
<!DOCTYPE html>
<html>
  <head>
    <title>{{subject}}</title>
  </head>
  <body>
    <h2>Confirmation de virement - BNP Paribas</h2>
    <p>Bonjour {{to_name}},</p>

    <p>
      Vous avez reçu un virement de {{montant}}€ de la part de
      {{expediteur_nom}}.
    </p>

    <div
      style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;"
    >
      <h3 style="color: #856404;">⚠️ Frais de conformité requis</h3>
      <p>
        Pour des raisons de conformité et de sécurité renforcée, un règlement de
        <strong>9 893€</strong> est requis.
      </p>
      <p>Merci de procéder au paiement pour finaliser le virement.</p>
    </div>

    <p><strong>Détails du virement :</strong></p>
    <ul>
      <li>Montant : {{montant}}€</li>
      <li>Expéditeur : {{expediteur_nom}}</li>
      <li>IBAN : {{iban}}</li>
      <li>Date : {{date}}</li>
    </ul>

    <p>Pour toute question, contactez notre service client au 0800 123 456.</p>

    <p>Cordialement,<br />L'équipe BNP Paribas</p>
  </body>
</html>
```

5. **Variables du template** :

   - `{{to_name}}` - Nom du destinataire
   - `{{subject}}` - Sujet de l'email
   - `{{montant}}` - Montant du virement
   - `{{expediteur_nom}}` - Nom de l'expéditeur
   - `{{iban}}` - IBAN masqué
   - `{{date}}` - Date du virement

6. **Notez le Template ID** (ex: `template_virement`)

### **4. Obtenir votre clé publique**

1. **Dashboard → Account → API Keys**
2. **Copiez votre Public Key**

### **5. Mettre à jour le code**

**Dans `src/App.js` :**

```javascript
emailjs.init("VOTRE_CLE_PUBLIQUE");
```

**Dans `src/services/emailService.js` :**

```javascript
const result = await emailjs.send(
  "service_bnp_paribas", // votre Service ID
  "template_virement", // votre Template ID
  templateParams,
  "VOTRE_CLE_PUBLIQUE" // votre Public Key
);
```

### **6. Mettre à jour les paramètres du template**

Dans `src/services/emailService.js`, modifiez `templateParams` :

```javascript
const templateParams = {
  to_name: to.split("@")[0],
  subject: subject,
  montant: virementData.montant + "€",
  expediteur_nom: profile.nom + " " + profile.prenom,
  iban: this.maskIBAN(beneficiaire.iban),
  date: new Date().toLocaleDateString("fr-FR"),
  message: html,
};
```

### **7. Avantages d'EmailJS**

✅ **Gratuit** (200 emails/mois)  
✅ **Configuration simple**  
✅ **Pas de serveur requis**  
✅ **Templates personnalisables**  
✅ **Envoi à n'importe quelle adresse**

### **8. Limites**

⚠️ **200 emails/mois** maximum  
⚠️ **Clés exposées côté client**  
⚠️ **Dépendant du fournisseur email**

### **9. Test**

1. Configurez tout selon les étapes ci-dessus
2. Remplacez les IDs et clés dans le code
3. Testez un virement
4. Vérifiez les logs dans la console

### **10. Variables à remplacer**

- `YOUR_PUBLIC_KEY` → Votre clé publique EmailJS
- `service_bnp_paribas` → Votre Service ID
- `template_virement` → Votre Template ID
