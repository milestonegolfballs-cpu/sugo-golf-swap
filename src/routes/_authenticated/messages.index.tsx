import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MobileShell } from "@/components/layout/MobileShell";
import { formatKRW, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/messages/")({
  head: () => ({ meta: [{ title: "메시지 — SUGO" }] }),
  component: MessagesIndex,
});

type Row = {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  buyer_last_read_at: string;
  seller_last_read_at: string;
  updated_at: string;
  listing: { id: string; title: string; photos: string[] | null; price: number | null } | null;
  buyer: { id: string; nickname: string | null; avatar_url: string | null } | null;
  seller: { id: string; nickname: string | null; avatar_url: string | null } | null;
  last_message?: { message: string; created_at: string; sender_id: string } | null;
  unread?: number;
};

function MessagesIndex() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["conversations", user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("conversations")
        .select(
          `id, product_id, buyer_id, seller_id, buyer_last_read_at, seller_last_read_at, updated_at,
           listing:listings(id, title, photos, price),
           buyer:profiles!conversations_buyer_id_fkey(id, nickname, avatar_url),
           seller:profiles!conversations_seller_id_fkey(id, nickname, avatar_url)`,
        )
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      const rows = (data ?? []) as unknown as Row[];
      // Fetch last message and unread count for each conversation
      await Promise.all(
        rows.map(async (r) => {
          const { data: msgs } = await supabase
            .from("messages")
            .select("message, created_at, sender_id")
            .eq("conversation_id", r.id)
            .order("created_at", { ascending: false })
            .limit(1);
          r.last_message = msgs?.[0] ?? null;

          const readAt =
            r.buyer_id === user.id ? r.buyer_last_read_at : r.seller_last_read_at;
          const { count } = await supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("conversation_id", r.id)
            .neq("sender_id", user.id)
            .gt("created_at", readAt);
          r.unread = count ?? 0;
        }),
      );
      return rows;
    },
  });

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`conv-list-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => queryClient.invalidateQueries({ queryKey: ["conversations", user.id] }),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "conversations" },
        () => queryClient.invalidateQueries({ queryKey: ["conversations", user.id] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id, queryClient]);

  const rows = query.data ?? [];

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-white px-2 py-3">
        <Link to="/" className="grid h-10 w-10 place-items-center" aria-label="뒤로">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold">메시지</h1>
      </header>

      {rows.length === 0 ? (
        <div className="px-6 py-24 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary">
            <MessageCircle className="h-7 w-7" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            아직 대화가 없어요.
            <br />
            관심 있는 상품에 문의해보세요.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {rows.map((r) => {
            const other = r.buyer_id === user.id ? r.seller : r.buyer;
            const preview =
              r.last_message?.message ??
              (r.listing ? `${r.listing.title} · ${formatKRW(r.listing.price)}` : "");
            return (
              <li key={r.id}>
                <button
                  onClick={() => navigate({ to: "/messages/$id", params: { id: r.id } })}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left active:bg-surface"
                >
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-surface">
                    {r.listing?.photos?.[0] ? (
                      <img
                        src={r.listing.photos[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-surface-strong">
                        <div className="h-6 w-6 rounded-full border border-border bg-white" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 overflow-hidden rounded-full border-2 border-white bg-primary-soft">
                      {other?.avatar_url ? (
                        <img src={other.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-[10px] font-bold text-primary">
                          {(other?.nickname ?? "?").slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {other?.nickname ?? "사용자"}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {timeAgo(r.last_message?.created_at ?? r.updated_at)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {r.listing?.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="line-clamp-1 flex-1 text-[13px] text-foreground/80">
                        {preview}
                      </p>
                      {r.unread && r.unread > 0 ? (
                        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                          {r.unread > 99 ? "99+" : r.unread}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </MobileShell>
  );
}
