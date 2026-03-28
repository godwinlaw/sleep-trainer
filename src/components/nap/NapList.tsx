"use client";

import { useRouter } from "next/navigation";
import NapCard from "./NapCard";
import type { NapRecord } from "@/lib/types";

interface NapListProps {
  naps: NapRecord[];
  title?: string;
}

export default function NapList({ naps, title }: NapListProps) {
  const router = useRouter();

  if (naps.length === 0) return null;

  return (
    <section>
      {title && <h3 className="mb-2 text-sm font-medium text-slate-blue-500">{title}</h3>}
      <div className="space-y-2">
        {naps.map((nap, i) => (
          <NapCard
            key={nap.id}
            nap={nap}
            index={i}
            onClick={() => router.push(`/log/nap?id=${nap.id}`)}
          />
        ))}
      </div>
    </section>
  );
}
