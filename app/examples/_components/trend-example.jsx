'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { PSC_ADDRESSES, NETWORK_CONFIG } from './psc-constants';
import { ALL_DATASETS } from './data/trend-datasets';

// Encode data for Trend PSC Mode 0x01
// Input: mode(1) | ts1(8) | val1(32) | ts2(8) | val2(32) | ...
function encodeTrendInput(data) {
  // Mode 0x01 = Full Analysis
  let hex = '0x01';

  for (const point of data) {
    // Timestamp as 8 bytes (uint64)
    const tsHex = BigInt(point.ts).toString(16).padStart(16, '0');
    // Value as 32 bytes (uint256) - scale by 1e18 for precision
    const valueScaled = BigInt(Math.floor(point.value * 1e10));
    const valHex = valueScaled.toString(16).padStart(64, '0');
    hex += tsHex + valHex;
  }

  return hex;
}

// Decode Trend PSC output
// Output: slopePct(32) | rSquared(32) | volatility(32) = 96 bytes
function decodeTrendOutput(hex) {
  if (!hex || hex === '0x' || hex.length < 194) {
    return null;
  }

  // Remove 0x prefix
  const data = hex.slice(2);

  // Each value is 32 bytes = 64 hex chars
  const slopePctHex = data.slice(0, 64);
  const rSquaredHex = data.slice(64, 128);
  const volatilityHex = data.slice(128, 192);

  // slopePct and rSquared are scaled by 1e18
  const slopePct = Number(BigInt('0x' + slopePctHex)) / 1e18;
  const rSquared = Number(BigInt('0x' + rSquaredHex)) / 1e18;

  // Volatility = std_dev * input_scale(1e10) * cosmetic_scale(1e16) = std_dev * 1e26
  const volatility = Number(BigInt('0x' + volatilityHex)) / 1e26;

  return { slopePct, rSquared, volatility };
}

// Helper to call Trend PSC
async function callTrendPSC(data) {
  const payload = encodeTrendInput(data);
  const response = await fetch(NETWORK_CONFIG.rpc, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{ to: PSC_ADDRESSES.TREND, data: payload }, 'latest']
    })
  });
  const json = await response.json();
  if (json.error) throw new Error(json.error.message);
  return decodeTrendOutput(json.result);
}

