import './globals.css';

export const metadata = {
  title: 'Acenda Booking',
  description: 'Luxury booking landing page built with Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
