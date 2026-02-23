import { redirect } from "next/navigation";

interface GroupPageProps {
  params: { groupId: string };
}

export default function GroupPage({ params }: GroupPageProps) {
  redirect(`/groups/${params.groupId}/community`);
}
