import { redirect } from "next/navigation";

interface GroupPageProps {
  params: Promise<{ groupId: string }>;
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { groupId } = await params;
  redirect(`/groups/${groupId}/community`);
}
