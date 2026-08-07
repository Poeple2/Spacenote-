import React, { useState, useEffect, useRef } from 'react';


// Utilisation d'images statiques locales conformément aux imports du projet
import monLogoContour from './logo1.jpeg'; 
import iconeAI from './logo2.jpeg'; 
import iconeUnemployed from './logo3.jpeg'; 
// Logo utilisé UNIQUEMENT pour l'icône qui orbite dans la spirale (différent du logo central).
// Remplace le fichier logo4.jpeg (ou change ce chemin) par ton propre visuel pour la spirale.
import logoOrbit from './logo.jpeg'; 

// Données des rôles adaptées à la maquette
const ROLES = [
  { id: 'people', label: 'People', faIcon: 'fa-user', iconColor: '#000000' },
  { id: 'companies', label: 'Companies', faIcon: 'fa-building', iconColor: '#0072c6' },
  { id: 'ai', label: 'Artificial Intelligence', icon: iconeAI, isAI: true },
];

// Liste des occupations de la maquette
const OCCUPATIONS = [
  { id: 'unemployed', label: 'Unemployed', icon: iconeUnemployed },
  { id: 'student', label: 'Student', faIcon: 'fa-book-open', iconColor: '#00b956' },
  { id: 'employee', label: 'Employee', faIcon: 'fa-id-card', iconColor: '#0072c6' },
  { id: 'self-employed', label: 'Self-employed', faIcon: 'fa-user-tie', iconColor: '#000000' },
  { id: 'retired', label: 'Retired', faIcon: 'fa-umbrella-beach', iconColor: '#ffbc00' },
];

// Liste des domaines d'intérêt avec leurs couleurs respectives
const INTERESTS = [
  { id: 'news', label: 'News', color: '#f7ca6d', faIcon: 'fa-feather-pointed', iconColor: '#000000' },
  { id: 'technology', label: 'Technology', color: '#0072c6', faIcon: 'fa-robot', iconColor: '#ffffff' },
  { id: 'product', label: 'Product & Innovation', color: '#e5e5e5', faIcon: 'fa-vr-cardboard', iconColor: '#000000' },
  { id: 'business', label: 'Business', color: '#00b050', faIcon: 'fa-building', iconColor: '#ffffff' },
  { id: 'sports', color: '#e5e5e5', label: 'Sports', faIcon: 'fa-person-running', iconColor: '#000000' },
  { id: 'gaming', label: 'Gaming', color: '#7030a0', faIcon: 'fa-gamepad', iconColor: '#ffffff' },
  { id: 'entertainment', label: 'Entertainment', color: '#e5e5e5', faIcon: 'fa-tv', iconColor: '#000000' },
  { id: 'music', label: 'Music', color: '#ff0000', faIcon: 'fa-music', iconColor: '#ffffff' },
  { id: 'culture', label: 'Culture', color: '#f2c9e6', faIcon: 'fa-masks-theater', iconColor: '#000000' },
  { id: 'society', label: 'Society', color: '#add8e6', faIcon: 'fa-people-group', iconColor: '#000000' },
  { id: 'travel', label: 'Travel', color: '#000000', faIcon: 'fa-plane', iconColor: '#ffffff' },
  { id: 'careers', label: 'Careers', color: '#c0501f', faIcon: 'fa-briefcase', iconColor: '#ffffff' },
  { id: 'lifestyle', label: 'Lifestyle', color: '#e5e5e5', faIcon: 'fa-heart', iconColor: '#000000' },
  { id: 'family', label: 'Family', color: '#0070c0', faIcon: 'fa-people-roof', iconColor: '#ffffff' },
  { id: 'family2', label: 'Family', color: '#da70d6', faIcon: 'fa-child-reaching', iconColor: '#ffffff' },
];

const COUNTRY_CODES = [
  { code: '+33', flag: '🇫🇷' },
  { code: '+7', flag: '🇷🇺' },
  { code: '+1', flag: '🇺🇸' },
  { code: '+86', flag: '🇨🇳' },
  { code: '+49', flag: '🇩🇪' },
  { code: '+44', flag: '🇬🇧' },
  { code: '+39', flag: '🇮🇹' },
  { code: '+34', flag: '🇪🇸' },
  { code: '+1', flag: '🇨🇦' },
  { code: '+81', flag: '🇯🇵' },
  { code: '+61', flag: '🇦🇺' },
  { code: '+55', flag: '🇧🇷' },
  { code: '+91', flag: '🇮🇳' },
  { code: '+212', flag: '🇲🇦' },
  { code: '+221', flag: '🇸🇳' },
  { code: '+32', flag: '🇧🇪' },
  { code: '+41', flag: '🇨🇭' }
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Génération d'une plage d'années réaliste
const YEARS = Array.from({ length: 100 }, (_, i) => 2026 - i);

// Liste des jours du mois (utilisée par la molette de date de naissance)
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

// Paramètres géométriques de la molette de sélection façon iOS
const WHEEL_ITEM_HEIGHT = 44;
const WHEEL_VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS;
const WHEEL_PADDING = (WHEEL_HEIGHT - WHEEL_ITEM_HEIGHT) / 2;

const S = {
  page: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    zIndex: 9998,
    background: '#ffffff',
    userSelect: 'none',
  },
  welcomeBg: {
    position: 'fixed',
    inset: 0,
    background: '#e5e5e5', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    boxSizing: 'border-box',
    zIndex: 10000,
  },
  welcomeCard: {
    background: '#ffffff',
    width: '100%',
    maxWidth: '960px',
    borderRadius: '40px',
    padding: '60px 40px',
    boxShadow: '0px 10px 40px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  panelWhite: {
    flex: '0 0 50%',
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 60px',
    boxSizing: 'border-box',
    overflowY: 'auto',
    position: 'relative',
  },
  panelGray: {
    flex: '0 0 50%',
    background: '#e5e5e5', 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 60px',
    boxSizing: 'border-box',
    textAlign: 'center',
    position: 'relative',
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#000000',
    margin: '0 0 16px 0',
    letterSpacing: '-0.5px',
  },
  desc: {
    fontSize: '20px',
    color: '#7f7f7f',
    lineHeight: '1.4',
    maxWidth: '380px',
    margin: '0 0 24px 0',
    fontWeight: '400',
  },
  input: {
    width: '100%',
    height: '50px',
    fontSize: '14px',
    border: '1px solid #cccccc',
    borderRadius: '10px',
    outline: 'none',
    background: '#ffffff',
    color: '#333333',
    padding: '0 20px',
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  select: {
    width: '100%',
    height: '50px',
    fontSize: '14px',
    border: '1px solid #cccccc',
    borderRadius: '10px',
    outline: 'none',
    background: '#ffffff',
    color: '#333333',
    padding: '0 20px',
    boxSizing: 'border-box',
    textAlign: 'center',
    cursor: 'pointer',
  },
  customSelectTrigger: {
    width: '100%',
    height: '50px',
    fontSize: '14px',
    border: '1px solid #cccccc',
    borderRadius: '10px',
    background: '#ffffff',
    color: '#7f7f7f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    cursor: 'pointer',
    padding: '0 20px',
    boxSizing: 'border-box',
  },
  btnYellow: {
    width: '280px',
    height: '44px',
    fontSize: '11px',
    fontWeight: '800',
    background: '#ffbc00',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: '0 2px 8px rgba(255, 188, 0, 0.2)',
  },
  btnNextDisabled: {
    width: '280px',
    height: '44px',
    fontSize: '11px',
    fontWeight: '800',
    background: '#e5e5ea',
    color: '#aeaeaf',
    border: 'none',
    borderRadius: '6px',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  btnSocialBadge: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    background: '#e5e5e5',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    width: '340px',
    margin: '12px 0 20px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#e5e5e5',
  },
  dividerText: {
    fontSize: '13px',
    color: '#a0a0a0',
  },
  link: {
    color: '#555555',
    cursor: 'pointer',
    fontSize: '13px',
    textDecoration: 'underline',
    fontWeight: '400',
  },
  stepperContainer: {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1px',
  margin: '0 0 42px 0',
},
  stepCircle: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
  },
  stepLine: {
    width: '12px',
    height: '1px',
    background: '#cccccc',
  },
  wheelPickerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '24px',
    height: '240px',
    margin: '40px 0',
    position: 'relative',
    overflow: 'hidden',
  },
  wheelColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    height: '100%',
    overflowY: 'auto',
    scrollbarWidth: 'none',
    width: '100px',
  },
  wheelActiveBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    height: '42px',
    borderTop: '1px solid #e5e5e5',
    borderBottom: '1px solid #e5e5e5',
    pointerEvents: 'none',
  },
  pickerFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '340px',
    marginTop: 'auto',
    paddingBottom: '20px',
  },
  pickerBtn: {
    height: '36px',
    borderRadius: '8px',
    border: '1.5px solid #e5e5e5',
    background: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 24px',
  },
  backSquareBtn: {
    position: 'absolute',
    top: '24px',
    left: '24px',
    width: '32px',
    height: '32px',
    border: '1px solid #cccccc',
    borderRadius: '6px',
    background: '#ffffff',
    cursor: 'pointer',
  }
};

