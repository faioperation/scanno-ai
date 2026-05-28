"use client";

export default function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
      <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
      <div className="h-3 w-5/6 animate-pulse rounded bg-gray-200" />
      <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
    </div>
  );
}
