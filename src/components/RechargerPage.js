import React, { useState } from 'react';
import './RechargerPage.css';

const RechargerPage = ({ onClose }) => {
  const [selectedService, setSelectedService] = useState('');
  const [formData, setFormData] = useState({
    numero: '',
    montant: '',
    operateur: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const services = [
    {
      id: 'mobile',
      title: 'Recharge mobile',
      description: 'Recharger votre forfait mobile',
      icon: '📱',
      color: '#4ECDC4',
      operateurs: ['Orange', 'SFR', 'Bouygues', 'Free']
    },
    {
      id: 'transport',
      title: 'Transport',
      description: 'Recharger votre carte de transport',
      icon: '🚇',
      color: '#FF6B35',
      operateurs: ['RATP', 'SNCF', 'TER']
    },
    {
      id: 'energie',
      title: 'Énergie',
      description: 'Payer votre facture d\'énergie',
      icon: '⚡',
      color: '#FFC107',
      operateurs: ['EDF', 'Engie', 'Total Energies']
    },
    {
      id: 'internet',
      title: 'Internet',
      description: 'Payer votre facture internet',
      icon: '🌐',
      color: '#17A2B8',
      operateurs: ['Orange', 'SFR', 'Free', 'Bouygues']
    }
  ];

  const montants = [5, 10, 20, 30, 50, 100];

  const handleConfirm = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="recharger-overlay">
      <div className="recharger-modal">
        <div className="modal-header">
          <h1>Recharger</h1>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          {!selectedService ? (
            <div className="services-grid">
              <h2>Choisissez le service</h2>
              {services.map(service => (
                <div
                  key={service.id}
                  className="service-option"
                  onClick={() => setSelectedService(service.id)}
                  style={{'--service-color': service.color}}
                >
                  <div className="service-icon">{service.icon}</div>
                  <div className="service-content">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                  <div className="service-arrow">→</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="recharger-form">
              <h2>{services.find(s => s.id === selectedService)?.title}</h2>
              
              <div className="form-group">
                <label>Numéro</label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => setFormData({...formData, numero: e.target.value})}
                  placeholder="Numéro de téléphone ou compte"
                />
              </div>

              <div className="form-group">
                <label>Opérateur</label>
                <select
                  value={formData.operateur}
                  onChange={(e) => setFormData({...formData, operateur: e.target.value})}
                >
                  <option value="">Sélectionnez un opérateur</option>
                  {services.find(s => s.id === selectedService)?.operateurs.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Montant</label>
                <div className="montants-grid">
                  {montants.map(montant => (
                    <button
                      key={montant}
                      className={`montant-btn ${formData.montant === montant.toString() ? 'selected' : ''}`}
                      onClick={() => setFormData({...formData, montant: montant.toString()})}
                    >
                      {montant}€
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={formData.montant}
                  onChange={(e) => setFormData({...formData, montant: e.target.value})}
                  placeholder="Ou saisissez un montant personnalisé"
                  className="montant-custom"
                />
              </div>

              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setSelectedService('')}>
                  Retour
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? 'Recharge en cours...' : 'Confirmer la recharge'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RechargerPage; 