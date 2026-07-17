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
    "trendFull": -0.535,
    "interim": 0,
    "winner": 0,
    "bets": [
      {
        "t": 1,
        "bucket": 0,
        "name": "Cora",
        "amount": 25,
        "price": 0.169,
        "units": 147.8,
        "time": "19:31"
      },
      {
        "t": 2,
        "bucket": 0,
        "name": "Ravi",
        "amount": 150,
        "price": 0.317,
        "units": 472.7,
        "time": "19:32"
      },
      {
        "t": 2,
        "bucket": 1,
        "name": "Beto",
        "amount": 75,
        "price": 0.239,
        "units": 314.0,
        "time": "19:32"
      },
      {
        "t": 6,
        "bucket": 3,
        "name": "Sam",
        "amount": 50,
        "price": 0.355,
        "units": 140.8,
        "time": "19:36"
      },
      {
        "t": 7,
        "bucket": 0,
        "name": "Nadia",
        "amount": 100,
        "price": 0.597,
        "units": 167.6,
        "time": "19:37"
      },
      {
        "t": 8,
        "bucket": 2,
        "name": "Rhea",
        "amount": 100,
        "price": 0.447,
        "units": 223.8,
        "time": "19:38"
      },
      {
        "t": 10,
        "bucket": 2,
        "name": "Zoe",
        "amount": 50,
        "price": 0.581,
        "units": 86.1,
        "time": "19:40"
      },
      {
        "t": 12,
        "bucket": 1,
        "name": "Piotr",
        "amount": 40,
        "price": 0.682,
        "units": 58.7,
        "time": "19:42"
      },
      {
        "t": 16,
        "bucket": 2,
        "name": "Tara",
        "amount": 30,
        "price": 0.827,
        "units": 36.3,
        "time": "19:46"
      },
      {
        "t": 18,
        "bucket": 0,
        "name": "Jade",
        "amount": 25,
        "price": 1.0,
        "units": 25.0,
        "time": "19:48"
      },
      {
        "t": 20,
        "bucket": 0,
        "name": "Yuki",
        "amount": 30,
        "price": 1.0,
        "units": 30.0,
        "time": "19:50"
      }
    ],
    "bounty": 675,
    "fit80": [
      65779.09,
      65620.67
    ],
    "trend80": -0.241,
    "tReveal": "19:54"
  },
  {
    "id": "jun04-1430",
    "dateLabel": "Jun 4",
    "fullDateLabel": "June 4, 2026",
    "windowLabel": "14:30-15:00 UTC",
    "tOpen": "14:30 UTC",
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
    "trendFull": -0.168,
    "interim": 0,
    "winner": 1,
    "bets": [
      {
        "t": 3,
        "bucket": 3,
        "name": "Ken",
        "amount": 30,
        "price": 0.239,
        "units": 125.3,
        "time": "14:33"
      },
      {
        "t": 3,
        "bucket": 1,
        "name": "Tara",
        "amount": 150,
        "price": 0.307,
        "units": 488.5,
        "time": "14:33"
      },
      {
        "t": 5,
        "bucket": 2,
        "name": "Elif",
        "amount": 15,
        "price": 0.299,
        "units": 50.2,
        "time": "14:35"
      },
      {
        "t": 6,
        "bucket": 2,
        "name": "Owen",
        "amount": 10,
        "price": 0.353,
        "units": 28.3,
        "time": "14:36"
      },
      {
        "t": 12,
        "bucket": 2,
        "name": "Mira",
        "amount": 40,
        "price": 0.598,
        "units": 66.9,
        "time": "14:42"
      },
      {
        "t": 15,
        "bucket": 1,
        "name": "Luis",
        "amount": 100,
        "price": 0.856,
        "units": 116.9,
        "time": "14:45"
      },
      {
        "t": 16,
        "bucket": 3,
        "name": "Ivan",
        "amount": 40,
        "price": 0.763,
        "units": 52.4,
        "time": "14:46"
      }
    ],
    "bounty": 385,
    "fit80": [
      64015.24,
      63885.0
    ],
    "trend80": -0.203,
    "tReveal": "14:54"
  },
  {
    "id": "jun08-1700",
    "dateLabel": "Jun 8",
    "fullDateLabel": "June 8, 2026",
    "windowLabel": "17:00-17:30 UTC",
    "tOpen": "17:00 UTC",
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
    "trendFull": 0.227,
    "interim": 3,
    "winner": 4,
    "bets": [
      {
        "t": 2,
        "bucket": 1,
        "name": "Sana",
        "amount": 60,
        "price": 0.229,
        "units": 261.9,
        "time": "17:02"
      },
      {
        "t": 4,
        "bucket": 1,
        "name": "Anika",
        "amount": 60,
        "price": 0.381,
        "units": 157.6,
        "time": "17:04"
      },
      {
        "t": 5,
        "bucket": 2,
        "name": "Diego",
        "amount": 60,
        "price": 0.326,
        "units": 183.8,
        "time": "17:05"
      },
      {
        "t": 6,
        "bucket": 4,
        "name": "Jade",
        "amount": 60,
        "price": 0.36,
        "units": 166.5,
        "time": "17:06"
      },
      {
        "t": 7,
        "bucket": 2,
        "name": "Vera",
        "amount": 20,
        "price": 0.447,
        "units": 44.8,
        "time": "17:07"
      },
      {
        "t": 8,
        "bucket": 1,
        "name": "Tessa",
        "amount": 150,
        "price": 0.592,
        "units": 253.2,
        "time": "17:08"
      },
      {
        "t": 9,
        "bucket": 2,
        "name": "Omar",
        "amount": 60,
        "price": 0.549,
        "units": 109.3,
        "time": "17:09"
      },
      {
        "t": 10,
        "bucket": 2,
        "name": "Mira",
        "amount": 10,
        "price": 0.608,
        "units": 16.5,
        "time": "17:10"
      },
      {
        "t": 11,
        "bucket": 0,
        "name": "Sam",
        "amount": 25,
        "price": 0.523,
        "units": 47.8,
        "time": "17:11"
      },
      {
        "t": 13,
        "bucket": 4,
        "name": "Zoe",
        "amount": 15,
        "price": 0.661,
        "units": 22.7,
        "time": "17:13"
      },
      {
        "t": 13,
        "bucket": 3,
        "name": "Wes",
        "amount": 25,
        "price": 0.597,
        "units": 41.9,
        "time": "17:13"
      },
      {
        "t": 14,
        "bucket": 3,
        "name": "Ravi",
        "amount": 100,
        "price": 0.674,
        "units": 148.4,
        "time": "17:14"
      },
      {
        "t": 16,
        "bucket": 3,
        "name": "Nadia",
        "amount": 25,
        "price": 0.784,
        "units": 31.9,
        "time": "17:16"
      }
    ],
    "bounty": 670,
    "fit80": [
      63440.43,
      63491.12
    ],
    "trend80": 0.08,
    "tReveal": "17:24"
  },
  {
    "id": "jul05-0500",
    "dateLabel": "Jul 5",
    "fullDateLabel": "July 5, 2026",
    "windowLabel": "05:00-05:30 UTC",
    "tOpen": "05:00 UTC",
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
    "trendFull": -0.018,
    "interim": 2,
    "winner": 2,
    "bets": [
      {
        "t": 1,
        "bucket": 2,
        "name": "Omar",
        "amount": 20,
        "price": 0.164,
        "units": 122.1,
        "time": "05:01"
      },
      {
        "t": 3,
        "bucket": 2,
        "name": "Luis",
        "amount": 50,
        "price": 0.296,
        "units": 168.8,
        "time": "05:03"
      },
      {
        "t": 3,
        "bucket": 4,
        "name": "Sam",
        "amount": 30,
        "price": 0.239,
        "units": 125.3,
        "time": "05:03"
      },
      {
        "t": 8,
        "bucket": 1,
        "name": "Zoe",
        "amount": 150,
        "price": 0.465,
        "units": 322.3,
        "time": "05:08"
      },
      {
        "t": 13,
        "bucket": 1,
        "name": "Maya",
        "amount": 25,
        "price": 0.718,
        "units": 34.8,
        "time": "05:13"
      },
      {
        "t": 15,
        "bucket": 0,
        "name": "Ravi",
        "amount": 10,
        "price": 0.666,
        "units": 15.0,
        "time": "05:15"
      }
    ],
    "bounty": 285,
    "fit80": [
      62772.19,
      62757.21
    ],
    "trend80": -0.024,
    "tReveal": "05:24"
  },
  {
    "id": "jul07-1700",
    "dateLabel": "Jul 7",
    "fullDateLabel": "July 7, 2026",
    "windowLabel": "17:00-17:30 UTC",
    "tOpen": "17:00 UTC",
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
    "trendFull": 0.064,
    "interim": 1,
    "winner": 3,
    "bets": [
      {
        "t": 4,
        "bucket": 3,
        "name": "Felix",
        "amount": 50,
        "price": 0.287,
        "units": 174.2,
        "time": "17:04"
      },
      {
        "t": 7,
        "bucket": 3,
        "name": "Owen",
        "amount": 50,
        "price": 0.455,
        "units": 109.9,
        "time": "17:07"
      },
      {
        "t": 9,
        "bucket": 0,
        "name": "Piotr",
        "amount": 15,
        "price": 0.445,
        "units": 33.7,
        "time": "17:09"
      },
      {
        "t": 10,
        "bucket": 1,
        "name": "Ravi",
        "amount": 30,
        "price": 0.489,
        "units": 61.4,
        "time": "17:10"
      },
      {
        "t": 11,
        "bucket": 1,
        "name": "Rhea",
        "amount": 20,
        "price": 0.547,
        "units": 36.6,
        "time": "17:11"
      },
      {
        "t": 13,
        "bucket": 2,
        "name": "Diego",
        "amount": 30,
        "price": 0.599,
        "units": 50.1,
        "time": "17:13"
      },
      {
        "t": 15,
        "bucket": 4,
        "name": "Vera",
        "amount": 150,
        "price": 0.707,
        "units": 212.2,
        "time": "17:15"
      },
      {
        "t": 15,
        "bucket": 1,
        "name": "Elif",
        "amount": 25,
        "price": 0.712,
        "units": 35.1,
        "time": "17:15"
      },
      {
        "t": 18,
        "bucket": 4,
        "name": "Ken",
        "amount": 50,
        "price": 0.872,
        "units": 57.4,
        "time": "17:18"
      }
    ],
    "bounty": 420,
    "fit80": [
      64047.91,
      63997.69
    ],
    "trend80": -0.078,
    "tReveal": "17:24"
  }
];
