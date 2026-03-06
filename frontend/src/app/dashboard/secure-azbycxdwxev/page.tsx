"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Administrator settings moved to standalone public page.
 * Redirect to /secure-azbycxdwxev (no login required).
 */
export default function DashboardAdministratorRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/secure-azbycxdwxev");
  }, [router]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
    </div>
  );
}
