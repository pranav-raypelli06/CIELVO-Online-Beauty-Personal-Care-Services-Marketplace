import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cielvo.vercel.app';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/salon/dashboard', '/customer/dashboard', '/staff/dashboard'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
