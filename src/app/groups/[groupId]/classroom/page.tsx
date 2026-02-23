import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { GraduationCap, BookOpen, FileText, Plus } from "lucide-react";
import CreateCourseModal from "@/components/classroom/CreateCourseModal";

interface ClassroomPageProps {
  params: { groupId: string };
}

export default async function ClassroomPage({ params }: ClassroomPageProps) {
  const { groupId } = params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true, name: true, ownerId: true },
  });

  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-500">Group not found.</p>
      </div>
    );
  }

  const membership = userId
    ? await prisma.membership.findUnique({
        where: { userId_groupId: { userId, groupId } },
        select: { role: true },
      })
    : null;

  const isOwnerOrAdmin =
    membership?.role === "owner" || membership?.role === "admin";

  const courses = await prisma.course.findMany({
    where: { groupId },
    orderBy: { order: "asc" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              progress: userId
                ? { where: { userId, completed: true } }
                : false,
            },
          },
        },
      },
    },
  });

  const coursesWithStats = courses.map((course) => {
    let totalLessons = 0;
    let completedLessons = 0;
    const moduleCount = course.modules.length;

    for (const mod of course.modules) {
      totalLessons += mod.lessons.length;
      if (userId) {
        for (const lesson of mod.lessons) {
          if (
            Array.isArray(lesson.progress) &&
            lesson.progress.length > 0
          ) {
            completedLessons++;
          }
        }
      }
    }

    const progressPercent =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      image: course.image,
      moduleCount,
      lessonCount: totalLessons,
      completedLessons,
      progressPercent,
    };
  });

  return (
    <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classroom</h1>
          <p className="text-gray-500 text-sm mt-1">
            Explore courses and track your progress
          </p>
        </div>
        {isOwnerOrAdmin && <CreateCourseModal groupId={groupId} />}
      </div>

      {coursesWithStats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <GraduationCap size={32} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            No courses yet
          </h2>
          <p className="text-gray-500 text-sm max-w-sm">
            {isOwnerOrAdmin
              ? "Get started by creating your first course for the community."
              : "Check back later for new courses from the community admins."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesWithStats.map((course) => (
            <Link
              key={course.id}
              href={`/groups/${groupId}/classroom/${course.id}`}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition"
            >
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative flex items-center justify-center">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <GraduationCap size={48} className="text-white/60" />
                )}
                {userId && course.lessonCount > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                    <div
                      className="h-full bg-white/90 transition-all"
                      style={{ width: `${course.progressPercent}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} />
                    {course.moduleCount}{" "}
                    {course.moduleCount === 1 ? "module" : "modules"}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={14} />
                    {course.lessonCount}{" "}
                    {course.lessonCount === 1 ? "lesson" : "lessons"}
                  </span>
                </div>

                {userId && course.lessonCount > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          course.progressPercent === 100
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${course.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-500 tabular-nums">
                      {course.progressPercent}%
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
