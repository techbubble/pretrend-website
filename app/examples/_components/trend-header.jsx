'use client';

import { PSC_ADDRESSES, PSC_GAS } from './psc-constants';

export function TrendHeader() {
  return (
    <div className="mb-4">
      <h1 className="display-5 fw-bold text-white mb-2">Trend</h1>
      <p className="text-muted-light mb-3">
        OLS regression and volatility analysis
        <span className="ms-3 small">
          <code className="text-vtru-green">{PSC_ADDRESSES.TREND}</code>
          <span className="text-white-50 ms-2">~{PSC_GAS.TREND.perByte}/byte gas</span>
        </span>
      </p>
    </div>
  );
}
