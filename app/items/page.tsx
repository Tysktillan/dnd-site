import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ItemsManagement from "@/components/items/ItemsManagement";

export default async function ItemsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'dm') {
    redirect('/');
  }

  const items = await prisma.magicalItem.findMany({
    orderBy: [
      { slot: 'asc' },
      { name: 'asc' }
    ]
  });

  return <ItemsManagement items={items} />;
}
