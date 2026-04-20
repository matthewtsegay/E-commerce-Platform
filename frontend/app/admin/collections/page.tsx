'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminShell from '@/components/admin/AdminShell';
import { useAuth } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Collection } from '@/lib/types';
import { extractList, getApiErrorMessage } from '@/lib/api-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X, Loader2, Tag, Package } from 'lucide-react';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-8 border-b">
          <h2 className="text-2xl font-black uppercase tracking-tighter">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}

export default function AdminCollectionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<{ id?: number; title: string } | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') router.push('/');
  }, [user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/store/collections/');
      setCollections(extractList<Collection>(res.data));
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to load collections.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user?.role === 'admin') load(); }, [user, load]);

  const handleSave = async () => {
    if (!editing?.title?.trim()) { toast.error('Title is required.'); return; }
    setSaving(true);
    try {
      if (editing.id) {
        await api.patch(`/store/collections/${editing.id}/`, { title: editing.title.trim() });
        toast.success('Collection updated.');
      } else {
        await api.post('/store/collections/', { title: editing.title.trim() });
        toast.success('Collection created.');
      }
      setModal(null);
      load();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to save collection.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Collection) => {
    if (c.products_count > 0) {
      toast.error(`Cannot delete "${c.title}" — it has ${c.products_count} product(s).`);
      return;
    }
    if (!confirm(`Delete "${c.title}"?`)) return;
    try {
      await api.delete(`/store/collections/${c.id}/`);
      toast.success('Collection deleted.');
      load();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to delete collection.'));
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      <AdminShell
        title="Manage Collections"
        subtitle={`${collections.length} collection${collections.length !== 1 ? 's' : ''}`}
        actions={
          <Button className="rounded-2xl font-black h-12 px-6 shadow-lg"
            onClick={() => { setEditing({ title: '' }); setModal('create'); }}>
            <Plus className="h-4 w-4 mr-2" /> New Collection
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : collections.length === 0 ? (
            <Card className="col-span-3 border-none shadow-sm rounded-[40px] bg-white">
              <CardContent className="flex flex-col items-center justify-center h-48 gap-4 text-muted-foreground">
                <Tag className="h-12 w-12 opacity-20" />
                <p className="font-bold">No collections yet</p>
                <Button onClick={() => { setEditing({ title: '' }); setModal('create'); }} className="rounded-2xl font-black h-10 px-6">
                  <Plus className="h-4 w-4 mr-2" /> Create First Collection
                </Button>
              </CardContent>
            </Card>
          ) : (
            collections.map((c) => (
              <Card key={c.id} className="border-none shadow-sm rounded-3xl bg-white hover:shadow-md transition-all group overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Tag className="h-6 w-6" />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="outline" onClick={() => { setEditing({ id: c.id, title: c.title }); setModal('edit'); }}
                        className="rounded-xl border-2 h-9 w-9">
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => handleDelete(c)}
                        className="rounded-xl border-2 h-9 w-9 hover:border-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-1">{c.title}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span className="text-sm font-bold">{c.products_count} product{c.products_count !== 1 ? 's' : ''}</span>
                  </div>
                  {c.products_count > 0 && (
                    <p className="text-xs text-amber-600 font-semibold mt-3 bg-amber-50 rounded-xl px-3 py-1 inline-block">
                      Cannot delete — has products
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </AdminShell>
      <Footer />

      {modal && (
        <Modal title={modal === 'create' ? 'New Collection' : 'Edit Collection'} onClose={() => setModal(null)}>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="font-bold uppercase text-xs tracking-widest text-primary">Collection Title *</Label>
              <Input
                value={editing?.title ?? ''}
                onChange={(e) => setEditing(prev => prev ? { ...prev, title: e.target.value } : null)}
                placeholder="e.g. Streetwear"
                className="h-12 border-2"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setModal(null)} className="h-12 rounded-2xl border-2 font-bold px-8">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="h-12 rounded-2xl font-black px-8 shadow-lg">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {modal === 'create' ? 'Create' : 'Update'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
