import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, Search, MessageCircle, User, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const items = [
  { to: "/", label: "홈", icon: Home, match: (p: string) => p === "/" },
  { to: "/search", label: "검색", icon: Search, match: (p: string) => p.startsWith("/search") },
] as const;

function useUnreadCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let userId: string | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function refresh() {
      if (!userId) return;
      const { data: convs } = await supabase
        .from("conversations")
        .select("id, buyer_id, seller_id, buyer_last_read_at, seller_last_read_at")
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
      if (!convs?.length) {
        if (!cancelled) setCount(0);
        return;
      }
      let total = 0;
      for (const c of convs) {
        const readAt = c.buyer_id === userId ? c.buyer_last_read_at : c.seller_last_read_at;
        const { count: n } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", c.id)
          .neq("sender_id", userId)
          .gt("created_at", readAt);
        total += n ?? 0;
      }
      if (!cancelled) setCount(total);
    }

    (async () => {
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
      if (!userId) return;
      await refresh();
      channel = supabase
        .channel(`unread-${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          () => refresh(),
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "conversations" },
          () => refresh(),
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return count;
}

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = useUnreadCount();

  const right = [
    {
      to: "/messages" as const,
      label: "메시지",
      icon: MessageCircle,
      match: (p: string) => p.startsWith("/messages"),
      badge: unread,
    },
    {
      to: "/me" as const,
      label: "내 정보",
      icon: User,
      match: (p: string) => p.startsWith("/me"),
      badge: 0,
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-white shadow-nav safe-bottom">
      <div className="relative grid grid-cols-5 items-end px-2 pb-2 pt-2">
        {items.map((it) => {
          const active = it.match(pathname);
          const Icon = it.icon;
          return (
            <Link key={it.to} to={it.to} className="flex flex-col items-center gap-1 py-1">
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

        <Link to="/sell" className="flex flex-col items-center" aria-label="등록하기">
          <span className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-fab transition-transform active:scale-95">
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </span>
          <span className="mt-1 text-[10px] font-medium text-muted-foreground">등록하기</span>
        </Link>

        {right.map((it) => {
          const active = it.match(pathname);
          const Icon = it.icon;
          return (
            <Link key={it.to} to={it.to} className="flex flex-col items-center gap-1 py-1">
              <span className="relative">
                <Icon
                  className={`h-6 w-6 ${active ? "text-primary" : "text-muted-foreground"}`}
                  strokeWidth={active ? 2.4 : 1.8}
                />
                {it.badge > 0 && (
                  <span className="absolute -right-1.5 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                    {it.badge > 99 ? "99+" : it.badge}
                  </span>
                )}
              </span>
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
