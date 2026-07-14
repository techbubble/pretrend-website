'use client';

import { useEffect, useRef, useState } from 'react';

const BUCKET_COLORS = ['#ef4444', '#f97316', '#a3a3a3', '#4ade80', '#8b5cf6'];

// Mini five-bucket bar chart that cycles its highlighted outcome for live energy.
export function AnimatedBuckets({ start = 0 }: { start?: number }) {
  const [hi, setHi] = useState(start);

  useEffect(() => {
    const id = setInterval(() => setHi((h) => (h + 1) % BUCKET_COLORS.length), 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="d-flex align-items-end justify-content-center gap-1" style={{ height: '44px' }}>
      {BUCKET_COLORS.map((c, i) => (
        <div
          key={i}
          style={{
            width: '18%',
            height: i === hi ? '100%' : '52%',
            background: c,
            opacity: i === hi ? 1 : 0.3,
            borderRadius: '3px',
            boxShadow: i === hi ? `0 0 10px ${c}` : 'none',
            transition: 'all 0.5s ease',
          }}
        />
      ))}
    </div>
  );
}

// Number that counts up from 0 to `end` the first time it scrolls into view.
export function CountUp({
  end,
  duration = 1600,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    let startTs = 0;
    const tick = (ts: number) => {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(end * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setVal(end);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}
