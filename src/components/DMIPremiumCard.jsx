import { useState, useEffect, useRef } from "react";

const DMIPremiumCard = ({
  cardNumber,
  cardName = "John Doe",
  validThru = "20 - 02 - 2026",
  membershipDate = "12-09-2026",
}) => {
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setScale(entries[0].contentRect.width / 520);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const numberParts = cardNumber.split(" ");

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[520px]"
      style={{ aspectRatio: "520 / 310", position: "relative" }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: "520px",
          height: "310px",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Rajdhani:wght@400;500;600;700&display=swap');

        .dmi-card-wrap {
          perspective: 1200px;
          width: 520px;
          cursor: pointer;
        }

        .dmi-card {
          width: 520px;
          height: 310px;
          border-radius: 18px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #7e1080 30%, #1a031a 100%,  #1a0040 100%);
          box-shadow: 0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.12);
          transform-style: preserve-3d;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }

        .dmi-card.hovered {
          transform: rotateY(-6deg) rotateX(3deg);
          box-shadow: 20px 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08);
        }

        .dmi-geo-bg {
          position: absolute;
          inset: 0;
          opacity: 0.18;
          pointer-events: none;
        }

        .dmi-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%);
          pointer-events: none;
        }

        .dmi-logo-box {
          position: absolute;
          top: 0;
          left: 0;
          background: white;
          
          padding: 8px 14px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
          z-index: 10;
        }

        .dmi-logo-tagline {
          font-size: 7px;
          color: #555;
          letter-spacing: 0.5px;
          font-family: 'Rajdhani', sans-serif;
          text-transform: uppercase;
        }

        .dmi-logo-letters {
          display: flex;
          align-items: center;
          gap: 0px;
        }

        .dmi-logo-d { color: #6b0fa8; font-size: 28px; font-weight: 900; font-family: 'Rajdhani', sans-serif; line-height: 1; }
        .dmi-logo-m { color: #f5c518; font-size: 28px; font-weight: 900; font-family: 'Rajdhani', sans-serif; line-height: 1; }
        .dmi-logo-i { color: #6b0fa8; font-size: 28px; font-weight: 900; font-family: 'Rajdhani', sans-serif; line-height: 1; }

        .dmi-logo-crown {
          color: #f5c518;
          font-size: 13px;
          line-height: 1;
          margin-bottom: -4px;
          text-align: center;
        }

        .dmi-logo-brand {
          font-size: 7.5px;
          color: #6b0fa8;
          letter-spacing: 1.5px;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 600;
          text-transform: uppercase;
        }

        .dmi-card-title {
          position: absolute;
          top: 18px;
          right: 22px;
          font-family: 'Cinzel', serif;
          font-size: 26px;
          font-weight: 700;
          color: #f5c518;
          letter-spacing: 1px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.3);
          z-index: 10;
        }

        .dmi-card-number {
          position: absolute;
          top: 130px;
          left: 30px;
          right: 30px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 36px;
          font-weight: 700;
          color: white;
          letter-spacing: 4px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.4);
          display: flex;
          gap: 18px;
          z-index: 10;
        }

        .dmi-valid-thru {
          position: absolute;
          top: 200px;
          right: 30px;
          text-align: right;
          z-index: 10;
        }

        .dmi-valid-label {
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.55);
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .dmi-valid-date {
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: rgba(255,255,255,0.6);
          letter-spacing: 1.5px;
          margin-top: 2px;
        }

        .dmi-card-name {
          position: absolute;
          bottom: 28px;
          left: 30px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 24px;
          font-weight: 500;
          color: rgba(200,180,220,0.85);
          letter-spacing: 1.5px;
          z-index: 10;
          text-shadow: 1px 1px 0 rgba(0,0,0,0.5), -1px -1px 0 rgba(0,0,0,0.3);
        }

        .dmi-membership-banner {
          position: absolute;
          bottom: 22px;
          right: -2px;
          background: linear-gradient(90deg, #d4a017, #f5c518, #e8b820);
          color: white;
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.8px;
          padding: 8px 20px 8px 28px;
          clip-path: polygon(16px 0%, 100% 0%, 100% 100%, 0% 100%);
          box-shadow: -4px 4px 12px rgba(0,0,0,0.3);
          z-index: 10;
          white-space: nowrap;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
      `}</style>

        <div
          className="dmi-card-wrap"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className={`dmi-card ${hovered ? "hovered" : ""}`}>

            {/* Geometric SVG Background */}
            <svg className="dmi-geo-bg" viewBox="0 0 520 310" xmlns="http://www.w3.org/2000/svg">
              <g fill="rgba(255,255,255,0.6)" stroke="rgba(255,255,255,0.3)" strokeWidth="1">
                <polygon points="330,60 370,60 350,90" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                <polygon points="370,60 410,60 390,90" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <polygon points="410,60 450,60 430,90" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                <polygon points="350,90 370,60 390,90" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <polygon points="390,90 410,60 430,90" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                <polygon points="310,90 350,90 330,120" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <polygon points="350,90 390,90 370,120" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <polygon points="390,90 430,90 410,120" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                <polygon points="430,90 470,90 450,120" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
                <polygon points="330,120 350,90 370,120" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                <polygon points="370,120 390,90 410,120" fill="rgba(255,255,255,0.09)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <polygon points="410,120 430,90 450,120" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <polygon points="290,120 330,120 310,150" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                <polygon points="330,120 370,120 350,150" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                <polygon points="370,120 410,120 390,150" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                <polygon points="410,120 450,120 430,150" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <polygon points="450,120 490,120 470,150" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
                <polygon points="270,150 310,150 290,180" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <polygon points="310,150 350,150 330,180" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <polygon points="350,150 390,150 370,180" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                <polygon points="390,150 430,150 410,180" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
                <polygon points="430,150 470,150 450,180" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              </g>
            </svg>

            <div className="dmi-shine" />

            {/* Logo */}
            <div className="dmi-logo-box mt-4 rounded-r-2xl">
              <img src="/logo.png" alt="" />
            </div>

            {/* Title */}
            <div className="dmi-card-title">Premium Card</div>

            {/* Card Number */}
            <div className="dmi-card-number">
              {numberParts.map((part, i) => (
                <span key={i}>{part}</span>
              ))}
            </div>

            {/* Valid Thru */}
            <div className="dmi-valid-thru">
              <div className="dmi-valid-label">Valid Thru</div>
              <div className="dmi-valid-date">{validThru}</div>
            </div>

            {/* Cardholder Name */}
            <div className="dmi-card-name">{cardName}</div>

            {/* Membership Banner */}
            <div className="dmi-membership-banner">
              Membership Date : {membershipDate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DMIPremiumCard;

// Usage example:
// <DMIPremiumCard
//   cardNumber="4545 1456 6766 7878"
//   cardName="John Doe"
//   validThru="20 - 02 - 2026"
//   membershipDate="12-09-2026"
// />