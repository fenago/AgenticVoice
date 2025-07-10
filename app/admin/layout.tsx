import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/types/auth";
import { AdminLayout } from "./components/AdminLayout";
import { ToastProvider } from "@/app/components/ui/Toast";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login");
  }

  // Check if user has admin privileges
  const isAdmin = session.user?.role === UserRole.ADMIN || 
                 session.user?.role === UserRole.GOD_MODE;

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  return (
    <ToastProvider>
      <AdminLayout user={session.user}>
        {children}
      </AdminLayout>
    </ToastProvider>
  );
}
