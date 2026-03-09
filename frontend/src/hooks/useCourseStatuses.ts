import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { personnelService } from "@/lib/api";
import { getServerDate } from "@/lib/serverTime";

interface CourseLike {
  start_date?: string;
  end_date?: string;
  completion_date?: string;
}

const isCurrentlyOnCourse = (courses: CourseLike[]) => {
  if (!courses || courses.length === 0) return false;

  const now = getServerDate();
  return courses.some((course) => {
    if (!course.start_date) return false;

    const start = new Date(course.start_date);
    const endCandidate = course.end_date || course.completion_date || course.start_date;
    const end = endCandidate ? new Date(endCandidate) : null;

    if (Number.isNaN(start.getTime()) || !end || Number.isNaN(end.getTime())) {
      return false;
    }

    return start <= now && now <= end;
  });
};

export const useCourseStatuses = (records: { id: number }[]) => {
  const [statusMap, setStatusMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef<Record<number, boolean>>({});

  const recordIds = useMemo(
    () => Array.from(new Set(records.map((record) => record.id))),
    [records]
  );

  useEffect(() => {
    let isCancelled = false;

    if (recordIds.length === 0) {
      setStatusMap({});
      return;
    }

    const updateStatusMapFromCache = () => {
      if (isCancelled) return;
      const nextMap: Record<number, boolean> = {};
      recordIds.forEach((id) => {
        if (cacheRef.current[id] !== undefined) {
          nextMap[id] = cacheRef.current[id];
        }
      });
      setStatusMap(nextMap);
    };

    const missingIds = recordIds.filter((id) => cacheRef.current[id] === undefined);

    if (missingIds.length === 0) {
      updateStatusMapFromCache();
      return;
    }

    setLoading(true);

    const fetchStatuses = async () => {
      try {
        const results = await Promise.all(
          missingIds.map(async (id) => {
            try {
              const response = await personnelService.getPersonnelCourses(id);
              if (response.status === "success" && response.data) {
                const data = response.data as any;
                const courses = data.courses || [];
                return { id, onCourse: isCurrentlyOnCourse(courses) };
              }
            } catch (err) {
              console.error(`Error fetching courses for personnel ${id}:`, err);
            }
            return { id, onCourse: false };
          })
        );

        if (isCancelled) return;

        results.forEach(({ id, onCourse }) => {
          cacheRef.current[id] = onCourse;
        });

        updateStatusMapFromCache();
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchStatuses();

    return () => {
      isCancelled = true;
    };
  }, [recordIds]);

  const getDisplayStatus = useCallback(
    (person: { id: number; dynamic_status?: string }) => {
      if (statusMap[person.id]) {
        return "On Course";
      }
      return person.dynamic_status || "Available";
    },
    [statusMap]
  );

  return {
    onCourseMap: statusMap,
    getDisplayStatus,
    courseStatusLoading: loading,
  };
};

