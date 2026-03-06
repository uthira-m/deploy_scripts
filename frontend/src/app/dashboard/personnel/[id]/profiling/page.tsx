"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ArrowLeft } from "lucide-react";

export default function PersonnelProfilingPage() {
  const params = useParams();
  const personnelId = params.id as string;

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-200">
          <p className="font-medium">
            Profiling feature is disabled for this deployment.
          </p>
          <p className="text-sm mt-1">
            Please contact the administrator if you believe you should have
            access to this report.
          </p>
        </div>
        <Link
          href={`/dashboard/personnel/${personnelId}`}
          className="mt-4 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Personnel
        </Link>
      </div>
    </ProtectedRoute>
  );
}

