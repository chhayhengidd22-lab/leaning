import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  X,
  Upload,
  Sparkles,
  CheckCircle,
  Image as ImageIcon,
  User,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Check
} from 'lucide-react';

interface AdminPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPhotoModal: React.FC<AdminPhotoModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const { isAdmin } = useAuth();

  const isKh = language === 'kh';

  const [currentAvatar, setCurrentAvatar] = useState<string>(
    settings?.creatorAvatar || '/src/assets/images/creator_standing_cutout_1790941029628.jpg'
  );
  const [photoPose, setPhotoPose] = useState<'standing' | 'sitting' | 'auto'>(
    settings?.creatorPhotoPose || 'standing'
  );
  const [photoStyle, setPhotoStyle] = useState<'cutout-transparent' | 'framed' | 'minimal'>(
    settings?.creatorPhotoStyle || 'cutout-transparent'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !isAdmin) return null;

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(isKh ? 'សូមជ្រើសរើសឯកសាររូបភាព (PNG, JPG, WebP)' : 'Please select an image file (PNG, JPG, WebP)');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCurrentAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  // Convert background to transparent PNG using Canvas
  const handleMakeTransparent = () => {
    if (!currentAvatar) return;
    setIsProcessing(true);
    setErrorMessage(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Sample corner pixels to detect background color
        const bgR = data[0];
        const bgG = data[1];
        const bgB = data[2];

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Euclidean color distance from background
          const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

          // If close to sampled background, or if very dark (< 30) or near pure white (> 240)
          if (
            dist < 45 ||
            (bgR < 35 && bgG < 35 && bgB < 35 && r < 40 && g < 40 && b < 40) ||
            (bgR > 235 && bgG > 235 && bgB > 235 && r > 230 && g > 230 && b > 230)
          ) {
            data[i + 3] = 0; // Pure alpha 0 (Transparent)
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const transparentPng = canvas.toDataURL('image/png');
        setCurrentAvatar(transparentPng);
        setPhotoStyle('cutout-transparent');
      } catch (err: any) {
        setErrorMessage(isKh ? 'មិនអាចបំលែងបានទេ: ' + err.message : 'Conversion failed: ' + err.message);
      } finally {
        setIsProcessing(false);
      }
    };
    img.onerror = () => {
      setIsProcessing(false);
      setErrorMessage(isKh ? 'មិនអាចទាញយករូបភាពសម្រាប់កែច្នៃបានទេ' : 'Failed to load image for processing');
    };
    img.src = currentAvatar;
  };

  // Match Web App Color (Dark #020617, Light #f8fafc, Amber #09090b)
  const handleMatchWebAppColor = () => {
    if (!currentAvatar) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        const bgR = data[0];
        const bgG = data[1];
        const bgB = data[2];

        // Determine target theme color
        let targetR = 2, targetG = 6, targetB = 23; // Dark #020617
        if (theme === 'light') {
          targetR = 248; targetG = 250; targetB = 252; // Light #f8fafc
        } else if (theme === 'amber') {
          targetR = 9; targetG = 9; targetB = 11; // Amber #09090b
        }

        for (let i = 0; i < data.length; i += 4) {
          const dist = Math.sqrt((data[i] - bgR) ** 2 + (data[i + 1] - bgG) ** 2 + (data[i + 2] - bgB) ** 2);
          if (dist < 45 || (bgR < 35 && bgG < 35 && bgB < 35 && data[i] < 40 && data[i+1] < 40 && data[i+2] < 40)) {
            data[i] = targetR;
            data[i + 1] = targetG;
            data[i + 2] = targetB;
            data[i + 3] = 255;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setCurrentAvatar(canvas.toDataURL('image/png'));
      } catch (err: any) {
        setErrorMessage(err.message);
      } finally {
        setIsProcessing(false);
      }
    };
    img.src = currentAvatar;
  };

  // Save changes to settings
  const handleSave = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await updateSettings({
        creatorAvatar: currentAvatar,
        creatorPhotoPose: photoPose,
        creatorPhotoStyle: photoStyle
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save settings');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className={`text-sm font-bold text-white ${isKh ? 'font-khmer' : ''}`}>
                {isKh ? 'គ្រប់គ្រងរូបភាពអ្នកបង្កើត (Admin: Creator Photo)' : 'Admin: Creator Photo & Posture Control'}
              </h3>
              <p className={`text-[11px] text-slate-400 ${isKh ? 'font-khmer' : ''}`}>
                {isKh
                  ? 'មានសិទ្ធិតែ Admin ប៉ុណ្ណោះក្នុងការ Upload រូប PNG និងផ្លាស់ប្តូររូបឈរ/អង្គុយ'
                  : 'Only Admin has permission to upload transparent PNG and configure standing/sitting posture.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
              {errorMessage}
            </div>
          )}

          {saveSuccess && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>{isKh ? 'បានរក្សាទុករូបភាព និងទម្រង់ជោគជ័យ!' : 'Photo and posture settings saved successfully!'}</span>
            </div>
          )}

          {/* Posture Switcher (Standing vs Sitting) */}
          <div className="space-y-2">
            <label className={`text-xs font-bold text-slate-200 block ${isKh ? 'font-khmer' : ''}`}>
              {isKh ? '១. ជ្រើសរើសទម្រង់រូប (ឈរ ឬ អង្គុយ):' : '1. Choose Posture Adaptation (Standing vs Sitting):'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPhotoPose('standing')}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  photoPose === 'standing'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <p className={`text-xs font-bold ${isKh ? 'font-khmer' : ''}`}>
                    🧍 {isKh ? 'រូបឈរ (Standing Pose)' : 'Standing Pose'}
                  </p>
                  <p className={`text-[11px] text-slate-400 mt-0.5 ${isKh ? 'font-khmer' : ''}`}>
                    {isKh ? 'ទម្រង់កម្ពស់ពេញ (Full Height / Tall)' : 'Full height vertical framing (360-520px)'}
                  </p>
                </div>
                {photoPose === 'standing' && <Check className="h-4 w-4 text-indigo-400 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => setPhotoPose('sitting')}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  photoPose === 'sitting'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <p className={`text-xs font-bold ${isKh ? 'font-khmer' : ''}`}>
                    🪑 {isKh ? 'រូបអង្គុយ (Sitting Pose)' : 'Sitting Pose'}
                  </p>
                  <p className={`text-[11px] text-slate-400 mt-0.5 ${isKh ? 'font-khmer' : ''}`}>
                    {isKh ? 'ទម្រង់តុ ឬកៅអី (Desk / Seated)' : 'Seated proportion framing (280-440px)'}
                  </p>
                </div>
                {photoPose === 'sitting' && <Check className="h-4 w-4 text-indigo-400 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Upload Input */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className={`text-xs font-bold text-slate-200 block ${isKh ? 'font-khmer' : ''}`}>
              {isKh ? '២. ផ្ទុកឡើងរូបភាព PNG (គ្មានផ្ទៃខាងក្រោយ):' : '2. Upload PNG Image (Transparent Background):'}
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="file"
                id="admin-photo-input"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="admin-photo-input"
                className={`cursor-pointer inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-colors w-full sm:w-auto justify-center ${isKh ? 'font-khmer' : ''}`}
              >
                <Upload className="h-4 w-4" />
                <span>{isKh ? 'ជ្រើសរើសរូបភាពពីម៉ាស៊ីន (PNG/JPG)' : 'Browse Photo File...'}</span>
              </label>

              <input
                type="text"
                value={currentAvatar}
                onChange={(e) => setCurrentAvatar(e.target.value)}
                placeholder="Or paste image URL or /src/assets/..."
                className="w-full sm:flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Background Transparency & Color Matching Tools */}
          <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
            <p className={`text-xs font-bold text-slate-300 ${isKh ? 'font-khmer' : ''}`}>
              {isKh ? 'ឧបករណ៍កែសម្រួលផ្ទៃខាងក្រោយ (Smart Background Tools):' : 'Smart Background & Transparency Tools:'}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleMakeTransparent}
                disabled={isProcessing}
                className={`inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/40 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-900/40 transition-colors disabled:opacity-50 ${isKh ? 'font-khmer' : ''}`}
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>{isKh ? 'លុបផ្ទៃខាងក្រោយជា PNG ថ្លា (Auto Transparent PNG)' : 'Make PNG Transparent (No Background)'}</span>
              </button>

              <button
                type="button"
                onClick={handleMatchWebAppColor}
                disabled={isProcessing}
                className={`inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-900/40 transition-colors disabled:opacity-50 ${isKh ? 'font-khmer' : ''}`}
              >
                <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>
                  {isKh
                    ? `ផ្គូផ្គងពណ៍ Web App (${theme.toUpperCase()})`
                    : `Match Web App Color (${theme.toUpperCase()})`}
                </span>
              </button>
            </div>
          </div>

          {/* Ready-to-Use High-Resolution Presets */}
          <div className="space-y-2">
            <label className={`text-xs font-medium text-slate-400 block ${isKh ? 'font-khmer' : ''}`}>
              {isKh ? 'ឬជ្រើសរើសរូបភាពគំរូ HD (Presets):' : 'Or Select HD Presets:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setCurrentAvatar('/src/assets/images/creator_seamless_dark_standing_1790941581410.jpg');
                  setPhotoPose('standing');
                  setPhotoStyle('cutout-transparent');
                }}
                className={`flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-2 text-left hover:border-indigo-500 transition-colors ${
                  currentAvatar.includes('standing') ? 'border-indigo-500 ring-1 ring-indigo-500' : ''
                }`}
              >
                <span className="text-base">🧍</span>
                <div>
                  <p className={`font-semibold text-white ${isKh ? 'font-khmer' : ''}`}>
                    {isKh ? 'រូបឈរ (Standing HD)' : 'Preset: Standing HD'}
                  </p>
                  <p className="text-[10px] text-slate-400">Seamless Dark / Transparent</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentAvatar('/src/assets/images/creator_seamless_dark_sitting_1790941594321.jpg');
                  setPhotoPose('sitting');
                  setPhotoStyle('cutout-transparent');
                }}
                className={`flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-2 text-left hover:border-indigo-500 transition-colors ${
                  currentAvatar.includes('sitting') ? 'border-indigo-500 ring-1 ring-indigo-500' : ''
                }`}
              >
                <span className="text-base">🪑</span>
                <div>
                  <p className={`font-semibold text-white ${isKh ? 'font-khmer' : ''}`}>
                    {isKh ? 'រូបអង្គុយ (Sitting HD)' : 'Preset: Sitting HD'}
                  </p>
                  <p className="text-[10px] text-slate-400">Desk / Workspace pose</p>
                </div>
              </button>
            </div>
          </div>

          {/* Live Preview Inside Modal */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <span className={`text-xs font-semibold text-slate-400 ${isKh ? 'font-khmer' : ''}`}>
              {isKh ? 'ការមើលសាកល្បងផ្ទាល់ (Live Preview):' : 'Live Preview on Web Background:'}
            </span>
            <div className={`relative flex items-center justify-center p-6 rounded-2xl border border-slate-800 overflow-hidden ${
              theme === 'light' ? 'bg-[#f8fafc]' : theme === 'amber' ? 'bg-[#09090b]' : 'bg-[#020617]'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
              <img
                src={currentAvatar}
                alt="Creator Preview"
                className={`w-auto object-contain transition-all ${
                  photoPose === 'sitting' ? 'h-48' : 'h-64'
                }`}
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl border border-slate-800 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${isKh ? 'font-khmer' : ''}`}
          >
            {isKh ? 'បោះបង់' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing}
            className={`inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-xs font-semibold text-white shadow-md transition-colors disabled:opacity-50 ${isKh ? 'font-khmer' : ''}`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{isKh ? 'កំពុងរក្សាទុក...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>{isKh ? 'រក្សាទុក និងអនុវត្ត (Save Changes)' : 'Save & Apply to Website'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
