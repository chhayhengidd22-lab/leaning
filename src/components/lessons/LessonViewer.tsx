import React, { useState, useEffect } from 'react';
import { Lesson, CodeSnippet, SlidePage, QuizQuestion, LessonMaterial } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { PdfViewer } from './PdfViewer.tsx';
import { generateLessonPdfBlob, downloadBlobAsFile } from '../../utils/pdfGenerator.ts';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Copy,
  Check,
  FileText,
  Download,
  Maximize2,
  Minimize2,
  PlayCircle,
  BookOpen,
  HelpCircle,
  Bookmark,
  Share2,
  ExternalLink,
  Layers,
  Sparkles,
  Terminal,
  Volume2,
  Eye
} from 'lucide-react';

interface LessonViewerProps {
  lessonId: string;
  onBackToSubject: (subjectSlug: string) => void;
  onSelectLesson: (id: string) => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lessonId,
  onBackToSubject,
  onSelectLesson
}) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'slides' | 'pdf' | 'code' | 'video' | 'quiz' | 'materials'>('content');

  // Slide Deck state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSlideFullscreen, setIsSlideFullscreen] = useState(false);

  // PDF Viewer state
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(100);

  // Code Snippet state
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [selectedSnippetIndex, setSelectedSnippetIndex] = useState(0);

  // Quiz state
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Bookmark & Progress state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isKh = language === 'kh';

  useEffect(() => {
    setLoading(true);
    setCurrentSlideIndex(0);
    setPdfPage(1);
    setSelectedQuizAnswers({});
    setQuizSubmitted(false);

    api.getLesson(lessonId)
      .then(res => {
        if (res.success && res.data) {
          setLesson(res.data);
          // Set default tab if video is primary or content
          if (!res.data.content && res.data.videoUrl) {
            setActiveTab('video');
          }
        }
      })
      .catch(err => console.error('Failed to load lesson:', err))
      .finally(() => setLoading(false));

    // Check user bookmarks & progress
    if (user) {
      api.getBookmarks().then(res => {
        if (res.success && res.data) {
          const found = res.data.some(b => b.lessonId === lessonId);
          setIsBookmarked(found);
        }
      }).catch(() => {});

      api.getProgress().then(res => {
        if (res.success && res.data) {
          const found = res.data.some(p => p.completedLessonIds.includes(lessonId));
          setIsCompleted(found);
        }
      }).catch(() => {});
    }
  }, [lessonId, user]);

  const handleCopyCode = (snippet: CodeSnippet) => {
    navigator.clipboard.writeText(snippet.code);
    setCopiedSnippetId(snippet.id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const handleToggleBookmark = async () => {
    if (!lesson) return;
    try {
      const res = await api.toggleBookmark(lesson.subjectId, lesson.id);
      if (res.success && res.data) {
        setIsBookmarked(res.data.isBookmarked);
        showToast(res.data.isBookmarked ? 'Lesson saved to bookmarks' : 'Bookmark removed');
      }
    } catch {
      showToast('Please sign in to bookmark lessons');
    }
  };

  const handleToggleComplete = async () => {
    if (!lesson) return;
    try {
      const res = await api.toggleProgress(lesson.subjectId, lesson.id);
      if (res.success && res.data) {
        const completed = res.data.completedLessonIds.includes(lesson.id);
        setIsCompleted(completed);
        showToast(completed ? 'Lesson marked as completed!' : 'Lesson marked as incomplete');
      }
    } catch {
      showToast('Please sign in to save learning progress');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-r-transparent" />
        <p className="mt-3 text-xs text-slate-400">Loading interactive lesson modules...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-400">Lesson not found.</p>
        <button
          onClick={() => onBackToSubject('')}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </button>
      </div>
    );
  }

  const lessonTitle = isKh ? (lesson.titleKh || lesson.title) : lesson.title;
  const slides: SlidePage[] = lesson.slides || [];
  const codeSnippets: CodeSnippet[] = lesson.codeSnippets || [];
  const materials: LessonMaterial[] = lesson.materials || [];
  const quiz: QuizQuestion[] = lesson.quiz || [];

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-bottom">
          {toastMessage}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onBackToSubject(lesson.subjectSlug || lesson.subjectId)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{lesson.subjectName || t('learn.back')}</span>
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-medium text-slate-400">
              {t('learn.lesson')} {(lesson.lessonNumber || 1).toString().padStart(2, '0')}
            </span>
          </div>

          {/* Action triggers: Bookmark, Complete */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleBookmark}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                isBookmarked
                  ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current text-indigo-400' : ''}`} />
              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            <button
              onClick={handleToggleComplete}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors ${
                isCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>{isCompleted ? t('learn.completed') : t('learn.markComplete')}</span>
            </button>
          </div>
        </div>

        {/* Lesson Title Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
            <span>{lesson.subjectName}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{lesson.duration}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{lesson.level}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {lessonTitle}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
            {lesson.description}
          </p>
        </div>

        {/* Interactive Feature Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'content'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>{t('learn.tab.content')}</span>
          </button>

          {slides.length > 0 && (
            <button
              onClick={() => setActiveTab('slides')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'slides'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-4 w-4 text-purple-400" />
              <span>{t('learn.tab.slides')} ({slides.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('pdf')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'pdf'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-4 w-4 text-amber-400" />
            <span>{isKh ? 'ឯកសារ PDF (អូសមើល & ដោនលោត)' : t('learn.tab.pdf')}</span>
          </button>

          {codeSnippets.length > 0 && (
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'code'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span>{t('learn.tab.code')} ({codeSnippets.length})</span>
            </button>
          )}

          {lesson.videoUrl && (
            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'video'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlayCircle className="h-4 w-4 text-sky-400" />
              <span>{t('learn.tab.video')}</span>
            </button>
          )}

          {quiz.length > 0 && (
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'quiz'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="h-4 w-4 text-rose-400" />
              <span>{t('learn.tab.quiz')} ({quiz.length})</span>
            </button>
          )}

          {materials.length > 0 && (
            <button
              onClick={() => setActiveTab('materials')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'materials'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Download className="h-4 w-4 text-cyan-400" />
              <span>{t('learn.tab.materials')} ({materials.length})</span>
            </button>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: LESSON CONTENT (Overview & Detailed Explanations)                  */}
        {/* ========================================================================= */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
                <div
                  dangerouslySetInnerHTML={{
                    __html: lesson.content
                      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b border-slate-800 pb-2">$1</h2>')
                      .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-indigo-300 mt-4 mb-2">$1</h3>')
                      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300">$1</li>')
                      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-white">$1</strong>')
                      .replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-xs">$1</code>')
                      .replace(/\n\n/g, '<br/>')
                  }}
                />
              </div>

              {/* Code preview spotlight if available */}
              {codeSnippets.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-emerald-400" />
                      <span>{codeSnippets[0].title}</span>
                    </h3>
                    <button
                      onClick={() => handleCopyCode(codeSnippets[0])}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:text-white"
                    >
                      {copiedSnippetId === codeSnippets[0].id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>{t('learn.copyCode')}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
                    {codeSnippets[0].code}
                  </pre>
                </div>
              )}
            </div>

            {/* Sidebar: Lesson Navigation Summary */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <h3 className="text-sm font-bold text-white">Module Curriculum</h3>
                <div className="space-y-2">
                  {(lesson.allLessonsSummary || []).map((summary: any) => {
                    const isCurrent = summary.id === lesson.id;
                    return (
                      <button
                        key={summary.id}
                        onClick={() => onSelectLesson(summary.id)}
                        className={`w-full text-left rounded-xl p-3 text-xs transition-colors flex items-center justify-between ${
                          isCurrent
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="tabular-nums font-mono opacity-70">
                            {summary.lessonNumber.toString().padStart(2, '0')}.
                          </span>
                          <span className="truncate">{summary.title}</span>
                        </div>
                        <span className="text-[10px] opacity-70 shrink-0 ml-2">
                          {summary.duration}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Jump Buttons */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Interactive Modules
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {slides.length > 0 && (
                    <button
                      onClick={() => setActiveTab('slides')}
                      className="rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-left text-slate-300 hover:border-purple-500/50 hover:text-white"
                    >
                      <Layers className="h-4 w-4 text-purple-400 mb-1" />
                      <span>{slides.length} Slides</span>
                    </button>
                  )}
                  {lesson.pdfUrl && (
                    <button
                      onClick={() => setActiveTab('pdf')}
                      className="rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-left text-slate-300 hover:border-amber-500/50 hover:text-white"
                    >
                      <FileText className="h-4 w-4 text-amber-400 mb-1" />
                      <span>PDF Document</span>
                    </button>
                  )}
                  {lesson.videoUrl && (
                    <button
                      onClick={() => setActiveTab('video')}
                      className="rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-left text-slate-300 hover:border-sky-500/50 hover:text-white"
                    >
                      <PlayCircle className="h-4 w-4 text-sky-400 mb-1" />
                      <span>Video Lesson</span>
                    </button>
                  )}
                  {quiz.length > 0 && (
                    <button
                      onClick={() => setActiveTab('quiz')}
                      className="rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-left text-slate-300 hover:border-rose-500/50 hover:text-white"
                    >
                      <HelpCircle className="h-4 w-4 text-rose-400 mb-1" />
                      <span>Quiz Tester</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: INTERACTIVE PRESENTATION SLIDE DECK                                */}
        {/* ========================================================================= */}
        {activeTab === 'slides' && slides.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl space-y-4 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Presentation Deck — Slide {currentSlideIndex + 1} of {slides.length}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSlideFullscreen(!isSlideFullscreen)}
                  className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white"
                  title="Toggle Fullscreen"
                >
                  {isSlideFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Slide Viewer Stage */}
            <div className={`relative rounded-xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-12 min-h-[380px] flex flex-col justify-between ${isSlideFullscreen ? 'min-h-[500px]' : ''}`}>
              <div className="space-y-6">
                <div className="flex items-center justify-between text-xs text-purple-400 font-mono">
                  <span>DEVLEARN SLIDES · {lesson.subjectName}</span>
                  <span className="tabular-nums">0{currentSlideIndex + 1} / 0{slides.length}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight border-b border-slate-800/80 pb-4">
                  {slides[currentSlideIndex].title}
                </h2>

                <ul className="space-y-4 text-sm sm:text-base text-slate-300 max-w-3xl">
                  {slides[currentSlideIndex].bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex h-2 w-2 rounded-full bg-purple-400 mt-2 shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Speaker Notes Callout */}
              {slides[currentSlideIndex].notes && (
                <div className="mt-8 rounded-xl border border-purple-500/20 bg-purple-950/20 p-4 text-xs text-purple-200">
                  <span className="font-bold text-purple-300">Instructor Note: </span>
                  {slides[currentSlideIndex].notes}
                </div>
              )}
            </div>

            {/* Slide Navigation Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={currentSlideIndex === 0}
                onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Slide
              </button>

              {/* Slide thumbnail / indicator bar */}
              <div className="flex items-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlideIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentSlideIndex ? 'w-6 bg-purple-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                    }`}
                    title={`Slide ${i + 1}`}
                  />
                ))}
              </div>

              <button
                disabled={currentSlideIndex === slides.length - 1}
                onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next Slide
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: INTERACTIVE SCROLLABLE PDF VIEWER & DOWNLOADER                     */}
        {/* ========================================================================= */}
        {activeTab === 'pdf' && (
          <PdfViewer
            pdfUrl={lesson.pdfUrl}
            pdfTitle={lesson.pdfTitle}
            lessonTitle={lessonTitle}
            subjectName={lesson.subjectName || 'IT Subject'}
            instructorName={lesson.instructorName || 'Kiri Heng'}
            content={lesson.content}
            slides={slides}
            codeSnippet={codeSnippets[0]?.code}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CODE PLAYGROUND & SYNTAX SNIPPETS                                  */}
        {/* ========================================================================= */}
        {activeTab === 'code' && codeSnippets.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Snippet selector tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                {codeSnippets.map((snippet, idx) => (
                  <button
                    key={snippet.id}
                    onClick={() => setSelectedSnippetIndex(idx)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      idx === selectedSnippetIndex
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {snippet.title}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-emerald-400 uppercase font-semibold">
                  {codeSnippets[selectedSnippetIndex].language}
                </span>

                <button
                  onClick={() => handleCopyCode(codeSnippets[selectedSnippetIndex])}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
                >
                  {copiedSnippetId === codeSnippets[selectedSnippetIndex].id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>{t('learn.copyCode')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Block Container */}
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 overflow-x-auto font-mono text-xs text-slate-200 leading-relaxed shadow-inner">
                <pre>{codeSnippets[selectedSnippetIndex].code}</pre>
              </div>

              {codeSnippets[selectedSnippetIndex].explanation && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-emerald-400">Code Architecture: </span>
                  {codeSnippets[selectedSnippetIndex].explanation}
                </div>
              )}

              {codeSnippets[selectedSnippetIndex].expectedOutput && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono">
                    Terminal Console Output
                  </span>
                  <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap">
                    {codeSnippets[selectedSnippetIndex].expectedOutput}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: VIDEO LESSON PLAYER                                                */}
        {/* ========================================================================= */}
        {activeTab === 'video' && lesson.videoUrl && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Video Demonstration</h3>
              </div>
            </div>

            <div className="relative aspect-video w-full rounded-xl border border-slate-800 bg-black overflow-hidden shadow-2xl">
              {lesson.videoType === 'youtube' || lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={lesson.videoUrl}
                  title={lesson.title}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={lesson.videoUrl}
                  controls
                  className="h-full w-full"
                  poster={lesson.thumbnail}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: PRACTICE QUIZ                                                      */}
        {/* ========================================================================= */}
        {activeTab === 'quiz' && quiz.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-rose-400" />
                  <span>Interactive Knowledge Check</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Test your understanding of the concepts covered in this lesson.
                </p>
              </div>
              {quizSubmitted && (
                <button
                  onClick={() => {
                    setSelectedQuizAnswers({});
                    setQuizSubmitted(false);
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white"
                >
                  Retry Quiz
                </button>
              )}
            </div>

            <div className="space-y-6">
              {quiz.map((q, qIndex) => {
                const selectedOption = selectedQuizAnswers[q.id];
                const isAnswered = selectedOption !== undefined;

                return (
                  <div key={q.id} className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 space-y-4">
                    <p className="text-sm font-semibold text-white">
                      <span className="text-indigo-400 mr-2">Q{qIndex + 1}.</span>
                      {q.question}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((option, optIndex) => {
                        const isSelected = selectedOption === optIndex;
                        let optionStyle = 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700';

                        if (quizSubmitted) {
                          if (optIndex === q.correctAnswer) {
                            optionStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200 font-semibold';
                          } else if (isSelected && optIndex !== q.correctAnswer) {
                            optionStyle = 'border-rose-500 bg-rose-950/40 text-rose-200 line-through';
                          }
                        } else if (isSelected) {
                          optionStyle = 'border-indigo-500 bg-indigo-950/50 text-white font-semibold ring-1 ring-indigo-500';
                        }

                        return (
                          <button
                            key={optIndex}
                            disabled={quizSubmitted}
                            onClick={() => {
                              setSelectedQuizAnswers(prev => ({ ...prev, [q.id]: optIndex }));
                            }}
                            className={`w-full text-left rounded-xl border p-3.5 text-xs transition-colors flex items-center justify-between ${optionStyle}`}
                          >
                            <span>{option}</span>
                            {quizSubmitted && optIndex === q.correctAnswer && (
                              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs text-slate-300">
                        <span className="font-bold text-indigo-400">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!quizSubmitted ? (
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  disabled={Object.keys(selectedQuizAnswers).length !== quiz.length}
                  onClick={() => setQuizSubmitted(true)}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Answers ({Object.keys(selectedQuizAnswers).length}/{quiz.length})
                </button>
              </div>
            ) : (
              <div className="rounded-xl bg-indigo-950/40 border border-indigo-500/30 p-4 text-center text-xs text-indigo-200 font-semibold">
                Quiz completed! Score: {
                  quiz.filter(q => selectedQuizAnswers[q.id] === q.correctAnswer).length
                } / {quiz.length} Correct.
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: DOWNLOADABLE MATERIALS                                             */}
        {/* ========================================================================= */}
        {activeTab === 'materials' && materials.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="h-5 w-5 text-cyan-400" />
              <span>Downloadable Learning Resources</span>
            </h3>
            <p className="text-xs text-slate-400">
              Verified files and slides associated with this lesson.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {materials.map(mat => (
                <div
                  key={mat.id}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white">{mat.title}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span className="uppercase">{mat.fileType}</span>
                      <span>·</span>
                      <span>{mat.fileSize}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {mat.fileType.toLowerCase() === 'pdf' && (
                      <button
                        onClick={() => setActiveTab('pdf')}
                        className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
                        title="View and Scroll PDF document"
                      >
                        <Eye className="h-3.5 w-3.5 text-amber-400" />
                        <span>{isKh ? 'អូសមើល' : 'View'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const blob = generateLessonPdfBlob(
                          mat.title,
                          lesson.subjectName || 'IT Subject',
                          'Kiri Heng',
                          lesson.content,
                          slides
                        );
                        downloadBlobAsFile(blob, mat.fileName || `${mat.title}.pdf`);
                        showToast(isKh ? 'បានទាញយកឯកសាររួចរាល់!' : 'File downloaded successfully!');
                      }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-md"
                      title={`Download ${mat.fileName}`}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BOTTOM NAVIGATION: PREVIOUS LESSON / NEXT LESSON                          */}
        {/* ========================================================================= */}
        <div className="pt-8 border-t border-slate-800 flex items-center justify-between gap-4">
          {lesson.prevLesson ? (
            <button
              onClick={() => onSelectLesson(lesson.prevLesson.id)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <div className="text-left">
                <span className="block text-[10px] text-slate-500 uppercase">{t('learn.prev')}</span>
                <span className="truncate max-w-[150px] sm:max-w-xs">{lesson.prevLesson.title}</span>
              </div>
            </button>
          ) : (
            <div />
          )}

          {lesson.nextLesson ? (
            <button
              onClick={() => onSelectLesson(lesson.nextLesson.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition-colors"
            >
              <div className="text-right">
                <span className="block text-[10px] text-indigo-200 uppercase">{t('learn.next')}</span>
                <span className="truncate max-w-[150px] sm:max-w-xs">{lesson.nextLesson.title}</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => onBackToSubject(lesson.subjectSlug || lesson.subjectId)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition-colors"
            >
              <span>Course Completed! View Curriculum</span>
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
