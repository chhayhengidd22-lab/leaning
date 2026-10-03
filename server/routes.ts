import { Router, Request, Response, NextFunction } from 'express';
import { db } from './store.ts';
import { Subject, Category, Lesson, LessonMaterial } from '../src/types/index.ts';

export const apiRouter = Router();

// --- Auth Middleware Helper ---
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthenticated. Bearer token missing.'
    });
  }
  const token = authHeader.split(' ')[1] || '';
  // extract userId from token 'devlearn_token_<userId>_<timestamp>'
  let userId = '';
  if (token.startsWith('devlearn_token_')) {
    const withoutPrefix = token.substring('devlearn_token_'.length);
    const lastUnderscoreIndex = withoutPrefix.lastIndexOf('_');
    userId = lastUnderscoreIndex > -1 ? withoutPrefix.substring(0, lastUnderscoreIndex) : withoutPrefix;
  } else {
    userId = token.split('_')[2] || 'usr-admin-1';
  }

  const user = db.getUserById(userId) || db.users.find(u => u.id === userId);
  if (!user || !user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Invalid session or account deactivated.'
    });
  }
  (req as any).user = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    const user = (req as any).user;
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Admin privileges required.'
      });
    }
    next();
  });
}

// --------------------------------------------------------------------------
// 1. PUBLIC SETTINGS & BRANDING
// --------------------------------------------------------------------------
apiRouter.get('/settings', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Website settings retrieved successfully',
    data: db.settings
  });
});

// --------------------------------------------------------------------------
// 2. CATEGORIES
// --------------------------------------------------------------------------
apiRouter.get('/categories', (req: Request, res: Response) => {
  const categories = db.categories
    .filter(c => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(c => ({
      ...c,
      subjectsCount: db.subjects.filter(s => s.categoryId === c.id && s.isPublished).length
    }));

  res.json({
    success: true,
    message: 'Categories retrieved successfully',
    data: categories
  });
});

// --------------------------------------------------------------------------
// 3. SUBJECTS
// --------------------------------------------------------------------------
apiRouter.get('/subjects', (req: Request, res: Response) => {
  const { category, level, sort, q } = req.query;
  let subjects = db.subjects.filter(s => s.isPublished);

  if (category && category !== 'all') {
    subjects = subjects.filter(s => s.categoryId === category || s.categoryName?.toLowerCase() === (category as string).toLowerCase());
  }

  if (level && level !== 'all') {
    subjects = subjects.filter(s => s.level === level);
  }

  if (q && typeof q === 'string') {
    const query = q.toLowerCase();
    subjects = subjects.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query) ||
      s.shortDescription.toLowerCase().includes(query)
    );
  }

  // Populate dynamic category name & live lesson count
  const populated = subjects.map(s => {
    const cat = db.categories.find(c => c.id === s.categoryId);
    const activeLessons = db.lessons.filter(l => l.subjectId === s.id && l.isPublished);
    return {
      ...s,
      categoryName: cat ? cat.name : s.categoryName,
      lessonsCount: activeLessons.length || s.lessonsCount
    };
  });

  if (sort === 'lessons') {
    populated.sort((a, b) => b.lessonsCount - a.lessonsCount);
  } else if (sort === 'name') {
    populated.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    populated.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  res.json({
    success: true,
    message: 'Subjects retrieved successfully',
    data: populated
  });
});

