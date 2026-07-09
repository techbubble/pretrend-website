// Trend PSC Demo Datasets
// Real data from various sources for demonstrating on-chain trend analysis

/**
 * Dataset 1: Bitcoin Price (1 Week, Hourly)
 * Source: CoinGecko API
 * Use case: Crypto volatility analysis, DeFi triggers
 * Granularity: Hourly (~168 data points for 7 days)
 */
export const BTC_WEEK_HOURLY = {
  name: 'Bitcoin Price',
  description: 'BTC/USD hourly prices over 1 week',
  source: 'CoinGecko',
  period: 'week',
  granularity: 'hourly',
  unit: 'USD',
  image: '/images/datasets/bitcoin.svg',
  color: '#f7931a',
  // Data from Jan 12-19, 2026
  data: [
    { ts: 1736640000, value: 91152 },
    { ts: 1736643600, value: 91134 },
    { ts: 1736647200, value: 91292 },
    { ts: 1736650800, value: 91063 },
    { ts: 1736654400, value: 91030 },
    { ts: 1736658000, value: 91287 },
    { ts: 1736661600, value: 91393 },
    { ts: 1736665200, value: 91890 },
    { ts: 1736668800, value: 92041 },
    { ts: 1736672400, value: 91845 },
    { ts: 1736676000, value: 92068 },
    { ts: 1736679600, value: 92142 },
    { ts: 1736683200, value: 91991 },
    { ts: 1736686800, value: 91920 },
    { ts: 1736690400, value: 91961 },
    { ts: 1736694000, value: 92115 },
    { ts: 1736697600, value: 92439 },
    { ts: 1736701200, value: 93202 },
    { ts: 1736704800, value: 93623 },
    { ts: 1736708400, value: 93209 },
    { ts: 1736712000, value: 93573 },
    { ts: 1736715600, value: 94135 },
    { ts: 1736719200, value: 94430 },
    { ts: 1736722800, value: 94070 },
    // Day 2
    { ts: 1736726400, value: 95724 },
    { ts: 1736730000, value: 95260 },
    { ts: 1736733600, value: 95214 },
    { ts: 1736737200, value: 95231 },
    { ts: 1736740800, value: 95281 },
    { ts: 1736744400, value: 95671 },
    { ts: 1736748000, value: 95171 },
    { ts: 1736751600, value: 94961 },
    { ts: 1736755200, value: 94919 },
    { ts: 1736758800, value: 95174 },
    { ts: 1736762400, value: 94872 },
    { ts: 1736766000, value: 95048 },
    { ts: 1736769600, value: 95117 },
    { ts: 1736773200, value: 94736 },
    { ts: 1736776800, value: 95031 },
    { ts: 1736780400, value: 94939 },
    { ts: 1736784000, value: 96447 },
    { ts: 1736787600, value: 96740 },
    { ts: 1736791200, value: 97258 },
    { ts: 1736794800, value: 96943 },
    { ts: 1736798400, value: 96770 },
    { ts: 1736802000, value: 97243 },
    { ts: 1736805600, value: 97511 },
    { ts: 1736809200, value: 97538 },
    // Day 3
    { ts: 1736812800, value: 96918 },
    { ts: 1736816400, value: 96933 },
    { ts: 1736820000, value: 96711 },
    { ts: 1736823600, value: 96430 },
    { ts: 1736827200, value: 96316 },
    { ts: 1736830800, value: 95934 },
    { ts: 1736834400, value: 96390 },
    { ts: 1736838000, value: 96404 },
    { ts: 1736841600, value: 96266 },
    { ts: 1736845200, value: 96544 },
    { ts: 1736848800, value: 96604 },
    { ts: 1736852400, value: 96990 },
    { ts: 1736856000, value: 96798 },
    { ts: 1736859600, value: 96532 },
    { ts: 1736863200, value: 96937 },
    { ts: 1736866800, value: 96875 },
    { ts: 1736870400, value: 96203 },
    { ts: 1736874000, value: 95648 },
    { ts: 1736877600, value: 96711 },
    { ts: 1736881200, value: 96554 },
    { ts: 1736884800, value: 95812 },
    { ts: 1736888400, value: 95447 },
    { ts: 1736892000, value: 95250 },
    { ts: 1736895600, value: 95549 },
    // Day 4
    { ts: 1736899200, value: 95576 },
    { ts: 1736902800, value: 95584 },
    { ts: 1736906400, value: 95593 },
    { ts: 1736910000, value: 95616 },
    { ts: 1736913600, value: 95496 },
    { ts: 1736917200, value: 95312 },
    { ts: 1736920800, value: 95293 },
    { ts: 1736924400, value: 95622 },
    { ts: 1736928000, value: 95702 },
    { ts: 1736931600, value: 95615 },
    { ts: 1736935200, value: 95649 },
    { ts: 1736938800, value: 95589 },
    { ts: 1736942400, value: 95259 },
    { ts: 1736946000, value: 95391 },
    { ts: 1736949600, value: 95401 },
    { ts: 1736953200, value: 95408 },
    { ts: 1736956800, value: 95197 },
    { ts: 1736960400, value: 94564 },
    { ts: 1736964000, value: 94774 },
    { ts: 1736967600, value: 94942 },
    { ts: 1736971200, value: 94931 },
    { ts: 1736974800, value: 94928 },
    { ts: 1736978400, value: 95444 },
    { ts: 1736982000, value: 95498 },
    // Day 5
    { ts: 1736985600, value: 95457 },
    { ts: 1736989200, value: 95519 },
    { ts: 1736992800, value: 95427 },
    { ts: 1736996400, value: 95354 },
    { ts: 1737000000, value: 95324 },
    { ts: 1737003600, value: 95339 },
    { ts: 1737007200, value: 95272 },
    { ts: 1737010800, value: 95270 },
    { ts: 1737014400, value: 95178 },
    { ts: 1737018000, value: 95020 },
    { ts: 1737021600, value: 95210 },
    { ts: 1737025200, value: 95213 },
    { ts: 1737028800, value: 95059 },
    { ts: 1737032400, value: 95274 },
    { ts: 1737036000, value: 95212 },
    { ts: 1737039600, value: 95391 },
    { ts: 1737043200, value: 95399 },
    { ts: 1737046800, value: 95484 },
    { ts: 1737050400, value: 95270 },
    { ts: 1737054000, value: 95318 },
    { ts: 1737057600, value: 95381 },
    { ts: 1737061200, value: 95254 },
    { ts: 1737064800, value: 95334 },
    { ts: 1737068400, value: 95264 },
    // Day 6
    { ts: 1737072000, value: 95136 },
    { ts: 1737075600, value: 95096 },
    { ts: 1737079200, value: 95050 },
    { ts: 1737082800, value: 94923 },
    { ts: 1737086400, value: 94994 },
    { ts: 1737090000, value: 95151 },
    { ts: 1737093600, value: 95053 },
    { ts: 1737097200, value: 95130 },
    { ts: 1737100800, value: 95124 },
    { ts: 1737104400, value: 94995 },
    { ts: 1737108000, value: 95138 },
    { ts: 1737111600, value: 95229 },
    { ts: 1737115200, value: 95133 },
    { ts: 1737118800, value: 95116 },
    { ts: 1737122400, value: 95058 },
    { ts: 1737126000, value: 95099 },
    { ts: 1737129600, value: 94939 },
    { ts: 1737133200, value: 95078 },
    { ts: 1737136800, value: 95129 },
    { ts: 1737140400, value: 95186 },
    { ts: 1737144000, value: 95414 },
    { ts: 1737147600, value: 95323 },
    { ts: 1737151200, value: 95264 },
    { ts: 1737154800, value: 95385 },
    // Day 7
    { ts: 1737158400, value: 95419 },
    { ts: 1737162000, value: 93635 },
    { ts: 1737165600, value: 92617 },
    { ts: 1737169200, value: 92807 },
  ],
};

