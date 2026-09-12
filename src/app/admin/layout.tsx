import { AdminNav } from "./nav";

export const metadata = { title: "관리자" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-[1260px] gap-8 px-6 py-8 md:grid-cols-[200px_minmax(0,1fr)] md:px-8">
      <AdminNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
