import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Lesson, Subject } from '../../types/index.ts';
import { Plus, Edit2, Trash2, X, Search, FileCode, PlayCircle, FileText, Layers } from 'lucide-react';

interface LessonManagementProps {
  initialOpenModal?: boolean;
}

export const LessonManagement: React.FC<LessonManagementProps> = ({ initialOpenModal }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(initialOpenModal || false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Form states
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formTitleKh, setFormTitleKh] = useState('');
  const [formDuration, setFormDuration] = useState('25 mins');
  const [formNumber, setFormNumber] = useState(1);
  const [formDesc, setFormDesc] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formPdfTitle, setFormPdfTitle] = useState('');
  const [formPdfUrl, setFormPdfUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getSubjects(),
      // Fetch all lessons from all subjects
      api.getSubjects().then(res => {
        if (!res.success) return [];
        return Promise.all(
          res.data.map(s => api.getSubjectBySlug(s.slug).then(r => r.data?.lessons || []))
        ).then(nested => nested.flat());
      })
    ]).then(([subRes, lessonList]) => {
      if (subRes.success) setSubjects(subRes.data);
      // Fetch full lesson list or use lessons returned
      setLessons(lessonList as any);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingLesson(null);
    setFormSubjectId(subjects[0]?.id || '');
    setFormTitle('');
    setFormTitleKh('');
    setFormDuration('20 mins');
    setFormNumber(lessons.length + 1);
    setFormDesc('');
    setFormContent('## Overview\n\nExplain lesson concept here with code examples.');
    setFormVideoUrl('https://www.youtube.com/embed/_uQrJ0TkZlc');
    setFormPdfTitle('Lesson_Lecture_Notes.pdf');
    setFormPdfUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    setModalOpen(true);
  };

  const openEditModal = (l: Lesson) => {
    setEditingLesson(l);
    setFormSubjectId(l.subjectId);
    setFormTitle(l.title);
    setFormTitleKh(l.titleKh || l.title);
    setFormDuration(l.duration || '20 mins');
    setFormNumber(l.lessonNumber);
    setFormDesc(l.description);
    setFormContent(l.content);
    setFormVideoUrl(l.videoUrl || '');
    setFormPdfTitle(l.pdfTitle || '');
    setFormPdfUrl(l.pdfUrl || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formSubjectId) return;
    setSaving(true);

    const payload = {
      subjectId: formSubjectId,
      title: formTitle,
      titleKh: formTitleKh,
      duration: formDuration,
      lessonNumber: Number(formNumber),
      description: formDesc,
      content: formContent,
      videoUrl: formVideoUrl,
      videoType: 'youtube' as const,
      pdfTitle: formPdfTitle,
      pdfUrl: formPdfUrl
    };

    try {
      if (editingLesson) {
        await api.updateLesson(editingLesson.id, payload);
      } else {
        await api.createLesson(payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete lesson "${title}"?`)) {
      try {
        await api.deleteLesson(id);
        loadData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const filteredLessons = lessons.filter(l =>
    selectedSubjectFilter === 'all' || l.subjectId === selectedSubjectFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="all">All Subjects ({lessons.length} lessons)</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Lesson</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
            <tr>
              <th className="py-3 px-4 font-semibold">#</th>
              <th className="py-3 px-4 font-semibold">Lesson Title</th>
              <th className="py-3 px-4 font-semibold">Duration</th>
              <th className="py-3 px-4 font-semibold">Media Support</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredLessons.map((l, i) => (
              <tr key={l.id || i} className="hover:bg-slate-850/50">
                <td className="py-3 px-4 font-mono text-slate-500 tabular-nums">
                  {(l.lessonNumber || i + 1).toString().padStart(2, '0')}
                </td>
                <td className="py-3 px-4">
                  <p className="font-semibold text-white">{l.title}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{l.description}</p>
                </td>
                <td className="py-3 px-4 font-mono text-slate-300">
                  {l.duration || '20 mins'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {l.videoUrl && <span title="Video included"><PlayCircle className="h-3.5 w-3.5 text-sky-400" /></span>}
                    {l.pdfUrl && <span title="PDF Document attached"><FileText className="h-3.5 w-3.5 text-amber-400" /></span>}
                    <span title="Code snippets"><FileCode className="h-3.5 w-3.5 text-emerald-400" /></span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(l)}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(l.id, l.title)}
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
            className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-300 font-medium">Belongs to Subject</label>
                  <select
                    value={formSubjectId}
                    onChange={e => setFormSubjectId(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Lesson Order #</label>
                  <input
                    type="number"
                    value={formNumber}
                    onChange={e => setFormNumber(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Lesson Title (English)</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="Lesson 01 — Introduction"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Lesson Title (Khmer)</label>
                  <input
                    type="text"
                    value={formTitleKh}
                    onChange={e => setFormTitleKh(e.target.value)}
                    placeholder="មេរៀនទី ០១ — សេចក្តីផ្តើម"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Estimated Duration</label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={e => setFormDuration(e.target.value)}
                    placeholder="e.g. 30 mins"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Video URL (YouTube embed or MP4)</label>
                  <input
                    type="text"
                    value={formVideoUrl}
                    onChange={e => setFormVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Short Summary</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Concise lesson goal..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Detailed Lesson Content (Markdown)</label>
                <textarea
                  rows={6}
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-white focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">PDF Document Title</label>
                  <input
                    type="text"
                    value={formPdfTitle}
                    onChange={e => setFormPdfTitle(e.target.value)}
                    placeholder="Lesson_Notes.pdf"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">PDF Document URL</label>
                  <input
                    type="text"
                    value={formPdfUrl}
                    onChange={e => setFormPdfUrl(e.target.value)}
                    placeholder="https://.../notes.pdf"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
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
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-500"
                >
                  {saving ? 'Saving...' : 'Save Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
