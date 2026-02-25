import FloatingLines from './FloatingLines';
import AnimatedPrice from './AnimatedPrice';
import './FeaturedCard.css';

export default function FeaturedCard({
  badge,
  name,
  price,
  period = '/mo',
  tagline,
  featuresLabel = 'Features:',
  features,
  cta,
  stripeNote,
  effectProps,
}) {
  return (
    <div className="featured-card">
      <FloatingLines {...effectProps} />
      <div className="featured-card__overlay" />

      <div className="featured-card__content">
        {badge && <span className="featured-card__badge">{badge}</span>}

        <div className="featured-card__header">
          <h2 className="featured-card__name">{name}</h2>
          <p className="featured-card__tagline">{tagline}</p>
        </div>

        <div className="featured-card__price-row">
          <span className="featured-card__currency">$</span>
          <span className="featured-card__amount"><AnimatedPrice price={price} /></span>
          <span className="featured-card__period">{period}</span>
        </div>

        <div className="featured-card__cta-group">
          <button className="featured-card__cta">{cta}</button>
          {stripeNote && <p className="featured-card__stripe-note">{stripeNote}</p>}
        </div>

        <ul className="featured-card__features">
          <li className="featured-card__features-label">{featuresLabel}</li>
          {features.map((f, i) => (
            <li key={i} className="featured-card__feature">
              <span className="featured-card__feature-icon">✓</span>
              <span>{f.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
