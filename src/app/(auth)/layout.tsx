'use client';

import Sidebar from '@/components/sidebar/Sidebar';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
