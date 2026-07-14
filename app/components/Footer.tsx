import Image from 'next/image';

export default function Footer({ disclaimer }: { disclaimer?: string }) {
  return (
    <footer className="footer-dark py-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-4 mb-md-0">
            <a href="https://www.verticalfoundation.net" target="_blank" rel="noopener noreferrer">
              <Image
                src="/assets/vertical-foundation-logo.png"
                alt="Vertical Foundation"
                width={100}
                height={25}
                style={{ height: '24px', width: 'auto', opacity: 0.6 }}
              />
            </a>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <a href="/whitepaper" className="me-4">
              Whitepaper
            </a>
            <a href="/examples" className="me-4">
              Examples
            </a>
            <a href="/ols" className="me-4">
              OLS
            </a>
            <a href="/investors" className="me-4">
              Investors
            </a>
            <a href="mailto:info@verticalfoundation.net">
              Contact
            </a>
          </div>
        </div>
        <hr className="my-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        {disclaimer && (
          <p className="text-center text-white-50 small mb-3" style={{ maxWidth: '720px', margin: '0 auto' }}>
            {disclaimer}
          </p>
        )}
        <p className="text-center text-white-50 small mb-0">
          © {new Date().getFullYear()} Pretrend · A Vertical Foundation project
        </p>
      </div>
    </footer>
  );
}