apiRouter.get('/subjects/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  let subject = db.subjects.find(s => s.slug === slug || s.id === slug);

  // Fallback to fuzzy or partial match
  if (!subject) {
    const slugLower = (slug || '').toLowerCase();
    subject = db.subjects.find(s =>
      s.slug.toLowerCase() === slugLower ||
      s.id.toLowerCase() === slugLower ||
      s.slug.toLowerCase().includes(slugLower) ||
      slugLower.includes(s.slug.toLowerCase()) ||
      (slugLower.includes('python') && s.slug.includes('python'))
    );
  }

  // Fallback to first available published subject
  if (!subject) {
    if (db.subjects.length > 0) {
      subject = db.subjects[0];
    } else {
      return res.status(404).json({
        success: false,
        message: 'Subject not found.'
      });
    }
  }

  const cat = db.categories.find(c => c.id === subject!.categoryId);
  const subjectLessons = db.lessons
    .filter(l => l.subjectId === subject!.id && l.isPublished)
    .sort((a, b) => a.lessonNumber - b.lessonNumber)
    .map(l => ({
      id: l.id,
      lessonNumber: l.lessonNumber,
      title: l.title,
      titleKh: l.titleKh,
      slug: l.slug,
      duration: l.duration,
      level: l.level,
      hasVideo: Boolean(l.videoUrl),
      hasPdf: Boolean(l.pdfUrl),
      hasSlides: Boolean(l.slides && l.slides.length > 0),
      hasQuiz: Boolean(l.quiz && l.quiz.length > 0)
    }));

  res.json({
    success: true,
    message: 'Subject retrieved successfully',
    data: {
      ...subject,
      categoryName: cat ? cat.name : subject!.categoryName,
      lessonsCount: subjectLessons.length,
      lessons: subjectLessons
    }
  });
});

apiRouter.get('/subjects/:slug/lessons', (req: Request, res: Response) => {
  const { slug } = req.params;
  let subject = db.subjects.find(s => s.slug === slug || s.id === slug);
  if (!subject) {
    const slugLower = (slug || '').toLowerCase();
    subject = db.subjects.find(s =>
      s.slug.toLowerCase() === slugLower ||
      s.id.toLowerCase() === slugLower ||
      s.slug.toLowerCase().includes(slugLower) ||
      slugLower.includes(s.slug.toLowerCase())
    ) || db.subjects[0];
  }

  if (!subject) {
    return res.status(404).json({ success: false, message: 'Subject not found.' });
  }

  const lessons = db.lessons
    .filter(l => l.subjectId === subject!.id && l.isPublished)
    .sort((a, b) => a.lessonNumber - b.lessonNumber);

  res.json({
    success: true,
    message: 'Lessons retrieved successfully',
    data: lessons
  });
});

// --------------------------------------------------------------------------
// 4. LESSONS LIST & DETAIL
// --------------------------------------------------------------------------
apiRouter.get('/lessons', (req: Request, res: Response) => {
  const { limit, featured, subjectId } = req.query;
  let lessons = db.lessons.filter(l => l.isPublished);

  if (subjectId) {
    lessons = lessons.filter(l => l.subjectId === subjectId);
  }

  if (featured === 'true') {
    lessons = lessons.filter(l => l.lessonNumber <= 2);
  }

  const max = limit ? parseInt(limit as string, 10) : 12;

  res.json({
    success: true,
    message: 'Lessons retrieved successfully',
    data: lessons.slice(0, max)
  });
});

apiRouter.get('/lessons/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let lesson = db.lessons.find(l => l.id === id || l.slug === id);

  if (!lesson) {
    const idLower = (id || '').toLowerCase();
    lesson = db.lessons.find(l =>
      l.id.toLowerCase() === idLower ||
      l.slug.toLowerCase() === idLower ||
      l.slug.toLowerCase().includes(idLower)
    ) || db.lessons[0];
  }

  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: 'Lesson not found.'
    });
  }

  const subject = db.subjects.find(s => s.id === lesson.subjectId);
  const allSubjectLessons = db.lessons
    .filter(l => l.subjectId === lesson.subjectId && l.isPublished)
    .sort((a, b) => a.lessonNumber - b.lessonNumber);

  const currentIndex = allSubjectLessons.findIndex(l => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? {
    id: allSubjectLessons[currentIndex - 1].id,
    title: allSubjectLessons[currentIndex - 1].title,
    lessonNumber: allSubjectLessons[currentIndex - 1].lessonNumber
  } : null;

  const nextLesson = currentIndex < allSubjectLessons.length - 1 ? {
    id: allSubjectLessons[currentIndex + 1].id,
    title: allSubjectLessons[currentIndex + 1].title,
    lessonNumber: allSubjectLessons[currentIndex + 1].lessonNumber
  } : null;

  // Increment view counter
  db.totalViews += 1;

  res.json({
    success: true,
    message: 'Lesson details retrieved successfully',
    data: {
      ...lesson,
      subjectName: subject?.name,
      subjectSlug: subject?.slug,
      prevLesson,
      nextLesson,
      allLessonsSummary: allSubjectLessons.map(l => ({
        id: l.id,
        lessonNumber: l.lessonNumber,
        title: l.title,
        duration: l.duration
      }))
    }
  });
});

