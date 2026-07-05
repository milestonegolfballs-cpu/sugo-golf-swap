import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MobileShell } from "@/components/layout/MobileShell";
import { CATEGORY_LABEL, type CategorySlug } from "@/lib/categories";
import { formatKRW } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/messages/$id")({
  head: () => ({ meta: [{ title: "대화 — SUGO" }] }),
  component: ChatRoom,
});

const QUICK_MESSAGES = [
  "아직 판매중인가요?",
  "가격 제안 가능합니다.",
  "직거래 가능한가요?",
  "배송 가능한가요?",
];

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChatRoom() {
  const { id } = Route.useParams();
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const { data: conv, isLoading } = useQuery({
    queryKey: ["conversation", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("conversations")
        .select(
          `id, product_id, buyer_id, seller_id,
           listing:listings(id, title, category, price, quantity, photos),
           buyer:profiles!conversations_buyer_id_fkey(id, nickname, avatar_url),
           seller:profiles!conversations_seller_id_fkey(id, nickname, avatar_url)`,
        )
        .eq("id", id)
        .maybeSingle();
      return data;
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, message, created_at")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });
      return (data ?? []) as Message[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${id}`,
        },
        (payload) => {
          const m = payload.new as Message;
          queryClient.setQueryData<Message[]>(["messages", id], (prev = []) => {
            if (prev.some((x) => x.id === m.id)) return prev;
            return [...prev, m];
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  // Mark as read whenever messages change
  useEffect(() => {
    if (!conv) return;
    const field = conv.buyer_id === user.id ? "buyer_last_read_at" : "seller_last_read_at";
    supabase
      .from("conversations")
      .update({ [field]: new Date().toISOString() })
      .eq("id", id)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["conversations", user.id] });
      });
  }, [conv, messages.length, id, user.id, queryClient]);

  // Autoscroll to bottom
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight });
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: async (msg: string) => {
      const clean = msg.trim();
      if (!clean) return;
      const { error } = await supabase.from("messages").insert({
        conversation_id: id,
        sender_id: user.id,
        message: clean,
      });
      if (error) throw error;
    },
    onError: () => toast.error("메시지를 보내지 못했어요"),
  });

  function send(msg: string) {
    sendMutation.mutate(msg);
    setText("");
  }

  if (isLoading) {
    return (
      <MobileShell hideNav>
        <div className="p-6 text-sm text-muted-foreground">불러오는 중...</div>
      </MobileShell>
    );
  }
  if (!conv || !conv.listing) {
    return (
      <MobileShell hideNav>
        <div className="p-6 text-center text-sm text-muted-foreground">
          대화를 찾을 수 없어요.
        </div>
      </MobileShell>
    );
  }

  const other = conv.buyer_id === user.id ? conv.seller : conv.buyer;
  const sellerName = conv.seller?.nickname ?? "판매자";

  return (
    <div className="mx-auto flex h-screen w-full max-w-md flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-2 border-b border-border bg-white px-2 py-3">
        <button
          onClick={() => navigate({ to: "/messages" })}
          className="grid h-10 w-10 place-items-center"
          aria-label="뒤로"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="truncate text-base font-bold">{other?.nickname ?? "대화"}</h1>
      </header>

      {/* Product summary */}
      <Link
        to="/listings/$id"
        params={{ id: conv.product_id }}
        className="mx-3 mt-3 flex items-center gap-3 rounded-2xl border border-border/70 bg-white p-3 shadow-soft active:scale-[0.99]"
      >
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-surface">
          {conv.listing.photos?.[0] ? (
            <img src={conv.listing.photos[0]} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center bg-surface-strong">
              <div className="h-6 w-6 rounded-full border border-border bg-white" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              {CATEGORY_LABEL[conv.listing.category as CategorySlug] ?? "상품"}
            </span>
            {conv.listing.quantity ? (
              <span className="text-[10px] text-muted-foreground">
                {conv.listing.quantity}개
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 line-clamp-1 text-sm font-medium text-foreground">
            {conv.listing.title}
          </p>
          <p className="text-sm font-bold text-foreground">{formatKRW(conv.listing.price)}</p>
        </div>
        <div className="text-[10px] text-muted-foreground">판매자 {sellerName}</div>
      </Link>

      {/* Messages */}
      <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <p className="mt-10 text-center text-xs text-muted-foreground">
            첫 메시지를 보내 대화를 시작해보세요.
          </p>
        ) : (
          messages.map((m, i) => {
            const mine = m.sender_id === user.id;
            const prev = messages[i - 1];
            const showTime =
              !prev ||
              prev.sender_id !== m.sender_id ||
              new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() > 60_000;
            return (
              <div
                key={m.id}
                className={`flex flex-col gap-1 ${mine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed ${
                    mine
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-surface text-foreground"
                  }`}
                >
                  {m.message}
                </div>
                {showTime && (
                  <span className="px-1 text-[10px] text-muted-foreground">
                    {fmtTime(m.created_at)}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick messages */}
      <div className="flex gap-2 overflow-x-auto border-t border-border/60 bg-white px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {QUICK_MESSAGES.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            disabled={sendMutation.isPending}
            className="shrink-0 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground active:scale-95 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) send(text);
        }}
        className="flex items-center gap-2 border-t border-border bg-white px-3 py-3 safe-bottom"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="거래 문의를 입력하세요."
          className="flex-1 rounded-full border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white"
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={!text.trim() || sendMutation.isPending}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft active:scale-95 disabled:opacity-40"
          aria-label="보내기"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
