'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminShell from '@/components/admin/AdminShell';
import { useAuth } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { AdminStats, AnalyticsData } from '@/lib/types';
import { getApiErrorMessage } from '@/lib/api-helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { BarChart3, TrendingUp, Users, ShoppingBag, Box, RefreshCw, Loader2 } from 'lucide-react';
import { formatEtb } from '@/lib/format-currency';

function MiniBarChart({ dates, values, label }: { dates: string[]; values: number[]; label: string }) {
  if (values.length === 0) return (
    <div className="flex items-center justify-center h-40 text-muted-foreground text-sm font-medium">No sales data for this period.</div>
  );
  const max = Math.max(...values, 1);
  return (
    <div className="w-full">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">{label}</p>
      <div className="flex items-end gap-1 h-40">
        {values.map((v, i) => {
          const pct = Math.max((v / max) * 100, 2);
          return (
            <div key={i} className="flex flex-col items-center flex-1 gap-1 group" title={`${dates[i]}: ${formatEtb(v)}`}>
              <div
                className="w-full bg-primary/20 group-hover:bg-primary rounded-t-sm transition-all duration-300 relative"
                style={{ height: `${pct}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block text-[9px] font-black text-primary whitespace-nowrap bg-white px-1 rounded shadow z-10">
                  {formatEtb(v)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[8px] text-muted-foreground font-medium mt-1">
        <span>{dates[0]?.slice(5) ?? ''}</span>
        <span>{dates[Math.floor(dates.length / 2)]?.slice(5) ?? ''}</span>
        <span>{dates[dates.length - 1]?.slice(5) ?? ''}</span>
      </div>
    </div>
  );
}

function HBarChart({ labels, values }: { labels: string[]; values: number[] }) {
  if (values.length === 0) return (
    <div className="flex items-center justify-center h-32 text-muted-foreground text-sm font-medium">No collection data.</div>
  );
  const max = Math.max(...values, 1);
  const colors = ['bg-primary', 'bg-blue-400', 'bg-purple-400', 'bg-emerald-400', 'bg-orange-400'];
  return (
    <div className="space-y-4">
      {labels.map((label, i) => {
        const pct = (values[i] / max) * 100;
        return (
          <div key={i}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-foreground truncate max-w-[60%]">{label}</span>
              <span className="text-xs font-black text-primary">{formatEtb(values[i])}</span>
            </div>
            <div className="w-full h-3 bg-muted/50 rounded-full overflow-hidden">
              <div
                className={`${colors[i % colors.length]} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') router.push('/');
  }, [user, router]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setAnalyticsError(false);
    try {
      const [statsRes] = await Promise.all([
        api.get('/store/admin-stats/'),
      ]);
      setStats(statsRes.data);

      // Analytics endpoint may not accept JWT (session auth) — try gracefully
      try {
        const analyticsRes = await api.get('/analytics/data/');
        setAnalytics(analyticsRes.data);
      } catch {
        setAnalyticsError(true);
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to load analytics.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') loadData();
  }, [user, loadData]);

  if (!user || user.role !== 'admin') return null;

  const statCards = stats
    ? [
        { label: 'Total Revenue', value: formatEtb(Number(stats.total_sales)), icon: TrendingUp, color: 'from-emerald-400 to-emerald-600', sub: 'All completed orders' },
        { label: 'Total Orders', value: String(stats.total_orders), icon: ShoppingBag, color: 'from-blue-400 to-blue-600', sub: 'Orders placed' },
        { label: 'Products', value: String(stats.total_products), icon: Box, color: 'from-purple-400 to-purple-600', sub: 'In catalog' },
        { label: 'Customers', value: String(stats.total_customers), icon: Users, color: 'from-orange-400 to-orange-600', sub: 'Registered users' },
      ]
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      <AdminShell
        title="Store Analytics"
        subtitle="Live performance metrics from your store"
        actions={
          <Button variant="outline" className="rounded-2xl border-2 font-bold h-12 px-6" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
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
                <Card key={stat.label} className="border-none shadow-sm rounded-[32px] overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-br ${stat.color} p-8 text-white`}>
                      <div className="flex items-center gap-3 mb-4">
                        <stat.icon className="h-6 w-6 opacity-80" />
                        <span className="text-xs font-black uppercase tracking-widest opacity-80">{stat.label}</span>
                      </div>
                      <div className="text-3xl font-black tracking-tighter">{stat.value}</div>
                      <div className="text-xs opacity-70 font-medium mt-1">{stat.sub}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Sales Chart - takes 2 cols */}
              <Card className="xl:col-span-2 border-none shadow-sm rounded-[40px] bg-white overflow-hidden">
                <CardHeader className="p-10 border-b">
                  <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Daily Sales — Last 30 Days
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10">
                  {analyticsError ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
                      <BarChart3 className="h-8 w-8 opacity-20" />
                      <p className="text-sm font-medium text-center">
                        Chart data unavailable — analytics endpoint requires session authentication.
                      </p>
                      <p className="text-xs text-center opacity-70">
                        Summary stats above are loaded from <code className="font-mono bg-muted px-1 rounded">/store/admin-stats/</code>
                      </p>
                    </div>
                  ) : analytics ? (
                    <MiniBarChart
                      dates={analytics.chart_data.dates}
                      values={analytics.chart_data.sales}
                      label="Revenue (ETB) per day"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-40">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Collection Breakdown */}
              <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden">
                <CardHeader className="p-10 border-b">
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">
                    Top Collections
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10">
                  {analyticsError ? (
                    <div className="flex items-center justify-center h-32 text-muted-foreground text-sm font-medium text-center">
                      Collection data unavailable
                    </div>
                  ) : analytics ? (
                    <HBarChart
                      labels={analytics.pie_data.labels}
                      values={analytics.pie_data.values}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Summary from analytics */}
            {analytics && !analyticsError && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm rounded-3xl bg-white">
                  <CardContent className="p-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Total Revenue (30d)</p>
                    <p className="text-3xl font-black tracking-tighter text-primary">{formatEtb(analytics.summary.total_revenue)}</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-3xl bg-white">
                  <CardContent className="p-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Total Orders (30d)</p>
                    <p className="text-3xl font-black tracking-tighter text-primary">{analytics.summary.total_orders}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </AdminShell>
      <Footer />
    </div>
  );
}
