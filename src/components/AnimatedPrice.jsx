import './AnimatedPrice.css';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * A single digit "reel" — all 10 digits are stacked vertically inside a
 * container with overflow:hidden. We translateY to the correct slot.
 * CSS transition handles the physics easing.
 */
function AnimatedDigit({ digit, delay = 0 }) {
  const index = parseInt(digit, 10);

  return (
    <span className="ap-digit">
      <span
        className="ap-reel"
        style={{
          transform: `translateY(${index * -1}em)`,
          transitionDelay: `${delay}ms`,
        }}
      >
        {DIGITS.map(d => (
          <span key={d} className="ap-reel__item">{d}</span>
        ))}
      </span>
    </span>
  );
}

export default function AnimatedPrice({ price }) {
  const chars = String(price).split('');

  return (
    <span className="ap-price">
      {chars.map((ch, i) =>
        /\d/.test(ch)
          ? <AnimatedDigit key={i} digit={ch} delay={i * 25} />
          : <span key={i} className="ap-static">{ch}</span>
      )}
    </span>
  );
}
