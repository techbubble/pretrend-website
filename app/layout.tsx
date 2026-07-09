import type { Metadata } from "next";
import { Titillium_Web } from "next/font/google";
import "./globals.css";

const titillium = Titillium_Web({
  subsets: ["latin"],
  weight: ["200", "300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pretrend Protocol | Continuous Trend Resolution for Prediction Markets",
  description: "Pretrend is a trend-based oracle protocol enabling prediction markets to resolve on the magnitude and direction of change — not just binary outcomes. Native on-chain statistical computation on the Vitruveo blockchain.",
  keywords: ["Pretrend", "prediction markets", "oracle", "trend", "OLS regression", "Vitruveo", "blockchain", "EVM", "bonding curve", "Vertical Foundation"],
  openGraph: {
    title: "Pretrend Protocol | Continuous Trend Resolution for Prediction Markets",
    description: "Prediction markets that resolve on magnitude and direction — five graded outcome buckets, priced by bonding curves, resolved by on-chain statistics.",
    type: "website",
  },
  icons: {
    icon: "/assets/pretrend-logomark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${titillium.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
