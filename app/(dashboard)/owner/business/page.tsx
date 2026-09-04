import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = {
  title: "Manage Business Profile",
  description: "Update your business details, address, and profile settings.",
};

export default async function OwnerBusinessPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const business = await db.business.findFirst({
    where: { owner_id: session.user.id },
  });

  if (business) {
    redirect("/owner/business/edit");
  } else {
    redirect("/owner/business/new");
  }
}
