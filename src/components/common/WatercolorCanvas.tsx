export interface WatercolorCanvasProps {
  className?: string;
}

export function WatercolorCanvas({ className = '' }: WatercolorCanvasProps) {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none ${className}`}
    >
      {/* Background SVG Canvas with Organic Watercolor Washes & Botanical Elements */}
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Subtle Watercolor Pigment Grain Filter */}
          <filter id="watercolorNoise" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="4"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="20"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation="15" result="blurred" />
            <feMerge>
              <feMergeNode in="blurred" />
              <feMergeNode in="SourceGraphic" opacity="0.4" />
            </feMerge>
          </filter>

          {/* Radial Gradient for Top Right Sage Wash */}
          <radialGradient
            id="sageWashTopRight"
            cx="85%"
            cy="15%"
            r="45%"
            fx="80%"
            fy="10%"
          >
            <stop offset="0%" stopColor="#AEC2AE" stopOpacity="0.18" />
            <stop offset="45%" stopColor="#5E765E" stopOpacity="0.09" />
            <stop offset="75%" stopColor="#FFF2DE" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#FFF2DE" stopOpacity="0" />
          </radialGradient>

          {/* Radial Gradient for Mid Left Olive Wash */}
          <radialGradient
            id="oliveWashLeft"
            cx="10%"
            cy="55%"
            r="40%"
            fx="15%"
            fy="50%"
          >
            <stop offset="0%" stopColor="#5E765E" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#AEC2AE" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#FFF2DE" stopOpacity="0" />
          </radialGradient>

          {/* Radial Gradient for Bottom Terracotta / Petal Warmth */}
          <radialGradient
            id="terracottaWashBottom"
            cx="90%"
            cy="85%"
            r="38%"
            fx="85%"
            fy="80%"
          >
            <stop offset="0%" stopColor="#D5A688" stopOpacity="0.14" />
            <stop offset="60%" stopColor="#FFF2DE" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#FFF2DE" stopOpacity="0" />
          </radialGradient>

          {/* Botanical Gradient for Leaves */}
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5E765E" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#AEC2AE" stopOpacity="0.12" />
          </linearGradient>

          <linearGradient id="terracottaPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D5A688" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#D5A688" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* 1. Large Fluid Watercolor Stains in Background */}
        <ellipse
          cx="1200"
          cy="180"
          rx="520"
          ry="380"
          fill="url(#sageWashTopRight)"
          filter="url(#watercolorNoise)"
        />

        <ellipse
          cx="180"
          cy="500"
          rx="450"
          ry="320"
          fill="url(#oliveWashLeft)"
          filter="url(#watercolorNoise)"
        />

        <ellipse
          cx="1280"
          cy="780"
          rx="400"
          ry="300"
          fill="url(#terracottaWashBottom)"
          filter="url(#watercolorNoise)"
        />

        {/* 2. Floating Ethereal Eucalyptus Branch (Top Right Corner) */}
        <g transform="translate(1120, -40) rotate(28) scale(1.15)">
          {/* Main Stem */}
          <path
            d="M50 0 C70 90, 90 220, 140 380"
            stroke="#5E765E"
            strokeWidth="1.8"
            strokeOpacity="0.22"
            fill="none"
          />

          {/* Watercolor Foliage Pairs */}
          <path
            d="M62 45 C95 25, 130 50, 118 78 C105 100, 70 80, 62 45 Z"
            fill="url(#leafGrad)"
          />
          <path
            d="M55 70 C25 50, 5 78, 20 102 C35 120, 60 95, 55 70 Z"
            fill="url(#leafGrad)"
          />

          <path
            d="M75 125 C115 105, 150 135, 138 165 C122 190, 85 160, 75 125 Z"
            fill="url(#leafGrad)"
          />
          <path
            d="M72 155 C35 135, 12 165, 30 192 C48 212, 78 185, 72 155 Z"
            fill="url(#leafGrad)"
          />

          <path
            d="M95 220 C138 198, 172 232, 158 265 C142 292, 105 260, 95 220 Z"
            fill="url(#leafGrad)"
          />
          <path
            d="M90 255 C50 232, 22 268, 42 298 C62 320, 98 290, 90 255 Z"
            fill="url(#leafGrad)"
          />

          <path
            d="M120 320 C165 300, 195 338, 178 370 C160 398, 128 365, 120 320 Z"
            fill="url(#leafGrad)"
          />
        </g>

        {/* 3. Olive Branch Spray (Bottom Left Flank) */}
        <g transform="translate(-50, 550) rotate(-16) scale(1.1)">
          {/* Stem */}
          <path
            d="M0 320 C110 240, 240 160, 360 40"
            stroke="#5E765E"
            strokeWidth="1.5"
            strokeOpacity="0.2"
            fill="none"
          />

          {/* Olive Leaf Clusters */}
          <path
            d="M80 260 C70 220, 100 185, 130 205 C155 225, 120 280, 80 260 Z"
            fill="url(#leafGrad)"
          />
          <path
            d="M130 220 C165 195, 205 215, 195 242 C182 268, 140 245, 130 220 Z"
            fill="url(#leafGrad)"
          />

          <path
            d="M185 170 C175 130, 208 95, 238 115 C262 135, 225 190, 185 170 Z"
            fill="url(#leafGrad)"
          />
          <path
            d="M235 130 C270 105, 310 125, 300 152 C288 178, 245 155, 235 130 Z"
            fill="url(#leafGrad)"
          />

          {/* Gentle Terracotta Berry/Flower Accents */}
          <circle cx="150" cy="245" r="4" fill="url(#terracottaPetalGrad)" />
          <circle cx="255" cy="155" r="4.5" fill="url(#terracottaPetalGrad)" />
        </g>

        {/* 4. Fine Meraki Botanical Petal Crest in Center Right */}
        <g transform="translate(1360, 480) scale(0.9)">
          <path
            d="M0 -60 C35 -20, 35 20, 0 60 C-35 20, -35 -20, 0 -60 Z"
            fill="url(#terracottaPetalGrad)"
          />
          <path
            d="M0 -35 C20 -10, 20 10, 0 35 C-20 10, -20 -10, 0 -35 Z"
            fill="url(#leafGrad)"
          />
        </g>
      </svg>
    </div>
  );
}
