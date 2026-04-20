'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminShell from '@/components/admin/AdminShell';
import { useAuth } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { PaymentMethodConfig } from '@/lib/types';
import { extractList, getApiErrorMessage } from '@/lib/api-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Pencil, X, Loader2, CreditCard, Clock } from 'lucide-react';

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

export default function AdminPaymentMethodsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<PaymentMethodConfig | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') router.push('/');
  }, [user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/store/payment-methods/');
      setMethods(extractList<PaymentMethodConfig>(res.data));
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to load payment methods.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user?.role === 'admin') load(); }, [user, load]);

  const toggleEnabled = async (m: PaymentMethodConfig) => {
    try {
      await api.patch(`/store/payment-methods/${m.id}/`, { enabled: !m.enabled });
      toast.success(`${m.display_name} ${m.enabled ? 'disabled' : 'enabled'}.`);
      load();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to update.'));
    }
  };

  const toggleComingSoon = async (m: PaymentMethodConfig) => {
    try {
      await api.patch(`/store/payment-methods/${m.id}/`, { coming_soon: !m.coming_soon });
      toast.success(`Coming soon ${m.coming_soon ? 'removed' : 'set'} for ${m.display_name}.`);
      load();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to update.'));
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await api.patch(`/store/payment-methods/${editing.id}/`, {
        display_name: editing.display_name,
        description: editing.description,
        enabled: editing.enabled,
        coming_soon: editing.coming_soon,
        eta: editing.eta,
        icon: editing.icon,
      });
      toast.success(`${editing.display_name} updated.`);
      setEditing(null);
      load();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to save.'));
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      <AdminShell
        title="Payment Methods"
        subtitle="Configure available payment options for checkout"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : methods.length === 0 ? (
            <Card className="col-span-3 border-none shadow-sm rounded-[40px] bg-white">
              <CardContent className="flex flex-col items-center justify-center h-48 gap-4 text-muted-foreground">
                <CreditCard className="h-12 w-12 opacity-20" />
                <p className="font-bold">No payment methods configured</p>
              </CardContent>
            </Card>
          ) : (
            methods.map((m) => (
              <Card key={m.id} className="border-none shadow-sm rounded-3xl bg-white hover:shadow-md transition-all group overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {m.icon ? (
                        <span className="text-3xl">{m.icon}</span>
                      ) : (
                        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>
                    <Button size="icon" variant="outline"
                      onClick={() => setEditing({ ...m })}
                      className="rounded-xl border-2 h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                  <h3 className="font-black text-lg uppercase tracking-tight">{m.display_name}</h3>
                  <p className="text-xs text-muted-foreground font-medium mt-1">{m.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge className={m.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}>
                      {m.enabled ? '✓ Enabled' : '✗ Disabled'}
                    </Badge>
                    {m.coming_soon && (
                      <Badge className="bg-blue-100 text-blue-700">
                        <Clock className="h-3 w-3 mr-1" />
                        Coming Soon {m.eta && `(${m.eta})`}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-3 mt-5 pt-4 border-t">
                    <button
                      onClick={() => toggleEnabled(m)}
                      className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border-2 transition-all ${
                        m.enabled ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {m.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => toggleComingSoon(m)}
                      className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border-2 border-blue-200 text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      {m.coming_soon ? 'Remove Soon' : 'Set Soon'}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </AdminShell>
      <Footer />

      {editing && (
        <Modal title="Edit Payment Method" onClose={() => setEditing(null)}>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="font-bold uppercase text-xs tracking-widest text-primary">Display Name</Label>
              <Input value={editing.display_name}
                onChange={(e) => setEditing(prev => prev ? { ...prev, display_name: e.target.value } : null)}
                className="h-12 border-2" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold uppercase text-xs tracking-widest text-primary">Description</Label>
              <textarea
                value={editing.description}
                onChange={(e) => setEditing(prev => prev ? { ...prev, description: e.target.value } : null)}
                rows={3}
                className="w-full border-2 rounded-xl p-3 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold uppercase text-xs tracking-widest text-primary">Icon (emoji or URL)</Label>
              <Input value={editing.icon}
                onChange={(e) => setEditing(prev => prev ? { ...prev, icon: e.target.value } : null)}
                placeholder="💳 or https://..." className="h-12 border-2" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold uppercase text-xs tracking-widest text-primary">ETA (if coming soon)</Label>
              <Input value={editing.eta}
                onChange={(e) => setEditing(prev => prev ? { ...prev, eta: e.target.value } : null)}
                placeholder="e.g. Q3 2025" className="h-12 border-2" />
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="pm_enabled" checked={editing.enabled}
                  onChange={(e) => setEditing(prev => prev ? { ...prev, enabled: e.target.checked } : null)}
                  className="h-4 w-4 accent-primary" />
                <Label htmlFor="pm_enabled" className="font-bold text-xs uppercase tracking-widest text-primary cursor-pointer">Enabled</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="pm_soon" checked={editing.coming_soon}
                  onChange={(e) => setEditing(prev => prev ? { ...prev, coming_soon: e.target.checked } : null)}
                  className="h-4 w-4 accent-primary" />
                <Label htmlFor="pm_soon" className="font-bold text-xs uppercase tracking-widest text-primary cursor-pointer">Coming Soon</Label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditing(null)} className="h-12 rounded-2xl border-2 font-bold px-8">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="h-12 rounded-2xl font-black px-8 shadow-lg">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
