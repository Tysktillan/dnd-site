import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NewsManagement from "@/components/news/NewsManagement";

export default async function NewsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'dm') {
    redirect('/');
  }

  const posts = await prisma.newsPost.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <NewsManagement posts={posts} />;
}
