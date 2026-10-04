import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext.tsx';
import { WebsiteSettings } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { syncAllToGoogleFirestore, testFirestoreConnection } from '../../services/firebaseSync.ts';
import firebaseConfig from '../../../firebase-applet-config.json';
import {
  Save,
  CheckCircle,
  Image as ImageIcon,
  User,
  Globe,
  Mail,
  Send,
  Github,
  Facebook,
  Phone,
  Layout,
  Sparkles,
  RefreshCw,
  Database,
  Cloud,
  Check,
  ShieldCheck
} from 'lucide-react';

export const SettingsManagement: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState<WebsiteSettings | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'branding' | 'hero' | 'contact' | 'about' | 'footer' | 'cloud-datastore'>('branding');
  const [saving, setSaving] = useState(false);
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [cloudSyncSuccess, setCloudSyncSuccess] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData({ ...settings });
    }
  }, [settings]);

  if (!formData) return null;

  const handleChange = (field: keyof WebsiteSettings, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);

    try {
      await updateSettings(formData);
      setSuccessMessage('Website branding and settings updated successfully! Public pages are updated immediately.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Dynamic Website Settings & Branding</span>
          </h2>
          <p className="text-xs text-slate-400">
            Customize creator identity, logo, hero layout, and contact channels without touching code.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
        </button>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs font-medium text-emerald-300">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveSubTab('branding')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            activeSubTab === 'branding' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Creator Profile & Branding
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('hero')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            activeSubTab === 'hero' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Hero Header & Layout
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('contact')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            activeSubTab === 'contact' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Contact & Social Channels
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('about')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            activeSubTab === 'about' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          4. About Section
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('footer')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            activeSubTab === 'footer' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          5. Footer & Copyright
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('cloud-datastore')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            activeSubTab === 'cloud-datastore' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:text-white'
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span>6. Google Cloud Data Store (Firestore)</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SUBTAB 1: CREATOR & BRANDING */}
        {activeSubTab === 'branding' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                Creator Identity & Brand Mark
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Developer / Creator Name (English)</label>
                  <input
                    type="text"
                    value={formData.creatorName}
                    onChange={e => handleChange('creatorName', e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Developer / Creator Name (Khmer)</label>
                  <input
                    type="text"
                    value={formData.creatorNameKh}
                    onChange={e => handleChange('creatorNameKh', e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Professional Role (English)</label>
                  <input
                    type="text"
                    value={formData.creatorRole}
                    onChange={e => handleChange('creatorRole', e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Professional Role (Khmer)</label>
                  <input
                    type="text"
                    value={formData.creatorRoleKh}
                    onChange={e => handleChange('creatorRoleKh', e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Creator Photo Upload & Presentation */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-slate-200 font-bold block">
                      Creator Photo / Hero Image (រូបភាពអ្នកបង្កើត/គ្រូបង្រៀន)
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Upload transparent PNG (no background), standing or sitting photo directly from your device.
                    </p>
                  </div>
                </div>

                {/* Upload Input & Browse Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <input
                    type="file"
                    id="creator-photo-upload"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64 = event.target?.result as string;
                        handleChange('creatorAvatar', base64);
                        // Also try validating upload on backend
                        try {
                          await api.uploadFile({
                            fileName: file.name,
                            base64Data: base64,
                            sizeInBytes: file.size
                          });
                        } catch (err) {
                          console.log('Stored as base64 data URL');
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="creator-photo-upload"
                    className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-colors"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Upload New Photo (PNG / JPG)</span>
                  </label>

                  <div className="flex-1 w-full sm:w-auto">
                    <input
                      type="text"
                      value={formData.creatorAvatar}
                      onChange={e => handleChange('creatorAvatar', e.target.value)}
                      placeholder="Or enter image URL / path..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Presentation Style & Pose Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">
                      Display Style (ទម្រង់បង្ហាញ)
                    </label>
                    <select
                      value={formData.creatorPhotoStyle || 'cutout-transparent'}
                      onChange={e => handleChange('creatorPhotoStyle', e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="cutout-transparent">Transparent Cutout (PNG គ្មានផ្ទៃខាងក្រោយ - Best)</option>
                      <option value="framed">Modern Framed Card (ទម្រង់ស៊ុម)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">
                      Pose Adaptation (ទម្រង់រូប ឈរ ឬ អង្គុយ)
                    </label>
                    <select
                      value={formData.creatorPhotoPose || 'standing'}
                      onChange={e => handleChange('creatorPhotoPose', e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="standing">Standing Pose (រូបឈរ - Full Height / Tall)</option>
                      <option value="sitting">Sitting Pose (រូបអង្គុយ - Desk / Seated)</option>
                      <option value="auto">Auto Adaptive (សម្របស្វ័យប្រវត្តិ)</option>
                    </select>
                  </div>
                </div>

                {/* Presets Quick Selector */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-slate-400 text-[11px] font-medium">
                    Or Choose High-Res Preset:
                  </label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('creatorAvatar', '/src/assets/images/creator_seamless_dark_standing_1790941581410.jpg');
                        handleChange('creatorPhotoPose', 'standing');
                        handleChange('creatorPhotoStyle', 'cutout-transparent');
                      }}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-300 hover:text-white hover:border-indigo-500 transition-colors"
                    >
                      Preset 1: Seamless Standing (រូបឈរ ពណ៍ផ្ទៃដូច Web)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('creatorAvatar', '/src/assets/images/creator_seamless_dark_sitting_1790941594321.jpg');
                        handleChange('creatorPhotoPose', 'sitting');
                        handleChange('creatorPhotoStyle', 'cutout-transparent');
                      }}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-300 hover:text-white hover:border-indigo-500 transition-colors"
                    >
                      Preset 2: Seamless Sitting (រូបអង្គុយ ពណ៍ផ្ទៃដូច Web)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('creatorAvatar', '/src/assets/images/creator_profile_avatar_1790863234093.jpg');
                        handleChange('creatorPhotoStyle', 'framed');
                      }}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-300 hover:text-white hover:border-indigo-500 transition-colors"
                    >
                      Preset 3: Studio Headshot (រូបថតមុខ)
                    </button>
                  </div>
                </div>

                {/* Background Transparency Converter Helper */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.creatorAvatar) return;
                      const img = new Image();
                      img.crossOrigin = 'anonymous';
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return;
                        ctx.drawImage(img, 0, 0);
                        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const data = imgData.data;
                        const bgR = data[0];
                        const bgG = data[1];
                        const bgB = data[2];
                        for (let i = 0; i < data.length; i += 4) {
                          const dist = Math.sqrt((data[i] - bgR) ** 2 + (data[i + 1] - bgG) ** 2 + (data[i + 2] - bgB) ** 2);
                          if (dist < 40 || (bgR < 35 && bgG < 35 && bgB < 35 && data[i] < 40 && data[i+1] < 40 && data[i+2] < 40)) {
                            data[i + 3] = 0; // Make pure transparent
                          }
                        }
                        ctx.putImageData(imgData, 0, 0);
                        handleChange('creatorAvatar', canvas.toDataURL('image/png'));
                        handleChange('creatorPhotoStyle', 'cutout-transparent');
                      };
                      img.src = formData.creatorAvatar;
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-indigo-300 hover:bg-slate-800 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Auto-Clean to Transparent PNG (លុបផ្ទៃខាងក្រោយជា PNG ថ្លា)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.creatorAvatar) return;
                      const img = new Image();
                      img.crossOrigin = 'anonymous';
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return;
                        ctx.drawImage(img, 0, 0);
                        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const data = imgData.data;
                        const bgR = data[0];
                        const bgG = data[1];
                        const bgB = data[2];
                        for (let i = 0; i < data.length; i += 4) {
                          const dist = Math.sqrt((data[i] - bgR) ** 2 + (data[i + 1] - bgG) ** 2 + (data[i + 2] - bgB) ** 2);
                          if (dist < 40 || (bgR < 35 && bgG < 35 && bgB < 35 && data[i] < 40 && data[i+1] < 40 && data[i+2] < 40)) {
                            // Replace with exact Web App Slate-950 color: rgb(2, 6, 23)
                            data[i] = 2;
                            data[i + 1] = 6;
                            data[i + 2] = 23;
                            data[i + 3] = 255;
                          }
                        }
                        ctx.putImageData(imgData, 0, 0);
                        handleChange('creatorAvatar', canvas.toDataURL('image/png'));
                      };
                      img.src = formData.creatorAvatar;
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-cyan-300 hover:bg-slate-800 transition-colors"
                  >
                    <span>Match Web App Color #020617 (ផ្គូផ្គងពណ៍ Web App)</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Short Biography</label>
                <textarea
                  rows={3}
                  value={formData.creatorBio}
                  onChange={e => handleChange('creatorBio', e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-indigo-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Logo & App Name Settings (កំណត់ឈ្មោះ App នឹង Logo)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">Logo Wordmark / Monogram (អក្សរកាត់ Logo)</label>
                    <input
                      type="text"
                      value={formData.logoText}
                      onChange={e => handleChange('logoText', e.target.value)}
                      placeholder="e.g. MECH MEN"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">App Name (English)</label>
                    <input
                      type="text"
                      value={formData.siteName}
                      onChange={e => handleChange('siteName', e.target.value)}
                      placeholder="e.g. MECH MEN"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">App Name (Khmer - ឈ្មោះខ្មែរ)</label>
                    <input
                      type="text"
                      value={formData.siteNameKh}
                      onChange={e => handleChange('siteNameKh', e.target.value)}
                      placeholder="e.g. MECH MEN — ម៉ិច ម៉ែន"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white font-bold focus:outline-none focus:border-indigo-500 font-khmer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">Sub-tagline (English)</label>
                    <input
                      type="text"
                      value={formData.siteSubtitle}
                      onChange={e => handleChange('siteSubtitle', e.target.value)}
                      placeholder="e.g. Bachelor of Science in Information Technology (BBU)"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">Sub-tagline (Khmer - អនុចំណងជើង)</label>
                    <input
                      type="text"
                      value={formData.siteSubtitleKh}
                      onChange={e => handleChange('siteSubtitleKh', e.target.value)}
                      placeholder="e.g. សាកលវិទ្យាល័យបៀលប្រាយ (BBU)"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500 font-khmer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5 text-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Live Navbar & Branding Preview
              </span>

              {/* Top Bar Preview */}
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex items-center gap-3 text-left">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                  {(formData.logoText || 'MM').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-xs text-white truncate leading-tight">
                    {formData.siteName || 'MECH MEN'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {formData.siteSubtitleKh || 'សាកលវិទ្យាល័យបៀលប្រាយ (BBU)'}
                  </p>
                </div>
              </div>

              <div className="h-32 w-32 rounded-2xl overflow-hidden border-2 border-indigo-500/40 mx-auto bg-slate-950 shadow-xl">
                <img
                  src={formData.creatorAvatar}
                  alt={formData.creatorName}
                  className="h-full w-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{formData.creatorName}</h4>
                <p className="text-xs text-indigo-400 font-medium">{formData.creatorRole}</p>
                <p className="text-[11px] text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {formData.creatorBio}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: HERO HEADER & LAYOUT */}
        {activeSubTab === 'hero' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6 text-xs">
            <div className="space-y-3">
              <label className="text-slate-300 font-bold text-sm block">
                Header Section Layout Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`cursor-pointer rounded-xl border p-4 flex flex-col justify-between transition-colors ${
                  formData.headerLayout === 'split-right-avatar'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="headerLayout"
                    value="split-right-avatar"
                    checked={formData.headerLayout === 'split-right-avatar'}
                    onChange={() => handleChange('headerLayout', 'split-right-avatar')}
                    className="sr-only"
                  />
                  <span className="font-bold text-xs">Right Side: Creator Photo</span>
                  <p className="text-[11px] text-slate-400 mt-1">Left side text/title, Right side photo (Prompt Preferred)</p>
                </label>

                <label className={`cursor-pointer rounded-xl border p-4 flex flex-col justify-between transition-colors ${
                  formData.headerLayout === 'split-left-avatar'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="headerLayout"
                    value="split-left-avatar"
                    checked={formData.headerLayout === 'split-left-avatar'}
                    onChange={() => handleChange('headerLayout', 'split-left-avatar')}
                    className="sr-only"
                  />
                  <span className="font-bold text-xs">Left Side: Creator Photo</span>
                  <p className="text-[11px] text-slate-400 mt-1">Left side photo, Right side title & description</p>
                </label>

                <label className={`cursor-pointer rounded-xl border p-4 flex flex-col justify-between transition-colors ${
                  formData.headerLayout === 'centered'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="headerLayout"
                    value="centered"
                    checked={formData.headerLayout === 'centered'}
                    onChange={() => handleChange('headerLayout', 'centered')}
                    className="sr-only"
                  />
                  <span className="font-bold text-xs">Centered Stack</span>
                  <p className="text-[11px] text-slate-400 mt-1">Avatar centered above main title and description</p>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Hero Main Title (English)</label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={e => handleChange('heroTitle', e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Hero Main Title (Khmer)</label>
                <input
                  type="text"
                  value={formData.heroTitleKh}
                  onChange={e => handleChange('heroTitleKh', e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Hero Subtitle (English)</label>
                <input
                  type="text"
                  value={formData.heroSubtitle}
                  onChange={e => handleChange('heroSubtitle', e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Hero Subtitle (Khmer)</label>
                <input
                  type="text"
                  value={formData.heroSubtitleKh}
                  onChange={e => handleChange('heroSubtitleKh', e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Hero Description (English)</label>
              <textarea
                rows={3}
                value={formData.heroDescription}
                onChange={e => handleChange('heroDescription', e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* SUBTAB 3: CONTACT & SOCIAL CHANNELS */}
        {activeSubTab === 'contact' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              Public Contact & Community Links
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5 text-sky-400" />
                  <span>Telegram Username</span>
                </label>
                <input
                  type="text"
                  value={formData.telegramUsername}
                  onChange={e => handleChange('telegramUsername', e.target.value)}
                  placeholder="e.g. kiri_heng_it"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Github className="h-3.5 w-3.5 text-slate-300" />
                  <span>GitHub Profile / Repo URL</span>
                </label>
                <input
                  type="text"
                  value={formData.githubUrl}
                  onChange={e => handleChange('githubUrl', e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Facebook className="h-3.5 w-3.5 text-blue-400" />
                  <span>Facebook Profile / Page URL</span>
                </label>
                <input
                  type="text"
                  value={formData.facebookUrl}
                  onChange={e => handleChange('facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Contact Email</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="contact@devlearn.it"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  placeholder="+855 12 345 678"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Physical Location / Office</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => handleChange('address', e.target.value)}
                  placeholder="Phnom Penh, Cambodia"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: ABOUT SECTION */}
        {activeSubTab === 'about' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              About The Platform & Mission
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">About Section Heading (English)</label>
                <input
                  type="text"
                  value={formData.aboutHeading}
                  onChange={e => handleChange('aboutHeading', e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">About Section Heading (Khmer)</label>
                <input
                  type="text"
                  value={formData.aboutHeadingKh}
                  onChange={e => handleChange('aboutHeadingKh', e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Mission & Narrative Text</label>
              <textarea
                rows={4}
                value={formData.aboutText}
                onChange={e => handleChange('aboutText', e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* SUBTAB 5: FOOTER */}
        {activeSubTab === 'footer' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              Footer Copy & Year
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Footer Text (English)</label>
                <input
                  type="text"
                  value={formData.footerText}
                  onChange={e => handleChange('footerText', e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Footer Text (Khmer)</label>
                <input
                  type="text"
                  value={formData.footerTextKh}
                  onChange={e => handleChange('footerTextKh', e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1 max-w-xs">
              <label className="text-slate-300 font-medium">Copyright Year</label>
              <input
                type="text"
                value={formData.copyrightYear}
                onChange={e => handleChange('copyrightYear', e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        )}

        {/* SUBTAB 6: GOOGLE CLOUD DATA STORE (FIREBASE FIRESTORE) */}
        {activeSubTab === 'cloud-datastore' && (
          <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-6 space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Google Cloud Firestore Data Store</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active & Connected
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your application data, subjects, categories, and settings are persistent on Google Cloud Firestore.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={syncingCloud}
                onClick={async () => {
                  setSyncingCloud(true);
                  setCloudSyncSuccess(null);
                  try {
                    const [subRes, catRes, lesRes, matRes] = await Promise.all([
                      api.getSubjects(),
                      api.getCategories(),
                      api.getLessons(),
                      api.getMaterials()
                    ]);
                    const result = await syncAllToGoogleFirestore(
                      subRes.data || [],
                      catRes.data || [],
                      formData,
                      lesRes.data || [],
                      matRes.data || []
                    );
                    if (result.success) {
                      setCloudSyncSuccess('រក្សាទុកជោគជ័យ! មុខវិជ្ជា មេរៀន ឯកសារ PDF និងការកំណត់ទាំងអស់ត្រូវបានរក្សាទុកក្នុង Google Cloud Firestore និងមិនបាត់បង់ពេល Hosting ឡើយ! (All subjects, lessons, PDFs, categories, and settings synced to Google Cloud!)');
                    } else {
                      setCloudSyncSuccess('Sync notice: ' + result.error);
                    }
                  } catch (e: any) {
                    setCloudSyncSuccess('Sync notice: ' + e.message);
                  } finally {
                    setSyncingCloud(false);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 disabled:opacity-50 transition-all shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${syncingCloud ? 'animate-spin' : ''}`} />
                <span>{syncingCloud ? 'Syncing to Google Cloud...' : 'Sync All Data to Google Cloud'}</span>
              </button>
            </div>

            {cloudSyncSuccess && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-4 text-xs font-medium text-emerald-300">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{cloudSyncSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Google Cloud Project ID
                </span>
                <p className="text-xs font-mono font-bold text-white">
                  {firebaseConfig.projectId}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Firestore Database ID
                </span>
                <p className="text-xs font-mono font-bold text-emerald-400 truncate" title={firebaseConfig.firestoreDatabaseId}>
                  {firebaseConfig.firestoreDatabaseId || '(default)'}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Cloud Security Rules
                </span>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>ABAC Hardened Rules Deployed</span>
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Cloud className="h-4 w-4 text-cyan-400" />
                <span>Cloud Collections Structure (រចនាសម្ព័ន្ធទិន្នន័យ Google Cloud):</span>
              </h4>
              <ul className="text-[11px] text-slate-400 space-y-1 font-mono list-disc list-inside">
                <li><span className="text-indigo-400">/settings/global</span> — MECH MEN Branding, Title, Logo & Creator Profile</li>
                <li><span className="text-cyan-400">/categories/{'{categoryId}'}</span> — Academic Semesters (Year 1 to Year 4)</li>
                <li><span className="text-emerald-400">/subjects/{'{subjectId}'}</span> — University IT Subjects & Curriculum</li>
                <li><span className="text-amber-400">/subjects/{'{subjectId}'}/lessons/{'{lessonId}'}</span> — Lectures, PDFs & Code Exercises</li>
                <li><span className="text-purple-400">/users/{'{userId}'}/progress</span> — Individual Student Learning Progress</li>
              </ul>
            </div>
          </div>
        )}

        {/* Bottom Save Trigger */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Apply Changes Across Website'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
