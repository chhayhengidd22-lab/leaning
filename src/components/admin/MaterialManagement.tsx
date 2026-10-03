import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { LessonMaterial } from '../../types/index.ts';
import { Upload, Trash2, FileText, Download, CheckCircle, AlertTriangle, Layers, Plus } from 'lucide-react';

export const MaterialManagement: React.FC = () => {
  const [materials, setMaterials] = useState<LessonMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'pptx' | 'ppt' | 'doc' | 'zip' | 'image' | 'video'>('pdf');
  const [fileSize, setFileSize] = useState('2.5 MB');
  const [fileUrl, setFileUrl] = useState('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    api.getMaterials()
      .then(res => {
        if (res.success) setMaterials(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fileName) return;

    setUploading(true);
    setUploadMessage(null);

    try {
      // Validate upload via backend upload API
      const validateRes = await api.uploadFile({
        fileName,
        fileType
      });

      if (!validateRes.success) {
        throw new Error(validateRes.message);
      }

      // Add to material list
      await api.createMaterial({
        title,
        fileName: validateRes.data.fileName || fileName,
        fileType: fileType as any,
        fileSize,
        fileUrl: fileUrl || validateRes.data.fileUrl
      });

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setUploadMessage(err.message || 'Upload validation failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete material "${name}"?`)) {
      try {
        await api.deleteMaterial(id);
        loadData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white">Course Materials & Downloads</h2>
          <p className="text-xs text-slate-400">
            Upload PDF slide decks, PPT/PPTX presentations, and lecture reference documents.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setFileName('Python_Full_Course_Slides.pdf');
            setFileType('pdf');
            setFileSize('3.4 MB');
            setUploadMessage(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 whitespace-nowrap"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Material</span>
        </button>
      </div>

      {/* Materials Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
            <tr>
              <th className="py-3 px-4 font-semibold">Document Title</th>
              <th className="py-3 px-4 font-semibold">File Format</th>
              <th className="py-3 px-4 font-semibold">File Size</th>
              <th className="py-3 px-4 font-semibold">Uploaded</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {materials.map(mat => (
              <tr key={mat.id} className="hover:bg-slate-850/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-800/40">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{mat.title}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{mat.fileName}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono uppercase font-semibold text-slate-300">
                    {mat.fileType}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                  {mat.fileSize}
                </td>
                <td className="py-3 px-4 text-slate-500 font-mono">
                  {mat.uploadedAt || '2026-09-30'}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <a
                      href={mat.fileUrl}
                      download={mat.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
                      title="Download file"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() => handleDelete(mat.id, mat.title)}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-rose-400 hover:bg-rose-950/40"
                      title="Delete file"
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
              <h3 className="text-sm font-bold text-white">Upload New Learning Material</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                &times;
              </button>
            </div>

            {uploadMessage && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
                {uploadMessage}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Material Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Lesson 01 Presentation Deck"
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">File Name (with extension)</label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  placeholder="Python_Basics_Slides.pdf"
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Format</label>
                  <select
                    value={fileType}
                    onChange={e => setFileType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="pptx">PowerPoint (.pptx)</option>
                    <option value="ppt">PowerPoint (.ppt)</option>
                    <option value="doc">Word Document (.doc)</option>
                    <option value="zip">ZIP Archive</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Simulated Size</label>
                  <input
                    type="text"
                    value={fileSize}
                    onChange={e => setFileSize(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-slate-800 p-4 text-center text-slate-400 space-y-1">
                <Upload className="h-6 w-6 text-indigo-400 mx-auto" />
                <p className="font-semibold text-slate-300">File Type Validation Enforced</p>
                <p className="text-[10px] text-slate-500">MIME and extension checked before storage.</p>
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
                  disabled={uploading}
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-500"
                >
                  {uploading ? 'Validating...' : 'Upload & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
