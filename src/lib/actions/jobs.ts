"use server";

import { prisma } from "@/lib/db";
import { collectKeyword, type Source } from "@/lib/collectors";
import { revalidatePath } from "next/cache";

export async function rerunJob(jobId: number) {
  const job = await prisma.collectJob.findUnique({ where: { id: jobId } });
  if (!job) return;
  const sources = job.sources.split(",").filter((s): s is Source => s === "mfds" || s === "naver");
  await collectKeyword(job.keyword, sources);
  revalidatePath("/admin/jobs");
  revalidatePath("/admin");
  revalidatePath("/");
}
