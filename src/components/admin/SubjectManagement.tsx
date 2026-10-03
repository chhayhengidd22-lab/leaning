import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Subject, Category, SubjectLevel } from '../../types/index.ts';
import { useTheme } from '../../context/ThemeContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Plus, Edit2, Trash2, Search, X, BookOpen, GraduationCap, Phone, MapPin, Layers } from 'lucide-react';

interface SubjectManagementProps {
  initialOpenModal?: boolean;
}

export const SubjectManagement: React.FC<SubjectManagementProps> = ({ initialOpenModal }) => {
  const { isLight, isAmber } = useTheme();
  const { language } = useLanguage();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal form state
  const [modalOpen, setModalOpen] = useState(initialOpenModal || false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [formName, setFormName] = useState('');
  const [formNameKh, setFormNameKh] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formLevel, setFormLevel] = useState<SubjectLevel>('Beginner');
  const [formAcademicYear, setFormAcademicYear] = useState('Year 1');
  const [formSemester, setFormSemester] = useState('Semester 2');
  const [formCredits, setFormCredits] = useState(3);
  const [formLecturerName, setFormLecturerName] = useState('');
  const [formLecturerTel, setFormLecturerTel] = useState('');
  const [formRoom, setFormRoom] = useState('Room: 204 Building A');
  const [formCoverImage, setFormCoverImage] = useState('/src/assets/images/subject_python_code_1790863262336.jpg');
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getSubjects(),
      api.getCategories()
    ]).then(([subRes, catRes]) => {
      if (subRes.success) setSubjects(subRes.data);
      if (catRes.success) setCategories(catRes.data);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingSubject(null);
    setFormName('');
    setFormNameKh('');
    setFormSlug('');
    setFormDesc('');
    setFormShortDesc('');
    setFormCategoryId(categories[0]?.id || 'cat-y1-s2');
    setFormLevel('Beginner');
    setFormAcademicYear('Year 1');
    setFormSemester('Semester 2');
    setFormCredits(3);
    setFormLecturerName('');
    setFormLecturerTel('');
    setFormRoom('Room: 204 Building A');
    setFormCoverImage('/src/assets/images/subject_python_code_1790863262336.jpg');
    setFormIsPublished(true);
    setFormIsFeatured(false);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (s: Subject) => {
    setEditingSubject(s);
    setFormName(s.name);
    setFormNameKh(s.nameKh || s.name);
    setFormSlug(s.slug);
    setFormDesc(s.description);
    setFormShortDesc(s.shortDescription);
    setFormCategoryId(s.categoryId);
    setFormLevel(s.level);
    setFormAcademicYear(s.academicYear || 'Year 1');
    setFormSemester(s.semester || 'Semester 1');
    setFormCredits(s.credits || 3);
    setFormLecturerName(s.lecturerName || '');
    setFormLecturerTel(s.lecturerTel || '');
    setFormRoom(s.room || 'Room: 204 Building A');
    setFormCoverImage(s.coverImage);
    setFormIsPublished(s.isPublished);
    setFormIsFeatured(s.isFeatured);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCategoryId) {
      setError('Name and Category are required.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      name: formName,
      nameKh: formNameKh,
      slug: formSlug || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: formDesc,
      shortDescription: formShortDesc,
      categoryId: formCategoryId,
      level: formLevel,
      academicYear: formAcademicYear,
      semester: formSemester,
      credits: Number(formCredits) || 3,
      lecturerName: formLecturerName,
      lecturerTel: formLecturerTel,
      room: formRoom,
      coverImage: formCoverImage,
      isPublished: formIsPublished,
      isFeatured: formIsFeatured
    };

    try {
      if (editingSubject) {
        await api.updateSubject(editingSubject.id, payload);
      } else {
        await api.createSubject(payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save subject');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete subject "${name}"?`)) {
      try {
        await api.deleteSubject(id);
        loadData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.nameKh && s.nameKh.toLowerCase().includes(search.toLowerCase())) ||
    (s.categoryName && s.categoryName.toLowerCase().includes(search.toLowerCase())) ||
    (s.lecturerName && s.lecturerName.toLowerCase().includes(search.toLowerCase()))
  );

  // Theme-aware styles
  const cardBgClass = isLight 
    ? 'bg-white border-slate-200 shadow-sm' 
    : isAmber 
    ? 'bg-amber-950/20 border-amber-500/20' 
    : 'bg-slate-900/60 border-slate-800';

  const tableHeaderClass = isLight 
    ? 'bg-slate-100 text-slate-700 border-slate-200' 
    : isAmber 
    ? 'bg-amber-950/40 text-amber-200 border-amber-500/20' 
    : 'bg-slate-950/60 text-slate-400 border-slate-800';

  const tableRowHoverClass = isLight
    ? 'hover:bg-slate-50 border-slate-200'
    : isAmber
    ? 'hover:bg-amber-950/30 border-amber-500/10'
    : 'hover:bg-slate-850/50 border-slate-800/60';

  const inputClass = isLight
    ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
    : isAmber
    ? 'bg-slate-950 border-amber-500/30 text-amber-100 placeholder-amber-500/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
    : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500';

  const labelClass = isLight ? 'text-slate-800 font-semibold' : isAmber ? 'text-amber-200 font-semibold' : 'text-slate-300 font-medium';

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'kh' ? 'ស្វែងរកមុខវិជ្ជា ឬសាស្ត្រាចារ្យ...' : 'Search subjects or lecturer...'}
            className={`w-full rounded-xl border pl-9 pr-4 py-2 text-xs transition-colors ${inputClass}`}
          />
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all whitespace-nowrap active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>{language === 'kh' ? '+ បញ្ចូលមុខវិជ្ជាថ្មី' : '+ Add New Subject'}</span>
        </button>
      </div>

      {/* Table Container */}
      <div className={`rounded-2xl border overflow-hidden transition-colors ${cardBgClass}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b ${tableHeaderClass}`}>
              <tr>
                <th className="py-3.5 px-4 font-bold">{language === 'kh' ? 'មុខវិជ្ជា' : 'Subject'}</th>
                <th className="py-3.5 px-4 font-bold">{language === 'kh' ? 'ឆមាស/ជំនាន់' : 'Category / Semester'}</th>
                <th className="py-3.5 px-4 font-bold">{language === 'kh' ? 'សាស្ត្រាចារ្យ & បន្ទប់' : 'Lecturer & Room'}</th>
                <th className="py-3.5 px-4 font-bold">{language === 'kh' ? 'មេរៀន' : 'Lessons'}</th>
                <th className="py-3.5 px-4 font-bold">{language === 'kh' ? 'ស្ថានភាព' : 'Status'}</th>
                <th className="py-3.5 px-4 font-bold text-right">{language === 'kh' ? 'សកម្មភាព' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading subjects...
                  </td>
                </tr>
              ) : filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No subjects found.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map(s => (
                  <tr key={s.id} className={`transition-colors ${tableRowHoverClass}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 rounded-lg overflow-hidden border border-slate-700/50 bg-slate-950 shrink-0 shadow-sm">
                          <img
                            src={s.coverImage}
                            alt={s.name}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p className={`font-bold line-clamp-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {language === 'kh' && s.nameKh ? s.nameKh : s.name}
                          </p>
                          <p className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {s.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={`py-3 px-4 font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      <div className="flex items-center gap-1.5">
                        <Layers className="h-3 w-3 text-indigo-500 shrink-0" />
                        <span>{s.categoryName || s.semester || 'General'}</span>
                      </div>
                      <span className={`text-[10px] inline-block mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {s.credits || 3} Credits · {s.level}
                      </span>
                    </td>
                    <td className={`py-3 px-4 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      <p className="font-semibold text-xs">{s.lecturerName || '—'}</p>
                      {s.lecturerTel && (
                        <p className={`text-[11px] flex items-center gap-1 mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          <Phone className="h-2.5 w-2.5" />
                          <span>{s.lecturerTel}</span>
                        </p>
                      )}
                      {s.room && (
                        <p className={`text-[10px] flex items-center gap-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                          <MapPin className="h-2.5 w-2.5" />
                          <span>{s.room}</span>
                        </p>
                      )}
                    </td>
                    <td className={`py-3 px-4 font-mono tabular-nums ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      <span className="font-bold text-indigo-500">{s.lessonsCount || 0}</span> lessons
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 font-bold ${
                        s.isPublished 
                          ? (isLight ? 'text-emerald-700' : 'text-emerald-400') 
                          : 'text-slate-400'
                      }`}>
                        <span className={`h-2 w-2 rounded-full ${s.isPublished ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {s.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(s)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isLight
                              ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
                              : 'border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                          title="Edit Subject"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isLight
                              ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'border-slate-800 bg-slate-900 text-rose-400 hover:bg-rose-950/40 hover:border-rose-800'
                          }`}
                          title="Delete Subject"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-2xl rounded-2xl border p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto ${
              isLight ? 'bg-white border-slate-200' : isAmber ? 'bg-slate-900 border-amber-500/30' : 'bg-slate-900 border-slate-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600 text-white">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {editingSubject 
                      ? (language === 'kh' ? 'កែប្រែព័ត៌មានមុខវិជ្ជា IT' : 'Edit IT Subject')
                      : (language === 'kh' ? 'បញ្ចូលមុខវិជ្ជា IT ថ្មី' : 'Add New IT Subject')
                    }
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Build Bright University (BBU) Curriculum Management
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className={`p-1.5 rounded-lg hover:bg-slate-200/50 ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>
                    {language === 'kh' ? 'ឈ្មោះមុខវិជ្ជា (ភាសាអង់គ្លេស)' : 'Subject Name (English)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Python Programming"
                    className={`w-full rounded-xl border px-3.5 py-2.5 font-medium ${inputClass}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    {language === 'kh' ? 'ឈ្មោះមុខវិជ្ជា (ភាសាខ្មែរ)' : 'Subject Name (Khmer)'}
                  </label>
                  <input
                    type="text"
                    value={formNameKh}
                    onChange={(e) => setFormNameKh(e.target.value)}
                    placeholder="ឧ. ការសរសេរកូដ Python"
                    className={`w-full rounded-xl border px-3.5 py-2.5 font-medium ${inputClass}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Category / Semester *</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 font-medium ${inputClass}`}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Academic Year</label>
                  <select
                    value={formAcademicYear}
                    onChange={(e) => setFormAcademicYear(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 font-medium ${inputClass}`}
                  >
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Semester</label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 font-medium ${inputClass}`}
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>
                    {language === 'kh' ? 'ឈ្មោះសាស្ត្រាចារ្យ' : 'Lecturer Name'}
                  </label>
                  <input
                    type="text"
                    value={formLecturerName}
                    onChange={(e) => setFormLecturerName(e.target.value)}
                    placeholder="e.g. Mr. Rin Tino"
                    className={`w-full rounded-xl border px-3.5 py-2.5 font-medium ${inputClass}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    {language === 'kh' ? 'លេខទូរស័ព្ទសាស្ត្រាចារ្យ' : 'Lecturer Tel'}
                  </label>
                  <input
                    type="text"
                    value={formLecturerTel}
                    onChange={(e) => setFormLecturerTel(e.target.value)}
                    placeholder="012 345 678"
                    className={`w-full rounded-xl border px-3.5 py-2.5 font-medium ${inputClass}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    {language === 'kh' ? 'បន្ទប់រៀន / អាគារ' : 'Room / Building'}
                  </label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    placeholder="Room: 204 Building A"
                    className={`w-full rounded-xl border px-3.5 py-2.5 font-medium ${inputClass}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Target Level</label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as SubjectLevel)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 font-medium ${inputClass}`}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Beginner → Advanced">Beginner → Advanced</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Credits</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={formCredits}
                    onChange={(e) => setFormCredits(Number(e.target.value) || 3)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 font-medium ${inputClass}`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Short Description (for Homepage Card)</label>
                <input
                  type="text"
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  placeholder="e.g. Master Python syntax, functions, and OOP."
                  className={`w-full rounded-xl border px-3.5 py-2.5 font-medium ${inputClass}`}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Full Course Description</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Detailed course overview and curriculum topics..."
                  className={`w-full rounded-xl border px-3.5 py-2.5 font-medium ${inputClass}`}
                />
              </div>

              {/* Cover Image Selector */}
              <div className="space-y-2">
                <label className={labelClass}>Cover Image</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formCoverImage}
                    onChange={(e) => setFormCoverImage(e.target.value)}
                    className={`flex-1 rounded-xl border px-3.5 py-2 font-mono text-[11px] ${inputClass}`}
                  />
                  <div className="h-9 w-14 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                    <img src={formCoverImage} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                </div>
                <div className="flex gap-2 items-center flex-wrap pt-1">
                  <button
                    type="button"
                    onClick={() => setFormCoverImage('/src/assets/images/subject_python_code_1790863262336.jpg')}
                    className="text-[11px] font-semibold text-indigo-500 hover:underline"
                  >
                    Preset: Python
                  </button>
                  <span className="text-slate-400">·</span>
                  <button
                    type="button"
                    onClick={() => setFormCoverImage('/src/assets/images/subject_web_dev_1790863282493.jpg')}
                    className="text-[11px] font-semibold text-indigo-500 hover:underline"
                  >
                    Preset: Web Dev
                  </button>
                  <span className="text-slate-400">·</span>
                  <button
                    type="button"
                    onClick={() => setFormCoverImage('/src/assets/images/subject_cyber_network_1790863299947.jpg')}
                    className="text-[11px] font-semibold text-indigo-500 hover:underline"
                  >
                    Preset: Cybersecurity & Network
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPublished}
                    onChange={(e) => setFormIsPublished(e.target.checked)}
                    className="rounded border-slate-400 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className={labelClass}>Publish Immediately</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="rounded border-slate-400 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className={labelClass}>Feature on Homepage</span>
                </label>
              </div>

              <div className={`pt-4 border-t flex justify-end gap-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={`rounded-xl border px-4 py-2 text-xs font-bold transition-colors ${
                    isLight 
                      ? 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200' 
                      : 'border-slate-800 bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 shadow-md active:scale-95 transition-all"
                >
                  {saving ? 'Saving...' : (editingSubject ? 'Update Subject' : 'Save Subject')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
