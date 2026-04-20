'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminShell from '@/components/admin/AdminShell';
import { useAuth } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { MembershipPlan } from '@/lib/types';
import { extractList, getApiErrorMessage } from '@/lib/api-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X, Loader2, Crown } from 'lucide-react';
import { formatEtb } from '@/lib/format-currency';

const LEVEL_STYLE: Record<string, { cls: string; icon: string }> = {
  bronze: { cls: 'bg-amber-100 text-amber-800 border-amber-200', icon: '🥉' },
  silver: { cls: 'bg-slate-100 text-slate-700 border-slate-300', icon: '🥈' },
  gold: { cls: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '🥇' },
};

const EMPTY: Partial<MembershipPlan> = {
  level: 'bronze', name: '', discount_percent: 0,
  perks_description: '', price: null, is_active: true,
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-8 border-b">
          <h2 className="text-2xl font-black uppercase tracking-tighter">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}

export default function AdminMembershipsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<Partial<MembershipPlan>>({ ...EMPTY });

  useEffect(() => {
    if (!user || user.role !== 'admin') router.push('/');
  }, [user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/store/memberships/');
      setPlans(extractList<MembershipPlan>(res.data));
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to load membership plans.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user?.role === 'admin') load(); }, [user, load]);

  const handleSave = async () => {
    if (!form.name?.trim()) { toast.error('Name is required.'); return; }
    setSaving(true);
    try {
      const payload = {
        level: form.level,
        name: form.name!.trim(),
        discount_percent: Number(form.discount_percent ?? 0),
        perks_description: form.perks_description || '',
        price: form.price != null ? Number(form.price) : null,
        is_active: Boolean(form.is_active),
      };
      if (form.id) {
        await api.patch(`/store/memberships/${form.id}/`, payload);
        toast.success('Plan updated.');
      } else {
        await api.post('/store/memberships/', payload);
        toast.success('Plan created.');
      }
      setModal(null);
      load();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to save plan.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan: MembershipPlan) => {
    if (!confirm(`Delete "${plan.name}"?`)) return;
    try {
      await api.delete(`/store/memberships/${plan.id}/`);
      toast.success('Plan deleted.');
      load();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to delete plan.'));
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      <AdminShell
        title="Membership Plans"
        subtitle="Configure Bronze, Silver and Gold membership tiers"
        actions={
          <Button className="rounded-2xl font-black h-12 px-6 shadow-lg"
            onClick={() => { setForm({ ...EMPTY }); setModal('create'); }}>
            <Plus className="h-4 w-4 mr-2" /> New Plan
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : plans.length === 0 ? (
            <Card className="col-span-3 border-none shadow-sm rounded-[40px] bg-white">
              <CardContent className="flex flex-col items-center justify-center h-48 gap-4 text-muted-foreground">
                <Crown className="h-12 w-12 opacity-20" />
                <p className="font-bold">No membership plans yet</p>
                <Button onClick={() => { setForm({ ...EMPTY }); setModal('create'); }} className="rounded-2xl font-black h-10 px-6">
                  <Plus className="h-4 w-4 mr-2" /> Create First Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            plans.map((plan) => {
              const style = LEVEL_STYLE[plan.level] ?? LEVEL_STYLE.bronze;
              return (
                <Card key={plan.id} className="border-none shadow-sm rounded-3xl bg-white hover:shadow-md transition-all group overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className={`border font-black text-xs tracking-widest ${style.cls}`}>
                        {style.icon} {plan.level.toUpperCase()}
                      </Badge>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="outline"
                          onClick={() => { setForm({ ...plan }); setModal('edit'); }}
                          className="rounded-xl border-2 h-9 w-9">
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => handleDelete(plan)}
                          className="rounded-xl border-2 h-9 w-9 hover:border-destructive hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-2">{plan.name}</h3>
                    <div className="space-y-2 text-sm font-medium text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <span className="font-bold text-primary">{plan.discount_percent}% discount</span>
                      </p>
                      {plan.price != null && (
                        <p>Price: <span className="font-bold text-foreground">{formatEtb(Number(plan.price))}</span></p>
                      )}
                      {plan.perks_description && (
                        <p className="text-xs leading-relaxed">{plan.perks_description}</p>
                      )}
                    </div>
                    <div className="mt-4">
                      <Badge className={plan.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </AdminShell>
      <Footer />

      {modal && (
        <Modal title={modal === 'create' ? 'New Membership Plan' : 'Edit Plan'} onClose={() => setModal(null)}>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="font-bold uppercase text-xs tracking-widest text-primary">Level</Label>
              <select
                value={form.level}
                onChange={(e) => setForm(prev => ({ ...prev, level: e.target.value as MembershipPlan['level'] }))}
                className="w-full border-2 rounded-xl h-12 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="bronze">🥉 Bronze</option>
                <option value="silver">🥈 Silver</option>
                <option value="gold">🥇 Gold</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="font-bold uppercase text-xs tracking-widest text-primary">Plan Name *</Label>
              <Input value={form.name ?? ''} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Gold Member" className="h-12 border-2" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold uppercase text-xs tracking-widest text-primary">Discount (%)</Label>
              <Input type="number" min="0" max="100" value={form.discount_percent ?? 0}
                onChange={(e) => setForm(p => ({ ...p, discount_percent: Number(e.target.value) }))}
                className="h-12 border-2" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold uppercase text-xs tracking-widest text-primary">Price (ETB)</Label>
              <Input type="number" min="0" value={form.price ?? ''}
                onChange={(e) => setForm(p => ({ ...p, price: e.target.value ? Number(e.target.value) : null }))}
                className="h-12 border-2" placeholder="Optional subscription price" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold uppercase text-xs tracking-widest text-primary">Perks Description</Label>
              <textarea
                value={form.perks_description ?? ''}
                onChange={(e) => setForm(p => ({ ...p, perks_description: e.target.value }))}
                rows={3}
                placeholder="List the benefits of this tier..."
                className="w-full border-2 rounded-xl p-3 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="plan_active" checked={Boolean(form.is_active)}
                onChange={(e) => setForm(p => ({ ...p, is_active: e.target.checked }))}
                className="h-4 w-4 accent-primary" />
              <Label htmlFor="plan_active" className="font-bold uppercase text-xs tracking-widest text-primary cursor-pointer">Active</Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setModal(null)} className="h-12 rounded-2xl border-2 font-bold px-8">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="h-12 rounded-2xl font-black px-8 shadow-lg">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {modal === 'create' ? 'Create Plan' : 'Update Plan'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
