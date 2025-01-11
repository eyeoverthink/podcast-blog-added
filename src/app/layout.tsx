import { ClerkProvider } from "@clerk/nextjs";
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Navbar } from '@/components/navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CreativeAI Studio',
  description: 'AI-powered podcast creation and management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className="h-full relative">
            <Navbar />
            <main className="pt-16 h-full">
              {children}
            </main>
            <Toaster />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
