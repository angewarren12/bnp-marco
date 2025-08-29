import React, { useState } from 'react';
import './PaiementPage.css';

const PaiementPage = ({ onClose }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [formData, setFormData] = useState({
    montant: '',
    beneficiaire: '',
    reference: '',
    motif: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const paiementOptions = [
    {
      id: 'sepa',
      title: 'Paiement SEPA',
      description: 'Paiement vers un compte bancaire européen',
      icon: '🏦',
      color: '#008854'
    },
    {
      id: 'facture',
      title: 'Paiement de facture',
      description: 'Payer une facture avec référence',
      icon: '📄',
      color: '#FF6B35'
    },
    {
      id: 'mobile',
      title: 'Paiement mobile',
      description: 'Paiement par téléphone portable',
      icon: '📱',
      color: '#4ECDC4'
    },
    {
      id: 'urgence',
      title: 'Paiement d\'urgence',
      description: 'Paiement traité en priorité',
      icon: '🚨',
      color: '#DC3545'
    }
  ];

  const handleConfirm = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="paiement-overlay">
      <div className="paiement-modal">
        <div className="modal-header">
          <h1>Nouveau paiement</h1>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          {/* Message d'erreur de conformité */}
          <div className="compliance-error">
            <div className="error-header">
              <i className="fas fa-ban"></i>
              <h2>Paiements temporairement indisponibles</h2>
            </div>
            
            <div className="error-content">
              <div className="compliance-message">
                <p>Votre compte a été réactivé le <strong>22/07/2025</strong>. Pour des raisons de conformité et de sécurité renforcée, les opérations de paiement sont temporairement suspendues.</p>
                
                <div className="compliance-details">
                  <div className="compliance-fees-display">
                    <span className="fees-title">Frais de conformité requis :</span>
                    <span className="fees-value">9 893€</span>
                  </div>
                  
                  <div className="compliance-reason">
                    <h4>Pourquoi ces frais ?</h4>
                    <ul>
                      <li>Vérification de conformité post-réactivation</li>
                      <li>Renforcement des mesures de sécurité</li>
                      <li>Validation des opérations financières</li>
                      <li>Contrôle anti-blanchiment renforcé</li>
                    </ul>
                  </div>
                  
                  <div className="compliance-action">
                    <p>Merci de régler ces frais pour réactiver l'accès à vos services de paiement.</p>
                    <button className="contact-support-btn" onClick={() => alert('Redirection vers le support client')}>
                      <i className="fas fa-headset"></i>
                      Contacter le support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaiementPage; 