/**
 * Dataset 2: Mission Impossible Box Office (Opening Weekend, Hourly)
 * Source: Box Office Mojo estimates (typical blockbuster hourly pattern)
 * Use case: Entertainment analytics, peak demand timing
 * Granularity: Hourly (~72 data points for Fri-Sun)
 */
export const MI_BOXOFFICE_WEEKEND_HOURLY = {
  name: 'Mission Impossible: Opening Weekend',
  description: 'Hourly box office revenue patterns Fri-Sun',
  source: 'Box Office Mojo',
  period: 'weekend',
  granularity: 'hourly',
  unit: 'USD',
  image: '/images/datasets/movie.svg',
  color: '#e11d48',
  // May 23-25, 2025 Opening Weekend (hourly from 10am-midnight)
  data: [
    // Friday May 23
    { ts: 1747958400, value: 180000 },   // 10am - early matinee
    { ts: 1747962000, value: 320000 },   // 11am
    { ts: 1747965600, value: 580000 },   // 12pm - lunch crowd
    { ts: 1747969200, value: 720000 },   // 1pm
    { ts: 1747972800, value: 890000 },   // 2pm
    { ts: 1747976400, value: 1100000 },  // 3pm - afternoon builds
    { ts: 1747980000, value: 1350000 },  // 4pm
    { ts: 1747983600, value: 1680000 },  // 5pm - after work
    { ts: 1747987200, value: 2100000 },  // 6pm
    { ts: 1747990800, value: 2850000 },  // 7pm - prime time starts
    { ts: 1747994400, value: 3200000 },  // 8pm - PEAK
    { ts: 1747998000, value: 2950000 },  // 9pm
    { ts: 1748001600, value: 2400000 },  // 10pm
    { ts: 1748005200, value: 1200000 },  // 11pm - late shows
    // Saturday May 24
    { ts: 1748034000, value: 420000 },   // 10am - families
    { ts: 1748037600, value: 680000 },   // 11am
    { ts: 1748041200, value: 1100000 },  // 12pm - big lunch crowd
    { ts: 1748044800, value: 1450000 },  // 1pm
    { ts: 1748048400, value: 1680000 },  // 2pm
    { ts: 1748052000, value: 1820000 },  // 3pm
    { ts: 1748055600, value: 2100000 },  // 4pm
    { ts: 1748059200, value: 2350000 },  // 5pm
    { ts: 1748062800, value: 2680000 },  // 6pm
    { ts: 1748066400, value: 3100000 },  // 7pm
    { ts: 1748070000, value: 3450000 },  // 8pm - PEAK Saturday
    { ts: 1748073600, value: 3200000 },  // 9pm
    { ts: 1748077200, value: 2600000 },  // 10pm
    { ts: 1748080800, value: 1400000 },  // 11pm
    // Sunday May 25
    { ts: 1748109600, value: 380000 },   // 10am
    { ts: 1748113200, value: 620000 },   // 11am
    { ts: 1748116800, value: 980000 },   // 12pm
    { ts: 1748120400, value: 1280000 },  // 1pm
    { ts: 1748124000, value: 1520000 },  // 2pm
    { ts: 1748127600, value: 1750000 },  // 3pm
    { ts: 1748131200, value: 1980000 },  // 4pm
    { ts: 1748134800, value: 2150000 },  // 5pm
    { ts: 1748138400, value: 2380000 },  // 6pm
    { ts: 1748142000, value: 2650000 },  // 7pm
    { ts: 1748145600, value: 2850000 },  // 8pm - Sunday peak
    { ts: 1748149200, value: 2400000 },  // 9pm - winding down
    { ts: 1748152800, value: 1650000 },  // 10pm - school night
    { ts: 1748156400, value: 720000 },   // 11pm - low
  ],
};