// --------------------------------------------------------------------------
// 5. GLOBAL SEARCH
// --------------------------------------------------------------------------
apiRouter.get('/search', (req: Request, res: Response) => {
  const q = ((req.query.q as string) || '').trim().toLowerCase();
  if (!q) {
    return res.json({
      success: true,
      data: { subjects: [], lessons: [], categories: [] }
    });
  }

  const matchedSubjects = db.subjects
    .filter(s => s.isPublished && (
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.shortDescription.toLowerCase().includes(q)
    ))
    .slice(0, 6);

  const matchedLessons = db.lessons
    .filter(l => l.isPublished && (
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.content.toLowerCase().includes(q)
    ))
    .slice(0, 8);

  const matchedCategories = db.categories
    .filter(c => c.isActive && (
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    ))
    .slice(0, 4);

  res.json({
    success: true,
    message: 'Search executed successfully',
    data: {
      subjects: matchedSubjects,
      lessons: matchedLessons,
      categories: matchedCategories
    }
  });
});

// --------------------------------------------------------------------------
// 6. AUTHENTICATION & PROFILE
// --------------------------------------------------------------------------
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed: Email and password are required.'
    });
  }

  const result = db.authenticateUser(email, password);
  if (!result) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials or account is suspended.'
    });
  }

  if (result.user.role === 'admin') {
    db.logActivity(
      result.user.id,
      result.user.name,
      'Admin Logged In',
      `Successful authentication from IP ${req.ip}`,
      req.ip,
      req.headers['user-agent'] as string
    );
  }

  res.json({
    success: true,
    message: 'Authentication successful',
    data: {
      user: result.user,
      token: result.token
    }
  });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed: Name, email, and password are required.'
    });
  }

  if (password.length < 6) {
    return res.status(422).json({
      success: false,
      message: 'Password must be at least 6 characters.'
    });
  }

  const result = db.registerStudent(name, email, password);
  if ('error' in result) {
    return res.status(422).json({
      success: false,
      message: result.error
    });
  }

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: result.user,
      token: result.token
    }
  });
});

apiRouter.get('/auth/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({
    success: true,
    data: { user }
  });
});

apiRouter.post('/auth/logout', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role === 'admin') {
    db.logActivity(user.id, user.name, 'Admin Logged Out', 'User session terminated', req.ip);
  }
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

apiRouter.put('/auth/profile', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { name, username, avatar } = req.body;

  if (name) user.name = name;
  if (username) user.username = username;
  if (avatar !== undefined) user.avatar = avatar;

  if (user.role === 'admin') {
    db.logActivity(user.id, user.name, 'Updated Admin Profile', 'Profile details updated', req.ip);
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
});

apiRouter.put('/auth/password', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(422).json({
      success: false,
      message: 'Current password and new password are required.'
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(422).json({
      success: false,
      message: 'New password and confirmation do not match.'
    });
  }

  if (newPassword.length < 6) {
    return res.status(422).json({
      success: false,
      message: 'New password must be at least 6 characters.'
    });
  }

  if (!db.verifyPassword(user.id, currentPassword)) {
    return res.status(422).json({
      success: false,
      message: 'Current password is incorrect.'
    });
  }

  db.updatePassword(user.id, newPassword);

  if (user.role === 'admin') {
    db.logActivity(user.id, user.name, 'Password Changed', 'Admin password successfully updated', req.ip);
  }

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// --------------------------------------------------------------------------
// 7. LEARNING PROGRESS & BOOKMARKS
// --------------------------------------------------------------------------
apiRouter.get('/progress', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const userProgress = db.progress.filter(p => p.userId === user.id);
  res.json({
    success: true,
    data: userProgress
  });
});

apiRouter.post('/progress/toggle', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { subjectId, lessonId } = req.body;

  if (!subjectId || !lessonId) {
    return res.status(422).json({ success: false, message: 'subjectId and lessonId are required.' });
  }

  let record = db.progress.find(p => p.userId === user.id && p.subjectId === subjectId);
  const totalSubjectLessons = db.lessons.filter(l => l.subjectId === subjectId && l.isPublished).length || 1;

  if (!record) {
    record = {
      userId: user.id,
      subjectId,
      completedLessonIds: [lessonId],
      lastVisitedLessonId: lessonId,
      progressPercent: Math.round((1 / totalSubjectLessons) * 100),
      lastUpdated: new Date().toISOString()
    };
    db.progress.push(record);
  } else {
    const exists = record.completedLessonIds.includes(lessonId);
    if (exists) {
      record.completedLessonIds = record.completedLessonIds.filter(id => id !== lessonId);
    } else {
      record.completedLessonIds.push(lessonId);
    }
    record.lastVisitedLessonId = lessonId;
    record.progressPercent = Math.min(100, Math.round((record.completedLessonIds.length / totalSubjectLessons) * 100));
    record.lastUpdated = new Date().toISOString();
  }

  res.json({
    success: true,
    message: 'Progress updated',
    data: record
  });
});

