import React, { useEffect, useState } from 'react';

// =========================================================================
// 1. IMPORTATION DIRECTE DU FICHIER LOGO UNIQUE (Contour)
// =========================================================================
import monLogoContour from './logo1.jpeg'; 

// 2. ASSIGNATION À LA VARIABLE UTILISÉE DANS LE COMPOSANT
const LOGO_CONTOUR_URL = monLogoContour; 
const ICONE_CADENAS_URL = ""; // Laissez vide pour avoir le carré simple par défaut


export default function SplashScreen({ onDone }) {
  const [step, setStep] = useState('step1');

  useEffect(() => {
    // Le logo contour s'affiche directement, le texte "SpaceNotes" apparaît en Étape 2 (step2)
    const t1 = setTimeout(() => setStep('step2'), 1500); 
    const t2 = setTimeout(() => setStep('step3'), 3000); 
    const t3 = setTimeout(() => setStep('fade'), 4500);  
    const t4 = setTimeout(() => onDone && onDone(), 5100); 
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onDone]);

  const transitionStyle = {
    transition: 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      opacity: step === 'fade' ? 0 : 1,
      transition: 'opacity 0.6s ease-in-out',
    }}>

      {/* ── CONTENEUR PRINCIPAL CENTRÉ ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '320px',
      }}>

        {/* ── ZONE LOGO (Directement actif dès l'ouverture) ── */}
        <div style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          marginBottom: '28px',
        }}>
          
          {/* LOGO CONTOUR UNIQUE (Toujours visible et stable) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 1,
            transform: 'scale(1)',
            ...transitionStyle,
          }}>
            {LOGO_CONTOUR_URL && (
              <img 
                src={LOGO_CONTOUR_URL} 
                alt="Logo Contour" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }} 
              />
            )}
          </div>
        </div>

        {/* ── TEXTE : "SpaceNotes" (Apparaît en Étape 2) ── */}
        <div style={{
          fontSize: '32px',
          fontWeight: '600',
          color: '#000000',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          letterSpacing: '-0.5px',
          opacity: step !== 'step1' ? 1 : 0,
          transform: step !== 'step1' ? 'translateY(0)' : 'translateY(15px)',
          ...transitionStyle,
        }}>
          SpaceNotes
        </div>

        {/* ── SÉPARATEUR & TAGLINE (Apparaît en Étape 3) ── */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: step === 'step3' ? 1 : 0,
          transform: step === 'step3' ? 'translateY(0)' : 'translateY(20px)',
          ...transitionStyle,
          transitionDelay: '0.1s',
        }}>
          {/* Ligne de séparation */}
          <div style={{
            width: '210px',
            height: '1px',
            backgroundColor: '#e5e5ea',
            margin: '28px 0',
          }} />

          {/* Carré + Texte */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}>
            
            {/* LE CARRÉ (Vide par défaut, ou contient votre icône si configurée) */}
            <div style={{
              width: '26px',
              height: '26px',
              border: '1.5px solid #aeaeaf',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {ICONE_CADENAS_URL ? (
                <img 
                  src={ICONE_CADENAS_URL} 
                  alt="Icone Encrypted" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              ) : null /* Laisse le carré vide comme sur la maquette */}
            </div>

            <span style={{
              fontSize: '15px',
              color: '#8e8e93',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: '400',
            }}>
              End-to-end encrypted
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}