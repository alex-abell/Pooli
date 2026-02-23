"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  BookOpen,
  FileText,
  Play,
  Loader2,
  ArrowLeft,
  X,
} from "lucide-react";
import Link from "next/link";

interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl: string | null;
  moduleId: string;
  order: number;
  progress: LessonProgress[];
}

interface Module {
  id: string;
  title: string;
  courseId: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  image: string | null;
  published: boolean;
  groupId: string;
  order: number;
  modules: Module[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completingLessonId, setCompletingLessonId] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch course");
      }
      const data: Course = await res.json();
      setCourse(data);

      // Auto-expand the first module
      if (data.modules.length > 0) {
        setExpandedModules(new Set([data.modules[0].id]));
      }
    } catch (err: any) {
      setError(err.message || "Failed to load course.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const isLessonCompleted = (lesson: Lesson): boolean => {
    return (
      Array.isArray(lesson.progress) &&
      lesson.progress.some((p) => p.completed)
    );
  };

  const handleToggleComplete = async (lesson: Lesson) => {
    if (isLessonCompleted(lesson) || completingLessonId === lesson.id) return;

    setCompletingLessonId(lesson.id);

    try {
      const res = await fetch(`/api/lessons/${lesson.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to mark lesson complete");
      }

      const progressData = await res.json();

      // Update the course state to reflect the completion
      setCourse((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          modules: prev.modules.map((mod) => ({
            ...mod,
            lessons: mod.lessons.map((l) => {
              if (l.id === lesson.id) {
                return {
                  ...l,
                  progress: [
                    {
                      id: progressData.id || progressData.progress?.id || "new",
                      userId: "",
                      lessonId: lesson.id,
                      completed: true,
                      completedAt: new Date().toISOString(),
                    },
                  ],
                };
              }
              return l;
            }),
          })),
        };
      });

      // Update selected lesson if it's the one we just completed
      if (selectedLesson?.id === lesson.id) {
        setSelectedLesson((prev) =>
          prev
            ? {
                ...prev,
                progress: [
                  {
                    id: progressData.id || progressData.progress?.id || "new",
                    userId: "",
                    lessonId: lesson.id,
                    completed: true,
                    completedAt: new Date().toISOString(),
                  },
                ],
              }
            : prev
        );
      }
    } catch (err: any) {
      console.error("Error completing lesson:", err.message);
    } finally {
      setCompletingLessonId(null);
    }
  };

  const selectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  // Calculate progress
  const totalLessons = course
    ? course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0)
    : 0;
  const completedLessons = course
    ? course.modules.reduce(
        (sum, mod) =>
          sum + mod.lessons.filter((l) => isLessonCompleted(l)).length,
        0
      )
    : 0;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
        <p className="text-gray-500">{error || "Course not found."}</p>
        <Link
          href={`/groups/${groupId}/classroom`}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          Back to Classroom
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/groups/${groupId}/classroom`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-4"
        >
          <ArrowLeft size={16} />
          Back to Classroom
        </Link>

        <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
        <p className="text-gray-500 mt-1">{course.description}</p>

        {/* Progress Bar */}
        {totalLessons > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Your Progress
              </span>
              <span className="text-sm font-medium text-gray-500 tabular-nums">
                {completedLessons}/{totalLessons} lessons ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progressPercent === 100 ? "bg-green-500" : "bg-blue-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Course content layout */}
      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Module list (left / top) */}
        <div className={`${selectedLesson ? "lg:w-[360px] lg:shrink-0" : "w-full"}`}>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BookOpen size={16} />
                Course Content
              </h2>
            </div>

            {course.modules.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">
                  No modules have been added to this course yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {course.modules.map((mod) => {
                  const isExpanded = expandedModules.has(mod.id);
                  const modCompleted = mod.lessons.filter((l) =>
                    isLessonCompleted(l)
                  ).length;
                  const modTotal = mod.lessons.length;

                  return (
                    <div key={mod.id}>
                      {/* Module header */}
                      <button
                        onClick={() => toggleModule(mod.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                      >
                        <div className="text-gray-400">
                          {isExpanded ? (
                            <ChevronDown size={18} />
                          ) : (
                            <ChevronRight size={18} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {mod.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {modCompleted}/{modTotal}{" "}
                            {modTotal === 1 ? "lesson" : "lessons"} complete
                          </p>
                        </div>
                        {modTotal > 0 && modCompleted === modTotal && (
                          <CheckCircle2
                            size={18}
                            className="text-green-500 shrink-0"
                          />
                        )}
                      </button>

                      {/* Lessons list */}
                      {isExpanded && (
                        <div className="bg-gray-50/50">
                          {mod.lessons.length === 0 ? (
                            <p className="text-xs text-gray-400 px-4 py-3 pl-11">
                              No lessons in this module.
                            </p>
                          ) : (
                            mod.lessons.map((lesson) => {
                              const completed = isLessonCompleted(lesson);
                              const isSelected =
                                selectedLesson?.id === lesson.id;
                              const isCompleting =
                                completingLessonId === lesson.id;

                              return (
                                <div
                                  key={lesson.id}
                                  className={`flex items-center gap-3 px-4 py-2.5 pl-11 cursor-pointer transition ${
                                    isSelected
                                      ? "bg-blue-50 border-l-2 border-blue-500"
                                      : "hover:bg-gray-100 border-l-2 border-transparent"
                                  }`}
                                >
                                  {/* Checkbox */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleComplete(lesson);
                                    }}
                                    disabled={completed || isCompleting}
                                    className="shrink-0"
                                    title={
                                      completed
                                        ? "Lesson completed"
                                        : "Mark as complete"
                                    }
                                  >
                                    {isCompleting ? (
                                      <Loader2
                                        size={18}
                                        className="animate-spin text-blue-400"
                                      />
                                    ) : completed ? (
                                      <CheckCircle2
                                        size={18}
                                        className="text-green-500"
                                      />
                                    ) : (
                                      <Circle
                                        size={18}
                                        className="text-gray-300 hover:text-blue-400 transition"
                                      />
                                    )}
                                  </button>

                                  {/* Lesson title */}
                                  <button
                                    onClick={() => selectLesson(lesson)}
                                    className={`flex-1 text-left text-sm truncate ${
                                      completed
                                        ? "text-gray-400 line-through"
                                        : isSelected
                                        ? "text-blue-700 font-medium"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {lesson.title}
                                  </button>

                                  {lesson.videoUrl && (
                                    <Play
                                      size={14}
                                      className="text-gray-300 shrink-0"
                                    />
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Lesson content panel (right / bottom) */}
        {selectedLesson && (
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={18} className="text-blue-500 shrink-0" />
                  <h3 className="font-semibold text-gray-900 truncate">
                    {selectedLesson.title}
                  </h3>
                  {isLessonCompleted(selectedLesson) && (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                      <CheckCircle2 size={12} />
                      Completed
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5">
                {selectedLesson.videoUrl && (
                  <div className="mb-5 aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      src={selectedLesson.videoUrl}
                      controls
                      className="w-full h-full"
                    />
                  </div>
                )}

                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedLesson.content}
                </div>

                {!isLessonCompleted(selectedLesson) && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleToggleComplete(selectedLesson)}
                      disabled={completingLessonId === selectedLesson.id}
                      className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
                    >
                      {completingLessonId === selectedLesson.id ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Marking Complete...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          Mark as Complete
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