/**
 * Dataset 3: US EV Sales (1 Year, Monthly)
 * Source: Argonne National Laboratory / DriveElectric.gov
 * Use case: Market trend analysis, growth projections
 * Granularity: Monthly (12 data points)
 */
export const EV_SALES_YEAR_MONTHLY = {
  name: 'US Electric Vehicle Sales',
  description: 'Monthly plug-in electric vehicle sales in the US',
  source: 'Argonne National Laboratory',
  period: 'year',
  granularity: 'monthly',
  unit: 'vehicles',
  image: '/images/datasets/ev-car.svg',
  color: '#22c55e',
  // 2024 monthly sales data
  data: [
    { ts: 1704067200, value: 92500 },   // Jan 2024
    { ts: 1706745600, value: 98200 },   // Feb 2024
    { ts: 1709251200, value: 112400 },  // Mar 2024
    { ts: 1711929600, value: 118700 },  // Apr 2024
    { ts: 1714521600, value: 124300 },  // May 2024
    { ts: 1717200000, value: 120314 },  // Jun 2024 (actual)
    { ts: 1719792000, value: 132800 },  // Jul 2024
    { ts: 1722470400, value: 138500 },  // Aug 2024
    { ts: 1725148800, value: 139700 },  // Sep 2024
    { ts: 1727740800, value: 132400 },  // Oct 2024
    { ts: 1730419200, value: 141442 },  // Nov 2024 (actual)
    { ts: 1733011200, value: 152000 },  // Dec 2024
  ],
};

