// Real 30-minute BTCUSDT markets replayed from Binance 1-minute closes.
// Thresholds: signed quintiles of rolling 30-minute OLS trends over the prior
// 30 days of 5-minute data, computed at each market's open (as the Oracle would).
// Generated 2026-07-13 from data-api.binance.vision.

export const BUCKET_NAMES = ['Crash', 'Bear', 'Flat', 'Bull', 'Moon'];

export const marketReplays = [
  {
    "id": "jun03-1930",
    "dateLabel": "Jun 3",
    "fullDateLabel": "June 3, 2026",
    "windowLabel": "19:30-20:00 UTC",
    "tOpen": "19:30 UTC",
    "tMid": "19:45",
    "tClose": "20:00",
    "thresholds": [
      -0.1705,
      -0.0476,
      0.0409,
      0.1461
    ],
    "lead": [
      65916.55,
      65958.01,
      66008.96,
      65964.01,
      65932.0,
      65922.0,
      65795.99,
      65702.21,
      65747.99,
      65745.11,
      65737.89,
      65646.02,
      65628.03,
      65612.01,
      65658.18
    ],
    "market": [
      65700.27,
      65684.0,
      65650.01,
      65638.0,
      65722.78,
      65722.0,
      65697.41,
      65795.3,
      65764.01,
      65768.01,
      65766.0,
      65819.99,
      65814.72,
      65800.01,
      65764.01,
      65797.99,
      65786.02,
      65754.01,
      65746.68,
      65746.9,
      65633.35,
      65574.01,
      65505.99,
      65486.23,
      65359.31,
      65303.99,
      65370.0,
      65397.99,
      65439.12,
      65462.0
    ],
    "fitFull": [
      65824.97,
      65473.04
    ],
    "fitHalf": [
      65668.73,
      65819.33
    ],
    "trendFull": -0.535,
    "trendHalf": 0.229,
    "interim": 4,
    "winner": 0,
    "bets": [
      {
        "t": 1,
        "bucket": 0,
        "name": "Omar",
        "amount": 50,
        "price": 0.2,
        "units": 250.0,
        "time": "19:31"
      },
      {
        "t": 2,
        "bucket": 2,
        "name": "Diego",
        "amount": 50,
        "price": 0.2,
        "units": 250.0,
        "time": "19:32"
      },
      {
        "t": 4,
        "bucket": 3,
        "name": "Noor",
        "amount": 30,
        "price": 0.2,
        "units": 150.0,
        "time": "19:34"
      },
      {
        "t": 9,
        "bucket": 0,
        "name": "Marco",
        "amount": 10,
        "price": 0.3,
        "units": 33.3,
        "time": "19:39"
      },
      {
        "t": 10,
        "bucket": 3,
        "name": "Aisha",
        "amount": 100,
        "price": 0.26,
        "units": 384.6,
        "time": "19:40"
      },
      {
        "t": 12,
        "bucket": 2,
        "name": "Lena",
        "amount": 20,
        "price": 0.3,
        "units": 66.7,
        "time": "19:42"
      },
      {
        "t": 13,
        "bucket": 1,
        "name": "Zoe",
        "amount": 60,
        "price": 0.2,
        "units": 300.0,
        "time": "19:43"
      },
      {
        "t": 22,
        "bucket": 4,
        "name": "Ken",
        "amount": 15,
        "price": 0.2,
        "units": 75.0,
        "time": "19:52"
      },
      {
        "t": 24,
        "bucket": 2,
        "name": "Hana",
        "amount": 40,
        "price": 0.327,
        "units": 122.4,
        "time": "19:54"
      },
      {
        "t": 26,
        "bucket": 4,
        "name": "Vera",
        "amount": 50,
        "price": 0.23,
        "units": 217.4,
        "time": "19:56"
      },
      {
        "t": 27,
        "bucket": 4,
        "name": "Maya",
        "amount": 25,
        "price": 0.317,
        "units": 78.9,
        "time": "19:57"
      }
    ],
    "finalPrices": [
      0.313,
      0.32,
      0.376,
      0.414,
      0.349
    ],
    "bounty": 450
  },
  {
    "id": "jun04-1430",
    "dateLabel": "Jun 4",
    "fullDateLabel": "June 4, 2026",
    "windowLabel": "14:30-15:00 UTC",
    "tOpen": "14:30 UTC",
    "tMid": "14:45",
    "tClose": "15:00",
    "thresholds": [
      -0.1786,
      -0.0499,
      0.0392,
      0.1465
    ],
    "lead": [
      64351.55,
      64364.31,
      64411.2,
      64213.4,
      64174.44,
      64178.8,
      64149.42,
      64110.89,
      64166.66,
      64176.01,
      64136.01,
      64067.17,
      64142.63,
      64125.99,
      64144.0
    ],
    "market": [
      64018.19,
      63966.06,
      63991.99,
      64082.41,
      64074.0,
      63950.61,
      63889.7,
      63876.85,
      63918.1,
      63902.5,
      63974.74,
      64004.83,
      63992.84,
      63980.1,
      64000.91,
      64037.83,
      64026.09,
      63945.99,
      63800.17,
      63903.6,
      64000.91,
      63946.71,
      63815.22,
      63812.61,
      63840.0,
      63852.01,
      63910.01,
      63946.47,
      63959.9,
      63958.97
    ],
    "fitFull": [
      63999.76,
      63892.26
    ],
    "fitHalf": [
      63984.07,
      63973.64
    ],
    "trendFull": -0.168,
    "trendHalf": -0.016,
    "interim": 2,
    "winner": 1,
    "bets": [
      {
        "t": 5,
        "bucket": 1,
        "name": "Nadia",
        "amount": 30,
        "price": 0.2,
        "units": 150.0,
        "time": "14:35"
      },
      {
        "t": 7,
        "bucket": 1,
        "name": "Priya",
        "amount": 25,
        "price": 0.26,
        "units": 96.2,
        "time": "14:37"
      },
      {
        "t": 8,
        "bucket": 2,
        "name": "Aisha",
        "amount": 100,
        "price": 0.2,
        "units": 500.0,
        "time": "14:38"
      },
      {
        "t": 11,
        "bucket": 2,
        "name": "Theo",
        "amount": 60,
        "price": 0.4,
        "units": 150.0,
        "time": "14:41"
      },
      {
        "t": 18,
        "bucket": 2,
        "name": "Ken",
        "amount": 30,
        "price": 0.46,
        "units": 65.2,
        "time": "14:48"
      },
      {
        "t": 21,
        "bucket": 2,
        "name": "Umar",
        "amount": 30,
        "price": 0.486,
        "units": 61.7,
        "time": "14:51"
      },
      {
        "t": 28,
        "bucket": 2,
        "name": "Zoe",
        "amount": 50,
        "price": 0.511,
        "units": 97.9,
        "time": "14:58"
      }
    ],
    "finalPrices": [
      0.2,
      0.298,
      0.55,
      0.2,
      0.2
    ],
    "bounty": 325
  },
  {
    "id": "jun08-1700",
    "dateLabel": "Jun 8",
    "fullDateLabel": "June 8, 2026",
    "windowLabel": "17:00-17:30 UTC",
    "tOpen": "17:00 UTC",
    "tMid": "17:15",
    "tClose": "17:30",
    "thresholds": [
      -0.1995,
      -0.0563,
      0.0397,
      0.1601
    ],
    "lead": [
      63660.0,
      63590.01,
      63638.0,
      63642.67,
      63606.01,
      63596.78,
      63587.99,
      63584.99,
      63573.99,
      63550.0,
      63542.97,
      63522.0,
      63500.0,
      63500.02,
      63532.01
    ],
    "market": [
      63458.49,
      63441.34,
      63398.0,
      63322.54,
      63467.64,
      63552.01,
      63574.0,
      63534.01,
      63522.01,
      63469.99,
      63460.0,
      63424.0,
      63448.01,
      63382.59,
      63356.05,
      63397.08,
      63451.11,
      63490.0,
      63424.0,
      63448.77,
      63491.13,
      63528.0,
      63536.0,
      63531.64,
      63535.95,
      63596.05,
      63596.0,
      63567.92,
      63610.0,
      63626.0
    ],
    "fitFull": [
      63416.02,
      63560.0
    ],
    "fitHalf": [
      63474.31,
      63426.66
    ],
    "trendFull": 0.227,
    "trendHalf": -0.075,
    "interim": 1,
    "winner": 4,
    "bets": [
      {
        "t": 3,
        "bucket": 0,
        "name": "Sam",
        "amount": 10,
        "price": 0.2,
        "units": 50.0,
        "time": "17:03"
      },
      {
        "t": 4,
        "bucket": 4,
        "name": "Aisha",
        "amount": 20,
        "price": 0.2,
        "units": 100.0,
        "time": "17:04"
      },
      {
        "t": 5,
        "bucket": 1,
        "name": "Priya",
        "amount": 30,
        "price": 0.2,
        "units": 150.0,
        "time": "17:05"
      },
      {
        "t": 6,
        "bucket": 0,
        "name": "Cora",
        "amount": 50,
        "price": 0.22,
        "units": 227.3,
        "time": "17:06"
      },
      {
        "t": 8,
        "bucket": 0,
        "name": "Beto",
        "amount": 20,
        "price": 0.311,
        "units": 64.3,
        "time": "17:08"
      },
      {
        "t": 11,
        "bucket": 0,
        "name": "Noor",
        "amount": 40,
        "price": 0.337,
        "units": 118.8,
        "time": "17:11"
      },
      {
        "t": 12,
        "bucket": 2,
        "name": "Nadia",
        "amount": 75,
        "price": 0.2,
        "units": 375.0,
        "time": "17:12"
      },
      {
        "t": 14,
        "bucket": 3,
        "name": "Felix",
        "amount": 25,
        "price": 0.2,
        "units": 125.0,
        "time": "17:14"
      },
      {
        "t": 21,
        "bucket": 1,
        "name": "Tara",
        "amount": 100,
        "price": 0.26,
        "units": 384.6,
        "time": "17:21"
      },
      {
        "t": 22,
        "bucket": 1,
        "name": "Zoe",
        "amount": 10,
        "price": 0.414,
        "units": 24.2,
        "time": "17:22"
      },
      {
        "t": 25,
        "bucket": 1,
        "name": "Mira",
        "amount": 30,
        "price": 0.424,
        "units": 70.8,
        "time": "17:25"
      },
      {
        "t": 27,
        "bucket": 4,
        "name": "Marco",
        "amount": 25,
        "price": 0.24,
        "units": 104.2,
        "time": "17:27"
      },
      {
        "t": 28,
        "bucket": 1,
        "name": "Ines",
        "amount": 20,
        "price": 0.452,
        "units": 44.3,
        "time": "17:28"
      }
    ],
    "finalPrices": [
      0.384,
      0.47,
      0.35,
      0.25,
      0.282
    ],
    "bounty": 455
  },
  {
    "id": "jul05-0500",
    "dateLabel": "Jul 5",
    "fullDateLabel": "July 5, 2026",
    "windowLabel": "05:00-05:30 UTC",
    "tOpen": "05:00 UTC",
    "tMid": "05:15",
    "tClose": "05:30",
    "thresholds": [
      -0.2241,
      -0.0654,
      0.0571,
      0.2125
    ],
    "lead": [
      62944.91,
      62858.01,
      62862.0,
      62856.0,
      62866.62,
      62854.01,
      62850.0,
      62831.99,
      62826.01,
      62818.21,
      62829.11,
      62832.0,
      62836.54,
      62837.02,
      62815.99
    ],
    "market": [
      62804.56,
      62787.15,
      62772.01,
      62755.62,
      62784.67,
      62790.0,
      62734.05,
      62742.39,
      62744.21,
      62760.0,
      62757.99,
      62768.01,
      62766.01,
      62766.01,
      62750.57,
      62752.18,
      62765.25,
      62760.01,
      62758.22,
      62781.7,
      62782.62,
      62774.45,
      62756.1,
      62754.29,
      62749.33,
      62749.33,
      62764.0,
      62774.0,
      62773.99,
      62755.0
    ],
    "fitFull": [
      62770.13,
      62758.78
    ],
    "fitHalf": [
      62780.49,
      62748.93
    ],
    "trendFull": -0.018,
    "trendHalf": -0.05,
    "interim": 2,
    "winner": 2,
    "bets": [
      {
        "t": 1,
        "bucket": 2,
        "name": "Elif",
        "amount": 15,
        "price": 0.2,
        "units": 75.0,
        "time": "05:01"
      },
      {
        "t": 9,
        "bucket": 0,
        "name": "Nico",
        "amount": 15,
        "price": 0.2,
        "units": 75.0,
        "time": "05:09"
      },
      {
        "t": 13,
        "bucket": 1,
        "name": "Ines",
        "amount": 150,
        "price": 0.2,
        "units": 750.0,
        "time": "05:13"
      },
      {
        "t": 14,
        "bucket": 4,
        "name": "Ravi",
        "amount": 15,
        "price": 0.2,
        "units": 75.0,
        "time": "05:14"
      },
      {
        "t": 21,
        "bucket": 1,
        "name": "Piotr",
        "amount": 20,
        "price": 0.5,
        "units": 40.0,
        "time": "05:21"
      },
      {
        "t": 25,
        "bucket": 2,
        "name": "Tessa",
        "amount": 20,
        "price": 0.23,
        "units": 87.0,
        "time": "05:25"
      }
    ],
    "finalPrices": [
      0.23,
      0.516,
      0.265,
      0.2,
      0.23
    ],
    "bounty": 235
  },
  {
    "id": "jul07-1700",
    "dateLabel": "Jul 7",
    "fullDateLabel": "July 7, 2026",
    "windowLabel": "17:00-17:30 UTC",
    "tOpen": "17:00 UTC",
    "tMid": "17:15",
    "tClose": "17:30",
    "thresholds": [
      -0.2125,
      -0.064,
      0.0531,
      0.2035
    ],
    "lead": [
      64049.07,
      64038.0,
      64026.44,
      64019.5,
      64026.0,
      64075.99,
      64174.0,
      64170.01,
      64132.55,
      64126.0,
      64097.46,
      64084.08,
      64035.99,
      64015.47,
      63983.27
    ],
    "market": [
      64018.0,
      64001.07,
      63986.0,
      64004.52,
      64058.82,
      64045.99,
      64079.79,
      64093.99,
      64116.01,
      64094.01,
      64075.62,
      64056.0,
      64060.0,
      64064.0,
      64014.96,
      63937.28,
      63908.58,
      63904.22,
      63910.25,
      63976.65,
      64004.5,
      64045.96,
      64015.53,
      64040.0,
      64058.22,
      64090.42,
      64075.0,
      64110.42,
      64140.01,
      64153.48
    ],
    "fitFull": [
      64017.57,
      64058.38
    ],
    "fitHalf": [
      64038.39,
      64049.87
    ],
    "trendFull": 0.064,
    "trendHalf": 0.018,
    "interim": 2,
    "winner": 3,
    "bets": [
      {
        "t": 6,
        "bucket": 3,
        "name": "Kofi",
        "amount": 15,
        "price": 0.2,
        "units": 75.0,
        "time": "17:06"
      },
      {
        "t": 7,
        "bucket": 3,
        "name": "Silas",
        "amount": 30,
        "price": 0.23,
        "units": 130.4,
        "time": "17:07"
      },
      {
        "t": 8,
        "bucket": 2,
        "name": "Tessa",
        "amount": 30,
        "price": 0.2,
        "units": 150.0,
        "time": "17:08"
      },
      {
        "t": 11,
        "bucket": 0,
        "name": "Yuki",
        "amount": 150,
        "price": 0.2,
        "units": 750.0,
        "time": "17:11"
      },
      {
        "t": 13,
        "bucket": 0,
        "name": "Owen",
        "amount": 25,
        "price": 0.5,
        "units": 50.0,
        "time": "17:13"
      },
      {
        "t": 17,
        "bucket": 2,
        "name": "Hana",
        "amount": 20,
        "price": 0.26,
        "units": 76.9,
        "time": "17:17"
      },
      {
        "t": 19,
        "bucket": 2,
        "name": "Felix",
        "amount": 150,
        "price": 0.291,
        "units": 515.9,
        "time": "17:19"
      },
      {
        "t": 23,
        "bucket": 2,
        "name": "Ines",
        "amount": 30,
        "price": 0.497,
        "units": 60.3,
        "time": "17:23"
      },
      {
        "t": 24,
        "bucket": 2,
        "name": "Elif",
        "amount": 150,
        "price": 0.521,
        "units": 287.8,
        "time": "17:24"
      }
    ],
    "finalPrices": [
      0.52,
      0.2,
      0.636,
      0.282,
      0.2
    ],
    "bounty": 600
  }
];
