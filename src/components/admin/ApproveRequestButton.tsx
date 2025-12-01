"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HiCheckCircle } from "react-icons/hi2";

interface ApproveRequestButtonProps {
  requestId: string;
}

export function ApproveRequestButton({ requestId }: ApproveRequestButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleApprove = async () => {
    setIsPending(true);
    try {
      const response = await fetch("/api/admin/approve-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error approving request:", data.error);
        alert(`Failed to approve request: ${data.error || "Unknown error"}`);
        setIsPending(false);
        return;
      }

      // Refresh the page to show updated status
      router.refresh();
    } catch (error) {
      console.error("Error approving request:", error);
      alert(`Failed to approve request: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleApprove}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <HiCheckCircle className="h-4 w-4" />
      {isPending ? "Approving..." : "Approve"}
    </button>
  );
}