// Simple SVG Chart Component
function TrendChart({ data, checkpoints, width = 1200, height = 380 }) {
  const padding = { top: 40, right: 60, bottom: 40, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const values = data.map(d => d.value);
  const minVal = Math.min(...values) * 0.98;
  const maxVal = Math.max(...values) * 1.02;

  const xScale = (i) => padding.left + (i / (data.length - 1)) * chartWidth;
  const yScale = (v) => padding.top + chartHeight - ((v - minVal) / (maxVal - minVal)) * chartHeight;

  // Create path for data line
  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.value)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }} className="trend-chart">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = padding.top + chartHeight * (1 - pct);
        const val = minVal + (maxVal - minVal) * pct;
        return (
          <g key={pct}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#333" strokeDasharray="4,4" />
            <text x={padding.left - 10} y={y + 4} textAnchor="end" fill="#888" fontSize="11">
              {val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${(val/1000).toFixed(0)}K` : val.toFixed(0)}
            </text>
          </g>
        );
      })}

      {/* Data line */}
      <path d={linePath} fill="none" stroke="#666" strokeWidth="2" />

      {/* Checkpoint markers and trend values */}
      {checkpoints.map((cp, i) => {
        const x = xScale(cp.dataIndex);
        const trendColor = cp.trend >= 0 ? '#4ade80' : '#f87171';
        return (
          <g key={i}>
            {/* Vertical line at checkpoint */}
            <line x1={x} y1={padding.top} x2={x} y2={padding.top + chartHeight} stroke={trendColor} strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />

            {/* Trend value label */}
            <rect x={x - 28} y={padding.top - 28} width="56" height="22" rx="4" fill={trendColor} opacity="0.9" />
            <text x={x} y={padding.top - 12} textAnchor="middle" fill="#000" fontSize="12" fontWeight="600">
              {cp.trend >= 0 ? '+' : ''}{cp.trend.toFixed(1)}%
            </text>

            {/* Data point at checkpoint */}
            <circle cx={x} cy={yScale(data[cp.dataIndex].value)} r="4" fill={trendColor} />
          </g>
        );
      })}

      {/* X-axis labels */}
      <text x={padding.left} y={height - 10} fill="#888" fontSize="11">Start</text>
      <text x={width - padding.right} y={height - 10} textAnchor="end" fill="#888" fontSize="11">End</text>
    </svg>
  );
}

export function TrendExample() {
  const [activeTab, setActiveTab] = useState('demo');
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [result, setResult] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!selectedDataset) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setCheckpoints([]);
    setProgress(0);

    try {
      const dataset = ALL_DATASETS.find(d => d.name === selectedDataset);
      if (!dataset) throw new Error('Dataset not found');

      const data = dataset.data;
      const numCheckpoints = 5;
      const checkpointResults = [];

      // Calculate trend at 5 progressive checkpoints (20%, 40%, 60%, 80%, 100%)
      for (let i = 1; i <= numCheckpoints; i++) {
        const endIndex = Math.floor((i / numCheckpoints) * data.length);
        const slice = data.slice(0, endIndex);

        if (slice.length < 2) continue;

        setProgress(i * 20);

        const decoded = await callTrendPSC(slice);

        // Calculate actual change for this slice
        const firstVal = slice[0].value;
        const lastVal = slice[slice.length - 1].value;
        const changePct = ((lastVal - firstVal) / firstVal) * 100;

        checkpointResults.push({
          checkpoint: i,
          dataIndex: endIndex - 1,
          dataPoints: slice.length,
          trend: changePct,
          rSquared: decoded.rSquared,
          slopePct: decoded.slopePct,
        });
      }

      setCheckpoints(checkpointResults);

      // Final result using all data
      const finalCheckpoint = checkpointResults[checkpointResults.length - 1];
      const meanValue = data.reduce((sum, p) => sum + p.value, 0) / data.length;
      const finalDecoded = await callTrendPSC(data);
      const volatilityPct = (finalDecoded.volatility / meanValue) * 100;

      setResult({
        totalChangePct: finalCheckpoint.trend,
        rSquared: finalCheckpoint.rSquared,
        volatilityPct,
        firstValue: data[0].value,
        lastValue: data[data.length - 1].value,
        meanValue,
        datasetName: dataset.name,
        dataPoints: data.length,
        period: dataset.period,
        unit: dataset.unit,
        dataset: dataset,
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const codeSnippet = `// Analyze trend using Vitruveo Trend PSC
const RPC = '${NETWORK_CONFIG.rpc}';
const TREND_ADDRESS = '${PSC_ADDRESSES.TREND}';

// Prepare data points: timestamp (8 bytes) + value (32 bytes)
function encodeTrendInput(dataPoints) {
  let hex = '0x01'; // Mode 0x01 = Full Analysis

  for (const { timestamp, value } of dataPoints) {
    // Timestamp as uint64
    hex += BigInt(timestamp).toString(16).padStart(16, '0');
    // Value scaled by 1e18 as uint256
    hex += BigInt(Math.floor(value * 1e18)).toString(16).padStart(64, '0');
  }
  return hex;
}

// Example: Bitcoin hourly prices
const data = [
  { timestamp: 1736640000, value: 91152 },
  { timestamp: 1736643600, value: 91134 },
  // ... more data points
];

const payload = encodeTrendInput(data);

const response = await fetch(RPC, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_call',
    params: [{ to: TREND_ADDRESS, data: payload }, 'latest']
  })
});

const { result } = await response.json();

// Decode output: slopePct(32) | rSquared(32) | volatility(32)
const slopePct = Number(BigInt('0x' + result.slice(2, 66))) / 1e18;
const rSquared = Number(BigInt('0x' + result.slice(66, 130))) / 1e18;
const volatility = Number(BigInt('0x' + result.slice(130, 194))) / 1e18;

