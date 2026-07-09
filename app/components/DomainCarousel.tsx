// Continuously scrolling carousel of the domains Pretrend will support.
// Pure CSS animation (no JS); the item list is rendered twice for a seamless loop.

const ICON_STROKE = '#a3d97a';

const icons: Record<string, React.ReactNode> = {
  crypto: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 7.5h4a2 2 0 0 1 0 4h-4zM9.5 11.5h4.5a2 2 0 0 1 0 4h-4.5z" />
      <path d="M11 5.5v2M13 5.5v2M11 16.5v2M13 16.5v2" />
    </>
  ),
  stocks: (
    <>
      <path d="M4 20V10M9 20V4M14 20v-8M19 20V7" />
      <path d="M2.5 8.5 8 3l4 4 6.5-5" opacity="0.5" />
    </>
  ),
  movies: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M3 7l2.5-4 4 1.5L7 8.5zM9.5 4.5l4 1.5-2.5 4-4-1.5zM17.5 6l3 1v0" />
      <path d="M10 12.5v5l4.5-2.5z" />
    </>
  ),
  music: (
    <>
      <circle cx="7" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
      <path d="M10 18V5l10-2v13" />
    </>
  ),
  tv: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M8 21h8M12 18v3M8 2.5 12 6l4-3.5" />
    </>
  ),
  weather: (
    <>
      <circle cx="8" cy="9" r="3.5" />
      <path d="M8 2.5v1.5M8 13.5V15M1.5 9H3M13 9h1.5M3.5 4.5l1 1M12.5 4.5l-1 1" />
      <path d="M13 20h6a3 3 0 0 0 .5-5.95A4.5 4.5 0 0 0 11 12.5" />
    </>
  ),
  sports: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a13 13 0 0 0 0 18M12 3a13 13 0 0 1 0 18M3 12h18" />
    </>
  ),
  fashion: (
    <>
      <path d="M12 5a2 2 0 1 1 2-2" />
      <path d="M12 5 3 12.5a1.5 1.5 0 0 0 .9 2.7h16.2a1.5 1.5 0 0 0 .9-2.7z" />
      <path d="M7 15.2V20a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-4.8" opacity="0.5" />
    </>
  ),
  popculture: (
    <>
      <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" />
    </>
  ),
  news: (
    <>
      <path d="M4 5h13v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M17 8h3v9.5a1.5 1.5 0 0 1-3 0z" />
      <path d="M7 9h7M7 12.5h7M7 16h4.5" />
    </>
  ),
};

const domains: { key: string; name: string; example: string }[] = [
  { key: 'crypto', name: 'Crypto', example: "Bitcoin's 30-day trend" },
  { key: 'stocks', name: 'Stocks', example: "NVIDIA's quarterly momentum" },
  { key: 'movies', name: 'Movies', example: 'Opening-weekend box office' },
  { key: 'music', name: 'Music', example: "An album drop's first week" },
  { key: 'tv', name: 'TV Shows', example: "A new series' audience curve" },
  { key: 'weather', name: 'Weather', example: 'A heat wave building or breaking' },
  { key: 'sports', name: 'Sports', example: "A rookie's scoring pace" },
  { key: 'fashion', name: 'Fashion', example: "A brand's search momentum" },
  { key: 'popculture', name: 'Pop Culture', example: "A celebrity's attention share" },
  { key: 'news', name: 'News', example: 'A story going global — or fading' },
];

function DomainCard({ domain }: { domain: (typeof domains)[number] }) {
  return (
    <div className="domain-card card-dark p-4 text-center">
      <svg
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke={ICON_STROKE}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mb-3"
      >
        {icons[domain.key]}
      </svg>
      <div className="text-white fw-semibold">{domain.name}</div>
      <div className="small text-white-50 mt-1">{domain.example}</div>
    </div>
  );
}

export default function DomainCarousel() {
  return (
    <div className="domain-marquee" aria-label="Domains Pretrend will support">
      <div className="domain-track">
        {[...domains, ...domains].map((d, i) => (
          <DomainCard key={`${d.key}-${i}`} domain={d} />
        ))}
      </div>
    </div>
  );
}
