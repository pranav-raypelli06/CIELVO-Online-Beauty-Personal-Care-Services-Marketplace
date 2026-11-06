import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LocationProvider } from '@/context/LocationContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LocationModal from '@/components/ui/LocationModal';

export const metadata: Metadata = {
  title: 'CIELVO — Your beauty. Your way. | India-Wide BeautyTech Marketplace',
  description:
    'Discover premier salons throughout India and book bespoke in-salon therapies or certified at-home beauty services with two-way doorstep OTP verification.',
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
