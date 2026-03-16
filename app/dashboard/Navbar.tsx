"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Coins, LayoutDashboard, Menu, Shield, X } from "lucide-react";
import SignOutButton from "./SignOutButton";

type NavbarProps = {
  userLabel: string;
  isAdmin: boolean;
};

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

function navItemClass(isActive: boolean) {
  return isActive
    ? "border-zinc-700 bg-zinc-800/90 text-zinc-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    : "border-transparent text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100";
}

export default function Navbar({ userLabel, isAdmin }: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/expensesTable",
      label: "Expenses",
      icon: BarChart3,
    },
    {
      href: "/dashboard/income",
      label: "Income",
      icon: Coins,
    },
  ];

  if (isAdmin) {
    navItems.push({
      href: "/dashboard/admin",
      label: "Admin",
      icon: Shield,
    });
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <Link
          href="/dashboard"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-3 transition-colors hover:bg-zinc-900"
        >
          <Image
            src="/favicon/apple-touch-icon.png"
            alt="CashNeko"
            width={40}
            height={40}
            className="rounded-xl"
          />
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500">
              Expense Tracker
            </p>
            <h1 className="truncate text-xl font-semibold tracking-tight text-zinc-100">
              CashNeko
            </h1>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${navItemClass(isActive)}`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="mb-3 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">Signed in</p>
          <p className="mt-1 truncate text-sm text-zinc-200">{userLabel}</p>
        </div>
        <SignOutButton />
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <Image
              src="/favicon/apple-touch-icon.png"
              alt="CashNeko"
              width={36}
              height={36}
              className="rounded-xl"
            />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-zinc-100">CashNeko</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 transition-colors hover:bg-zinc-800"
            aria-label={open ? "Close navigation" : "Open navigation"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
            aria-label="Close navigation overlay"
          />
          <aside className="absolute left-0 top-0 h-full w-[82vw] max-w-xs border-r border-white/10 bg-zinc-950 shadow-2xl">
            {SidebarContent}
          </aside>
        </div>
      ) : null}

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/10 bg-zinc-950/95 backdrop-blur lg:block">
        {SidebarContent}
      </aside>
    </>
  );
}
