'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminShell from '@/components/admin/AdminShell';
import { useAuth } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Customer } from '@/lib/types';
import { extractList, getApiErrorMessage } from '@/lib/api-helpers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, RefreshCw, Users, Crown } from 'lucide-react';

const MEMBERSHIP_MAP = {
  B: { label: 'Bronze', cls: 'bg-amber-100 text-amber-800 border-amber-200', icon: '🥉' },
  S: { label: 'Silver', cls: 'bg-slate-100 text-slate-700 border-slate-300', icon: '🥈' },
  G: { label: 'Gold', cls: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '🥇' },
};

const MEMBERSHIP_OPTIONS: Array<{ value: 'B' | 'S' | 'G'; label: string }> = [
  { value: 'B', label: 'Bronze' },
  { value: 'S', label: 'Silver' },
  { value: 'G', label: 'Gold' },
];

export default function AdminCustomersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') router.push('/');
  }, [user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/store/customers/');
      setCustomers(extractList<Customer>(res.data));
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to load customers.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user?.role === 'admin') load(); }, [user, load]);

  const updateMembership = async (customer: Customer, membership: 'B' | 'S' | 'G') => {
    setUpdatingId(customer.id);
    try {
      await api.patch(`/store/customers/${customer.id}/`, { membership });
      toast.success(`Customer #${customer.id} membership updated to ${MEMBERSHIP_MAP[membership].label}.`);
      setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, membership } : c));
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to update membership.'));
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      <AdminShell
        title="Manage Customers"
        subtitle={`${customers.length} registered customer${customers.length !== 1 ? 's' : ''}`}
        actions={
          <Button variant="outline" className="rounded-2xl border-2 font-bold h-12 px-6" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        }
      >
        <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-4 text-muted-foreground">
                <Users className="h-12 w-12 opacity-20" />
                <p className="font-bold">No customers yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/30 border-b">
                      {['Customer ID', 'User ID', 'Phone', 'Birth Date', 'Membership', 'Change Membership'].map(h => (
                        <th key={h} className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customers.map((c) => {
                      const mem = MEMBERSHIP_MAP[c.membership] ?? MEMBERSHIP_MAP.B;
                      return (
                        <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-5 font-black italic">#{c.id}</td>
                          <td className="px-6 py-5 font-bold text-sm text-muted-foreground">User #{c.user_id}</td>
                          <td className="px-6 py-5 font-medium text-sm">{c.phone || '—'}</td>
                          <td className="px-6 py-5 text-sm text-muted-foreground font-medium">
                            {c.birth_date ? new Date(c.birth_date).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-6 py-5">
                            <Badge className={`border font-black text-xs tracking-widest ${mem.cls}`}>
                              <Crown className="h-3 w-3 mr-1" />
                              {mem.icon} {mem.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-5">
                            {updatingId === c.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            ) : (
                              <div className="flex gap-2">
                                {MEMBERSHIP_OPTIONS
                                  .filter(opt => opt.value !== c.membership)
                                  .map(opt => {
                                    const m = MEMBERSHIP_MAP[opt.value];
                                    return (
                                      <button
                                        key={opt.value}
                                        onClick={() => updateMembership(c, opt.value)}
                                        className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${m.cls} hover:opacity-80 transition-opacity`}
                                      >
                                        {m.icon} {m.label}
                                      </button>
                                    );
                                  })}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </AdminShell>
      <Footer />
    </div>
  );
}
