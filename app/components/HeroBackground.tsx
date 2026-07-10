// Subtle animated backdrop for the hero: bar charts growing and shrinking,
// trend lines drawing themselves, and numbers falling / zooming.
// Decorative only — pure CSS animations (classes in globals.css), no JS.

const GREEN = '#7abe4d';
const TEAL = '#388697';
const BLUE = '#2f8fd6';

function Bars({ x, y, color, phase }: { x: number; y: number; color: string; phase: number }) {
  const heights = [70, 120, 95, 150, 80, 130];
  return (
    <g>
      {heights.map((h, i) => (
        <rect
          key={i}
          className="hero-bg-bar"
          x={x + i * 34}
          y={y - h}
          width="22"
          height={h}
          rx="3"
          fill={color}
          style={{ animationDelay: `${phase + i * 0.7}s` }}
        />
      ))}
    </g>
  );
}

const fallingNumbers = [
  { text: '+5.8%', x: 140, dur: 26, delay: 0, size: 30, color: GREEN },
  { text: '-2.1%', x: 420, dur: 34, delay: -12, size: 22, color: TEAL },
  { text: '+9.1%', x: 700, dur: 22, delay: -6, size: 38, color: GREEN },
  { text: '-8.2%', x: 980, dur: 30, delay: -20, size: 24, color: BLUE },
  { text: '+2.3%', x: 1240, dur: 27, delay: -3, size: 28, color: GREEN },
  { text: 'R² 0.94', x: 560, dur: 38, delay: -25, size: 20, color: TEAL },
  { text: '$0.20', x: 1440, dur: 31, delay: -16, size: 26, color: BLUE },
  { text: 'σ 1.2%', x: 260, dur: 36, delay: -30, size: 20, color: TEAL },
];

const zoomingNumbers = [
  { text: '+61.2%', x: 320, y: 260, dur: 9, delay: 0, color: GREEN },
  { text: '-34.0%', x: 1180, y: 520, dur: 11, delay: -4, color: BLUE },
  { text: '+10.6%', x: 820, y: 700, dur: 10, delay: -7, color: TEAL },
];

export default function HeroBackground() {
  return (
    <div className="hero-bg" aria-hidden="true">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
        {/* breathing bar charts */}
        <Bars x={90} y={840} color={GREEN} phase={0} />
        <Bars x={1290} y={780} color={TEAL} phase={-2.5} />
        <Bars x={660} y={870} color={BLUE} phase={-4.5} />

        {/* self-drawing trend lines */}
        <polyline
          className="hero-bg-line"
          points="0,620 180,590 340,610 520,540 700,560 880,480 1060,510 1240,420 1420,450 1600,360"
          fill="none"
          stroke={GREEN}
          strokeWidth="2"
        />
        <polyline
          className="hero-bg-line hero-bg-line-slow"
          points="0,300 200,340 380,310 560,390 740,360 920,430 1100,400 1280,470 1460,440 1600,500"
          fill="none"
          stroke={TEAL}
          strokeWidth="2"
        />

        {/* falling numbers */}
        {fallingNumbers.map((n) => (
          <text
            key={n.text + n.x}
            className="hero-bg-fall"
            x={n.x}
            y="0"
            fill={n.color}
            fontSize={n.size}
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            style={{ animationDuration: `${n.dur}s`, animationDelay: `${n.delay}s` }}
          >
            {n.text}
          </text>
        ))}

        {/* zooming numbers */}
        {zoomingNumbers.map((n) => (
          <text
            key={n.text}
            className="hero-bg-zoom"
            x={n.x}
            y={n.y}
            fill={n.color}
            fontSize="34"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            style={{ animationDuration: `${n.dur}s`, animationDelay: `${n.delay}s` }}
          >
            {n.text}
          </text>
        ))}
      </svg>
    </div>
  );
}
