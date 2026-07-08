"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, ClipboardList, FileText, Settings, LogOut, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/borrowings", label: "Borrowings", icon: ClipboardList },
  { href: "/admin/requests", label: "Procurement", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin/login") return;
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) router.push("/admin/login");
      else setUser(d.user);
    }).catch(() => router.push("/admin/login"));
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#dee1e6] transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-[#dee1e6]">
            <h2 className="text-lg font-semibold text-[#0052ff] tracking-tight">ICT Inventory</h2>
            <p className="text-xs text-[#7c828a] mt-0.5">Mutiara Bangsa</p>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-colors ${active ? "bg-[#0052ff] text-white" : "text-[#5b616e] hover:bg-[#f7f7f7]"}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-[#dee1e6]">
            <div className="flex items-center gap-3 mb-3 px-3">
              <div className="w-8 h-8 bg-[#eef0f3] rounded-full flex items-center justify-center text-[#5b616e] font-semibold text-xs">
                {user?.username?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <p className="text-sm font-medium text-[#0a0b0d]">{user?.username || "Admin"}</p>
                <p className="text-xs text-[#7c828a]">{user?.role}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-[#5b616e] rounded-[12px]" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-[#dee1e6] px-4 py-3 flex items-center justify-between lg:px-6 h-16">
          <button className="lg:hidden p-2 -ml-2 text-[#0a0b0d]" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold text-[#0a0b0d]">
            {NAV_ITEMS.find((i) => i.href === pathname)?.label || "Admin"}
          </h1>
          <div />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}