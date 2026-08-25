import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SugoLogo } from "@/components/brand/SugoLogo";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "환영합니다 — SUGO" },
      { name: "description", content: "SUGO에 오신 것을 환영합니다." },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background px-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <SugoLogo size="md" />
        <div className="mt-10 text-6xl">🎉</div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">환영합니다.</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          SUGO에서 원하는 골프공을
          <br />
          쉽게 사고 팔아보세요.
        </p>
      </div>

      <div className="space-y-3 pb-10">
        <button
          onClick={() => navigate({ to: "/listings" })}
          className="w-full rounded-2xl bg-primary py-4 text-[15px] font-bold text-primary-foreground shadow-sm transition active:scale-[0.99]"
        >
          상품 둘러보기
        </button>
        <button
          onClick={() => navigate({ to: "/sell" })}
          className="w-full rounded-2xl border border-border bg-white py-4 text-[15px] font-bold text-foreground shadow-sm transition active:scale-[0.99]"
        >
          상품 등록하기
        </button>
      </div>
    </div>
  );
}
