import { useState, useCallback, useEffect, useRef } from 'react';
import PricingCard from './components/PricingCard';
import FeaturedCard from './components/FeaturedCard';
import CustomizationPanel from './components/CustomizationPanel';
import './App.css';

const PLANS = [
  {
    name: 'Free',
    monthlyPrice: '0',
    annualPrice: '0',
    tagline: 'A simple way to get started',
    cta: 'Current plan',
    ctaStyle: 'disabled',
    featuresLabel: 'Features:',
    features: [
      { text: '5 credits per day', sub: '(25 credits / month)' },
      { text: '1 active chat' },
      { text: 'SaaS' },
      { text: 'Community support' },
    ],
  },
  {
    name: 'Pro',
    monthlyPrice: '29',
    annualPrice: '23',
    tagline: 'Unlock all needed features',
    cta: 'Upgrade',
    stripeNote: 'Secure payment powered by Stripe',
    featuresLabel: 'Everything in Free, plus:',
    features: [
      { text: '100 credits per month' },
      { text: '3 active chats' },
      { text: 'SaaS' },
      { text: 'Email support' },
    ],
  },
  {
    name: 'Enterprise',
    monthlyPrice: null,
    annualPrice: null,
    customPriceLabel: 'Custom',
    tagline: 'For large companies',
    cta: 'Contact Us',
    ctaStyle: 'outline',
    featuresLabel: 'Everything in Pro, plus:',
    features: [
      { text: 'Custom integrations' },
      { text: 'Custom deployment options' },
      { text: 'SSO' },
      { text: 'Group-based access controls' },
      { text: 'Onboarding services' },
      { text: 'Dedicated support' },
    ],
  },
];

const DEFAULT_EFFECT = {
  linesGradient: ['#2f4ba2', '#e947f5', '#ffffff'],
  enabledWaves: ['top', 'middle', 'bottom'],
  lineCount: [6, 6, 6],
  lineDistance: [5, 5, 5],
  animationSpeed: 1,
  interactive: true,
  bendRadius: 5,
  bendStrength: -0.5,
  mouseDamping: 0.05,
  parallax: false,
  parallaxStrength: 0.2,
  mixBlendMode: 'normal',
  backgroundColor: '#000000',
  topLineWidth: 1.0, middleLineWidth: 1.0, bottomLineWidth: 1.0,
  topOpacity: 0.1, middleOpacity: 1.0, bottomOpacity: 0.2,
  topSoftness: 0.0, middleSoftness: 0.0, bottomSoftness: 0.0,
};

const DEFAULT_LIGHT_EFFECT = {
  linesGradient: ['#ffffff', '#a78bfa', '#f9a8d4'],
  enabledWaves: ['top', 'middle', 'bottom'],
  lineCount: [6, 6, 6],
  lineDistance: [5, 5, 5],
  animationSpeed: 1,
  interactive: true,
  bendRadius: 5,
  bendStrength: -0.5,
  mouseDamping: 0.05,
  parallax: false,
  parallaxStrength: 0.2,
  mixBlendMode: 'normal',
  backgroundColor: '#ffffff',
  topLineWidth: 1.0, middleLineWidth: 1.0, bottomLineWidth: 1.0,
  topOpacity: 0.1, middleOpacity: 1.0, bottomOpacity: 0.2,
  topSoftness: 0.0, middleSoftness: 0.0, bottomSoftness: 0.0,
};

export default function App() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [effectProps, setEffectProps] = useState(DEFAULT_EFFECT);
  const [lightEffectProps, setLightEffectProps] = useState(DEFAULT_LIGHT_EFFECT);
  const [isDark, setIsDark] = useState(true);

  const setProp = useCallback((key, value) => {
    setEffectProps(prev => ({ ...prev, [key]: value }));
  }, []);

  const setLightProp = useCallback((key, value) => {
    setLightEffectProps(prev => ({ ...prev, [key]: value }));
  }, []);

  const pageRef = useRef(null);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const onMove = (e) => {
      el.style.setProperty('--mouse-x', `${e.clientX}px`);
      el.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const activeEffectProps = isDark ? effectProps : lightEffectProps;

  const [free, pro, enterprise] = PLANS;
  const price = (plan) => isAnnual ? plan.annualPrice : plan.monthlyPrice;

  return (
    <div className={`page${isDark ? '' : ' page--light'}`} ref={pageRef}>
      <header className="page__header">
        <div className="page__badge">Pricing</div>
        <h1 className="page__title">Choose your plan</h1>
        <p className="page__subtitle">
          Start free, scale as you grow. No hidden fees, cancel anytime.
        </p>

        <div className="page__toggle" onClick={() => setIsAnnual(prev => !prev)} role="switch" aria-checked={isAnnual}>
          <span className={`page__toggle-label ${!isAnnual ? 'page__toggle-label--active' : ''}`}>Monthly</span>
          <div className={`page__toggle-track ${isAnnual ? 'page__toggle-track--on' : ''}`}>
            <div className="page__toggle-thumb" />
          </div>
          <span className={`page__toggle-label ${isAnnual ? 'page__toggle-label--active' : ''}`}>Annually</span>
          <span className={`page__toggle-save ${isAnnual ? 'page__toggle-save--visible' : ''}`}>Save 20%</span>
        </div>
      </header>

      <div className="page__cards">
        <PricingCard {...free} price={price(free)} />
        <FeaturedCard
          {...pro}
          price={price(pro)}
          effectProps={activeEffectProps}
        />
        <PricingCard {...enterprise} price={price(enterprise)} />
      </div>

      <p className="page__note">No credit card required for Free plan.</p>

      <CustomizationPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        effectProps={effectProps}
        setProp={setProp}
        lightEffectProps={lightEffectProps}
        setLightProp={setLightProp}
      />

      <button
        className="theme-toggle-btn"
        onClick={() => setIsDark(prev => !prev)}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>

      <button
        className={`effect-controls-btn${panelOpen ? ' effect-controls-btn--active' : ''}`}
        onClick={() => setPanelOpen(prev => !prev)}
        aria-label="Toggle effect controls panel"
      >
        <span className="effect-controls-btn__dot" />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span className="effect-controls-btn__label">Effects Settings</span>
      </button>
    </div>
  );
}
