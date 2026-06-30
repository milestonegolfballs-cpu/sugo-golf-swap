import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, Heart, User, Plus } from "lucide-react";

const items = [
  { to: "/", label: "홈", icon: Home, match: (p: string) => p === "/" },
  { to: "/search", label: "검색", icon: Search, match: (p: string) => p.startsWith("/search") },
] as const;

const right = [
  {
    to: "/favorites",
    label: "관심상품",
    icon: Heart,
    match: (p: string) => p.startsWith("/favorites"),
  },
  { to: "/me", label: "내 정보", icon: User, match: (p: string) => p.startsWith("/me") },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-white shadow-nav safe-bottom">
      <div className="relative grid grid-cols-5 items-end px-2 pb-2 pt-2">
        {items.map((it) => {
          const active = it.match(pathname);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className="flex flex-col items-center gap-1 py-1"
            >
              <Icon
                className={`h-6 w-6 ${active ? "text-primary" : "text-muted-foreground"}`}
                strokeWidth={active ? 2.4 : 1.8}
              />
              <span
                className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                {it.label}
              </span>
            </Link>
          );
        })}

        {/* Center elevated FAB */}
        <Link
          to="/sell"
          className="flex flex-col items-center"
          aria-label="등록하기"
        >
          <span className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-fab transition-transform active:scale-95">
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </span>
          <span className="mt-1 text-[10px] font-medium text-muted-foreground">
            등록하기
          </span>
        </Link>

        {right.map((it) => {
          const active = it.match(pathname);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className="flex flex-col items-center gap-1 py-1"
            >
              <Icon
                className={`h-6 w-6 ${active ? "text-primary" : "text-muted-foreground"}`}
                strokeWidth={active ? 2.4 : 1.8}
              />
              <span
                className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                {it.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
