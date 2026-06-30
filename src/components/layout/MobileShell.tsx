import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function MobileShell({
  children,
  hideNav,
}: {
  children: ReactNode;
  hideNav?: boolean;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background shadow-elevated">
      <main className={`flex-1 ${hideNav ? "" : "pb-28"}`}>{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
