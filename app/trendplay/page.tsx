import type { Metadata } from "next";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { GameProviders } from './_components/game-providers';
import { GameApp } from './_components/game-app';

export const metadata: Metadata = {
  title: "TrendPlay | Pretrend Protocol",
  description: "TrendPlay: buy credits with USDT.b on Vitruveo, aim your line at one of the five outcome buckets as the prices appear, and beat the regression for points.",
};

export default function TrendPlayPage() {
  return (
    <GameProviders>
      <Header />
      <main>
        <section className="section-padding bg-dark-custom" style={{ paddingTop: '140px', paddingBottom: '40px' }}>
          <div className="container">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold mb-3">
                <span className="text-gradient">TrendPlay</span>
              </h1>
              <div className="card-dark tp-hero-tile p-4 mx-auto" style={{ maxWidth: '1040px' }}>
                <img
                  src="/images/graphbg.jpg"
                  alt=""
                  aria-hidden="true"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12, pointerEvents: 'none' }}
                />
                <svg className="tp-pulse-svg" viewBox="0 0 1200 220" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    className="tp-pulse-glow"
                    d="M0,150 L90,148 L130,152 L170,146 L210,150 L250,64 L280,196 L310,118 L350,142 L420,138 L470,132 L520,136 L560,52 L590,184 L620,108 L680,126 L740,120 L800,124 L840,44 L870,172 L900,96 L960,112 L1030,104 L1090,108 L1140,40 L1170,150 L1200,88"
                    fill="none"
                    stroke="#39ff14"
                    strokeWidth="7"
                  />
                  <path
                    className="tp-pulse-line"
                    d="M0,150 L90,148 L130,152 L170,146 L210,150 L250,64 L280,196 L310,118 L350,142 L420,138 L470,132 L520,136 L560,52 L590,184 L620,108 L680,126 L740,120 L800,124 L840,44 L870,172 L900,96 L960,112 L1030,104 L1090,108 L1140,40 L1170,150 L1200,88"
                    fill="none"
                    stroke="#39ff14"
                    strokeWidth="2"
                  />
                </svg>
                <p className="mb-0" style={{ fontSize: '1.1rem', fontWeight: 400, position: 'relative', color: '#ffffff', textShadow: '0 1px 10px rgba(0,0,0,0.85)', textWrap: 'balance' }}>
                  TrendPlay is a game built on the same mechanics that resolve every Pretrend
                  market. Each game deals a fresh 30-minute market, one closes every 2 seconds.
                  You start the round at 600 points and burn 20 per price revealed &mdash; submit
                  early for a bigger score, but the dotted OLS answer must land within 2% of
                  your line to win. At price 24 the slider locks and your line rides the
                  runout. A credit is 0.99 USDT.b on Vitruveo; each game uses 1 credit.
                </p>
              </div>
            </div>
            <GameApp />
            <p className="text-muted-custom text-center mt-3 mb-0" style={{ maxWidth: '820px', margin: '0 auto' }}>
              The bucket boundaries are the same signed quintiles Pretrend markets resolve
              against, and the hidden runout mirrors the Timeslope participation close.
              Curious how the answer is computed? The{' '}
              <a href="/ols" className="text-green text-decoration-none">OLS page</a> walks
              through the whole method.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </GameProviders>
  );
}
