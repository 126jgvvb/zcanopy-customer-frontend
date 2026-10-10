"use client";

import { useRouter } from "next/navigation";
import PropertyVideoReel from "@/components/PropertyVideoReel";

export default function ReelsPage() {
  const router = useRouter();
  return <PropertyVideoReel onClose={() => router.back()} />;
}