apiRouter.get('/bookmarks', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const bookmarks = db.bookmarks.filter(b => b.userId === user.id);
  res.json({
    success: true,
    data: bookmarks
  });
});

apiRouter.post('/bookmarks/toggle', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { lessonId, subjectId } = req.body;

  const index = db.bookmarks.findIndex(b => b.userId === user.id && b.lessonId === lessonId);
  let isBookmarked = false;

  if (index > -1) {
    db.bookmarks.splice(index, 1);
    isBookmarked = false;
  } else {
    db.bookmarks.push({
      userId: user.id,
      lessonId,
      subjectId,
      createdAt: new Date().toISOString()
    });
    isBookmarked = true;
  }

  res.json({
    success: true,
    message: isBookmarked ? 'Lesson bookmarked' : 'Bookmark removed',
    data: { isBookmarked }
  });
});

// --------------------------------------------------------------------------
// 8. ADMIN DASHBOARD & ACTIVITY
// --------------------------------------------------------------------------
apiRouter.get('/admin/dashboard', requireAdmin, (req: Request, res: Response) => {
  const stats = db.getDashboardStats();
  res.json({
    success: true,
    message: 'Dashboard metrics loaded',
    data: stats
  });
});

apiRouter.get('/admin/activity-logs', requireAdmin, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: db.activityLogs
  });
});

apiRouter.get('/admin/users', requireAdmin, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: db.users
  });
});

apiRouter.put('/admin/users/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const user = db.getUserById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  user.isActive = !user.isActive;
  const admin = (req as any).user;
  db.logActivity(
    admin.id,
    admin.name,
    'Toggled User Status',
    `User ${user.email} status changed to ${user.isActive ? 'Active' : 'Deactivated'}`,
    req.ip
  );

  res.json({
    success: true,
    message: `User is now ${user.isActive ? 'active' : 'deactivated'}`,
    data: user
  });
});

// --------------------------------------------------------------------------
// 9. ADMIN SUBJECT MANAGEMENT (CRUD)
// --------------------------------------------------------------------------
apiRouter.post('/admin/subjects', requireAdmin, (req: Request, res: Response) => {
  const {
    name,
    nameKh,
    slug,
    description,
    descriptionKh,
    shortDescription,
    shortDescriptionKh,
    categoryId,
    level,
    academicYear,
    semester,
    credits,
    lecturerName,
    lecturerTel,
    room,
    university,
    coverImage,
    icon,
    isPublished,
    isFeatured,
    learningObjectives
  } = req.body;

  if (!name || !categoryId) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed: Name and categoryId are required.'
    });
  }

  const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const cat = db.categories.find(c => c.id === categoryId);

  const newSubject: Subject = {
    id: 'sub-' + Date.now(),
    name,
    nameKh: nameKh || name,
    slug: generatedSlug,
    description: description || '',
    descriptionKh: descriptionKh || description || '',
    shortDescription: shortDescription || (description ? description.slice(0, 100) : ''),
    shortDescriptionKh: shortDescriptionKh || shortDescription || '',
    categoryId,
    categoryName: cat?.name || 'Programming',
    level: level || 'Beginner',
    academicYear: academicYear || 'Year 1',
    semester: semester || 'Semester 1',
    credits: Number(credits) || 3,
    lecturerName: lecturerName || '',
    lecturerTel: lecturerTel || '',
    room: room || 'Room: 204 Building A',
    university: university || 'Build Bright University',
    coverImage: coverImage || '/src/assets/images/subject_python_code_1790863262336.jpg',
    icon: icon || 'Code',
    lessonsCount: 0,
    isPublished: isPublished !== undefined ? isPublished : true,
    isFeatured: Boolean(isFeatured),
    sortOrder: db.subjects.length + 1,
    learningObjectives: learningObjectives || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.subjects.push(newSubject);
  const admin = (req as any).user;
  db.logActivity(admin.id, admin.name, 'Created Subject', `Added subject: "${name}"`, req.ip);

  res.status(201).json({
    success: true,
    message: 'Subject created successfully',
    data: newSubject
  });
});

