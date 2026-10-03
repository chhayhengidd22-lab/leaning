import React, { useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { generateLessonPdfBlob, downloadBlobAsFile } from '../../utils/pdfGenerator.ts';
import {
  FileText,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Printer,
  RotateCcw,
  Check,
  Eye,
  Layers,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface PdfViewerProps {
  pdfUrl?: string;
  pdfTitle?: string;
  lessonTitle: string;
  subjectName: string;
  instructorName?: string;
  content?: string;
  slides?: Array<{ title: string; bullets: string[]; notes?: string }>;
  codeSnippet?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfUrl,
  pdfTitle,
  lessonTitle,
  subjectName,
  instructorName = 'Kiri Heng',
  content = '',
  slides = [],
  codeSnippet = ''
}) => {
  const { language, t } = useLanguage();
  const { theme, isLight, isAmber } = useTheme();
  const isKh = language === 'kh';

  // Viewer modes & controls
  const [viewMode, setViewMode] = useState<'scroll' | 'single' | 'embed'>('scroll');
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const docTitle = pdfTitle || `${lessonTitle.replace(/\s+/g, '_')}_Document.pdf`;

  // Download handler
  const handleDownload = () => {
    setIsDownloading(true);
    try {
      if (pdfUrl && pdfUrl.startsWith('data:application/pdf')) {
        // Direct data URL download
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = docTitle;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Generate real client-side PDF Blob
        const blob = generateLessonPdfBlob(
          lessonTitle,
          subjectName,
          instructorName,
          content,
          slides
        );
        downloadBlobAsFile(blob, docTitle);
      }

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(160, prev + 15));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(70, prev - 15));
  const handleResetZoom = () => setZoomLevel(100);

  // Structured multi-page document model for high-fidelity interactive scrolling
  const pagesData = [
    {
      pageNumber: 1,
      sectionTitle: isKh ? 'សេចក្តីផ្តើម និងស្ថាបត្យកម្ម' : 'Overview & Architecture Foundation',
      type: 'overview'
    },
    {
      pageNumber: 2,
      sectionTitle: isKh ? 'គោលគំនិតស្នូល និងការរៀបចំ' : 'Core Concepts & Engineering Workflow',
      type: 'concepts'
    },
    {
      pageNumber: 3,
      sectionTitle: isKh ? 'ស្លាយបង្រៀន និងចំនុចគន្លឹះ' : 'Lecture Presentation Points',
      type: 'slides'
    },
    {
      pageNumber: 4,
      sectionTitle: isKh ? 'សេចក្តីសង្ខេប និងលំហាត់អនុវត្ត' : 'Summary, Code & Practice Exercises',
      type: 'exercises'
    }
  ];

  const totalPages = pagesData.length;

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border overflow-hidden shadow-2xl transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none bg-slate-950 p-4 sm:p-8 flex flex-col justify-between overflow-y-auto'
          : isLight
          ? 'border-slate-300 bg-white/95'
          : isAmber
          ? 'border-zinc-800 bg-zinc-950/90'
          : 'border-slate-800 bg-slate-900/90'
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. DOCUMENT TOP TOOLBAR (Navigation, Zoom, View Modes, Download)          */}
      {/* ========================================================================= */}
      <div className={`flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b backdrop-blur-md ${
        isLight ? 'border-slate-200 bg-slate-50/95 text-slate-800' : 'border-slate-800 bg-slate-950/80 text-white'
      }`}>
        {/* Document Info */}
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold shadow-sm ${
            isAmber
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
          }`}>
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className={`text-xs sm:text-sm font-bold truncate max-w-[200px] sm:max-w-md ${isKh ? 'font-khmer' : ''}`}>
              {docTitle}
            </h3>
            <p className={`text-[11px] text-slate-400 ${isKh ? 'font-khmer' : ''}`}>
              {subjectName} · {isKh ? `ទំព័រទី ${currentPage} នៃ ${totalPages}` : `Page ${currentPage} of ${totalPages}`} · PDF 1.4
            </p>
          </div>
        </div>

        {/* Center: Controls (Scroll Mode vs Single Page vs Zoom) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-xl border border-slate-700/80 bg-slate-900/60 p-0.5 text-[11px]">
            <button
              onClick={() => setViewMode('scroll')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                viewMode === 'scroll'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              } ${isKh ? 'font-khmer' : ''}`}
              title="Continuous Scroll Mode (អូសមើលបន្តបន្ទាប់)"
            >
              <span>📜 {isKh ? 'អូសមើល' : 'Scroll'}</span>
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                viewMode === 'single'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              } ${isKh ? 'font-khmer' : ''}`}
              title="Single Page Mode (ម្តងមួយទំព័រ)"
            >
              <span>📄 {isKh ? 'ទំព័រ' : 'Page'}</span>
            </button>
            {pdfUrl && (
              <button
                onClick={() => setViewMode('embed')}
                className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                  viewMode === 'embed'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Browser Native PDF Frame"
              >
                <span>Embed</span>
              </button>
            )}
          </div>

          {/* Zoom controls */}
          <div className="hidden md:flex items-center gap-1 border-l border-slate-700/60 pl-2">
            <button
              onClick={handleZoomOut}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom Out (-)"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 py-1 rounded-lg text-[11px] font-mono font-semibold text-slate-300 hover:bg-slate-800"
              title="Reset Zoom (100%)"
            >
              {zoomLevel}%
            </button>
            <button
              onClick={handleZoomIn}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded-lg border border-slate-700/80 bg-slate-900/60 p-1.5 text-slate-400 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Reader'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Right: Actions (Download PDF & Print) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Print or Save as PDF"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print</span>
          </button>

          {/* PROMINENT DOWNLOAD BUTTON */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-lg transition-all active:scale-95 ${
              downloadSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : isAmber
                ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/25'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            } ${isKh ? 'font-khmer' : ''}`}
            title="Download PDF to computer/phone"
          >
            {downloadSuccess ? (
              <>
                <Check className="h-4 w-4" />
                <span>{isKh ? 'បានដោនលោតរួចរាល់!' : 'Downloaded!'}</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 animate-bounce" />
                <span>{isKh ? 'ដោនលោត PDF (Download)' : 'Download PDF'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PDF VIEWER CONTENT STAGE (SCROLLABLE OR EMBEDDED)                      */}
      {/* ========================================================================= */}
      <div className={`relative w-full overflow-x-auto overflow-y-auto max-h-[720px] p-4 sm:p-8 flex justify-center ${
        isLight ? 'bg-slate-200/80' : 'bg-slate-950/90'
      }`}>
        {viewMode === 'embed' && pdfUrl ? (
          /* Native Browser PDF Iframe */
          <div className="w-full max-w-4xl aspect-[16/10] min-h-[560px] rounded-xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-900">
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0`}
              title={docTitle}
              className="h-full w-full border-0"
            />
          </div>
        ) : (
          /* Multi-Page High-Fidelity Interactive PDF Document */
          <div
            className="flex flex-col items-center gap-8 transition-transform duration-200 origin-top"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            {pagesData
              .filter(p => (viewMode === 'scroll' ? true : p.pageNumber === currentPage))
              .map(page => (
                <div
                  key={page.pageNumber}
                  id={`pdf-page-${page.pageNumber}`}
                  className="relative w-full max-w-[760px] min-h-[960px] rounded-sm bg-white text-slate-900 p-8 sm:p-14 shadow-2xl border border-slate-300 flex flex-col justify-between transition-shadow select-text"
                >
                  {/* Watermark / Header Line */}
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-[11px] text-slate-500 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-600" />
                        <span className="font-bold text-slate-800 uppercase tracking-wider">{subjectName}</span>
                      </div>
                      <span>DEVLEARN IT PLATFORM · OFFICIAL COURSE DOCUMENT</span>
                    </div>

                    {/* Page Content Rendering */}
                    <div className="mt-8 space-y-6">
                      {/* PAGE 1: OVERVIEW */}
                      {page.type === 'overview' && (
                        <div className="space-y-6">
                          <div className="border-b border-slate-200 pb-6">
                            <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700 font-mono uppercase">
                              Lecture Notes · Module 01
                            </span>
                            <h1 className={`text-2xl sm:text-3xl font-extrabold text-slate-950 mt-3 tracking-tight ${isKh ? 'font-khmer' : ''}`}>
                              {lessonTitle}
                            </h1>
                            <p className="text-xs text-slate-500 mt-1">
                              Instructor: <span className="font-semibold text-slate-800">{instructorName}</span> · Date: 2026-02-01
                            </p>
                          </div>

                          <div className="space-y-3">
                            <h2 className={`text-sm font-bold text-slate-900 uppercase tracking-wider ${isKh ? 'font-khmer' : ''}`}>
                              1. Course Overview & Introduction
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                              {content ||
                                'This module introduces the architectural fundamentals, execution lifecycle, memory modeling, and engineering best practices for building robust modern IT solutions.'}
                            </p>
                          </div>

                          {/* Learning Objectives Box */}
                          <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-5 space-y-2">
                            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                              Target Learning Outcomes:
                            </h3>
                            <ul className="space-y-1.5 text-xs text-indigo-950 list-disc list-inside">
                              <li>Understand virtual environment isolation and dependency workflows</li>
                              <li>Master interpreted runtime compilation vs bytecode execution</li>
                              <li>Write clean, PEP-8 compliant scalable application logic</li>
                              <li>Perform automated debugging and modular function packaging</li>
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* PAGE 2: CONCEPTS & ARCHITECTURE */}
                      {page.type === 'concepts' && (
                        <div className="space-y-6">
                          <h2 className={`text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 ${isKh ? 'font-khmer' : ''}`}>
                            2. System Architecture & Runtime Lifecycle
                          </h2>

                          {/* Technical Diagram in PDF */}
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3 font-mono text-[11px]">
                            <p className="font-bold text-slate-800 uppercase tracking-wider">
                              [ Execution Architecture Flowchart ]
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
                              <div className="rounded-lg border border-slate-300 bg-white p-2">
                                <p className="font-bold text-indigo-600">Source (.py)</p>
                                <p className="text-[10px] text-slate-500">Developer Code</p>
                              </div>
                              <div className="flex items-center justify-center font-bold text-slate-400">➔</div>
                              <div className="rounded-lg border border-slate-300 bg-white p-2">
                                <p className="font-bold text-purple-600">Bytecode (.pyc)</p>
                                <p className="text-[10px] text-slate-500">CPython AST</p>
                              </div>
                              <div className="flex items-center justify-center font-bold text-slate-400">➔</div>
                            </div>
                            <p className="text-slate-600 text-[10px] mt-2 leading-relaxed">
                              The Python Virtual Machine (PVM) interprets bytecode into CPU instructions via platform-specific C runtime calls.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <h3 className="text-xs font-bold text-slate-900">Variables, Memory References & Scope</h3>
                            <p className="text-xs text-slate-700 leading-relaxed">
                              Variables in Python serve as symbolic references to allocated memory objects in the heap. Everything is an object, including primitive numbers, strings, and functions. Reference counting and cyclic garbage collection guarantee memory safety.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* PAGE 3: SLIDES & LECTURE POINTS */}
                      {page.type === 'slides' && (
                        <div className="space-y-6">
                          <h2 className={`text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 ${isKh ? 'font-khmer' : ''}`}>
                            3. Presentation Slides & Key Directives
                          </h2>

                          <div className="space-y-4">
                            {(slides.length > 0
                              ? slides
                              : [
                                  {
                                    title: 'Setting up Developer Environment',
                                    bullets: [
                                      'Install Python 3.12+ from official sources',
                                      'Configure VS Code with Python Language Server',
                                      'Isolate dependencies using: python -m venv .venv',
                                      'Activate virtual environment: source .venv/bin/activate'
                                    ],
                                    notes: 'Virtual environments prevent global package conflicts.'
                                  },
                                  {
                                    title: 'Language Philosophy & Zen',
                                    bullets: [
                                      'Beautiful is better than ugly',
                                      'Explicit is better than implicit',
                                      'Simple is better than complex',
                                      'Readability counts'
                                    ],
                                    notes: 'Follow clean code conventions for long-term maintainability.'
                                  }
                                ]
                            ).map((s, idx) => (
                              <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white font-mono">
                                    {idx + 1}
                                  </span>
                                  <span>{s.title}</span>
                                </h4>
                                <ul className="space-y-1 text-xs text-slate-700 pl-7 list-disc">
                                  {s.bullets.map((b, bIdx) => (
                                    <li key={bIdx}>{b}</li>
                                  ))}
                                </ul>
                                {s.notes && (
                                  <p className="text-[11px] text-indigo-700 pl-7 italic">
                                    Note: {s.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PAGE 4: CODE & EXERCISES */}
                      {page.type === 'exercises' && (
                        <div className="space-y-6">
                          <h2 className={`text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 ${isKh ? 'font-khmer' : ''}`}>
                            4. Code Implementation & Hands-on Exercises
                          </h2>

                          {/* Code snippet block in PDF */}
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-slate-700">Official Code Sample:</span>
                            <pre className="rounded-xl border border-slate-300 bg-slate-900 p-4 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed shadow-inner">
                              {codeSnippet || `# DevLearn IT Lesson Example
name = "Kiri Heng"
course = "Python Programming"
lessons = 10

print(f"Course: {course}")
print(f"Instructor: {name}")
print(f"Total Lessons: {lessons}")`}
                            </pre>
                          </div>

                          {/* Practice Exercises */}
                          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
                            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                              Hands-On Practice Exercises:
                            </h4>
                            <ol className="space-y-1.5 text-xs text-amber-950 list-decimal list-inside">
                              <li>Create a script that prompts user age and prints years remaining to retirement.</li>
                              <li>Calculate dynamic memory usage using sys.getsizeof() on various data types.</li>
                              <li>Build a CLI calculator handling addition, subtraction, multiplication, and division.</li>
                            </ol>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PDF Document Footer */}
                  <div className="mt-8 border-t border-slate-200 pt-4 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{docTitle}</span>
                    <span className="font-bold text-slate-700">
                      Page {page.pageNumber} of {totalPages}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM PAGE NAVIGATOR (FOR SINGLE PAGE OR SCROLL JUMP)                 */}
      {/* ========================================================================= */}
      <div className={`flex items-center justify-between px-6 py-3 border-t text-xs backdrop-blur-md ${
        isLight ? 'border-slate-200 bg-slate-50/95 text-slate-700' : 'border-slate-800 bg-slate-950/80 text-slate-300'
      }`}>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => {
              const prev = Math.max(1, currentPage - 1);
              setCurrentPage(prev);
              if (viewMode === 'scroll') {
                document.getElementById(`pdf-page-${prev}`)?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-900/60 px-2.5 py-1 text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{isKh ? 'ទំព័រមុន' : 'Previous'}</span>
          </button>

          <span className="font-mono text-xs">
            {isKh ? `ទំព័រ ${currentPage} នៃ ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
          </span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => {
              const next = Math.min(totalPages, currentPage + 1);
              setCurrentPage(next);
              if (viewMode === 'scroll') {
                document.getElementById(`pdf-page-${next}`)?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-900/60 px-2.5 py-1 text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span>{isKh ? 'ទំព័របន្ទាប់' : 'Next'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Quick jump to page buttons */}
        <div className="hidden sm:flex items-center gap-1.5">
          {pagesData.map(p => (
            <button
              key={p.pageNumber}
              onClick={() => {
                setCurrentPage(p.pageNumber);
                if (viewMode === 'scroll') {
                  document.getElementById(`pdf-page-${p.pageNumber}`)?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`h-7 w-7 rounded-lg font-mono text-xs font-bold transition-all ${
                currentPage === p.pageNumber
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-700/60 bg-slate-900/40 text-slate-400 hover:text-white'
              }`}
            >
              {p.pageNumber}
            </button>
          ))}
        </div>

        {/* Quick Download Anchor */}
        <button
          onClick={handleDownload}
          className={`inline-flex items-center gap-1 font-semibold ${
            isAmber ? 'text-amber-400 hover:underline' : 'text-indigo-400 hover:underline'
          } ${isKh ? 'font-khmer' : ''}`}
        >
          <Download className="h-3.5 w-3.5" />
          <span>{isKh ? 'ទាញយកឯកសារ (Download)' : 'Download Document'}</span>
        </button>
      </div>
    </div>
  );
};
