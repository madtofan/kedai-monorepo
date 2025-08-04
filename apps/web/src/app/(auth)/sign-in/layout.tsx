import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default async function Page({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await authClient.getSession();
  console.log({ session });
  if (!!session.data?.session.userId) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full">
      <div className="flex w-full flex-col items-center justify-center md:py-10">
        {children}
      </div>
    </div>
  );
}
