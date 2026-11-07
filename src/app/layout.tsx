import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LocationProvider } from '@/context/LocationContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LocationModal from '@/components/ui/LocationModal';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cielvo-online-beauty-personal-care.vercel.app'),
  title: {
    default: 'CIELVO — Your beauty. Your way. | India-Wide BeautyTech Marketplace',
    template: '%s | CIELVO',
  },
  description:
    'Discover premier salons throughout India and book bespoke in-salon therapies or certified at-home beauty services with two-way doorstep OTP verification.',
  keywords: [
    'CIELVO',
    'cielvo',
    'cielvo beauty',
    'cielvo technologies',
    'salon booking India',
    'at-home beauty services',
    'hair salon near me',
    'skincare treatment',
    'bridal makeup India',
    'verified beauty professionals',
    'doorstep salon service',
    'India beauty marketplace',
  ],
  authors: [{ name: 'CIELVO Technologies' }],
  creator: 'CIELVO Technologies',
  publisher: 'CIELVO Technologies',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://cielvo.vercel.app',
    siteName: 'CIELVO',
    title: 'CIELVO — Your beauty. Your way. | India-Wide BeautyTech Marketplace',
    description:
      'Discover premier salons throughout India and book bespoke in-salon therapies or certified at-home beauty services with two-way doorstep OTP verification.',
    images: [
      {
        url: '/images/brand/cielvo-hero-atelier.jpg',
        width: 1200,
        height: 630,
        alt: 'CIELVO BeautyTech Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CIELVO — Your beauty. Your way.',
    description:
      'Discover premier salons throughout India and book bespoke in-salon therapies or certified at-home beauty services.',
    images: ['/images/brand/cielvo-hero-atelier.jpg'],
  },
  icons: {
    icon: '/images/brand/cielvo-app-icon.jpg',
    apple: '/images/brand/cielvo-app-icon.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-ivory text-aubergine antialiased selection:bg-terracotta selection:text-ivory">
        <AuthProvider>
          <LocationProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <LocationModal />
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
