"use client";
import { useGetScheduledStatusesQuery } from '@/redux/features/api/fediApi';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function ScheduledPage() {
  const { data, error, isLoading } = useGetScheduledStatusesQuery();
  return isLoading ? (
    <h1>Loading...</h1>
  ) : error ? (
    <h1>Something went wrong. Please try again.</h1>
  ) : (
    <div>
      <div className="w-full">
        <Link href="/app/scheduled/new"><Button><Plus className="mr-2 h-4 w-4" />New post</Button></Link>
      </div>
      {!!data && data.length > 0 ? data?.map((status) => (
        <div key={status.id}>
          <h2>{status.params.text}</h2>
        </div>
      )) : (
        <h2>No scheduled statuses.</h2>
      )}
    </div>
  );
}
