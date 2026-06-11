
import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AutoStat AI – Professional Statistical Analysis & Forecasting',
  description: 'Automated statistical profiling, predictive forecasting, and AI-powered executive insights for enterprise datasets. Transform raw data into strategic intelligence.',
  openGraph: {
    title: 'AutoStat AI – Professional Statistical Analysis',
    description: 'Enterprise-grade automated data analytics and forecasting platform.',
    type: 'website',
    url: 'https://autostat-ai.vercel.app',
    siteName: 'AutoStat AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoStat AI – Professional Statistical Analysis',
    description: 'Automated statistical profiling and AI-powered executive insights.',
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
