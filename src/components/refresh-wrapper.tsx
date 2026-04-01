"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function RefreshWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 10000);
    return () => clearInterval(id);
  }, [router]);
  return <>{children}</>;
}
