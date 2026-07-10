// Animated wireframe sphere bounding three labeled axes:
// Blockchain (x, green), Artificial Intelligence (y, blue), Humanities (z, teal).
// Pure SVG with SMIL animations — no client-side JS.

const CX = 400;
const CY = 300;
const R = 175;

// Latitude ring at a vertical offset from the sphere's center.
function Latitude({ dy, squash = 0.28 }: { dy: number; squash?: number }) {
  const rx = Math.sqrt(R * R - dy * dy);
  return (
    <ellipse
      cx={CX}
      cy={CY + dy}
      rx={rx}
      ry={rx * squash}
      fill="none"
      stroke="rgba(255,255,255,0.10)"
      strokeWidth="1.8"
    />
  );
}

// Meridian whose horizontal radius oscillates to suggest rotation about the y-axis.
function Meridian({ begin, opacity }: { begin: string; opacity: number }) {
  return (
    <ellipse cx={CX} cy={CY} ry={R} fill="none" stroke={`rgba(255,255,255,${opacity})`} strokeWidth="1.8">
      <animate
        attributeName="rx"
        values={`${R};2;${R}`}
        dur="14s"
        begin={begin}
        repeatCount="indefinite"
        calcMode="spline"
        keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
      />
    </ellipse>
  );
}

export default function IntersectionSphere() {
  return (
    <svg viewBox="0 0 800 600" style={{ width: '100%', height: 'auto', display: 'block' }} role="img"
      aria-label="Three axes labeled Blockchain, Artificial Intelligence, and Humanities meeting inside a rotating sphere">
      <defs>
        <radialGradient id="sphereGlow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#7abe4d" stopOpacity="0.10" />
          <stop offset="55%" stopColor="#388697" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#0a0f0a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* soft glow behind the sphere */}
      <circle cx={CX} cy={CY} r={R * 1.25} fill="url(#sphereGlow)" />

      {/* Isometric axis triad: y up, x down-right, z down-left — 120 degrees apart,
          the standard 2D projection of three mutually perpendicular axes. */}

      {/* Y axis — Artificial Intelligence (blue), straight up */}
      <line x1={CX} y1={CY + 200} x2={CX} y2={CY - 215} stroke="#2f8fd6" strokeWidth="3" opacity="0.75" />
      <polygon points={`${CX},${CY - 229} ${CX - 6},${CY - 213} ${CX + 6},${CY - 213}`} fill="#2f8fd6" />
      <text x={CX + 14} y={CY - 218} fill="#2f8fd6" fontSize="16" fontWeight="600" letterSpacing="0.08em">
        ARTIFICIAL INTELLIGENCE
      </text>
      <text x={CX + 14} y={CY - 200} fill="rgba(255,255,255,0.75)" fontSize="14">y — machine-scale insight</text>

      {/* X axis — Blockchain (green), 30 degrees below horizontal, to the right */}
      <line
        x1={CX - 216.5} y1={CY - 125}
        x2={CX + 216.5} y2={CY + 125}
        stroke="#7abe4d" strokeWidth="3" opacity="0.75"
      />
      <polygon
        points={`${CX + 228.6},${CY + 132} ${CX + 213.5},${CY + 130.2} ${CX + 219.5},${CY + 119.8}`}
        fill="#7abe4d"
      />
      <text x={CX + 150} y={CY + 165} fill="#7abe4d" fontSize="16" fontWeight="600" letterSpacing="0.08em">
        BLOCKCHAIN
      </text>
      <text x={CX + 150} y={CY + 183} fill="rgba(255,255,255,0.75)" fontSize="14">x — verifiable truth</text>

      {/* Z axis — Humanities (teal), 30 degrees below horizontal, to the left */}
      <line
        x1={CX + 216.5} y1={CY - 125}
        x2={CX - 216.5} y2={CY + 125}
        stroke="#388697" strokeWidth="3" opacity="0.75"
      />
      <polygon
        points={`${CX - 228.6},${CY + 132} ${CX - 213.5},${CY + 130.2} ${CX - 219.5},${CY + 119.8}`}
        fill="#388697"
      />
      <text x={CX - 150} y={CY + 165} textAnchor="end" fill="#388697" fontSize="16" fontWeight="600" letterSpacing="0.08em">
        HUMANITIES
      </text>
      <text x={CX - 150} y={CY + 183} textAnchor="end" fill="rgba(255,255,255,0.75)" fontSize="14">
        z — what people care about
      </text>

      {/* wireframe sphere, slightly tilted like a globe */}
      <g transform={`rotate(-12 ${CX} ${CY})`}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2.2" />
        <Latitude dy={-105} />
        <Latitude dy={-55} />
        <Latitude dy={55} />
        <Latitude dy={105} />
        {/* equator, dashed and slowly marching */}
        <ellipse cx={CX} cy={CY} rx={R} ry={R * 0.28} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.8" strokeDasharray="5 7">
          <animate attributeName="stroke-dashoffset" values="0;-120" dur="12s" repeatCount="indefinite" />
        </ellipse>
        {/* rotating meridians */}
        <Meridian begin="0s" opacity={0.2} />
        <Meridian begin="-3.5s" opacity={0.16} />
        <Meridian begin="-7s" opacity={0.2} />
        <Meridian begin="-10.5s" opacity={0.16} />
      </g>

      {/* origin: the intersection, marked by the Pretrend logomark */}
      <circle cx={CX} cy={CY} r="26" fill="none" stroke="#a3d97a" strokeWidth="2.5">
        <animate attributeName="r" values="26;58" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;0" dur="3s" repeatCount="indefinite" />
      </circle>
      <image
        href="/assets/pretrend-logomark.png"
        x={CX - 24}
        y={CY - 24}
        width="48"
        height="48"
      >
        <animate attributeName="opacity" values="1;0.75;1" dur="3s" repeatCount="indefinite" />
      </image>
    </svg>
  );
}