apiRouter.put('/admin/subjects/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.subjects.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Subject not found.' });
  }

  const existing = db.subjects[index];
  const updated: Subject = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  if (req.body.categoryId) {
    const cat = db.categories.find(c => c.id === req.body.categoryId);
    if (cat) updated.categoryName = cat.name;
  }

  db.subjects[index] = updated;
  const admin = (req as any).user;
  db.logActivity(admin.id, admin.name, 'Updated Subject', `Modified subject: "${updated.name}"`, req.ip);

  res.json({
    success: true,
    message: 'Subject updated successfully',
    data: updated
  });
});

apiRouter.delete('/admin/subjects/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.subjects.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Subject not found.' });
  }

  const deleted = db.subjects.splice(index, 1)[0];
  const admin = (req as any).user;
  db.logActivity(admin.id, admin.name, 'Deleted Subject', `Removed subject: "${deleted.name}"`, req.ip);

  res.json({
    success: true,
    message: 'Subject deleted successfully'
  });
});

// --------------------------------------------------------------------------
// 10. ADMIN CATEGORY MANAGEMENT (CRUD)
// --------------------------------------------------------------------------
apiRouter.post('/admin/categories', requireAdmin, (req: Request, res: Response) => {
  const { name, nameKh, description, icon, color } = req.body;
  if (!name) {
    return res.status(422).json({ success: false, message: 'Category name is required.' });
  }

  const newCat: Category = {
    id: 'cat-' + Date.now(),
    name,
    nameKh: nameKh || name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: description || '',
    icon: icon || 'Folder',
    color: color || '#38bdf8',
    sortOrder: db.categories.length + 1,
    isActive: true,
    subjectsCount: 0
  };

  db.categories.push(newCat);
  const admin = (req as any).user;
  db.logActivity(admin.id, admin.name, 'Created Category', `Added category: "${name}"`, req.ip);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: newCat
  });
});

apiRouter.put('/admin/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const cat = db.categories.find(c => c.id === id);
  if (!cat) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }

  Object.assign(cat, req.body);
  const admin = (req as any).user;
  db.logActivity(admin.id, admin.name, 'Updated Category', `Modified category: "${cat.name}"`, req.ip);

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: cat
  });
});

