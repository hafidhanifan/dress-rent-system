import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Naia Dress",
  description: "Created by Dimas Ibnu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${jost.variable} h-full antialiased`}
    >
      <head>
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="beforeInteractive"
        />
      </head>

      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `
      window.addEventListener('pageshow', function(e) {
        var navType = performance.getEntriesByType('navigation')[0]?.type;
        console.log('pageshow, navType =', navType);
        if (navType === 'back_forward') {
          window.location.reload();
        }
      });
    `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