// Colonne de molette rotative façon iOS (défilement + snap + effet de fondu sur la profondeur)
const WheelColumn = ({ items, selectedIndex, onSelectIndex, renderItem, width = 110, fontScale = 1 }) => {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const safeIndex = Math.max(0, selectedIndex);
  const [scrollTop, setScrollTop] = useState(safeIndex * WHEEL_ITEM_HEIGHT);

  // Positionne la molette sur l'élément sélectionné à l'ouverture
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = safeIndex * WHEEL_ITEM_HEIGHT;
      setScrollTop(safeIndex * WHEEL_ITEM_HEIGHT);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e) => {
    const top = e.target.scrollTop;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setScrollTop(top);
      const idx = Math.round(top / WHEEL_ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      if (clamped !== safeIndex) {
        onSelectIndex(clamped);
      }
    });
  };

  const handleClickItem = (idx) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: idx * WHEEL_ITEM_HEIGHT, behavior: 'smooth' });
    }
    onSelectIndex(idx);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: `${WHEEL_HEIGHT}px`,
        width: `${width}px`,
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div style={{ height: `${WHEEL_PADDING}px` }} />
      {items.map((item, i) => {
        const itemCenter = WHEEL_PADDING + i * WHEEL_ITEM_HEIGHT + WHEEL_ITEM_HEIGHT / 2;
        const scrollCenter = scrollTop + WHEEL_HEIGHT / 2;
        const distance = Math.min(Math.abs(itemCenter - scrollCenter) / WHEEL_ITEM_HEIGHT, 2);
        const fontSize = (22 - distance * 4) * fontScale;
        const opacity = Math.max(1 - distance * 0.4, 0.2);
        const isCenter = distance < 0.4;

        return (
          <div
            key={i}
            onClick={() => handleClickItem(i)}
            style={{
              height: `${WHEEL_ITEM_HEIGHT}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              scrollSnapAlign: 'center',
              fontSize: `${fontSize}px`,
              fontWeight: isCenter ? '600' : '400',
              color: '#000000',
              opacity,
              cursor: 'pointer',
            }}
          >
            {renderItem(item)}
          </div>
        );
      })}
      <div style={{ height: `${WHEEL_PADDING}px` }} />
    </div>
  );
};

const CentralLogo = () => (
  <div style={{
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100px',
    height: '100px',
    background: '#ffffff',
    borderRadius: '1px',
    
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '12px',
    boxSizing: 'border-box',
    pointerEvents: 'none',
  }}>
    <img 
      src={monLogoContour} 
      alt="SpaceNotes" 
      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
    />
  </div>
);

// Style adjustments for loading orbital page keyframe rotations
const animationStyles = `
@keyframes orbit {
  from { transform: rotate(0deg) translateX(115px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(115px) rotate(-360deg); }
}
`;

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('welcome'); 
  
  // States Sign In
  const [siEmail, setSiEmail] = useState('');
  const [showSiEmail, setShowSiEmail] = useState(false);
  const [siPass, setSiPass] = useState('');
  const [showSiPass, setShowSiPass] = useState(false);

  // States Sign Up
  const [suStep, setSuStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false); 
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  
  // Étape 2 (Occupation)
  const [occupation, setOccupation] = useState('');
  const [isOccupationDropdownOpen, setIsOccupationDropdownOpen] = useState(false);
  const [institution, setInstitution] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isInterestDropdownOpen, setIsInterestDropdownOpen] = useState(false);

  // Étape 3 (Infos contact)
  const [birthdate, setBirthdate] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+33');
  const [phone, setPhone] = useState('');

  // Overlays Étape 3
  const [isBirthdatePickerOpen, setIsBirthdatePickerOpen] = useState(false);
  const [isCountryCodePickerOpen, setIsCountryCodePickerOpen] = useState(false);

  // Sélections temporaires pour la molette Date de Naissance
  const [tempMonth, setTempMonth] = useState('July');
  const [tempDay, setTempDay] = useState(8);
  const [tempYear, setTempYear] = useState(2026);

  // Sélection temporaire pour le pays
  const [tempCountry, setTempCountry] = useState('+1');

  // Étape 4 (Mots de passe)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordSuggestion, setShowPasswordSuggestion] = useState(false);

  // Écrans de transition de l'inscription
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isFinalLogoScreen, setIsFinalLogoScreen] = useState(false);
  const [isSignInVerified, setIsSignInVerified] = useState(false);

  // ── États pour le flow "Mot de passe oublié" ──
  const [resetCode, setResetCode] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [useFaceIdForPassword, setUseFaceIdForPassword] = useState(false);

  // Validation dynamique des étapes
  const isStep1Valid = selectedRole !== '' && username.trim() !== '' && fullname.trim() !== '';
  const isStep2Valid = occupation !== '' && selectedInterests.length > 0;
  const isStep3Valid = birthdate !== '' && email.trim() !== '' && phone.trim() !== '';
  const isStep4Valid = password.trim() !== '' && confirmPassword.trim() !== '' && password === confirmPassword;

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = animationStyles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const handleSignIn = () => {
    if (!siEmail.trim() || !siPass.trim()) return;
    setIsSignInVerified(true);
    setTimeout(() => {
      onAuth && onAuth();
    }, 2500);
  };

  const handleSignUpNext = () => {
    if (suStep < 4) {
      setSuStep(suStep + 1);
    } else {
      // Déclenchement de la séquence d'écrans de chargement animés
      setIsProcessing(true);
      
      // Phase 1 : "Wait a minute" pendant 3.5 secondes (image_e51317.png)
      setTimeout(() => {
        setIsVerified(true);
        
        // Phase 2 : "Your information has been verified" pendant 3.5 secondes (image_e516b8.png)
        setTimeout(() => {
          setIsFinalLogoScreen(true);
          
          // Phase 3 : Écran logo minimaliste blanc pendant 1.5 secondes (image_e519df.png)
          setTimeout(() => {
            onAuth && onAuth();
          }, 1500);
        }, 3500);
      }, 3500);
    }
  };

  const handleSignUpBack = () => {
    if (suStep > 1) setSuStep(suStep - 1);
  };

  const selectRoleOption = (roleLabel) => {
    setSelectedRole(roleLabel);
    setIsRoleDropdownOpen(false);
  };

  const selectOccupationOption = (occLabel) => {
    setOccupation(occLabel);
    setIsOccupationDropdownOpen(false);
  };

  const toggleInterestOption = (interestId) => {
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests(selectedInterests.filter(id => id !== interestId));
    } else {
      setSelectedInterests([...selectedInterests, interestId]);
    }
  };

  const saveBirthdate = () => {
    const monthIndex = MONTHS.indexOf(tempMonth) + 1;
    const formattedMonth = String(monthIndex).padStart(2, '0');
    const formattedDay = String(tempDay).padStart(2, '0');
    setBirthdate(`${formattedDay}/${formattedMonth}/${tempYear}`);
    setIsBirthdatePickerOpen(false);
  };

  const saveCountryCode = () => {
    setCountryCode(tempCountry);
    setIsCountryCodePickerOpen(false);
  };

  // ── Handlers pour le flow "Mot de passe oublié" ──
  const handleOpenForgotPassword = () => {
    setMode('forgot-verify');
  };

  const handleVerifyResetCode = () => {
    if (!resetCode.trim()) return;
    setMode('forgot-reset');
  };

  const handleResendCode = () => {
    setIsResending(true);
    setResetCode('');
    setTimeout(() => setIsResending(false), 2000);
  };

  const handleChooseFaceId = () => {
    setUseFaceIdForPassword(true);
  };

  const handleConfirmNewPassword = () => {
    if (!useFaceIdForPassword && newResetPassword.trim().length < 6) return;
    setMode('forgot-success');
    setTimeout(() => {
      setMode('signin');
      setResetCode('');
      setNewResetPassword('');
      setUseFaceIdForPassword(false);
    }, 2500);
  };

  const handleBackToSignIn = () => {
    setMode('signin');
    setResetCode('');
    setNewResetPassword('');
    setUseFaceIdForPassword(false);
  };

  // Génère un mot de passe fort côté front-end, sans besoin de backend
  const generateStrongPassword = (closeAfter = true) => {
    const length = 14;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*-_';
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);

    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }

    setPassword(result);
    setConfirmPassword(result);
    setShowPassword(true);
    setShowConfirmPassword(true);
    if (closeAfter) setShowPasswordSuggestion(false);
  };

  const renderStepper = () => (
    <div style={S.stepperContainer}>
      {[1, 2, 3, 4].map((step, idx) => {
        const isCurrent = suStep === step;
        const isCompleted = step < suStep;
        return (
          <React.Fragment key={step}>
            <div style={{
              ...S.stepCircle,
              border: isCurrent ? '2px solid #ffbc00' : 'none',
              background: isCurrent ? '#ffffff' : isCompleted ? '#ffbc00' : '#cccccc',
              color: isCurrent ? '#000000' : '#ffffff',
            }}>
              {step}
            </div>
            {idx < 3 && <div style={S.stepLine} />}
          </React.Fragment>
        );
      })}
    </div>
  );

  if (mode === 'welcome') {
    return (
      <div style={S.welcomeBg}>
        <div style={S.welcomeCard}>
          <h1 style={{ fontSize: '46px', fontWeight: '500', color: '#000000', margin: '0 0 24px 0', letterSpacing: '-0.5px' }}>
            Welcome to SpaceNotes
          </h1>
          <p style={{ fontSize: '19px', lineHeight: '1.45', color: '#86868b', maxWidth: '720px', margin: '0 0 40px 0', fontWeight: '400' }}>
            SpaceNotes lets you quickly jot down whatever pops into your head or save longer texts, 
            including to-do lists, images, links to websites, scanned documents, handwritten notes 
            or sketches. You can also use AI to enhance your notes, helping you record and 
            automate your business calls and other tasks.
          </p>
          <button onClick={() => setMode('signin')} style={S.btnYellow}>
            CONTINUE
          </button>
          <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', gap: '10px', color: '#86868b', fontSize: '14px', fontWeight: '600' }}>
            <i className="fa-solid fa-lock" style={{ fontSize: '18px' }}></i>
            <span>End-to-end encrypted</span>
          </div>
        </div>
      </div>
    );
  }

  // ── ÉCRAN DE CHARGEMENT FINAL ULTRA-MINIMALISTE (image_e519df.png) ──
  if (isFinalLogoScreen) {
    return (
      <div style={{
        ...S.page,
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          padding: '12px',
          boxSizing: 'border-box'
        }}>
          <img 
            src={monLogoContour} 
            alt="SpaceNotes" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        </div>
      </div>
    );
  }

  // ── ÉCRAN DE TRAITEMENT (WAIT A MINUTE - image_e51317.png) ──
  if (isProcessing && !isVerified) {
    return (
      <div style={S.page}>
        <CentralLogo />
        <div style={{ ...S.panelWhite, flex: '0 0 50%', justifyContent: 'center', alignItems: 'center' }}>
          
          {/* Graphique de cercles concentriques avec icône orbitale */}
          <div style={{
            position: 'relative',
            width: '280px',
            height: '280px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '40px'
          }}>
            {/* Cercles concentriques */}
            <div style={{ position: 'absolute', width: '260px', height: '260px', borderRadius: '50%', border: '1.5px solid #e5e5e5' }} />
            <div style={{ position: 'absolute', width: '180px', height: '180px', borderRadius: '50%', border: '1.5px solid #e5e5e5' }} />

            {/* Logo qui orbite dans la spirale — image dédiée, différente du logo central */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '36px',
              height: '36px',
              marginTop: '-18px',
              marginLeft: '-18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'orbit 4s linear infinite',
              transformOrigin: 'center center'
            }}>
              <img src={logoOrbit} alt="SpaceNotes orbit" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>

          <h1 style={{ ...S.title, fontSize: '28px', textAlign: 'center', marginBottom: '8px' }}>
            Wait a minute<br />Your information<br />are being processed
          </h1>
          
          <p style={{
            fontSize: '11px',
            color: '#8e8e93',
            textAlign: 'center',
            lineHeight: '1.6',
            maxWidth: '320px',
            marginTop: '20px'
          }}>
            You are about to discover an infinite part of the People universe through SpaceNotes. This is not about pushing you into another reality. Rather, it is to make you understand that as long as you are breathing, you are the reality.
          </p>
        </div>

        {/* Panneau de droite constant */}
        <div style={S.panelGray}>
          <h2 style={{ ...S.title, fontSize: '36px', marginBottom: '24px' }}>Welcome back !</h2>
          <p style={S.desc}>
            To keep connected with us, please log in with your personal info.
          </p>
          <button style={{ ...S.btnYellow, background: '#ffbc00' }}>SIGN UP</button>
        </div>
      </div>
    );
  }

  // ── ÉCRAN DE SUCCÈS CONNEXION / INSCRIPTION ──
  if (isSignInVerified || (isProcessing && isVerified)) {
    return (
      <div style={S.page}>
        <CentralLogo />
        <div style={{ ...S.panelWhite, flex: '0 0 50%', justifyContent: 'center', alignItems: 'center' }}>
          
          {/* Graphique Cercle + Carré de validation */}
          <div style={{
            position: 'relative',
            width: '280px',
            height: '280px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '40px'
          }}>
            <div style={{ position: 'absolute', width: '260px', height: '260px', borderRadius: '50%', border: '1.5px solid #dcdcdc' }} />
            <div style={{
              width: '120px',
              height: '120px',
              border: '3px solid #00b956',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box'
            }}>
              <span
                aria-hidden="true"
                style={{
                  color: '#00b956',
                  fontSize: '86px',
                  fontWeight: '800',
                  lineHeight: 1,
                  transform: 'translateY(-3px)'
                }}
              >
                ✓
              </span>
            </div>
          </div>

          <h1 style={{ ...S.title, fontSize: '28px', textAlign: 'center', marginBottom: '8px' }}>
            {isSignInVerified ? (
              <>Connection successful,<br />enter in SpaceNotes</>
            ) : (
              <>Your information has been<br />verified, enter in SpaceNotes</>
            )}
          </h1>
          
          <p style={{
            fontSize: '11px',
            color: '#8e8e93',
            textAlign: 'center',
            lineHeight: '1.6',
            maxWidth: '320px',
            marginTop: '20px'
          }}>
            You are about to discover an infinite part of the People universe through SpaceNotes. This is not about pushing you into another reality. Rather, it is to make you understand that as long as you are breathing, you are the reality.
          </p>
        </div>

        {/* Panneau de droite constant */}
        <div style={S.panelGray}>
          <h2 style={{ ...S.title, fontSize: '36px', marginBottom: '24px' }}>Welcome back !</h2>
          <p style={S.desc}>
            To keep connected with us, please log in with your personal info.
          </p>
          <button style={{ ...S.btnYellow, background: '#ffbc00' }}>SIGN UP</button>
        </div>
      </div>
    );
  }

  // ── ÉCRAN : VERIFY BOARDING PASS (étape 1 du reset de mot de passe) ──
  if (mode === 'forgot-verify') {
    return (
      <div style={S.page}>
        <CentralLogo />
        <div style={S.panelGray}>
          <h2 style={{ ...S.title, fontSize: '36px', marginBottom: '24px' }}>Hello friend !</h2>
          <p style={S.desc}>
            Enter your personal details and start your journey with us.
          </p>
          <button onClick={() => { setMode('signup'); setSuStep(1); }} style={S.btnYellow}>
            SIGN UP
          </button>
        </div>

        <div style={{ ...S.panelWhite, position: 'relative' }}>
          <div onClick={handleBackToSignIn} style={S.backSquareBtn} />

          <div style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 style={{ ...S.title, marginBottom: '16px' }}>Verify Boarding Pass</h1>
            <p style={{ fontSize: '13px', color: '#8e8e93', textAlign: 'center', lineHeight: '1.5', marginBottom: '40px', maxWidth: '300px' }}>
              Enter the 7 digit code sent to the email Address linked to your Username
            </p>

            <input
              style={{ ...S.input, marginBottom: '24px' }}
              type="text"
              maxLength={7}
              placeholder="Enter code here"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
            />

            <p style={{ fontSize: '13px', color: '#555555', marginBottom: '40px' }}>
              Didn't receive a code ?{' '}
              <span onClick={handleResendCode} style={{ fontWeight: '700', color: '#000000', cursor: 'pointer' }}>
                {isResending ? 'Sending...' : 'Resend one'}
              </span>
            </p>

            <button
              style={resetCode.trim() ? S.btnYellow : S.btnNextDisabled}
              onClick={handleVerifyResetCode}
              disabled={!resetCode.trim()}
            >
              CONFIRM
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── ÉCRAN : RESEND PASSWORD (étape 2 du reset de mot de passe) ──
  if (mode === 'forgot-reset') {
    return (
      <div style={S.page}>
        <CentralLogo />
        <div style={S.panelGray}>
          <h2 style={{ ...S.title, fontSize: '36px', marginBottom: '24px' }}>Hello friend !</h2>
          <p style={S.desc}>
            Enter your personal details and start your journey with us.
          </p>
          <button onClick={() => { setMode('signup'); setSuStep(1); }} style={S.btnYellow}>
            SIGN UP
          </button>
        </div>

        <div style={{ ...S.panelWhite, position: 'relative' }}>
          <div onClick={handleBackToSignIn} style={S.backSquareBtn} />

          <div style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 style={{ ...S.title, marginBottom: '16px' }}>Resend Password</h1>
            <p style={{ fontSize: '13px', color: '#8e8e93', textAlign: 'center', lineHeight: '1.5', marginBottom: '40px', maxWidth: '320px' }}>
              Your password has expired; please choose a new password. Your password must be at least six characters and cannot contain spaces or match your email address.
            </p>

            {!useFaceIdForPassword ? (
              <input
                style={{ ...S.input, marginBottom: '24px' }}
                type="password"
                placeholder="New password"
                value={newResetPassword}
                onChange={(e) => setNewResetPassword(e.target.value)}
              />
            ) : (
              <div style={{ ...S.input, marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7f7f7f' }}>
                Face ID enabled
              </div>
            )}

            <p style={{ fontSize: '13px', color: '#555555', marginBottom: '40px' }}>
              Choose Face ID as password ?{' '}
              <span onClick={handleChooseFaceId} style={{ fontWeight: '700', color: '#000000', cursor: 'pointer' }}>
                Click here !
              </span>
            </p>

            <button
              style={(useFaceIdForPassword || newResetPassword.trim().length >= 6) ? S.btnYellow : S.btnNextDisabled}
              onClick={handleConfirmNewPassword}
              disabled={!useFaceIdForPassword && newResetPassword.trim().length < 6}
            >
              CONFIRM
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── ÉCRAN : SUCCÈS DU RESET (Visa accepted) ──
  if (mode === 'forgot-success') {
    return (
      <div style={S.page}>
        <CentralLogo />
        <div style={S.panelGray}>
          <h2 style={{ ...S.title, fontSize: '36px', marginBottom: '24px' }}>Hello friend !</h2>
          <p style={S.desc}>
            Enter your personal details and start your journey with us.
          </p>
          <button onClick={() => { setMode('signup'); setSuStep(1); }} style={S.btnYellow}>
            SIGN UP
          </button>
        </div>

        <div style={{ ...S.panelWhite, flex: '0 0 50%', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{
            position: 'relative',
            width: '280px',
            height: '280px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '40px'
          }}>
            <div style={{ position: 'absolute', width: '260px', height: '260px', borderRadius: '50%', border: '1.5px solid #dcdcdc' }} />
            <div style={{
              width: '80px',
              height: '80px',
              border: '1.5px solid #a0a0a0',
              borderRadius: '4px',
              background: '#ffffff'
            }} />
          </div>
          <h1 style={{ ...S.title, fontSize: '28px', textAlign: 'center' }}>
            Visa accepted...
          </h1>
        </div>
      </div>
    );
  }

  const isFormBlurred = isRoleDropdownOpen || isOccupationDropdownOpen || isInterestDropdownOpen || isBirthdatePickerOpen || isCountryCodePickerOpen;

  const interestPlaceholder = selectedInterests.length > 0 
    ? `${String(selectedInterests.length).padStart(2, '0')}/${INTERESTS.length} areas of interest`
    : 'Select your areas of interest';

  return (
    <div style={S.page}>
      <CentralLogo />

      {/* ───────────────────────────────────────────────────────────────────────
          MODE DE CONNEXION (SIGN IN)
          ─────────────────────────────────────────────────────────────────────── */}
      {mode === 'signin' && (
        <>
          <div style={S.panelGray}>
            <h2 style={{ ...S.title, fontSize: '36px', marginBottom: '24px' }}>Hello friend !</h2>
            <p style={S.desc}>
              Enter your personal details and start your journey with us.
            </p>
            <button onClick={() => { setMode('signup'); setSuStep(1); }} style={S.btnYellow}>
              SIGN UP
            </button>
          </div>

          <div style={S.panelWhite}>
            <div style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h1 style={{ ...S.title, marginBottom: '24px' }}>Sign in to SpaceNotes</h1>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '12px' }}>
                <button style={S.btnSocialBadge}><i className="fa-brands fa-google" style={{ color: '#EA4335' }}></i></button>
                <button style={S.btnSocialBadge}><i className="fa-brands fa-apple" style={{ color: '#000000' }}></i></button>
                <button style={S.btnSocialBadge}><i className="fa-brands fa-facebook-f" style={{ color: '#1877F2' }}></i></button>
              </div>

              <div style={S.divider}>
                <div style={S.dividerLine} />
                <span style={S.dividerText}>or</span>
                <div style={S.dividerLine} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '340px', marginBottom: '24px' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    style={{ ...S.input, paddingRight: '60px' }}
                    type={showSiEmail ? 'text' : 'password'}
                    placeholder="User name/email"
                    value={siEmail}
                    onChange={(e) => setSiEmail(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSiEmail((visible) => !visible)}
                    aria-label={showSiEmail ? 'Masquer le nom utilisateur ou email' : 'Afficher le nom utilisateur ou email'}
                    title={showSiEmail ? 'Masquer' : 'Afficher'}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '30px',
                      height: '30px',
                      padding: 0,
                      border: 'none',
                      background: 'transparent',
                      color: '#9a9a9a',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '17px',
                    }}
                  >
                    <i className={`fa-regular ${showSiEmail ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                  </button>
                </div>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input 
                    style={{ ...S.input, paddingRight: '60px' }}
                    type={showSiPass ? 'text' : 'password'} 
                    placeholder="Password"
                    value={siPass} 
                    onChange={(e) => setSiPass(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignIn()} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowSiPass((visible) => !visible)}
                    aria-label={showSiPass ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    title={showSiPass ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '32px',
                      height: '32px',
                      padding: 0,
                      border: 'none',
                      borderRadius: '50%',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#8e8e93',
                      fontSize: '17px',
                      userSelect: 'none',
                    }}
                  >
                    <i className={`fa-regular ${showSiPass ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                  </button>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={S.link} onClick={handleOpenForgotPassword}>Forgotten password ?</span>
                </div>
              </div>

              <button style={S.btnYellow} onClick={handleSignIn}>CONFIRM</button>
            </div>
          </div>
        </>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          MODE D'INSCRIPTION (SIGN UP)
          ─────────────────────────────────────────────────────────────────────── */}
      {mode === 'signup' && (
        <>
          {/* GAUCHE : Formulaire d'inscription */}
          <div style={{
            ...S.panelWhite,
            height: '100vh',
            justifyContent: 'flex-start',
            padding: '32px 60px 28px',
          }}>
            
            <div style={{ 
  width: '100%',
  maxWidth: '420px',
  minHeight: 'calc(100vh - 60px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  opacity: isFormBlurred ? 0.45 : 1,
  transition: 'opacity 0.2s ease-in-out',
  pointerEvents: isFormBlurred ? 'none' : 'auto'
}}>
              
              <h1
style={{
    ...S.title,
    fontSize: '32px',
    marginBottom: '42px',
    textAlign: 'center'
  }}
>
  Create an account
</h1>

             <div
  style={{
    display: 'flex',
    gap: '18px',
    justifyContent: 'center',
    marginBottom: '30px'
  }}
>
                <button style={S.btnSocialBadge}><i className="fa-brands fa-google" style={{ color: '#EA4335' }}></i></button>
                <button style={S.btnSocialBadge}><i className="fa-brands fa-apple" style={{ color: '#000000' }}></i></button>
                <button style={S.btnSocialBadge}><i className="fa-brands fa-facebook-f" style={{ color: '#1877F2' }}></i></button>
              </div>

              <div style={{ ...S.divider, gap: '18px', margin: '0 0 54px 0' }}>
                <div style={S.dividerLine} />
                <span style={S.dividerText}>or</span>
                <div style={S.dividerLine} />
              </div>

              {renderStepper()}

              {/* ÉTAPE 1 */}
              {suStep === 1 && (
                <>
                  <p style={{
  fontSize: '12px',
  color: '#8e8e93',
  textAlign: 'center',
  lineHeight: '1.6',
  margin: '0 0 54px 0',
  maxWidth: '340px'
}}>
                    Select an option to access tailored tools.<br/>
                    Enter a User name to navigate on SpaceNotes.<br/>
                    Enter your full name to access the Marketplace.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '340px', marginBottom: '24px' }}>
                    
                    <div 
                      style={S.customSelectTrigger} 
                      onClick={() => setIsRoleDropdownOpen(true)}
                    >
                      <span style={{ color: selectedRole ? '#000000' : '#7f7f7f' }}>
                        {selectedRole || 'Select an option'}
                      </span>
                      <span style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: '#000000', fontSize: '10px' }}>▼</span>
                    </div>

                    <input 
                      style={S.input} 
                      type="text" 
                      placeholder="User name" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />

                    <input 
                      style={S.input} 
                      type="text" 
                      placeholder="Full name" 
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* ÉTAPE 2 */}
              {suStep === 2 && (
                <>
                  <p style={{ fontSize: '12px', color: '#8e8e93', textAlign: 'center', lineHeight: '1.6', margin: '0 0 24px 0', maxWidth: '320px' }}>
                    Occupation refers to your job. By giving the name of your institution, you can receive targeted ads tailored to your occupation, interests and AI needs.
                  </p>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '30px',
                    width: '380px',
                    maxWidth: '100%',
                    marginBottom: '0px'
                  }}>
                    
                    <div 
                      style={S.customSelectTrigger} 
                      onClick={() => setIsOccupationDropdownOpen(true)}
                    >
                      <span style={{ color: occupation ? '#000000' : '#7f7f7f' }}>
                        {occupation || 'Occupation'}
                      </span>
                      <span style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: '#000000', fontSize: '10px' }}>▼</span>
                    </div>

                    <input 
                      style={S.input} 
                      type="text" 
                      placeholder="Name of Institution" 
                      value={institution} 
                      onChange={(e) => setInstitution(e.target.value)} 
                    />

                    <div 
                      style={S.customSelectTrigger}
                      onClick={() => setIsInterestDropdownOpen(true)}
                    >
                      <span style={{ color: selectedInterests.length > 0 ? '#000000' : '#7f7f7f' }}>
                        {interestPlaceholder}
                      </span>
                      <span style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: '#000000', fontSize: '10px' }}>▼</span>
                    </div>

                  </div>
                </>
              )}

              {/* ÉTAPE 3 */}
              {suStep === 3 && (
                <>
                  <p style={{ fontSize: '12px', color: '#8e8e93', textAlign: 'center', lineHeight: '1.6', margin: '0 0 24px 0', maxWidth: '320px' }}>
                    Entering your date of birth is essential, particularly in light of laws protecting minors. The remaining two fields are used to set up your account.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '340px', marginBottom: '24px' }}>
                    
                    {/* Déclencheur personnalisé Date de Naissance */}
                    <div 
                      style={S.customSelectTrigger} 
                      onClick={() => setIsBirthdatePickerOpen(true)}
                    >
                      <span style={{ color: birthdate ? '#000000' : '#7f7f7f' }}>
                        {birthdate || 'JJ/MM/AAAA'}
                      </span>
                    </div>

                    <input 
                      style={S.input} 
                      type="email" 
                      placeholder="Email address" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* Déclencheur personnalisé Indicateur Pays */}
                      <div 
                        style={{ ...S.customSelectTrigger, width: '80px' }} 
                        onClick={() => setIsCountryCodePickerOpen(true)}
                      >
                        <span style={{ color: '#000000' }}>{countryCode || '+'}</span>
                      </div>

                      <input 
                        style={{ ...S.input, flex: 1 }} 
                        type="tel" 
                        placeholder="Phone number" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ── ÉTAPE 4 (SAISIE DU MOT DE PASSE ET DES ACTIONS DE LOCKS - image_e512a2.png) ── */}
              {suStep === 4 && (
                <>
                  <p style={{ fontSize: '12px', color: '#8e8e93', textAlign: 'center', lineHeight: '1.6', margin: '0 0 24px 0', maxWidth: '320px' }}>
                    You will be able to access your account with your user name and email without forgetting to enter your password
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '340px', marginBottom: '24px' }}>
                    
                    {/* Input Password */}
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input 
                        style={{ ...S.input, paddingRight: '60px' }} 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        onFocus={() => setShowPasswordSuggestion(true)}
                        onBlur={() => setTimeout(() => setShowPasswordSuggestion(false), 150)}
                      />
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        style={{
                          position: 'absolute',
                          right: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '32px',
                          height: '32px',
                          padding: 0,
                          border: 'none',
                          borderRadius: '50%',
                          background: 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#8e8e93',
                          fontSize: '17px',
                          userSelect: 'none',
                          zIndex: 2,
                        }}
                      >
                        <i className={`fa-regular ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                      </button>

                      {/* Suggestion façon Safari : "Use a strong password" + régénération */}
                      {showPasswordSuggestion && (
                        <div
                          onMouseDown={(e) => e.preventDefault()}
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 4px)',
                            left: 0,
                            right: 0,
                            background: '#ffffff',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 50,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            onClick={() => generateStrongPassword(true)}
                            style={{
                              background: '#3f7de0',
                              color: '#ffffff',
                              padding: '10px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{
                              width: '16px',
                              height: '16px',
                              border: '1.5px solid #ffffff',
                              borderRadius: '3px',
                              flexShrink: 0,
                            }} />
                            Use a strong password
                          </div>

                          <div
                            onClick={() => generateStrongPassword(false)}
                            style={{
                              padding: '10px 14px',
                              fontSize: '13px',
                              color: '#333333',
                              cursor: 'pointer',
                              borderTop: '1px solid #eeeeee',
                            }}
                          >
                            Suggest a new password
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input Confirm Password */}
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input 
                        style={{ ...S.input, paddingRight: '60px' }} 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="Confirm Password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((visible) => !visible)}
                        aria-label={showConfirmPassword ? 'Masquer la confirmation du mot de passe' : 'Afficher la confirmation du mot de passe'}
                        title={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        style={{
                          position: 'absolute',
                          right: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '32px',
                          height: '32px',
                          padding: 0,
                          border: 'none',
                          borderRadius: '50%',
                          background: 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#8e8e93',
                          fontSize: '17px',
                          userSelect: 'none',
                          zIndex: 2,
                        }}
                      >
                        <i className={`fa-regular ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                      </button>
                    </div>

                  </div>
                </>
              )}

              {/* Boutons de navigation : rangée volontairement plus large que le formulaire, comme sur la maquette */}
              <div style={{
                display: 'flex',
                width: '100%',
                maxWidth: '760px',
                justifyContent: suStep > 1 ? 'space-between' : 'center',
                alignItems: 'center',
                gap: suStep > 1 ? '110px' : '0px',
                marginTop: '62px',
                padding: '20px 8px 10px',
                boxSizing: 'border-box',
              }}>
                {suStep > 1 && (
                  <button 
                    style={{
                      ...S.btnYellow,
                      background: '#e5e5e5',
                      color: '#333333',
                      width: '295px',
                      height: '40px',
                      boxShadow: 'none'
                    }} 
                    onClick={handleSignUpBack}
                  >
                    BACK
                  </button>
                )}
                
                {suStep === 1 ? (
                  <button 
                    style={{ ...(isStep1Valid ? S.btnYellow : S.btnNextDisabled), width: '295px', height: '40px' }} 
                    onClick={handleSignUpNext}
                    disabled={!isStep1Valid}
                  >
                    NEXT
                  </button>
                ) : suStep === 2 ? (
                  <button 
                    style={{ ...(isStep2Valid ? S.btnYellow : S.btnNextDisabled), width: '295px', height: '40px' }} 
                    onClick={handleSignUpNext}
                    disabled={!isStep2Valid}
                  >
                    NEXT
                  </button>
                ) : suStep === 3 ? (
                  <button 
                    style={{ ...(isStep3Valid ? S.btnYellow : S.btnNextDisabled), width: '295px', height: '40px' }} 
                    onClick={handleSignUpNext}
                    disabled={!isStep3Valid}
                  >
                    NEXT
                  </button>
                ) : (
                  <button 
                    style={{ ...(isStep4Valid ? S.btnYellow : S.btnNextDisabled), width: '295px', height: '40px' }} 
                    onClick={handleSignUpNext}
                    disabled={!isStep4Valid}
                  >
                    CONFIRM
                  </button>
                )}
              </div>

            </div>

            {/* ── OVERLAY ÉTAPE 1 : SELECTION DU ROLE ── */}
            {isRoleDropdownOpen && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'transparent', 
                zIndex: 100,
                pointerEvents: 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '20px', 
                  top: '450px', 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '30px',
                  pointerEvents: 'auto'
                }}>
                  
                  {/* People */}
                  <div 
                    onClick={() => selectRoleOption('People')}
                    style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                  >
                    <div style={{
                      width: '74px', height: '74px', borderRadius: '18px', background: '#e5e5e5',
                      border: '1.5px solid #dcdcdc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <i className="fa-solid fa-user" style={{ fontSize: '38px', color: '#000000' }}></i>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: '500', color: '#000000' }}>People</span>
                  </div>

                  {/* Companies */}
                  <div 
                    onClick={() => selectRoleOption('Companies')}
                    style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                  >
                    <div style={{
                      width: '74px', height: '74px', borderRadius: '18px', background: '#e5e5e5',
                      border: '1.5px solid #dcdcdc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <i className="fa-solid fa-building" style={{ fontSize: '38px', color: '#0072c6' }}></i>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: '500', color: '#000000' }}>Companies</span>
                  </div>

                  {/* Artificial Intelligence */}
                  <div 
                    onClick={() => selectRoleOption('Artificial Intelligence')}
                    style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                  >
                    <div style={{
                      width: '74px', 
                      height: '74px', 
                      borderRadius: '18px', 
                      background: '#f3e8ff',
                      border: '2px solid #757277', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      padding: '8px',
                      boxSizing: 'border-box'
                    }}>
                      <img 
                        src={iconeAI} 
                        alt="AI Icon" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                      />
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: '500', color: '#000000' }}>Artificial Intelligence</span>
                  </div>

                </div>
              </div>
            )}

            {/* ── OVERLAY ÉTAPE 2 : SELECTION DE L'OCCUPATION ── */}
            {isOccupationDropdownOpen && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'transparent', 
                zIndex: 100,
                pointerEvents: 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '20px', 
                  top: '180px', 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '30px',
                  pointerEvents: 'auto'
                }}>
                  
                  {OCCUPATIONS.map((occ) => (
                    <div 
                      key={occ.id}
                      onClick={() => selectOccupationOption(occ.label)}
                      style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                    >
                      <div style={{
                        width: '74px', 
                        height: '74px', 
                        borderRadius: '18px', 
                        background: '#e5e5e5',
                        border: '1.5px solid #dcdcdc', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {occ.icon ? (
                          <img 
                            src={occ.icon} 
                            alt={`${occ.label} icon`} 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'contain',
                              padding: '8px',
                              boxSizing: 'border-box'
                            }} 
                          />
                        ) : (
                          <i
                            className={`fa-solid ${occ.faIcon}`}
                            style={{ fontSize: '38px', color: occ.iconColor }}
                          ></i>
                        )}
                      </div>
                      <span style={{ fontSize: '20px', fontWeight: '500', color: '#000000' }}>{occ.label}</span>
                    </div>
                  ))}

                </div>
              </div>
            )}

            {/* ── OVERLAY ÉTAPE 2 : SÉLECTION DES CENTRES D’INTÉRÊT ── */}
            {isInterestDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(255, 255, 255, 0.60)',
                  zIndex: 100,
                  overflowY: 'auto',
                  padding: '92px 28px 40px',
                  boxSizing: 'border-box',
                }}
              >
                {/* Barre supérieure fixe */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '72px',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 18px',
                    boxSizing: 'border-box',
                    borderBottom: 'none',
                    zIndex: 102,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsInterestDropdownOpen(false)}
                    style={{
                      width: '82px',
                      height: '36px',
                      border: '2px solid #ffbc00',
                      borderRadius: '6px',
                      background: '#ffffff',
                      color: '#000000',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsInterestDropdownOpen(false)}
                    style={{
                      width: '82px',
                      height: '36px',
                      border: 'none',
                      borderRadius: '6px',
                      background: '#ffbc00',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    Done
                  </button>
                </div>

                {/* Liste des centres d’intérêt */}
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                  }}
                >
                  {INTERESTS.map((interestOption) => {
                    const isSelected = selectedInterests.includes(interestOption.id);

                    return (
                      <div
                        key={interestOption.id}
                        onClick={() => toggleInterestOption(interestOption.id)}
                        style={{
                          minHeight: '74px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '24px',
                          }}
                        >
                          <div
                            style={{
                              width: '68px',
                              height: '68px',
                              flexShrink: 0,
                              borderRadius: '16px',
                              background: interestOption.color,
                              border: '1px solid #dddddd',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxSizing: 'border-box',
                            }}
                          >
                            <i
                              className={`fa-solid ${interestOption.faIcon}`}
                              aria-hidden="true"
                              style={{
                                color: interestOption.iconColor,
                                fontSize: '32px',
                              }}
                            ></i>
                          </div>

                          <span
                            style={{
                              fontSize: '17px',
                              fontWeight: '600',
                              color: '#000000',
                            }}
                          >
                            {interestOption.label}
                          </span>
                        </div>
                        <div
  style={{
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff',
    cursor: 'pointer',
    transition: '0.2s',
    position: 'relative',
  left: '-70px',  // déplace vers la gauche
    
  }}
>
  <div
    style={{
      width: '5px',
      height: '5px',
      borderRadius: '50%',
      background: isSelected ? '#ffbc00' : '#c8c8c8'
    }}
  />
</div>

  

                        
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── OVERLAY INTERACTIF : SELECT BIRTHDATE ── */}
            {isBirthdatePickerOpen && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255, 255, 255, 0.98)',
                zIndex: 101,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                padding: '62px 20px 12px',
                boxSizing: 'border-box'
              }}>
                <h1 style={{
                  ...S.title,
                  textAlign: 'center',
                  margin: '0 0 118px',
                  fontSize: '27px'
                }}>
                  Select birthdate
                </h1>

                {/* Molette de sélection iOS : plus grande et centrée */}
                <div style={{
                  ...S.wheelPickerContainer,
                  height: `${WHEEL_HEIGHT}px`,
                  width: '92%',
                  maxWidth: '650px',
                  alignSelf: 'center',
                  gap: '70px',
                  margin: '0 auto',
                  transform: 'scale(1.16)',
                  transformOrigin: 'center center'
                }}>
                  <div style={{ ...S.wheelActiveBar, height: `${WHEEL_ITEM_HEIGHT}px` }} />

                  {/* Colonne Mois */}
                  <WheelColumn
                    items={MONTHS}
                    selectedIndex={MONTHS.indexOf(tempMonth)}
                    onSelectIndex={(i) => setTempMonth(MONTHS[i])}
                    renderItem={(m) => m}
                    width={150}
                    fontScale={1.12}
                  />

                  {/* Colonne Jours */}
                  <WheelColumn
                    items={DAYS}
                    selectedIndex={DAYS.indexOf(tempDay)}
                    onSelectIndex={(i) => setTempDay(DAYS[i])}
                    renderItem={(d) => d}
                    width={72}
                    fontScale={1.12}
                  />

                  {/* Colonne Années */}
                  <WheelColumn
                    items={YEARS}
                    selectedIndex={YEARS.indexOf(tempYear)}
                    onSelectIndex={(i) => setTempYear(YEARS[i])}
                    renderItem={(y) => y}
                    width={105}
                    fontScale={1.12}
                  />
                </div>

                <div style={{
                  ...S.pickerFooter,
                  width: '100%',
                  maxWidth: 'none',
                  marginTop: 'auto',
                  paddingBottom: '0',
                  gap: '108px'
                }}>
                  <button
                    onClick={() => setIsBirthdatePickerOpen(false)}
                    style={{
                      ...S.pickerBtn,
                      flex: 1,
                      height: '30px',
                      padding: '0 18px',
                      color: '#007aff',
                      fontSize: '10px',
                      borderRadius: '6px',
                      border: '1px solid #dedede',
                      background: '#f7f7f7'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveBirthdate}
                    style={{
                      ...S.pickerBtn,
                      flex: 1,
                      height: '30px',
                      padding: '0 18px',
                      color: '#000000',
                      fontSize: '10px',
                      borderRadius: '6px',
                      border: '1px solid #dedede',
                      background: '#f7f7f7'
                    }}
                  >
                    NEXT
                  </button>
                </div>
              </div>
            )}

            {/* ── OVERLAY INTERACTIF : SELECT LANGUAGE (Pays) ── */}
            {isCountryCodePickerOpen && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255, 255, 255, 0.98)',
                zIndex: 101,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '62px 34px 12px',
                boxSizing: 'border-box'
              }}>
                <h1 style={{
                  ...S.title,
                  fontSize: '28px',
                  margin: '0',
                  lineHeight: 1.2
                }}>
                  Select language
                </h1>

                {/* Sélecteur de langue agrandi et recentré comme sur la maquette */}
                <div style={{
                  ...S.wheelPickerContainer,
                  width: '300px',
                  height: '440px',
                  margin: '74px 0 0',
                  flexShrink: 0
                }}>
                  <WheelColumn
                    items={COUNTRY_CODES}
                    selectedIndex={COUNTRY_CODES.findIndex((c) => c.code === tempCountry)}
                    onSelectIndex={(i) => setTempCountry(COUNTRY_CODES[i].code)}
                    renderItem={(item) => (
                      <>
                        <span style={{ minWidth: '58px', textAlign: 'right' }}>{item.code}</span>
                        <span style={{ fontSize: '38px', lineHeight: 1 }}>{item.flag}</span>
                      </>
                    )}
                    width={250}
                    fontScale={1.35}
                  />
                </div>

                <div style={{
                  ...S.pickerFooter,
                  width: '100%',
                  maxWidth: 'none',
                  marginTop: 'auto',
                  paddingBottom: '0',
                  gap: '160px'
                }}>
                  <button
                    onClick={() => setIsCountryCodePickerOpen(false)}
                    style={{
                      ...S.pickerBtn,
                      flex: 1,
                      height: '34px',
                      padding: '0 18px',
                      color: '#007aff',
                      fontSize: '11px',
                      borderRadius: '6px',
                      border: '1px solid #dedede',
                      background: '#f7f7f7'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCountryCode}
                    style={{
                      ...S.pickerBtn,
                      flex: 1,
                      height: '34px',
                      padding: '0 18px',
                      color: '#000000',
                      fontSize: '11px',
                      borderRadius: '6px',
                      border: '1px solid #dedede',
                      background: '#f7f7f7'
                    }}
                  >
                    NEXT
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* DROITE : Message de Bienvenue (Panneau Gris) */}
          <div style={S.panelGray}>
            <h2 style={{ ...S.title, fontSize: '36px', marginBottom: '24px' }}>Welcome back !</h2>
            <p style={S.desc}>
              To keep connected with us, please log in with your personal info.
            </p>
            <button onClick={() => setMode('signin')} style={S.btnYellow}>
              SIGN IN
            </button>

          </div>
        </>
      )}
    </div>
  );
}