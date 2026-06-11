
import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://autostat-ai.vercel.app'),
  applicationName: 'AutoStat AI',
  title: 'AutoStat AI',
  description: 'AI-Powered Statistical Analytics, Forecasting & Data Intelligence Platform',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  themeColor: '#050507',
  colorScheme: 'dark',
  openGraph: {
    title: 'AutoStat AI',
    description: 'AI-Powered Statistical Analytics, Forecasting & Data Intelligence Platform',
    type: 'website',
    url: 'https://autostat-ai.vercel.app',
    siteName: 'AutoStat AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoStat AI',
    description: 'AI-Powered Statistical Analytics, Forecasting & Data Intelligence Platform',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  );
}
