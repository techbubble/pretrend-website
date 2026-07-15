import type { Metadata } from "next";
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: "Preview | Pretrend Protocol",
  description: "The Pretrend Preview: a play-money environment where auto-generated 30-minute BTC markets will run end-to-end on the real protocol. No wallets, no gas, no risk.",
};

export default function PreviewPage() {
  return (
    <>
      <Header />
      <main>
        <section className="section-padding bg-dark-custom" style={{ paddingTop: '140px', paddingBottom: '60px' }}>
          <div className="container">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold mb-3">
                The Pretrend <span className="text-gradient">Preview</span>
              </h1>
              <p className="lead text-muted-custom" style={{ maxWidth: '900px', margin: '0 auto', textWrap: 'balance' }}>
                Real markets, real resolution, play money. The Preview will run auto-generated
                30-minute BTC markets end-to-end on the live protocol — experience how Pretrend
                works with nothing at risk.
              </p>
            </div>

            <div className="card-dark p-4 p-lg-5" style={{ maxWidth: '860px', margin: '0 auto' }}>
              <h2 className="h4 fw-bold mb-3">Live now</h2>
              <p className="text-muted-custom">
                The Preview comes online piece by piece, and each piece appears here as it
                ships. First up: the oracle.
              </p>
              <div className="d-flex align-items-center gap-4 p-3 p-md-4 rounded" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <div className="h5 text-green mb-1">TrendPulse Oracle</div>
                  <div className="text-muted-custom">
                    The data engine behind Pretrend, running live: Bitcoin, Ethereum, world
                    news sentiment, and New York weather — each feed with the OLS trend line
                    that will settle its markets.
                  </div>
                </div>
                <div className="ms-auto flex-shrink-0">
                  <a href="/preview/trendpulse" className="btn btn-primary btn-lg px-5 py-3" style={{ fontSize: '1.35rem', fontWeight: 600 }}>
                    View Live Status
                  </a>
                </div>
              </div>
              <p className="text-muted-custom small mt-4 mb-0">
                Access requirements for the Preview will be posted here — stay tuned.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
