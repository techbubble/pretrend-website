import type { Metadata } from "next";
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: "Investors | Pretrend Protocol",
  description: "How Pretrend is funded and owned: bootstrapped development, open to select angel investors, and 20% of ownership reserved for the Vitruveo community through the VIP program.",
};

const ownership = [
  { label: 'Team & Investors', pct: 78, boxes: 39, color: '#3f6d2c' },
  { label: 'Vitruveo Community', pct: 20, boxes: 10, color: '#8b5cf6' },
  { label: 'Notaries', pct: 2, boxes: 1, color: '#2f8fd6' },
];

function OwnershipGrid() {
  const cells = ownership.flatMap((group) =>
    Array.from({ length: group.boxes }, (_, i) => ({ ...group, key: `${group.label}-${i}` }))
  );
  return (
    <div>
      <div className="ownership-grid mb-4">
        {cells.map((cell) => (
          <div
            key={cell.key}
            className="ownership-cell"
            style={{ background: `${cell.color}33`, borderColor: cell.color }}
            title={`${cell.label} — each box is 2%`}
          />
        ))}
      </div>
      <div className="d-flex justify-content-center gap-4 flex-wrap">
        {ownership.map((group) => (
          <div key={group.label} className="d-flex align-items-center gap-2">
            <span
              className="d-inline-block rounded"
              style={{
                width: '16px',
                height: '16px',
                background: `${group.color}33`,
                border: `1px solid ${group.color}`,
              }}
            />
            <span className="small text-white">
              {group.label} <span className="text-white-50">{group.pct}%</span>
            </span>
          </div>
        ))}
      </div>
      <p className="text-white-50 text-center small mt-3 mb-0">Each box represents 2% of Pretrend ownership.</p>
    </div>
  );
}

export default function InvestorsPage() {
  return (
    <>
      <Header />
      <main>
        {/* Bootstrapped, selectively open */}
        <section className="section-padding bg-dark-custom" style={{ paddingTop: '140px' }}>
          <div className="container">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold mb-3">
                <span className="text-gradient">Investing</span> in Pretrend
              </h1>
            </div>
            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
              <p className="text-muted-custom mb-4">
                We&apos;re bootstrapping Pretrend until the traction speaks for itself — and
                we&apos;re open to one or two angel investors who want to help it speak
                sooner. If that&apos;s you, reach us at{' '}
                <a href="mailto:info@verticalfoundation.net" className="text-green text-decoration-none">
                  info@verticalfoundation.net
                </a>.
              </p>
              <p className="text-muted-custom mb-0">
                Whether Pretrend ultimately becomes an equity play or a token play is a
                decision we&apos;re deliberately keeping open — and one we expect our
                investors to largely drive. The Seed round will be structured accordingly, as
                either a SAFE or a SAFT (Simple Agreement for Future Equity / Token). If the
                round lands on a SAFE, the Vitruveo community&apos;s stake will likely be
                held through a syndicate.
              </p>
            </div>
          </div>
        </section>

        {/* Vitruveo Inspired Pretrend (VIP) */}
        <section className="section-padding bg-dark-alt">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="display-6 fw-bold mb-3">Vitruveo Inspired Pretrend (VIP)</h2>
            </div>
            <div style={{ maxWidth: '820px', margin: '0 auto' }} className="mb-5">
              <p className="text-muted-custom mb-4">
                Pretrend exists because of the Vitruveo community, and its ownership reflects
                that. Through the VIP program, Vitruveo community members can{' '}
                <a
                  href="https://scope.vitruveo.ai/legacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green"
                >
                  burn selected legacy assets
                </a>{' '}
                and convert them into future ownership of Pretrend — turning early belief in
                the chain into a stake in its flagship application.
              </p>
              <p className="text-muted-custom mb-0">
                We have reserved 20% of Pretrend&apos;s ownership for the Vitruveo community.
                The remainder is held by the team and investors, with a dedicated share for
                the notaries who keep the oracle running.
              </p>
            </div>
            <div className="card-dark p-4 p-lg-5">
              <OwnershipGrid />
            </div>
          </div>
        </section>
      </main>
      <Footer disclaimer="Nothing on this page is investment advice, an offer to sell, or a solicitation of an offer to buy any security or token. Any future offering will be made only through definitive agreements." />
    </>
  );
}
