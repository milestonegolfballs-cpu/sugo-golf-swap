import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{ title: "비밀번호 찾기 — SUGO" }],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("재설정 링크를 보내드렸어요.");
    } catch {
      toast.error("요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header className="flex items-center px-4 py-3">
        <button
          onClick={() => navigate({ to: "/auth" })}
          className="grid h-10 w-10 place-items-center -ml-2"
          aria-label="뒤로"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </header>

      <div className="px-6 pt-2">
        <h1 className="text-2xl font-bold text-foreground">비밀번호 찾기</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          가입하신 이메일로 재설정 링크를 보내드려요.
        </p>
      </div>

      {sent ? (
        <div className="px-6 pt-10 text-center">
          <div className="text-5xl">📮</div>
          <p className="mt-4 text-[15px] text-foreground">이메일을 확인해 주세요.</p>
          <Link
            to="/auth"
            className="mt-8 inline-block text-sm font-semibold text-primary"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-3 px-6">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-full rounded-2xl border border-border bg-white px-4 py-3.5 text-[15px] shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary py-4 text-[15px] font-bold text-primary-foreground shadow-sm transition active:scale-[0.99] disabled:opacity-40"
          >
            {loading ? "전송중..." : "재설정 링크 보내기"}
          </button>
        </form>
      )}
    </div>
  );
}
