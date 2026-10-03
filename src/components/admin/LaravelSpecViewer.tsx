import React, { useState } from 'react';
import { Code2, Database, Shield, Server, FileText, CheckCircle, Copy } from 'lucide-react';

export const LaravelSpecViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'routes' | 'migrations' | 'controllers' | 'models'>('routes');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const routesPhp = `<?php

use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\Api\\AuthController;
use App\\Http\\Controllers\\Api\\SubjectController;
use App\\Http\\Controllers\\Api\\CategoryController;
use App\\Http\\Controllers\\Api\\LessonController;
use App\\Http\\Controllers\\Api\\MaterialController;
use App\\Http\\Controllers\\Api\\SettingController;
use App\\Http\\Controllers\\Api\\ProgressController;
use App\\Http\\Controllers\\Api\\AdminDashboardController;

/*
|--------------------------------------------------------------------------
| DevLearn IT Platform - Laravel REST API Routes (routes/api.php)
|--------------------------------------------------------------------------
*/

// Public Endpoints
Route::get('/settings', [SettingController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/subjects', [SubjectController::class, 'index']);
Route::get('/subjects/{slug}', [SubjectController::class, 'show']);
Route::get('/subjects/{slug}/lessons', [SubjectController::class, 'lessons']);
Route::get('/lessons/{id}', [LessonController::class, 'show']);
Route::get('/materials', [MaterialController::class, 'index']);
Route::get('/search', [SubjectController::class, 'search']);

// Authentication Routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Protected Student & User Routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'changePassword']);

    Route::get('/progress', [ProgressController::class, 'index']);
    Route::post('/progress/toggle', [ProgressController::class, 'toggle']);
    Route::get('/bookmarks', [ProgressController::class, 'bookmarks']);
    Route::post('/bookmarks/toggle', [ProgressController::class, 'toggleBookmark']);
    Route::post('/upload', [MaterialController::class, 'upload']);
});

// Protected Admin Management Routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);
    Route::get('/activity-logs', [AdminDashboardController::class, 'activityLogs']);
    Route::get('/users', [AdminDashboardController::class, 'users']);
    Route::put('/users/{id}/status', [AdminDashboardController::class, 'toggleUserStatus']);

    Route::apiResource('subjects', SubjectController::class)->except(['index', 'show']);
    Route::apiResource('categories', CategoryController::class)->except(['index']);
    Route::apiResource('lessons', LessonController::class)->except(['show']);
    Route::apiResource('materials', MaterialController::class)->except(['index']);

    Route::put('/settings', [SettingController::class, 'update']);
});`;

  const migrationsPhp = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Categories Table
        Schema::create('categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->string('name_kh')->nullable();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->default('Code');
            $table->string('color')->default('#38bdf8');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Subjects Table
        Schema::create('subjects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('category_id')->constrained('categories')->cascadeOnDelete();
            $table->string('name');
            $table->string('name_kh')->nullable();
            $table->string('slug')->unique();
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->enum('level', ['Beginner', 'Intermediate', 'Advanced', 'Beginner → Advanced']);
            $table->string('cover_image');
            $table->string('icon')->default('BookOpen');
            $table->boolean('is_published')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->json('learning_objectives')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. Lessons Table
        Schema::create('lessons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->integer('lesson_number');
            $table->string('title');
            $table->string('title_kh')->nullable();
            $table->string('slug');
            $table->string('duration')->default('20 mins');
            $table->text('description')->nullable();
            $table->longText('content')->nullable();
            $table->string('video_type')->nullable(); // youtube, vimeo, upload
            $table->string('video_url')->nullable();
            $table->string('pdf_title')->nullable();
            $table->string('pdf_url')->nullable();
            $table->json('code_snippets')->nullable();
            $table->json('slides')->nullable();
            $table->json('quiz')->nullable();
            $table->boolean('is_published')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 4. Lesson Materials Table
        Schema::create('lesson_materials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('lesson_id')->nullable()->constrained('lessons')->nullOnDelete();
            $table->string('title');
            $table->string('file_name');
            $table->string('file_type'); // pdf, ppt, pptx, zip
            $table->string('file_size');
            $table->string('file_url');
            $table->boolean('downloadable')->default(true);
            $table->timestamps();
        });
    }
};`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Code2 className="h-4 w-4 text-indigo-400" />
            <span>Laravel REST Backend Architecture Specification</span>
          </h2>
          <p className="text-xs text-slate-400">
            Enterprise dual-project structure: <code className="text-indigo-300">it-learning-backend</code> (Laravel 11 REST API) &amp; <code className="text-indigo-300">it-learning-frontend</code> (Client UI).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(activeTab === 'routes' ? routesPhp : migrationsPhp)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 hover:text-white"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'routes' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          routes/api.php
        </button>
        <button
          onClick={() => setActiveTab('migrations')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'migrations' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          database/migrations/*.php
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 overflow-x-auto shadow-2xl font-mono text-xs text-slate-200 leading-relaxed">
        <pre>{activeTab === 'routes' ? routesPhp : migrationsPhp}</pre>
      </div>
    </div>
  );
};
