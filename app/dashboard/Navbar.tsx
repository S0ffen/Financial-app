import SignOutButton from "./SignOutButton";

type NavbarProps = {
  userEmail: string;
};

export default function Navbar({ userEmail }: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 w-full border-b border-white/10 bg-black/40 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.7)]" />
          <p className="text-sm font-semibold tracking-wide text-zinc-100">Finance Dashboard</p>
        </div>

        <div className="flex items-center gap-4">
          <p className="hidden text-sm text-zinc-400 sm:block">{userEmail}</p>
          <SignOutButton />
        </div>
      </nav>
    </header>
  );
}
