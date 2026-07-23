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
              <div>
                <h2 className="h3 fw-bold mb-3">Preview Requirements</h2>
                <p className="text-muted-custom">
                  We&apos;re excited to bring you the Pretrend Preview soon. There&apos;s no
                  designated go-live date yet, but expect it in August. Access is being
                  granted to a select group of users — to be eligible, complete the
                  following:
                </p>
                <ol className="text-muted-custom" style={{ lineHeight: 2 }}>
                  <li>
                    Hold a VIP token — obtain one at{' '}
                    <a href="https://scope.vitruveo.ai/legacy" target="_blank" rel="noopener noreferrer" className="text-green text-decoration-none">
                      scope.vitruveo.ai/legacy
                    </a>{' '}
                    by burning your legacy tokens.
                  </li>
                  <li>
                    Obtain a VNS name at{' '}
                    <a href="https://scope.vitruveo.ai/vns" target="_blank" rel="noopener noreferrer" className="text-green text-decoration-none">
                      scope.vitruveo.ai/vns
                    </a>.
                  </li>
                  <li>
                    Bridge at least 1 USDT from BSC to USDT.b on Vitruveo via the{' '}
                    <a href="https://scope.vitruveo.ai/bridge/usdt" target="_blank" rel="noopener noreferrer" className="text-green text-decoration-none">
                      USDT Bridge
                    </a>.
                  </li>
                  <li>
                    Subscribe to our{' '}
                    <a href="https://www.youtube.com/@pretrendofficial" target="_blank" rel="noopener noreferrer" className="text-green text-decoration-none">
                      YouTube channel
                    </a>.
                  </li>
                  <li>
                    Fill out the{' '}
                    <a href="https://forms.gle/wDmPreSY473Ut5FX6" target="_blank" rel="noopener noreferrer" className="text-green text-decoration-none">
                      one-question form
                    </a>.
                  </li>
                </ol>
                <p className="text-muted-custom mb-0">
                  Step 5 asks for a wallet address — provide the same wallet used for steps
                  1, 2, and 3, since we check a single wallet for all three conditions. For
                  step 4, use the same email address you submit in the form so we can verify
                  your subscription.
                </p>
              </div>
              <div className="mt-5">
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
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