console.log(\`Slope: \${slopePct.toFixed(4)}%\`);
console.log(\`R²: \${rSquared.toFixed(4)}\`);
console.log(\`Volatility: \${volatility.toFixed(4)}\`);`;

  const soliditySnippet = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TrendAnalysis {
    address constant TREND_PSC = ${PSC_ADDRESSES.TREND};

    struct TrendResult {
        int256 slopePct;    // Slope as percentage (scaled by 1e18)
        uint256 rSquared;   // R² confidence (0-1, scaled by 1e18)
        uint256 volatility; // Volatility measure (scaled by 1e18)
    }

    /// @notice Analyze price trend from time series data
    /// @param timestamps Array of timestamps (unix epoch)
    /// @param values Array of values (prices, quantities, etc.)
    function analyzeTrend(
        uint64[] calldata timestamps,
        uint256[] calldata values
    ) external view returns (TrendResult memory) {
        require(timestamps.length == values.length, "Length mismatch");
        require(timestamps.length >= 2, "Need at least 2 points");

        // Build payload: mode(1) | ts1(8) | val1(32) | ...
        bytes memory payload = new bytes(1 + timestamps.length * 40);
        payload[0] = 0x01; // Mode 0x01 = Full Analysis

        uint256 offset = 1;
        for (uint256 i = 0; i < timestamps.length; i++) {
            // Pack timestamp (8 bytes)
            for (uint256 j = 0; j < 8; j++) {
                payload[offset + j] = bytes1(uint8(timestamps[i] >> (56 - j * 8)));
            }
            offset += 8;

            // Pack value (32 bytes)
            for (uint256 j = 0; j < 32; j++) {
                payload[offset + j] = bytes1(uint8(values[i] >> (248 - j * 8)));
            }
            offset += 32;
        }

        (bool success, bytes memory result) = TREND_PSC.staticcall(payload);
        require(success && result.length == 96, "Trend call failed");

        return TrendResult({
            slopePct: int256(uint256(bytes32(result[0:32]))),
            rSquared: uint256(bytes32(result[32:64])),
            volatility: uint256(bytes32(result[64:96]))
        });
    }

    /// @notice Check if asset is trending up with confidence
    function isBullish(
        uint64[] calldata timestamps,
        uint256[] calldata prices,
        int256 minSlope,
        uint256 minConfidence
    ) external view returns (bool) {
        TrendResult memory trend = this.analyzeTrend(timestamps, prices);
        return trend.slopePct >= minSlope && trend.rSquared >= minConfidence;
    }
}`;

  return (
    <div className="mb-5">
      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'demo' ? 'active' : ''}`}
            onClick={() => setActiveTab('demo')}
          >
            Demo
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'client' ? 'active' : ''}`}
            onClick={() => setActiveTab('client')}
          >
            Client Code
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'solidity' ? 'active' : ''}`}
            onClick={() => setActiveTab('solidity')}
          >
            Smart Contract
          </button>
        </li>
      </ul>

      {/* Demo Tab */}
      {activeTab === 'demo' && (
        <div>
          <p className="text-muted-light mb-4">
            Select a real-world dataset to analyze its trend using on-chain OLS regression.
          </p>

          {/* Dataset Selection */}
          <div className="row g-3 mb-4">
            {ALL_DATASETS.map((dataset) => (
              <div key={dataset.name} className="col-md-6">
                <div
                  className={`card p-3 rounded-3 cursor-pointer dataset-tile ${
                    selectedDataset === dataset.name ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedDataset(dataset.name)}
                  style={{
                    cursor: 'pointer',
                    '--dataset-color': dataset.color,
                    borderColor: selectedDataset === dataset.name ? dataset.color : undefined,
                    borderWidth: selectedDataset === dataset.name ? '2px' : undefined,
                  }}
                >
                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="dataset-image-wrapper"
                      style={{ backgroundColor: `${dataset.color}15` }}
                    >
                      <img
                        src={dataset.image}
                        alt={dataset.name}
                        className="dataset-image"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="text-white mb-2" style={{ color: dataset.color }}>
                        {dataset.name}
                      </h6>
                      <div className="d-flex flex-wrap gap-2 text-muted-light small mb-2">
                        <span className="dataset-badge" style={{ borderColor: `${dataset.color}40` }}>
                          {dataset.period}
                        </span>
                        <span className="dataset-badge" style={{ borderColor: `${dataset.color}40` }}>
                          {dataset.granularity}
                        </span>
                        <span className="dataset-badge" style={{ borderColor: `${dataset.color}40` }}>
                          {dataset.data.length} pts
                        </span>
                      </div>
                      <p className="text-muted-light small mb-0">{dataset.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary mb-4"
            onClick={handleAnalyze}
            disabled={loading || !selectedDataset}
          >
            {loading ? `Analyzing... ${progress}%` : 'Analyze Trend'}
          </button>

          {/* Progress bar */}
          {loading && (
            <div className="progress mb-4" style={{ height: '4px', backgroundColor: '#333' }}>
              <div
                className="progress-bar"
                style={{ width: `${progress}%`, backgroundColor: '#7abe4d', transition: 'width 0.3s' }}
              />
            </div>
          )}

          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          {/* Results with Chart */}
          {result && checkpoints.length > 0 && (
            <div className="trend-result p-4 rounded-3">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h5 className="text-white mb-1">{result.datasetName}</h5>
                  <p className="text-muted-light small mb-0">Progressive trend at 20%, 40%, 60%, 80%, 100%</p>
                </div>
                <button
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={() => {
                    const csv = 'timestamp,value\n' + result.dataset.data.map(p => `${p.ts},${p.value}`).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${result.datasetName.toLowerCase().replace(/\s+/g, '-')}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  CSV
                </button>
              </div>

              {/* Chart */}
              <div className="chart-container mb-4" style={{ overflowX: 'auto' }}>
                <TrendChart data={result.dataset.data} checkpoints={checkpoints} />
              </div>

              {/* Summary Stats */}
              <div className="row g-4 mb-4">
                <div className="col-md-4 text-center">
                  <div className="trend-value-large" style={{
                    color: result.totalChangePct >= 0 ? '#4ade80' : '#f87171'
                  }}>
                    {result.totalChangePct >= 0 ? '+' : ''}{result.totalChangePct.toFixed(1)}%
                  </div>
                  <div className="text-muted-light">Final Change</div>
                  <div className="text-muted-light small mt-1">
                    {result.firstValue.toLocaleString()} → {result.lastValue.toLocaleString()} {result.unit}
                  </div>
                </div>
                <div className="col-md-4 text-center">
                  <div className="trend-value-large text-white">
                    {(result.rSquared * 100).toFixed(0)}%
                  </div>
                  <div className="text-muted-light">Trend Confidence</div>
                  <div className="text-muted-light small mt-1">
                    {result.rSquared > 0.7 ? 'Strong linear fit' : result.rSquared > 0.4 ? 'Moderate fit' : 'Weak/noisy'}
                  </div>
                </div>
                <div className="col-md-4 text-center">
                  <div className="trend-value-large text-warning">
                    {result.volatilityPct.toFixed(1)}%
                  </div>
                  <div className="text-muted-light">Volatility</div>
                  <div className="text-muted-light small mt-1">
                    {result.volatilityPct < 5 ? 'Low variance' : result.volatilityPct < 15 ? 'Moderate swings' : 'High variance'}
                  </div>
                </div>
              </div>

              {/* Insight */}
              <div className="interpretation p-3 rounded" style={{ backgroundColor: '#1a1a1a' }}>
                <p className="mb-0 text-muted-light">
                  <strong className="text-white">Trend Evolution:</strong>{' '}
                  {checkpoints.length > 1 && (() => {
                    const first = checkpoints[0].trend;
                    const last = checkpoints[checkpoints.length - 1].trend;
                    const flipped = (first >= 0 && last < 0) || (first < 0 && last >= 0);
                    const strengthened = Math.abs(last) > Math.abs(first) * 1.5;
                    const weakened = Math.abs(last) < Math.abs(first) * 0.5;

                    if (flipped) return `Started ${first >= 0 ? 'positive' : 'negative'}, reversed to ${last >= 0 ? 'positive' : 'negative'} by end.`;
                    if (strengthened) return `Trend strengthened significantly from ${first.toFixed(1)}% to ${last.toFixed(1)}%.`;
                    if (weakened) return `Initial trend of ${first.toFixed(1)}% weakened to ${last.toFixed(1)}%.`;
                    return `Trend remained relatively stable throughout the period.`;
                  })()}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Client Code Tab */}
      {activeTab === 'client' && (
        <SyntaxHighlighter
          language="javascript"
          style={oneDark}
          customStyle={{ borderRadius: '8px', fontSize: '14px' }}
        >
          {codeSnippet}
        </SyntaxHighlighter>
      )}

      {/* Smart Contract Tab */}
      {activeTab === 'solidity' && (
        <SyntaxHighlighter
          language="solidity"
          style={oneDark}
          customStyle={{ borderRadius: '8px', fontSize: '14px' }}
        >
          {soliditySnippet}
        </SyntaxHighlighter>
      )}

      <style jsx>{`
        .nav-tabs {
          border-bottom: 1px solid #333;
        }
        .nav-tabs .nav-link {
          color: #888;
          border: none;
          border-bottom: 2px solid transparent;
          background: transparent;
          padding: 0.5rem 1rem;
        }
        .nav-tabs .nav-link:hover {
          color: #fff;
          border-bottom-color: #555;
        }
        .nav-tabs .nav-link.active {
          color: #7abe4d;
          border-bottom-color: #7abe4d;
          background: transparent;
        }
        .dataset-tile {
          background-color: #1a1a1a;
          border: 1px solid #333;
          transition: all 0.2s ease;
        }
        .dataset-tile:hover {
          border-color: var(--dataset-color, #555);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .dataset-tile.selected {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(26, 26, 26, 1) 100%);
        }
        .dataset-image-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .dataset-image {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }
        .dataset-badge {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
        }
        .trend-result {
          background: linear-gradient(135deg, rgba(122, 190, 77, 0.05) 0%, rgba(26, 26, 26, 1) 100%);
          border: 1px solid #333;
        }
        .trend-value-large {
          font-size: 2.5rem;
          font-weight: 700;
          font-family: var(--bs-font-monospace);
        }
        .text-warning {
          color: #fbbf24 !important;
        }
        .chart-container {
          background: #111;
          border-radius: 8px;
          padding: 1rem;
        }
        .trend-chart {
          display: block;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
