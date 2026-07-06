import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "비밀번호 재설정 — SUGO" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const ok = password.length >= 8 && password === confirm;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ok) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("비밀번호가 변경되었어요.");
      navigate({ to: "/", replace: true });
    } catch {
      toast.error("변경에 실패했어요. 링크가 만료되었을 수 있어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background px-6 pt-14">
      <h1 className="text-2xl font-bold text-foreground">비밀번호 재설정</h1>
      <p className="mt-2 text-sm text-muted-foreground">새로운 비밀번호를 입력해 주세요.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-3">
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="새 비밀번호 (8자 이상)"
          className="w-full rounded-2xl border border-border bg-white px-4 py-3.5 text-[15px] shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="비밀번호 확인"
          className="w-full rounded-2xl border border-border bg-white px-4 py-3.5 text-[15px] shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={!ok || loading}
          className="w-full rounded-2xl bg-primary py-4 text-[15px] font-bold text-primary-foreground shadow-sm transition active:scale-[0.99] disabled:opacity-40"
        >
          {loading ? "변경중..." : "비밀번호 변경"}
        </button>
      </form>
    </div>
  );
}
