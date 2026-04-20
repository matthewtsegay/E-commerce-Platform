'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminShell from '@/components/admin/AdminShell';
import { useAuth } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { PromoBanner } from '@/lib/types';
import { extractList, getApiErrorMessage } from '@/lib/api-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X, Loader2, Megaphone, Eye, MousePointer } from 'lucide-react';

const ZONE_LABELS: Record<string, string> = {
  hero: 'Hero', 'promotions-grid': 'Promo Grid',
  'category-banner': 'Category', 'checkout-banner': 'Checkout',
};

const ANIM_OPTIONS = ['none', 'fade', 'slide', 'scale', 'bounce'];
const ZONE_OPTIONS = ['hero', 'promotions-grid', 'category-banner', 'checkout-banner'];
const LINK_TYPE_OPTIONS = ['category', 'product', 'external'];

const EMPTY_BANNER: Partial<PromoBanner> = {
  title: '', subtitle: '', image_url: '', link: '',
  link_type: 'category', zone: 'hero', animation: 'none', active: true,
  start_date: null, end_date: null,
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-8 border-b">
          <h2 className="text-2xl font-black uppercase tracking-tighter">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}

export default function AdminBannersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<Partial<PromoBanner>>({ ...EMPTY_BANNER });

  useEffect(() => {
    if (!user || user.role !== 'admin') router.push('/');
  }, [user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/store/promotions/');
      setBanners(extractList<PromoBanner>(res.data));
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to load banners.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user?.role === 'admin') load(); }, [user, load]);

  const f = (key: keyof PromoBanner) => ({
    value: String(form[key] ?? ''),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [key]: e.target.value }));
    },
  });

  const handleSave = async () => {
    if (!form.title?.trim()) { toast.error('Title is required.'); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title!.trim(),
        subtitle: form.subtitle || '',
        image_url: form.image_url || '',
        link: form.link || '',
        link_type: form.link_type || 'category',
        zone: form.zone || 'hero',
        animation: form.animation || 'none',
        active: Boolean(form.active),
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      if ((form as PromoBanner & { id?: number }).id) {
        await api.patch(`/store/promotions/${(form as PromoBanner & { id?: number }).id}/`, payload);
        toast.success('Banner updated.');
      } else {
        await api.post('/store/promotions/', payload);
        toast.success('Banner created.');
      }
      setModal(null);
      load();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to save banner.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (banner: PromoBanner) => {
    if (!confirm(`Delete banner "${banner.title}"?`)) return;
    try {
      await api.delete(`/store/promotions/${banner.id}/`);
      toast.success('Banner deleted.');
      load();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to delete banner.'));
    }
  };

  const toggleActive = async (banner: PromoBanner) => {
    try {
      await api.patch(`/store/promotions/${banner.id}/`, { active: !banner.active });
      toast.success(`Banner ${banner.active ? 'deactivated' : 'activated'}.`);
      load();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to toggle banner.'));
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      <AdminShell
        title="Promo Banners"
        subtitle="Manage marketing banners shown across the store"
        actions={
          <Button className="rounded-2xl font-black h-12 px-6 shadow-lg"
            onClick={() => { setForm({ ...EMPTY_BANNER }); setModal('create'); }}>
            <Plus className="h-4 w-4 mr-2" /> New Banner
          </Button>
        }
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : banners.length === 0 ? (
            <Card className="col-span-2 border-none shadow-sm rounded-[40px] bg-white">
              <CardContent className="flex flex-col items-center justify-center h-48 gap-4 text-muted-foreground">
                <Megaphone className="h-12 w-12 opacity-20" />
                <p className="font-bold">No banners yet</p>
                <Button onClick={() => { setForm({ ...EMPTY_BANNER }); setModal('create'); }} className="rounded-2xl font-black h-10 px-6">
                  <Plus className="h-4 w-4 mr-2" /> Create Banner
                </Button>
              </CardContent>
            </Card>
          ) : (
            banners.map((b) => (
              <Card key={b.id} className="border-none shadow-sm rounded-3xl bg-white hover:shadow-md transition-all group overflow-hidden">
                <CardContent className="p-6">
                  {/* Preview image */}
                  {b.image_url && (
                    <div className="w-full h-32 rounded-2xl overflow-hidden mb-4 bg-muted">
                      <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className={`text-[10px] font-black tracking-widest ${b.active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                          {b.active ? '● Live' : '○ Inactive'}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-bold tracking-widest">
                          {ZONE_LABELS[b.zone] ?? b.zone}
                        </Badge>
                        {b.animation !== 'none' && (
                          <Badge variant="outline" className="text-[10px] font-bold">{b.animation}</Badge>
                        )}
                      </div>
                      <h3 className="font-black text-lg uppercase tracking-tight truncate">{b.title}</h3>
                      {b.subtitle && <p className="text-sm text-muted-foreground font-medium truncate">{b.subtitle}</p>}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button size="icon" variant="outline"
                        onClick={() => { setForm({ ...b, image_url: b.image_url || '' }); setModal('edit'); }}
                        className="rounded-xl border-2 h-9 w-9">
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => handleDelete(b)}
                        className="rounded-xl border-2 h-9 w-9 hover:border-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{b.impressions} views</span>
                    <span className="flex items-center gap-1"><MousePointer className="h-3 w-3" />{b.clicks} clicks</span>
                    <button onClick={() => toggleActive(b)}
                      className="ml-auto text-xs font-black uppercase tracking-widest text-primary hover:underline">
                      {b.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </AdminShell>
      <Footer />

      {modal && (
        <Modal title={modal === 'create' ? 'New Banner' : 'Edit Banner'} onClose={() => setModal(null)}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 space-y-2">
                <Label className="font-bold uppercase text-xs tracking-widest text-primary">Title *</Label>
                <Input {...f('title')} placeholder="Banner headline" className="h-12 border-2" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="font-bold uppercase text-xs tracking-widest text-primary">Subtitle</Label>
                <Input {...f('subtitle')} placeholder="Optional sub-text" className="h-12 border-2" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="font-bold uppercase text-xs tracking-widest text-primary">Image URL</Label>
                <Input {...f('image_url')} placeholder="https://..." className="h-12 border-2" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase text-xs tracking-widest text-primary">Zone</Label>
                <select {...f('zone')} className="w-full border-2 rounded-xl h-12 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary">
                  {ZONE_OPTIONS.map(z => <option key={z} value={z}>{ZONE_LABELS[z] ?? z}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase text-xs tracking-widest text-primary">Animation</Label>
                <select {...f('animation')} className="w-full border-2 rounded-xl h-12 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary">
                  {ANIM_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase text-xs tracking-widest text-primary">Link Type</Label>
                <select {...f('link_type')} className="w-full border-2 rounded-xl h-12 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary">
                  {LINK_TYPE_OPTIONS.map(lt => <option key={lt} value={lt}>{lt}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase text-xs tracking-widest text-primary">Link / URL</Label>
                <Input {...f('link')} placeholder="/products or https://..." className="h-12 border-2" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase text-xs tracking-widest text-primary">Start Date</Label>
                <Input {...f('start_date')} type="datetime-local" className="h-12 border-2" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase text-xs tracking-widest text-primary">End Date</Label>
                <Input {...f('end_date')} type="datetime-local" className="h-12 border-2" />
              </div>
              <div className="md:col-span-2 flex items-center gap-3">
                <input type="checkbox" id="banner_active" checked={Boolean(form.active)}
                  onChange={(e) => setForm(p => ({ ...p, active: e.target.checked }))}
                  className="h-4 w-4 accent-primary" />
                <Label htmlFor="banner_active" className="font-bold uppercase text-xs tracking-widest text-primary cursor-pointer">Active (visible on site)</Label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setModal(null)} className="h-12 rounded-2xl border-2 font-bold px-8">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="h-12 rounded-2xl font-black px-8 shadow-lg">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {modal === 'create' ? 'Create Banner' : 'Update Banner'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
