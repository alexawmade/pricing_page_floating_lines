import AnimatedPrice from './AnimatedPrice';
import './PricingCard.css';

export default function PricingCard({
  badge,
  name,
  price,
  customPriceLabel,
  period = '/mo',
  tagline,
  featuresLabel = 'Features:',
  features,
  cta,
  ctaStyle = 'default', // 'default' | 'disabled' | 'outline'
}) {
  const isCustom = !price && customPriceLabel;

  return (
    <div className="pricing-card">
      {badge && <span className="pricing-card__badge">{badge}</span>}

      <div className="pricing-card__header">
        <h2 className="pricing-card__name">{name}</h2>
        <p className="pricing-card__tagline">{tagline}</p>
      </div>

      <div className="pricing-card__price-row">
        {!isCustom && <span className="pricing-card__currency">$</span>}
        <span className="pricing-card__amount">
          {isCustom
            ? <span className="pricing-card__custom-price">{customPriceLabel}</span>
            : <AnimatedPrice price={price} />
          }
        </span>
        {!isCustom && <span className="pricing-card__period">{period}</span>}
      </div>

      <ul className="pricing-card__features">
        <li className="pricing-card__features-label">{featuresLabel}</li>
        {features.map((f, i) => (
          <li key={i} className={`pricing-card__feature ${f.disabled ? 'pricing-card__feature--disabled' : ''}`}>
            <span className="pricing-card__feature-icon">
              {f.disabled ? '✕' : '✓'}
            </span>
            <span>
              {f.text}
              {f.sub && <span className="pricing-card__feature-sub"> {f.sub}</span>}
            </span>
          </li>
        ))}
      </ul>

      <button className={`pricing-card__cta pricing-card__cta--${ctaStyle}`} disabled={ctaStyle === 'disabled'}>
        {cta}
      </button>
    </div>
  );
}
