import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Footer } from '@/components/layout/Footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7] dark:bg-[#070c09] text-stone-900 dark:text-stone-100 selection:bg-forest-500 selection:text-white">
      <Navbar />

      <div className="flex-1 flex w-full">
        {/* Sidebar will show for desktop viewport on portal routes or when authenticated */}
        <Sidebar />

        <main className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
          <div className="flex-1 w-full">
            {children}
          </div>
          <Footer />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
