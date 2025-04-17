import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AlgoTrack',
  description: 'Track your progress on competitive programming platforms',
  icons: {
    icon: '/favicon.ico', // place your favicon.ico in the public folder
  },
  openGraph: {
    title: 'AlgoTrack',
    description: 'Track your progress on competitive programming platforms',
    url: 'https://algo-tracker-website.onrender.com', // replace with your actual domain
    siteName: 'AlgoTrack',
    images: [
      {
        url: 'https://algo-tracker-website.onrender.com/og-image.png', // place your Open Graph image in the public folder
        width: 1200,
        height: 630,
        alt: 'AlgoTrack Open Graph Image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        </body>
    </html>
  );
}

