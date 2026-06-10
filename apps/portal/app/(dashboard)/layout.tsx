'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar }  from '@/components/layout/topbar';
import { useRealtimeVMs } from '@/hooks/useRealtimeVMs';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const customer = useAuth(s => s.customer);
  const token    = useAuth(s => s.accessToken);

  useEffect(() => { if (!customer) router.replace('/login'); }, [customer, router]);
  useRealtimeVMs(token ?? undefined);

  if (!customer) return null;

  return (
    <div className="app">
      <Sidebar/>
      <div className="main">
        <Topbar/>
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}
