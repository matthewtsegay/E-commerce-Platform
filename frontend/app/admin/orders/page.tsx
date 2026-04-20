'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminShell from '@/components/admin/AdminShell';
import { useAuth } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Order, Customer } from '@/lib/types';
import { extractList, getApiErrorMessage } from '@/lib/api-helpers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, RefreshCw, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { formatEtb } from '@/lib/format-currency';

const STATUS_MAP = {
  P: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  C: { label: 'Complete', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  F: { label: 'Failed', cls: 'bg-red-100 text-red-700 border-red-200' },
};

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'P', label: 'Pending' },
  { value: 'C', label: 'Complete' },
  { value: 'F', label: 'Failed' },
];

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  // Map: customer_id → customer object (for name lookups)
  const [customerMap, setCustomerMap] = useState<Record<number, Customer>>({});
  // Map: customer.user_id → user display name
  const [userNames, setUserNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (!user || user.role !== 'admin') router.push('/');
  }, [user, router]);

  // Load customers once and build a map: customer.id → Customer
  const loadCustomers = useCallback(async () => {
    try {
      const res = await api.get('/store/customers/');
      const customers = extractList<Customer>(res.data);
      const map: Record<number, Customer> = {};
      customers.forEach(c => { map[c.id] = c; });
      setCustomerMap(map);

      // Then fetch user details for each unique user_id
      const uniqueUserIds = [...new Set(customers.map(c => c.user_id))];
      const names: Record<number, string> = {};
      await Promise.allSettled(
        uniqueUserIds.map(async (uid) => {
          try {
            const res = await api.get(`/auth/users/${uid}/`);
            const u = res.data;
            names[uid] = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || `User #${uid}`;
          } catch {
            names[uid] = `User #${uid}`;
          }
        })
      );
      setUserNames(names);
    } catch {
      // Customers list not critical — orders still show
    }
  }, []);

  const load = useCallback(async (pg = 1, sf = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pg) });
      if (sf) params.set('payment_status', sf);
      const res = await api.get(`/store/orders/?${params}`);
      const data = res.data;
      if (Array.isArray(data)) {
        setOrders(data);
        setCount(data.length);
      } else {
        setOrders(data.results ?? []);
        setCount(data.count ?? 0);
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to load orders.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      load(page, statusFilter);
      loadCustomers();
    }
  }, [user, load, loadCustomers, page, statusFilter]);

  const updateStatus = async (order: Order, newStatus: string) => {
    setUpdatingId(order.id);
    try {
      await api.patch(`/store/orders/${order.id}/`, { payment_status: newStatus });
      toast.success(`Order #${order.id} → ${STATUS_MAP[newStatus as keyof typeof STATUS_MAP]?.label}.`);
      load(page, statusFilter);
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to update order status.'));
    } finally {
      setUpdatingId(null);
    }
  };

  // Resolve customer display name from customer ID
  const getCustomerName = (customerId: number): string => {
    const customer = customerMap[customerId];
    if (!customer) return `Customer #${customerId}`;
    const name = userNames[customer.user_id];
    return name || `Customer #${customerId}`;
  };

  if (!user || user.role !== 'admin') return null;

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      <AdminShell
        title="Manage Orders"
        subtitle={`${count} total order${count !== 1 ? 's' : ''}`}
        actions={
          <Button variant="outline" className="rounded-2xl border-2 font-bold h-12 px-6"
            onClick={() => load(page, statusFilter)}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        }
      >
        {/* Filter Bar */}
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-6 flex flex-wrap gap-3 items-center">
            <span className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Filter:</span>
            {STATUS_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => { setStatusFilter(value); setPage(1); }}
                className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${
                  statusFilter === value
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'border-transparent bg-muted hover:border-primary/20'
                }`}
              >
                {label}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground font-medium">No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/30 border-b">
                      {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Update Status'].map(h => (
                        <th key={h} className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map((order) => {
                      const s = STATUS_MAP[order.payment_status] ?? STATUS_MAP.P;
                      const customerName = getCustomerName(order.customer);
                      return (
                        <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-5 font-black italic">#{order.id}</td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="h-3 w-3 text-primary" />
                              </div>
                              <div>
                                <p className="font-bold text-sm leading-tight">{customerName}</p>
                                <p className="text-[10px] text-muted-foreground font-medium">ID #{order.customer}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm text-muted-foreground font-medium">
                            {new Date(order.placed_at).toLocaleDateString('en-ET', {
                              year: 'numeric', month: 'short', day: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-5 font-bold">{order.items?.length ?? 0}</td>
                          <td className="px-6 py-5 font-black text-primary">{formatEtb(Number(order.total_price))}</td>
                          <td className="px-6 py-5">
                            <Badge className={`border font-black text-[10px] tracking-widest uppercase ${s.cls}`}>
                              {s.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex gap-2 flex-wrap">
                              {updatingId === order.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              ) : (
                                Object.entries(STATUS_MAP)
                                  .filter(([k]) => k !== order.payment_status)
                                  .map(([k, v]) => (
                                    <button
                                      key={k}
                                      onClick={() => updateStatus(order, k)}
                                      className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${v.cls} hover:opacity-80 transition-opacity`}
                                    >
                                      → {v.label}
                                    </button>
                                  ))
                              )}
                            </div>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1} className="rounded-2xl border-2 font-bold">
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <span className="font-bold text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages} className="rounded-2xl border-2 font-bold">
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </AdminShell>
      <Footer />
    </div>
  );
}
