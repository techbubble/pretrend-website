import type { Metadata } from "next";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { TrendHeader } from './_components/trend-header';
import { TrendExample } from './_components/trend-example';
import { TrendInfo } from './_components/trend-info';

export const metadata: Metadata = {
  title: "Examples | Pretrend Protocol",
  description: "Live examples of the Trend precompile that powers Pretrend — run OLS regression and volatility analysis on real datasets directly against the Vitruveo blockchain.",
};

export default function ExamplesPage() {
  return (
    <>
      <Header />
      <main>
        {/* Intro: how trend computation is built into the protocol */}
        <section className="section-padding bg-dark-custom" style={{ paddingTop: '140px', paddingBottom: '40px' }}>
          <div className="container">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold mb-3">
                Trend, <span className="text-gradient">Built Into the Protocol</span>
              </h1>
              <p className="lead text-muted-custom" style={{ maxWidth: '820px', margin: '0 auto' }}>
                Every Pretrend market resolves through statistics computed by the blockchain
                itself — not by an off-chain service you have to trust.
              </p>
            </div>

            <div className="row g-4 mb-4">
              <div className="col-lg-4">
                <div className="card-dark p-4 h-100">
                  <h3 className="h5 text-green mb-3">A Native Precompile</h3>
                  <p className="text-muted-custom small mb-0">
                    The Trend precompile is part of the Vitruveo protocol — compiled Go code
                    running at the Geth client layer, like the EVM&apos;s built-in cryptographic
                    functions. Statistical analysis that would be prohibitively expensive in
                    Solidity executes in microseconds, on-chain, at address{' '}
                    <code style={{ fontSize: '0.85em' }}>0x…DC</code>.
                  </p>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="card-dark p-4 h-100">
                  <h3 className="h5 text-green mb-3">Deterministic &amp; Verifiable</h3>
                  <p className="text-muted-custom small mb-0">
                    Give it the same time-series, get the same answer — every node, every time.
                    When a Pretrend market resolves, anyone can re-run the computation against
                    the same data and verify the winning bucket independently. The oracle
                    stores results; the protocol computes them.
                  </p>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="card-dark p-4 h-100">
                  <h3 className="h5 text-green mb-3">Two Modes, One Oracle</h3>
                  <p className="text-muted-custom small mb-0">
                    Mode 1 fits an OLS regression over timestamp-value pairs, returning slope,
                    R-squared, and volatility — this resolves markets. Mode 2 computes quintile
                    thresholds from historical windows — this calibrates the five outcome
                    buckets before a market opens.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-muted-custom text-center mb-0" style={{ maxWidth: '760px', margin: '0 auto' }}>
              The examples below are live. Pick a dataset and the page calls the Trend precompile
              on Vitruveo mainnet via <code style={{ fontSize: '0.9em' }}>eth_call</code> — the
              same computation a Pretrend market uses to resolve.
            </p>
          </div>
        </section>

        {/* Ported Vitruveo trend PSC demo */}
        <section className="bg-dark-alt py-5">
          <div className="container">
            <TrendHeader />
            <TrendExample />
            <TrendInfo />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
