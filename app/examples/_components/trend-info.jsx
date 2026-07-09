'use client';

export function TrendInfo() {
  return (
    <div className="mb-5">
      <section className="mb-5">
        <h3 className="text-vtru-green mb-3">Why It Matters</h3>
        <p className="text-muted-light">
          DeFi protocols need deterministic statistical settlement without off-chain
          trust. Trend enables on-chain price trend analysis, volatility-based
          triggers, and data-driven smart contracts.
        </p>
      </section>

      <section className="mb-5">
        <h3 className="text-vtru-green mb-3">Modes</h3>
        <ul className="text-muted-light">
          <li className="mb-2"><strong className="text-white">Mode 0x01 (Analysis):</strong> Slope percentage, R^2 confidence, volatility</li>
          <li className="mb-2"><strong className="text-white">Mode 0x02 (Volatility Buckets):</strong> Quintile distribution of price velocity</li>
        </ul>
      </section>

      <section className="mb-5">
        <h3 className="text-vtru-green mb-3">Interface</h3>
        <div className="code-block"><pre>{`// Mode 0x01: Full Analysis
Input:  mode(1) | ts1(8) | val1(32) | ts2(8) | val2(32) | ...
Output: slopePct(32) | rSquared(32) | volatility(32) = 96 bytes

// Mode 0x02: Volatility Buckets
Input:  mode(1) | windowSize(8) | ts1(8) | val1(32) | ...
Output: q20(32) | q40(32) | q60(32) | q80(32) = 128 bytes`}</pre></div>
      </section>
    </div>
  );
}
