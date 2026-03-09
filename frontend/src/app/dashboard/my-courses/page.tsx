"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import RemarksTooltip from '@/components/RemarksTooltip';
import { formatDate, parseDate } from '@/lib/utils';
import { BookOpen } from 'lucide-react';

interface Course {
  id: number;
  course_name: string;
  course_code: string;
  duration?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  completion_date?: string | null;
  grade: string | null;
  status: 'obtained' | 'planned';
  remarks: string | null;
  course_id: number;
}

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/user/courses');
      
      // The api.get() already returns the ApiResponse structure
      // So response.status is the correct way to check, not response.data.status
      if (response.status === 'success' && response.data) {
        setCourses(response.data.courses || []);
      } else {
        setError(response.message || 'Failed to fetch courses data');
      }
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      setError(error.message || 'Failed to fetch your courses');
    } finally {
      setIsLoading(false);
    }
  };

  const getCourseEndDate = (course: Course) => course.end_date || course.completion_date || null;

  const getCourseDurationLabel = (course: Course) => {
    if (course.duration && course.duration.trim()) {
      return course.duration;
    }

    if (!course.start_date || !getCourseEndDate(course)) {
      return '--';
    }

    const start = parseDate(course.start_date);
    const end = parseDate(getCourseEndDate(course) as string);

    if (!start || !end) {
      return '--';
    }

    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) {
      return '--';
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays <= 0) {
      return '--';
    }

    if (diffDays >= 30 && diffDays % 30 === 0) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    }

    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  const obtainedCourses = courses.filter(c => c.status === 'obtained');
  const plannedCourses = courses.filter(c => c.status === 'planned');

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="ml-4 text-white">Loading your courses...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">My Courses</h1>
          <p className="text-gray-300 text-sm lg:text-base">View your training courses and qualifications</p>
        </div>

        {/* View-Only Notice */}
        <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg">
          <p className="text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            This is a read-only view of your courses. Contact your administrator to update course information.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Courses Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Courses Obtained</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{obtainedCourses.length}</p>
              </div>
              <div className=" p-3 rounded-lg">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Courses Planned</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">{plannedCourses.length}</p>
              </div>
              <div className=" p-3 rounded-lg">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Obtained Courses Section */}
        <div className="mb-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
            <div className=" border-b border-white/10 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-green-400 rounded-full"></span>
                Courses Obtained ({obtainedCourses.length})
              </h2>
              <p className="text-gray-400 text-sm mt-1">Completed courses with grading</p>
            </div>

            {obtainedCourses.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No obtained courses found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Course Code</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Course Name</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Start Date</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">End Date</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Duration</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Grade</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {obtainedCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-mono text-sm lg:text-base">{course.course_code}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base">{course.course_name}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">{formatDate(course.start_date)}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">{formatDate(getCourseEndDate(course))}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                          <span className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-300 text-xs font-medium">
                            {getCourseDurationLabel(course)}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-base">
                          {course.grade ? (
                            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                              {course.grade}
                            </span>
                          ) : (
                            <span className="text-gray-400">--</span>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base max-w-xs">
                          {course.remarks ? (
                            <RemarksTooltip text={course.remarks} truncateAt={30}>
                              <div className="truncate cursor-help">
                                {course.remarks.length > 30 
                                  ? `${course.remarks.substring(0, 30)}...` 
                                  : course.remarks
                                }
                              </div>
                            </RemarksTooltip>
                          ) : (
                            '--'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Planned Courses Section */}
        <div className="mb-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
            <div className=" border-b border-white/10 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-blue-400 rounded-full"></span>
                Courses Planned ({plannedCourses.length})
              </h2>
              <p className="text-gray-400 text-sm mt-1">Upcoming courses scheduled for training</p>
            </div>

            {plannedCourses.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No planned courses found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Course Code</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Course Name</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Start Date</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">End Date</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Duration</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Status</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {plannedCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-mono text-sm lg:text-base">{course.course_code}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base">{course.course_name}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">{formatDate(course.start_date)}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">{formatDate(getCourseEndDate(course))}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                          <span className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-300 text-xs font-medium">
                            {getCourseDurationLabel(course)}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                            Planned
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base max-w-xs">
                          {course.remarks ? (
                            <RemarksTooltip text={course.remarks} truncateAt={30}>
                              <div className="truncate cursor-help">
                                {course.remarks.length > 30 
                                  ? `${course.remarks.substring(0, 30)}...` 
                                  : course.remarks
                                }
                              </div>
                            </RemarksTooltip>
                          ) : (
                            '--'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-300 text-sm">
            Total Courses: {courses.length} (Obtained: {obtainedCourses.length}, Planned: {plannedCourses.length})
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