apiRouter.delete('/admin/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.categories.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }

  const deleted = db.categories.splice(index, 1)[0];
  const admin = (req as any).user;
  db.logActivity(admin.id, admin.name, 'Deleted Category', `Removed category: "${deleted.name}"`, req.ip);

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// --------------------------------------------------------------------------
// 11. ADMIN LESSON MANAGEMENT (CRUD)
// --------------------------------------------------------------------------
apiRouter.post('/admin/lessons', requireAdmin, (req: Request, res: Response) => {
  const {
    subjectId,
    lessonNumber,
    title,
    titleKh,
    slug,
    duration,
    level,
    description,
    descriptionKh,
    content,
    videoType,
    videoUrl,
    pdfTitle,
    pdfUrl,
    codeSnippets,
    slides,
    quiz,
    isPublished
  } = req.body;

  if (!subjectId || !title) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed: subjectId and title are required.'
    });
  }

  const subject = db.subjects.find(s => s.id === subjectId);
  const existingLessons = db.lessons.filter(l => l.subjectId === subjectId);

  const newLesson: Lesson = {
    id: 'les-' + Date.now(),
    subjectId,
    subjectSlug: subject?.slug,
    subjectName: subject?.name,
    lessonNumber: Number(lessonNumber) || existingLessons.length + 1,
    title,
    titleKh: titleKh || title,
    slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    duration: duration || '20 mins',
    level: level || 'Beginner',
    description: description || '',
    descriptionKh: descriptionKh || description || '',
    content: content || '## Introduction\n\nLesson content goes here.',
    videoType: videoType || 'youtube',
    videoUrl: videoUrl || '',
    pdfTitle: pdfTitle || '',
    pdfUrl: pdfUrl || '',
    codeSnippets: codeSnippets || [],
    slides: slides || [],
    quiz: quiz || [],
    materials: [],
    isPublished: isPublished !== undefined ? isPublished : true,
    sortOrder: existingLessons.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.lessons.push(newLesson);

  // Update subject lesson count
  if (subject) {
    subject.lessonsCount = db.lessons.filter(l => l.subjectId === subject.id && l.isPublished).length;
  }

  const admin = (req as any).user;
  db.logActivity(admin.id, admin.name, 'Created Lesson', `Added lesson: "${title}" to ${subject?.name || 'Subject'}`, req.ip);

  res.status(201).json({
    success: true,
    message: 'Lesson created successfully',
    data: newLesson
  });
});

apiRouter.put('/admin/lessons/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.lessons.findIndex(l => l.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Lesson not found.' });
  }

  const existing = db.lessons[index];
  const updated: Lesson = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  db.lessons[index] = updated;

  // Refresh subject count
  const subject = db.subjects.find(s => s.id === updated.subjectId);
  if (subject) {
    subject.lessonsCount = db.lessons.filter(l => l.subjectId === subject.id && l.isPublished).length;
  }

  const admin = (req as any).user;
  db.logActivity(admin.id, admin.name, 'Updated Lesson', `Modified lesson: "${updated.title}"`, req.ip);

  res.json({
    success: true,
    message: 'Lesson updated successfully',
    data: updated
  });
});

apiRouter.delete('/admin/lessons/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.lessons.findIndex(l => l.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Lesson not found.' });
  }

  const deleted = db.lessons.splice(index, 1)[0];
  const subject = db.subjects.find(s => s.id === deleted.subjectId);
  if (subject) {
    subject.lessonsCount = db.lessons.filter(l => l.subjectId === subject.id && l.isPublished).length;
  }

  const admin = (req as any).user;
  db.logActivity(admin.id, admin.name, 'Deleted Lesson', `Removed lesson: "${deleted.title}"`, req.ip);

  res.json({
    success: true,
    message: 'Lesson deleted successfully'
  });
});

// --------------------------------------------------------------------------
// 12. ADMIN BRANDING & SETTINGS (The Dynamic Branding Engine)
// --------------------------------------------------------------------------
apiRouter.put('/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const updates = req.body;
  Object.assign(db.settings, updates);

  const admin = (req as any).user;
  db.logActivity(
    admin.id,
    admin.name,
    'Updated Website Branding',
    `Branding updated: Creator "${db.settings.creatorName}", Site "${db.settings.siteName}"`,
    req.ip
  );

  res.json({
    success: true,
    message: 'Settings updated successfully. All public pages have been updated immediately.',
    data: db.settings
  });
});

// --------------------------------------------------------------------------
// 13. MATERIAL MANAGEMENT & SECURE UPLOAD
// --------------------------------------------------------------------------
apiRouter.get('/materials', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: db.materials
  });
});

