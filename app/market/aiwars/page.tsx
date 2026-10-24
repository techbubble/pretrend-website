import type { Metadata } from "next";
import { Orbitron, Share_Tech_Mono, Gugi, Inter } from "next/font/google";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { GameProviders } from './_components/game-providers';
import { GameApp } from './_components/game-app';
import { ComingSoonBanner } from './_components/coming-soon';

// AI Wars type system, scoped to this page via CSS variables on .aw-page.
const display = Orbitron({ subsets: ['latin'], weight: ['500', '700', '900'], variable: '--aw-display' });
const mono = Share_Tech_Mono({ subsets: ['latin'], weight: '400', variable: '--aw-mono' });
const logo = Gugi({ subsets: ['latin'], weight: '400', variable: '--aw-logo' });
const body = Inter({ subsets: ['latin'], variable: '--aw-body' });

export const metadata: Metadata = {
  title: "AIWars Trends | Pretrend Protocol",
  description: "AIWars Trends: a live 5-minute trend game on the AI Wars Battle Momentum pulse, resolved by the Pretrend oracle. Buy credits with USDT.b on Vitruveo, aim your line at one of five outcome buckets, and beat the OLS regression for points.",
};

export default function TrendPlayPage() {
  return (
    <GameProviders>
      <Header />
      <main className={`aw-page ${display.variable} ${mono.variable} ${logo.variable} ${body.variable}`}>
        {/* Hero band */}
        <section className="aw-hero">
          <img src="/aiwars/war.jpg" alt="" aria-hidden="true" className="aw-hero-art" />
          <div className="aw-hero-tint" />
          <div className="aw-hero-fade" />
          <div className="aw-starfield" />
          <div className="aw-scanline" />
          <div className="container position-relative" style={{ maxWidth: '1100px', paddingTop: '120px', paddingBottom: '36px' }}>
            <p className="aw-kicker aw-kicker-ink mb-3">A Vertical Foundation Project &middot; Pretrend &times; AI Wars</p>
            <h1 className="aw-glitch mb-2" style={{ lineHeight: 1 }}>
              <span aria-label="AI WARS" role="img" className="aw-logo">
                A<span aria-hidden="true" className="aw-logo-i">I</span>WARS
              </span>{' '}
              <span className="aw-display aw-trends">Trends</span>
            </h1>
            {/* Second row: intro at two thirds, tile at one third. Both columns
                start with a kicker set 1.5rem below the row top so they align. */}
            <div className="row g-4 align-items-stretch mt-1">
              <div className="col-lg-8 aw-intro-col">
                <p className="aw-kicker aw-kicker-ember mb-0">Live trend game &nbsp;&middot;&nbsp; The Fall of Meridian</p>
                <div className="aw-rule my-4" style={{ maxWidth: '560px' }} />
                <p className="aw-ink mb-3" style={{ maxWidth: '760px', fontSize: '1.15rem' }}>
                  Prediction markets trade on real-world events. AIWars Trends moves that up a notch:
                  the TrendPulse oracle ingests live gaming telemetry from AI Wars and turns the battle
                  itself into a tradable trend &mdash; a market on the direction of the fight, not a
                  who-wins bet.
                </p>
                <p className="aw-dim mb-0" style={{ maxWidth: '720px', fontSize: '1.05rem' }}>
                  A new 5-minute market opens on every 5-minute mark. Betting is open for the first four
                  minutes, the last minute is a locked runout. The dotted line is the live ordinary least
                  squares trend of the pulse so far; watch it switch buckets as the battle moves, then
                  lock your own line in before the gate closes.
                </p>
              </div>
              <div className="col-lg-4 d-flex">
                <ComingSoonBanner />
              </div>
            </div>
          </div>
        </section>

        <section className="aw-body-band" style={{ paddingBottom: '60px' }}>
          <div className="container" style={{ maxWidth: '1100px' }}>
            <GameApp />
          </div>
        </section>
      </main>
      <Footer />
    </GameProviders>
  );
}
