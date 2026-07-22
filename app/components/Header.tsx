'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// Wallet connect button is only loaded/rendered on the validator app page.
const ConnectWallet = dynamic(() => import('../web3/ConnectWallet'), { ssr: false });

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  // trailingSlash: true → usePathname() returns "/validators/"
  // Pages listed here must wrap Header in a wagmi/RainbowKit provider.
  const showConnect = ['/validators', '/trendpulse'].includes(pathname?.replace(/\/+$/, '') ?? '');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`navbar navbar-expand-md navbar-dark fixed-top ${
        scrolled || menuOpen ? 'bg-black' : 'bg-transparent'
      }`}
      style={{ transition: 'background 0.3s' }}
    >
      <div className="container">
        <a className="navbar-brand fw-bold d-flex align-items-center gap-2" href="/" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
          <img
            src="/assets/pretrend-logomark.png"
            alt="Pretrend"
            width={34}
            height={34}
            style={{ height: '34px', width: 'auto' }}
          />
          <span className="text-gradient">Pretrend</span>
        </a>
        <button
          className={`navbar-toggler ${menuOpen ? '' : 'collapsed'}`}
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`navbar-collapse justify-content-end ${menuOpen ? 'show' : 'collapse'}`} id="navbarNav">
          <ul className="navbar-nav gap-md-4" onClick={() => setMenuOpen(false)}>
            <li className="nav-item">
              <a className="nav-link" href="/">Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/whitepaper">Whitepaper</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/examples">Examples</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/ols">OLS</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/trendpulse">TrendPulse</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/preview">Preview</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/investors">Investors</a>
            </li>
          </ul>
          {showConnect && (
            <div className="ms-md-4 mt-3 mt-md-0">
              <ConnectWallet />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
