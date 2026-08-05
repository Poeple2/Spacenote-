import React, { useEffect, useState } from 'react';

import monLogoContour from './logo1.jpeg';

const LOGO_CONTOUR_URL = monLogoContour;

export default function SplashScreen({ onDone }) {
  const [step, setStep] = useState('step1');

  useEffect(() => {
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
    <div
      style={{
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
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '320px',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 1,
              transform: 'scale(1)',
              ...transitionStyle,
            }}
          >
            {LOGO_CONTOUR_URL && (
              <img
                src={LOGO_CONTOUR_URL}
                alt="SpaceNotes"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            )}
          </div>
        </div>

        <div
          style={{
            fontSize: '32px',
            fontWeight: '600',
            color: '#000000',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            letterSpacing: '-0.5px',
            opacity: step !== 'step1' ? 1 : 0,
            transform: step !== 'step1' ? 'translateY(0)' : 'translateY(15px)',
            ...transitionStyle,
          }}
        >
          SpaceNotes
        </div>

        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: step === 'step3' ? 1 : 0,
            transform: step === 'step3' ? 'translateY(0)' : 'translateY(20px)',
            ...transitionStyle,
            transitionDelay: '0.1s',
          }}
        >
          <div
            style={{
              width: '210px',
              height: '1px',
              backgroundColor: '#d1d1d6',
              margin: '28px 0',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8e8e93',
              }}
            >
              <i className="fa-solid fa-lock" style={{ fontSize: '25px' }}></i>
            </div>

            <span
              style={{
                fontSize: '15px',
                color: '#8e8e93',
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontWeight: '500',
              }}
            >
              End-to-end encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}