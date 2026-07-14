import type { Metadata } from "next";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { OlsPlayground } from './_components/ols-playground';
import { SpikeDemo } from './_components/spike-demo';
import { RsqCompare } from './_components/rsq-compare';

export const metadata: Metadata = {
  title: "OLS | Pretrend Protocol",
  description: "The math behind Pretrend's trend resolution: how ordinary least squares turns thirty noisy prices into one defensible number, why it is hard to manipulate, and why it has been the standard measure of trend for 220 years.",
};

export default function OlsPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="section-padding bg-dark-custom" style={{ paddingTop: '140px', paddingBottom: '40px' }}>
          <div className="container">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold mb-3">
                The Math Behind <span className="text-gradient">the Trend</span>
              </h1>
              <p className="lead text-muted-custom" style={{ maxWidth: '900px', margin: '0 auto', textWrap: 'balance' }}>
                Every Pretrend market resolves through ordinary least squares — a regression
                technique with 220 years of history and a precise definition of &quot;best.&quot;
                This page shows what it computes, why it is hard to fool, and why nothing
                simpler does the job.
              </p>
            </div>

            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
              <h2 className="h3 fw-bold mb-3">Thirty prices, one number</h2>
              <p className="text-muted-custom">
                A 30-minute BTC market produces 30 one-minute closes. Resolution has to compress
                them into a single number: how much did the series move, and in which direction?
                The shortcut everyone reaches for first — compare the close to the open — uses
                exactly 2 of the 30 points. In the July 7 market on our{' '}
                <a href="/examples" className="text-green text-decoration-none">Examples page</a>,
                close-versus-open reads +0.212%, which would resolve the market as Moon. The line
                fitted through all 30 points says +0.064% — Bull. Two points told a story the
                other twenty-eight don&apos;t support.
              </p>
              <p className="text-muted-custom mb-0">
                OLS asks a better question: of every straight line you could draw through the
                data, which one has the smallest total error? Error is measured as the vertical
                gap between each price and the line — a residual — and OLS minimizes the sum of
                the squared residuals. Squaring does two jobs: it treats overshoot and undershoot
                symmetrically, and it makes large misses count for more than small ones.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive fit */}
        <section className="section-padding bg-dark-alt" style={{ paddingTop: '50px', paddingBottom: '50px' }}>
          <div className="container">
            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
              <h2 className="h3 fw-bold mb-3">Try to beat it</h2>
              <p className="text-muted-custom">
                Below are the 30 real closes from the June 3 market — the one that crashed.
                Drag the slider to tilt the line and watch the residuals and their total cost.
                Every candidate line pivots through the mean point, because the best line
                provably passes through it.
              </p>
            </div>
            <div className="card-dark p-3 p-md-4 mt-4" style={{ maxWidth: '960px', margin: '0 auto' }}>
              <OlsPlayground />
            </div>
            <p className="text-muted-custom text-center mt-3 mb-0" style={{ maxWidth: '820px', margin: '0 auto' }}>
              The curve under the slider is the total residual cost of every possible slope — a
              parabola with exactly one minimum. OLS doesn&apos;t search for it; it solves for it
              in closed form. No iteration, no starting guess, no parameters to tune.
            </p>
          </div>
        </section>

        {/* The formula */}
        <section className="section-padding bg-dark-custom" style={{ paddingTop: '50px', paddingBottom: '50px' }}>
          <div className="container" style={{ maxWidth: '860px' }}>
            <h2 className="h3 fw-bold mb-3">The whole method is three lines</h2>
            <p className="text-muted-custom">
              With time steps x&#8321;&hellip;x&#8345; and prices y&#8321;&hellip;y&#8345;, the
              slope is the covariance of price with time divided by the variance of time:
            </p>
            <div className="ols-formula">slope&nbsp;&nbsp;b = &Sigma;(x&#7522; &minus; x&#772;)(y&#7522; &minus; y&#772;) / &Sigma;(x&#7522; &minus; x&#772;)&#178;</div>
            <div className="ols-formula">intercept&nbsp;&nbsp;a = y&#772; &minus; b&middot;x&#772;</div>
            <div className="ols-formula">trend% = (&ycirc;&#8345; &minus; &ycirc;&#8321;) / &ycirc;&#8321; &times; 100</div>
            <p className="text-muted-custom">
              Pretrend&apos;s trend is the percentage change along the fitted line from the start
              of the market to the end — not between any two raw prices. A worked example with
              five points, small enough to check by hand:
            </p>
            <div className="table-responsive">
              <table className="ols-table">
                <thead>
                  <tr>
                    <th>x (min)</th>
                    <th>y (price)</th>
                    <th>x &minus; x&#772;</th>
                    <th>y &minus; y&#772;</th>
                    <th>(x &minus; x&#772;)(y &minus; y&#772;)</th>
                    <th>(x &minus; x&#772;)&#178;</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>0</td><td>100.0</td><td>&minus;2</td><td>&minus;1.0</td><td>2.0</td><td>4</td></tr>
                  <tr><td>1</td><td>101.0</td><td>&minus;1</td><td>0.0</td><td>0.0</td><td>1</td></tr>
                  <tr><td>2</td><td>100.5</td><td>0</td><td>&minus;0.5</td><td>0.0</td><td>0</td></tr>
                  <tr><td>3</td><td>102.0</td><td>1</td><td>1.0</td><td>1.0</td><td>1</td></tr>
                  <tr><td>4</td><td>101.5</td><td>2</td><td>0.5</td><td>1.0</td><td>4</td></tr>
                  <tr><td colSpan={2}>x&#772; = 2, y&#772; = 101</td><td></td><td></td><td><strong>&Sigma; = 4.0</strong></td><td><strong>&Sigma; = 10</strong></td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-custom mb-0">
              So b = 4 / 10 = 0.4 per minute, a = 101 &minus; 0.4&middot;2 = 100.2. The fitted
              line runs from 100.2 to 101.8, and the trend is 1.6 / 100.2 = <strong className="text-white">+1.60%</strong>.
              That&apos;s the entire computation — a handful of multiplications and one division,
              which is why it fits in a blockchain precompile and returns the same answer on
              every node.
            </p>
          </div>
        </section>

        {/* Pedigree */}
        <section className="section-padding bg-dark-alt" style={{ paddingTop: '50px', paddingBottom: '50px' }}>
          <div className="container" style={{ maxWidth: '860px' }}>
            <h2 className="h3 fw-bold mb-3">Proven for 220 years</h2>
            <p className="text-muted-custom">
              Least squares was published by Legendre in 1805; Gauss — who claimed he had been
              using it since 1795 — built its probabilistic foundations and used its machinery in
              the celebrated recovery of the dwarf planet Ceres, lost behind the sun after five
              weeks of observations. The Gauss&ndash;Markov theorem later made &quot;best&quot;
              precise: among all linear unbiased estimators, OLS has the minimum variance. Under
              its assumptions, no other straight-line estimate is systematically closer to the
              truth. It has been the standard measure of trend ever since:
            </p>
            <ul className="text-muted-custom">
              <li>The beta shown on every stock terminal is an OLS slope.</li>
              <li>The &deg;C-per-decade warming figures in IPCC reports are OLS slopes.</li>
              <li>Trend GDP growth, unemployment trajectories, and inflation momentum in central bank papers: OLS slopes.</li>
              <li>Dose-response curves, sensor drift calibration, Moore&apos;s law charts: OLS.</li>
            </ul>
            <p className="text-muted-custom mb-0">
              Market noise is not perfectly Gaussian, and OLS does not require it to be — the
              Gauss&ndash;Markov result needs only uncorrelated, equal-variance errors. Where
              reality deviates, Pretrend&apos;s design absorbs it: thresholds are calibrated from
              each data source&apos;s own history, and every fit ships with its own quality score.
            </p>
          </div>
        </section>

        {/* Manipulation resistance */}
        <section className="section-padding bg-dark-custom" style={{ paddingTop: '50px', paddingBottom: '50px' }}>
          <div className="container">
            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
              <h2 className="h3 fw-bold mb-3">Hard to fool</h2>
              <p className="text-muted-custom">
                Because every point carries equal weight, moving the trend requires moving the
                market — not the print. A rule that only reads the close can be flipped by a
                single trade timed to the bell. Try it on the July 7 market:
              </p>
            </div>
            <div className="card-dark p-3 p-md-4 mt-4" style={{ maxWidth: '960px', margin: '0 auto' }}>
              <SpikeDemo />
            </div>
            <p className="text-muted-custom text-center mt-3 mb-0" style={{ maxWidth: '820px', margin: '0 auto' }}>
              A +0.3% spoofed final print more than doubles the two-point reading and would hand
              the market to Moon. The OLS trend moves a few hundredths of a percent and stays in
              Bull. To shift a regression you must hold the price away from its path for many
              observations against real order flow — an attack that costs real money and is
              visible in the data. This is the manipulation model behind the whitepaper&apos;s
              oracle design.
            </p>
          </div>
        </section>

        {/* R-squared */}
        <section className="section-padding bg-dark-alt" style={{ paddingTop: '50px', paddingBottom: '50px' }}>
          <div className="container">
            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
              <h2 className="h3 fw-bold mb-3">The fit grades itself</h2>
              <p className="text-muted-custom">
                OLS ships with its own confidence measure. R&#178; is the share of price variance
                the fitted line explains: 1.0 is a perfect straight march, 0 is structureless
                noise. Two series with the same slope are not the same signal:
              </p>
            </div>
            <div className="card-dark p-3 p-md-4 mt-4" style={{ maxWidth: '960px', margin: '0 auto' }}>
              <RsqCompare />
            </div>
            <p className="text-muted-custom text-center mt-3 mb-0" style={{ maxWidth: '820px', margin: '0 auto' }}>
              The Trend precompile returns R&#178; alongside every slope, so anything built on
              Pretrend can distinguish conviction from coincidence — and void markets whose data
              never carried a signal at all.
            </p>
          </div>
        </section>

        {/* Alternatives */}
        <section className="section-padding bg-dark-custom" style={{ paddingTop: '50px', paddingBottom: '50px' }}>
          <div className="container" style={{ maxWidth: '860px' }}>
            <h2 className="h3 fw-bold mb-3">What about the alternatives?</h2>
            <div className="table-responsive">
              <table className="ols-table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>What it uses</th>
                    <th>Where it breaks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Close minus open</td>
                    <td>2 of n points</td>
                    <td>One trade at the bell decides the market</td>
                  </tr>
                  <tr>
                    <td>High minus low</td>
                    <td>2 extreme prints</td>
                    <td>A single wick sets the outcome; says nothing about direction</td>
                  </tr>
                  <tr>
                    <td>Moving-average delta</td>
                    <td>Smoothed endpoints</td>
                    <td>Lags the data; the window length changes the answer</td>
                  </tr>
                  <tr>
                    <td>Theil&ndash;Sen median slope</td>
                    <td>All point pairs</td>
                    <td>Robust, but O(n&#178;) work for marginal gain on already-averaged closes</td>
                  </tr>
                  <tr>
                    <td>Kalman filter / EMA</td>
                    <td>Recursive state</td>
                    <td>Tuning parameters become a governance attack surface</td>
                  </tr>
                  <tr>
                    <td><strong className="text-white">OLS</strong></td>
                    <td>Every point, equally</td>
                    <td>Closed form, O(n), provably minimum-variance, self-grading via R&#178;</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-custom mb-0">
              On Vitruveo the entire computation — slope, R&#178;, and volatility — is a single
              precompile call at <code style={{ fontSize: '0.9em' }}>0x&hellip;DC</code>,
              deterministic on every node. See it run against live chain data on the{' '}
              <a href="/examples" className="text-green text-decoration-none">Examples page</a>,
              or read the resolution spec in the{' '}
              <a href="/whitepaper" className="text-green text-decoration-none">whitepaper</a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
