'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminShell from '@/components/admin/AdminShell';
import { useAuth } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, ShoppingBag, Box, ArrowUpRight, Loader2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatEtb } from '@/lib/format-currency';
import { api } from '@/lib/api-client';
import { getApiErrorMessage } from '@/lib/api-helpers';
import { AdminStats, Order } from '@/lib/types';
import Link from 'next/link';
import { toast } from 'sonner';
import { extractList } from '@/lib/api-helpers';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  C: { label: 'Complete', cls: 'bg-emerald-100 text-emerald-700' },
  P: { label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
  F: { label: 'Failed', cls: 'bg-red-100 text-red-700' },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/store/admin-stats/'),
        api.get('/store/orders/?page=1'),
      ]);
      setStats(statsRes.data);
      const orders = extractList<Order>(ordersRes.data);
      setRecentOrders(orders.slice(0, 5));
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to load dashboard data.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') loadData();
  }, [user]);

  if (!user || user.role !== 'admin') return null;

  const statCards = stats
    ? [
        { label: 'Total Sales', value: formatEtb(Number(stats.total_sales)), icon: TrendingUp, color: 'bg-emerald-500' },
        { label: 'Total Orders', value: String(stats.total_orders), icon: ShoppingBag, color: 'bg-blue-500' },
        { label: 'Total Products', value: String(stats.total_products), icon: Box, color: 'bg-purple-500' },
        { label: 'Total Customers', value: String(stats.total_customers), icon: Users, color: 'bg-orange-500' },
      ]
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      <AdminShell
        title="Admin Dashboard"
        subtitle="Monitoring your store performance in real-time."
        actions={
          <>
            <Button variant="outline" className="rounded-2xl border-2 font-bold h-12 px-6" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Link href="/">
              <Button className="rounded-2xl font-black shadow-lg h-12 px-6">View Live Store</Button>
            </Link>
          </>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {statCards.map((stat) => (
                <Card key={stat.label} className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <h3 className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                    <div className="text-3xl font-black tracking-tighter italic">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Orders */}
            <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden">
              <CardHeader className="p-10 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter">Recent Orders</CardTitle>
                  <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-widest">Latest activity</p>
                </div>
                <Link href="/admin/orders">
                  <Button variant="ghost" className="font-bold uppercase text-xs tracking-widest">See all orders</Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {recentOrders.length === 0 ? (
                  <div className="p-10 text-center text-muted-foreground font-medium">No orders yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/30 border-b">
                          {['Order', 'Customer', 'Status', 'Amount', 'Action'].map(h => (
                            <th key={h} className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {recentOrders.map((order) => {
                          const s = STATUS_MAP[order.payment_status] ?? STATUS_MAP.P;
                          return (
                            <tr key={order.id} className="hover:bg-muted/10 transition-colors group">
                              <td className="px-8 py-6 font-black italic">#{order.id}</td>
                              <td className="px-8 py-6 font-bold text-sm">Customer #{order.customer}</td>
                              <td className="px-8 py-6">
                                <Badge className={`${s.cls} border-none font-black text-[10px] tracking-widest uppercase`}>{s.label}</Badge>
                              </td>
                              <td className="px-8 py-6 font-black text-primary">{formatEtb(Number(order.total_price))}</td>
                              <td className="px-8 py-6 text-right">
                                <Link href="/admin/orders">
                                  <Button variant="ghost" size="icon" className="group-hover:text-primary transition-colors">
                                    <ArrowUpRight className="h-4 w-4" />
                                  </Button>
                                </Link>
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

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { href: '/admin/products', label: 'Manage Products', icon: Box },
                { href: '/admin/orders', label: 'Manage Orders', icon: ShoppingBag },
                { href: '/admin/customers', label: 'Customers', icon: Users },
                { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}>
                  <Card className="border-none shadow-sm rounded-3xl bg-white hover:shadow-md hover:border-primary/20 border-2 border-transparent transition-all cursor-pointer group">
                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                      <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="font-bold text-sm uppercase tracking-wide">{label}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </AdminShell>
      <Footer />
    </div>
  );
}