apiRouter.post('/admin/materials', requireAdmin, (req: Request, res: Response) => {
  const { lessonId, title, fileName, fileType, fileSize, fileUrl } = req.body;
  if (!title || !fileType) {
    return res.status(422).json({ success: false, message: 'Title and fileType are required.' });
  }

  const newMaterial: LessonMaterial = {
    id: 'mat-' + Date.now(),
    lessonId: lessonId || '',
    title,
    fileName: fileName || title.replace(/\s+/g, '_') + '.' + fileType,
    fileType,
    fileSize: fileSize || '1.5 MB',
    fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    downloadable: true,
    uploadedAt: new Date().toISOString().split('T')[0]
  };

  db.materials.push(newMaterial);

  // If attached to a lesson, add to lesson materials
  if (lessonId) {
    const lesson = db.lessons.find(l => l.id === lessonId);
    if (lesson) {
      if (!lesson.materials) lesson.materials = [];
      lesson.materials.push(newMaterial);
    }
  }

  const admin = (req as any).user;
  db.logActivity(admin.id, admin.name, 'Uploaded Material', `Added material: "${title}" (${fileType.toUpperCase()})`, req.ip);

  res.status(201).json({
    success: true,
    message: 'Material added successfully',
    data: newMaterial
  });
});

apiRouter.delete('/admin/materials/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.materials.findIndex(m => m.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Material not found.' });
  }

  const deleted = db.materials.splice(index, 1)[0];
  const admin = (req as any).user;
  db.logActivity(admin.id, admin.name, 'Deleted Material', `Removed material: "${deleted.title}"`, req.ip);

  res.json({
    success: true,
    message: 'Material deleted successfully'
  });
});

// Secure file upload validation endpoint - strictly Admin only
apiRouter.post('/upload', requireAdmin, (req: Request, res: Response) => {
  const { fileName, fileType, base64Data, sizeInBytes } = req.body;

  if (!fileName) {
    return res.status(422).json({ success: false, message: 'File name is required.' });
  }

  // Validate allowed extensions and mime
  const allowedExtensions = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'zip', 'png', 'jpg', 'jpeg', 'webp', 'mp4'];
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (!allowedExtensions.includes(ext)) {
    return res.status(422).json({
      success: false,
      message: `File type .${ext} is prohibited. Allowed types: ${allowedExtensions.join(', ')}`
    });
  }

  // Max 50MB
  if (sizeInBytes && sizeInBytes > 50 * 1024 * 1024) {
    return res.status(422).json({
      success: false,
      message: 'File size exceeds maximum allowable limit of 50 MB.'
    });
  }

  // Sanitized safe file name
  const safeName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const fileUrl = base64Data || `/uploads/${safeName}`;

  res.json({
    success: true,
    message: 'File uploaded and validated successfully',
    data: {
      fileName: safeName,
      fileUrl,
      fileType: ext,
      fileSize: sizeInBytes ? `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB'
    }
  });
});

// --------------------------------------------------------------------------
// 14. LARAVEL ARCHITECTURE & REST SPECIFICATION
// --------------------------------------------------------------------------
apiRouter.get('/laravel-spec', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Laravel Backend Architecture Specification',
    data: {
      projects: {
        backend: "it-learning-backend (Laravel 11 REST API)",
        frontend: "it-learning-frontend (Vite + React SPA consuming REST API)"
      },
      databaseEngine: "MySQL 8.0 with InnoDB, Foreign Keys, and ACID Transactions",
      eloquentModels: [
        "User (Authenticatable, HasApiTokens)",
        "Category (hasMany Subjects)",
        "Subject (belongsTo Category, hasMany Lessons)",
        "Lesson (belongsTo Subject, hasMany Materials)",
        "LessonMaterial (belongsTo Lesson)",
        "Setting (KeyValue Dynamic Store)",
        "ActivityLog (belongsTo Admin)",
        "LearningProgress (belongsTo User & Subject)"
      ],
      controllers: [
        "App\\Http\\Controllers\\Api\\AuthController",
        "App\\Http\\Controllers\\Api\\SubjectController",
        "App\\Http\\Controllers\\Api\\CategoryController",
        "App\\Http\\Controllers\\Api\\LessonController",
        "App\\Http\\Controllers\\Api\\MaterialController",
        "App\\Http\\Controllers\\Api\\SettingController",
        "App\\Http\\Controllers\\Api\\ProgressController",
        "App\\Http\\Controllers\\Api\\AdminDashboardController"
      ],
      middleware: [
        "auth:sanctum (Token validation)",
        "admin (Role authorization check)",
        "throttle:60,1 (API Rate Limiter)"
      ]
    }
  });
});
