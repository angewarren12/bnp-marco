import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import './App.css';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

function App() {
  useEffect(() => {
    // Initialiser EmailJS
    emailjs.init("u9q4QhywRWjrfKnHj"); // Remplacez par votre clé publique
  }, []);

  return (
    <Router>
    <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
    </div>
    </Router>
  );
}

export default App;
