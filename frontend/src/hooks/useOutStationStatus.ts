import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { personnelService } from "@/lib/api";

interface OutStationLike {
  start_date?: string;
  end_date?: string;
}

const isCurrentlyOutStation = (outStations: OutStationLike[]) => {
  if (!outStations || outStations.length === 0) return false;

  const now = new Date();
  return outStations.some((outStation) => {
    if (!outStation.start_date) return false;

    const start = new Date(outStation.start_date);
    const endCandidate = outStation.end_date || outStation.start_date;
    const end = endCandidate ? new Date(endCandidate) : null;

    if (Number.isNaN(start.getTime()) || !end || Number.isNaN(end.getTime())) {
      return false;
    }

    return start <= now && now <= end;
  });
};

export const useOutStationStatus = (records: { id: number }[]) => {
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
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5003/api'}/others/${id}/out-station-employment`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                  'Content-Type': 'application/json',
                },
              });
              if (response.ok) {
                const result = await response.json();
                if (result.status === "success" && result.data) {
                  const outStations = result.data.outStationEmployments || [];
                  return { id, outStation: isCurrentlyOutStation(outStations) };
                }
              }
            } catch (err) {
              console.error(`Error fetching out station for personnel ${id}:`, err);
            }
            return { id, outStation: false };
          })
        );

        if (isCancelled) return;

        results.forEach(({ id, outStation }) => {
          cacheRef.current[id] = outStation;
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

  const isOutStation = useCallback(
    (person: { id: number }) => {
      return statusMap[person.id] || false;
    },
    [statusMap]
  );

  return {
    outStationMap: statusMap,
    isOutStation,
    outStationStatusLoading: loading,
  };
};

