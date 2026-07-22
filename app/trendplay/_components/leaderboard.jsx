'use client';

const FONT = "'Titillium Web',sans-serif";

function shortAddr(a) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function Leaderboard({ rows, myAddress }) {
  if (!rows?.length) return null;

  return (
    <div className="card-dark p-3 p-md-4 mt-4">
      <h2 className="h4 fw-bold mb-3">Leaderboard</h2>
      <div className="table-responsive">
        <table className="ols-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '3rem' }}>#</th>
              <th>Player</th>
              <th style={{ textAlign: 'right' }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const mine = myAddress && row.address.toLowerCase() === myAddress.toLowerCase();
              return (
                <tr key={row.address} style={mine ? { color: '#7abe4d' } : undefined}>
                  <td>{i + 1}</td>
                  <td style={{ fontFamily: FONT }}>
                    {row.name ? (
                      <span className={mine ? '' : 'text-white'} title={row.address} style={{ cursor: 'default' }}>
                        {row.name}
                      </span>
                    ) : (
                      <span title={row.address} style={{ cursor: 'default' }}>{shortAddr(row.address)}</span>
                    )}
                    {mine ? ' (you)' : ''}
                  </td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.points.toLocaleString('en-US')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
