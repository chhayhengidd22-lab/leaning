import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Category } from '../../types/index.ts';
import { Plus, Edit2, Trash2, X, Search, Layers } from 'lucide-react';

export const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formName, setFormName] = useState('');
  const [formNameKh, setFormNameKh] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState('Code');
  const [formColor, setFormColor] = useState('#38bdf8');
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    setLoading(true);
    api.getCategories()
      .then(res => {
        if (res.success) setCategories(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormNameKh('');
    setFormDesc('');
    setFormIcon('Code');
    setFormColor('#38bdf8');
    setModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingCategory(c);
    setFormName(c.name);
    setFormNameKh(c.nameKh || c.name);
    setFormDesc(c.description);
    setFormIcon(c.icon);
    setFormColor(c.color);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;
    setSaving(true);

    const payload = {
      name: formName,
      nameKh: formNameKh,
      description: formDesc,
      icon: formIcon,
      color: formColor
    };

    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, payload);
      } else {
        await api.createCategory(payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error saving category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete category "${name}"?`)) {
      try {
        await api.deleteCategory(id);
        loadData();
      } catch (err: any) {
        alert(err.message || 'Error deleting');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Learning Categories</h2>
          <p className="text-xs text-slate-400">Manage IT skill pathways and curriculum tracks.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
            <tr>
              <th className="py-3 px-4 font-semibold">Category Name</th>
              <th className="py-3 px-4 font-semibold">Khmer Translation</th>
              <th className="py-3 px-4 font-semibold">Icon</th>
              <th className="py-3 px-4 font-semibold">Subjects</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-slate-850/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-semibold text-white">{cat.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {cat.nameKh || '—'}
                </td>
                <td className="py-3 px-4 font-mono text-slate-400">
                  {cat.icon}
                </td>
                <td className="py-3 px-4 font-mono tabular-nums text-slate-300">
                  {cat.subjectsCount || 0} subjects
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-rose-400 hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Category Name (English)</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Mobile App Development"
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Category Name (Khmer)</label>
                <input
                  type="text"
                  value={formNameKh}
                  onChange={e => setFormNameKh(e.target.value)}
                  placeholder="e.g. ការអភិវឌ្ឍន៍កម្មវិធីទូរស័ព្ទ"
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Description</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Short explanation..."
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Lucide Icon</label>
                  <select
                    value={formIcon}
                    onChange={e => setFormIcon(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Code">Code</option>
                    <option value="Globe">Globe</option>
                    <option value="Database">Database</option>
                    <option value="ShieldCheck">ShieldCheck</option>
                    <option value="Terminal">Terminal</option>
                    <option value="Cpu">Cpu</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Accent Color</label>
                  <input
                    type="color"
                    value={formColor}
                    onChange={e => setFormColor(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-slate-800 bg-slate-950 cursor-pointer p-1"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-white font-semibold hover:bg-indigo-500"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