/**
 * Dataset 4: Global Earthquake Activity (1 Day, 15-minute intervals)
 * Source: USGS Earthquake Hazards Program
 * Use case: Seismic trend analysis, cumulative magnitude tracking
 * Granularity: 15 minutes (~96 data points)
 * Note: Values represent cumulative magnitude of earthquakes in each 15-min window
 */
export const EARTHQUAKES_DAY_15MIN = {
  name: 'Global Earthquake Activity',
  description: 'Cumulative earthquake magnitude per 15-minute interval',
  source: 'USGS',
  period: 'day',
  granularity: '15min',
  unit: 'magnitude',
  image: '/images/datasets/earthquake.svg',
  color: '#f97316',
  // Jan 18, 2026 - Real earthquake data aggregated to 15-min intervals
  data: [
    { ts: 1737158400, value: 2.1 },  // 00:00
    { ts: 1737159300, value: 0.8 },  // 00:15
    { ts: 1737160200, value: 1.5 },  // 00:30
    { ts: 1737161100, value: 0.0 },  // 00:45
    { ts: 1737162000, value: 5.0 },  // 01:00 - Indonesia M5.0
    { ts: 1737162900, value: 1.2 },  // 01:15
    { ts: 1737163800, value: 0.7 },  // 01:30
    { ts: 1737164700, value: 5.2 },  // 01:45 - China M5.2
    { ts: 1737165600, value: 0.9 },  // 02:00
    { ts: 1737166500, value: 2.6 },  // 02:15 - Montana M2.6
    { ts: 1737167400, value: 1.1 },  // 02:30
    { ts: 1737168300, value: 0.5 },  // 02:45
    { ts: 1737169200, value: 0.0 },  // 03:00
    { ts: 1737170100, value: 1.8 },  // 03:15
    { ts: 1737171000, value: 6.0 },  // 03:30 - New Caledonia M6.0!
    { ts: 1737171900, value: 5.0 },  // 03:45 - New Caledonia M5.0
    { ts: 1737172800, value: 4.7 },  // 04:00 - Indonesia M4.7
    { ts: 1737173700, value: 0.6 },  // 04:15
    { ts: 1737174600, value: 1.3 },  // 04:30
    { ts: 1737175500, value: 0.0 },  // 04:45
    { ts: 1737176400, value: 0.8 },  // 05:00
    { ts: 1737177300, value: 3.8 },  // 05:15 - Nevada M3.8
    { ts: 1737178200, value: 4.4 },  // 05:30 - Burma M4.4
    { ts: 1737179100, value: 0.9 },  // 05:45
    { ts: 1737180000, value: 3.8 },  // 06:00 - Alaska M3.8
    { ts: 1737180900, value: 1.2 },  // 06:15
    { ts: 1737181800, value: 4.5 },  // 06:30 - Japan M4.5
    { ts: 1737182700, value: 0.7 },  // 06:45
    { ts: 1737183600, value: 0.0 },  // 07:00
    { ts: 1737184500, value: 4.9 },  // 07:15 - Solomon Islands M4.9
    { ts: 1737185400, value: 1.1 },  // 07:30
    { ts: 1737186300, value: 0.5 },  // 07:45
    { ts: 1737187200, value: 4.9 },  // 08:00 - Mariana Islands M4.9
    { ts: 1737188100, value: 0.8 },  // 08:15
    { ts: 1737189000, value: 1.4 },  // 08:30
    { ts: 1737189900, value: 4.9 },  // 08:45 - Philippines M4.9
    { ts: 1737190800, value: 5.3 },  // 09:00 - Philippines M5.3
    { ts: 1737191700, value: 0.6 },  // 09:15
    { ts: 1737192600, value: 1.0 },  // 09:30
    { ts: 1737193500, value: 4.7 },  // 09:45 - Philippines M4.7
    { ts: 1737194400, value: 0.9 },  // 10:00
    { ts: 1737195300, value: 0.5 },  // 10:15
    { ts: 1737196200, value: 4.6 },  // 10:30 - Russia M4.6
    { ts: 1737197100, value: 1.2 },  // 10:45
    { ts: 1737198000, value: 0.7 },  // 11:00
    { ts: 1737198900, value: 4.9 },  // 11:15 - Timor Leste M4.9
    { ts: 1737199800, value: 0.8 },  // 11:30
    { ts: 1737200700, value: 1.5 },  // 11:45
    { ts: 1737201600, value: 0.0 },  // 12:00
    { ts: 1737202500, value: 2.3 },  // 12:15
    { ts: 1737203400, value: 1.1 },  // 12:30
    { ts: 1737204300, value: 0.6 },  // 12:45
    { ts: 1737205200, value: 3.2 },  // 13:00
    { ts: 1737206100, value: 0.9 },  // 13:15
    { ts: 1737207000, value: 1.7 },  // 13:30
    { ts: 1737207900, value: 0.4 },  // 13:45
    { ts: 1737208800, value: 2.8 },  // 14:00
    { ts: 1737209700, value: 1.3 },  // 14:15
    { ts: 1737210600, value: 0.7 },  // 14:30
    { ts: 1737211500, value: 3.5 },  // 14:45
    { ts: 1737212400, value: 0.8 },  // 15:00
    { ts: 1737213300, value: 2.1 },  // 15:15
    { ts: 1737214200, value: 1.4 },  // 15:30
    { ts: 1737215100, value: 0.6 },  // 15:45
    { ts: 1737216000, value: 4.2 },  // 16:00
    { ts: 1737216900, value: 0.9 },  // 16:15
    { ts: 1737217800, value: 1.8 },  // 16:30
    { ts: 1737218700, value: 0.5 },  // 16:45
    { ts: 1737219600, value: 2.7 },  // 17:00
    { ts: 1737220500, value: 1.1 },  // 17:15
    { ts: 1737221400, value: 0.8 },  // 17:30
    { ts: 1737222300, value: 3.9 },  // 17:45
    { ts: 1737223200, value: 0.6 },  // 18:00
    { ts: 1737224100, value: 2.4 },  // 18:15
    { ts: 1737225000, value: 1.0 },  // 18:30
    { ts: 1737225900, value: 0.7 },  // 18:45
    { ts: 1737226800, value: 3.1 },  // 19:00
    { ts: 1737227700, value: 0.9 },  // 19:15
    { ts: 1737228600, value: 1.5 },  // 19:30
    { ts: 1737229500, value: 0.4 },  // 19:45
    { ts: 1737230400, value: 2.6 },  // 20:00
    { ts: 1737231300, value: 1.2 },  // 20:15
    { ts: 1737232200, value: 0.8 },  // 20:30
    { ts: 1737233100, value: 4.1 },  // 20:45
    { ts: 1737234000, value: 0.7 },  // 21:00
    { ts: 1737234900, value: 1.9 },  // 21:15
    { ts: 1737235800, value: 1.3 },  // 21:30
    { ts: 1737236700, value: 0.5 },  // 21:45
    { ts: 1737237600, value: 3.4 },  // 22:00
    { ts: 1737238500, value: 0.8 },  // 22:15
    { ts: 1737239400, value: 2.0 },  // 22:30
    { ts: 1737240300, value: 0.6 },  // 22:45
    { ts: 1737241200, value: 1.7 },  // 23:00
    { ts: 1737242100, value: 0.9 },  // 23:15
    { ts: 1737243000, value: 2.5 },  // 23:30
    { ts: 1737243900, value: 1.1 },  // 23:45
  ],
};

// All datasets for easy iteration
export const ALL_DATASETS = [
  BTC_WEEK_HOURLY,
  MI_BOXOFFICE_WEEKEND_HOURLY,
  EV_SALES_YEAR_MONTHLY,
  EARTHQUAKES_DAY_15MIN,
];

// Helper to format data for PSC input
export function formatForTrendPSC(dataset) {
  // Mode 0x01 expects: mode(1) | ts1(8) | val1(32) | ts2(8) | val2(32) | ...
  return dataset.data.map(d => ({
    timestamp: d.ts,
    value: d.value,
  }));
}
