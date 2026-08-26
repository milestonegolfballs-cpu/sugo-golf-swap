import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Check } from "lucide-react";
import { SugoLogo } from "@/components/brand/SugoLogo";
import { REGIONS } from "@/lib/categories";

const searchSchema = z.object({
  redirect: z.string().optional(),
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "로그인 — SUGO" },
      { name: "description", content: "SUGO에 로그인하고 골프공을 사고팔아 보세요." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

const BUSINESS_TYPES = ["골프연습장", "골프샵", "골프공 판매업체", "기타"];

function translateAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "이메일 또는 비밀번호가 올바르지 않아요.";
  if (m.includes("email not confirmed")) return "이메일 인증이 필요해요.";
  if (m.includes("already registered") || m.includes("already been registered") || m.includes("user already"))
    return "이미 가입된 이메일이에요. 로그인해 주세요.";
  if (m.includes("password") && m.includes("6")) return "비밀번호는 8자 이상이어야 해요.";
  if (m.includes("rate limit")) return "잠시 후 다시 시도해 주세요.";
  return "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.";
}

function AuthPage() {
  const navigate = useNavigate();
  const { redirect, mode: initialMode } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<Mode>(initialMode ?? "signin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: redirect ?? "/", replace: true });
    });
  }, [navigate, redirect]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header className="flex items-center px-4 py-3">
        <button
          onClick={() => navigate({ to: "/" })}
          className="grid h-10 w-10 place-items-center -ml-2"
          aria-label="뒤로"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </header>

      <div className="px-6 pt-2">
        <SugoLogo size="lg" />
        <h1 className="mt-6 text-2xl font-bold text-foreground">
          {mode === "signin" ? "로그인" : "회원가입"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">수고한 골프공의 새로운 시작</p>
      </div>

      <div className="mt-8 flex-1 px-6 pb-10">
        {mode === "signin" ? (
          <SignInForm
            loading={loading}
            setLoading={setLoading}
            onSwitch={() => setMode("signup")}
            redirect={redirect}
          />
        ) : (
          <SignUpForm
            loading={loading}
            setLoading={setLoading}
            onSwitch={() => setMode("signin")}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- SIGN IN ---------------- */

function SignInForm({
  loading,
  setLoading,
  onSwitch,
  redirect,
}: {
  loading: boolean;
  setLoading: (v: boolean) => void;
  onSwitch: () => void;
  redirect?: string;
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("로그인 성공");
      navigate({ to: redirect ?? "/", replace: true });
    } catch (err) {
      toast.error(translateAuthError(err instanceof Error ? err.message : ""));
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setLoading(true);
    // Supabase 표준 OAuth 플로우 — 특수 서버 경로 없이 어떤 도메인
    // (Vercel 포함)에서도 동작합니다. 구글로 리디렉션됐다가 로그인
    // 완료 후 다시 이 사이트로 돌아옵니다.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      toast.error("Google 로그인에 실패했어요");
      setLoading(false);
    }
    // 성공 시 브라우저가 구글로 즉시 이동하므로 별도 처리가 필요 없습니다.
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-3">
        <RoundedInput
          type="email"
          required
          value={email}
          onChange={setEmail}
          placeholder="이메일"
          autoComplete="email"
        />
        <RoundedInput
          type="password"
          required
          minLength={8}
          value={password}
          onChange={setPassword}
          placeholder="비밀번호"
          autoComplete="current-password"
        />
        <PrimaryButton loading={loading} type="submit">
          로그인
        </PrimaryButton>
      </form>

      <Divider />

      <button
        type="button"
        onClick={onGoogle}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-white py-3.5 text-sm font-medium text-foreground shadow-sm transition active:scale-[0.99] disabled:opacity-60"
      >
        <GoogleIcon />
        Google 로그인
      </button>

      <div className="mt-6 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onSwitch}
          className="font-semibold text-primary"
        >
          회원가입
        </button>
        <Link to="/forgot-password" className="text-muted-foreground">
          비밀번호 찾기
        </Link>
      </div>
    </>
  );
}

/* ---------------- SIGN UP ---------------- */

function SignUpForm({
  loading,
  setLoading,
  onSwitch,
}: {
  loading: boolean;
  setLoading: (v: boolean) => void;
  onSwitch: () => void;
}) {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [region, setRegion] = useState("");
  const [sellerType, setSellerType] = useState<"individual" | "business">("individual");
  const [businessType, setBusinessType] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const passwordOk = password.length >= 8;
  const passwordsMatch = password === confirm && confirm.length > 0;
  const businessOk = sellerType === "individual" || businessType.length > 0;
  const canSubmit =
    nickname.trim().length > 0 &&
    email.includes("@") &&
    passwordOk &&
    passwordsMatch &&
    region.length > 0 &&
    businessOk &&
    agreeTerms &&
    agreePrivacy;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            nickname: nickname.trim(),
            region,
            seller_type: sellerType,
            business_type: sellerType === "business" ? businessType : null,
          },
        },
      });
      if (error) throw error;
      toast.success("가입을 환영합니다!");
      navigate({ to: "/welcome", replace: true });
    } catch (err) {
      toast.error(translateAuthError(err instanceof Error ? err.message : ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <RoundedInput value={nickname} onChange={setNickname} placeholder="닉네임" required />
      <RoundedInput
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="이메일"
        required
        autoComplete="email"
      />
      <div>
        <RoundedInput
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="비밀번호 (8자 이상)"
          required
          minLength={8}
          autoComplete="new-password"
        />
        {password.length > 0 && !passwordOk && (
          <p className="mt-1 pl-1 text-xs text-destructive">비밀번호는 8자 이상이어야 해요.</p>
        )}
      </div>
      <div>
        <RoundedInput
          type="password"
          value={confirm}
          onChange={setConfirm}
          placeholder="비밀번호 확인"
          required
          minLength={8}
          autoComplete="new-password"
        />
        {confirm.length > 0 && !passwordsMatch && (
          <p className="mt-1 pl-1 text-xs text-destructive">비밀번호가 일치하지 않아요.</p>
        )}
      </div>

      <SelectField value={region} onChange={setRegion} placeholder="지역 선택" options={REGIONS} />

      <div className="pt-2">
        <p className="mb-2 pl-1 text-sm font-medium text-foreground">회원 유형</p>
        <div className="grid grid-cols-2 gap-2">
          <RadioTile
            selected={sellerType === "individual"}
            onClick={() => setSellerType("individual")}
            label="개인"
          />
          <RadioTile
            selected={sellerType === "business"}
            onClick={() => setSellerType("business")}
            label="업체"
          />
        </div>
      </div>

      {sellerType === "business" && (
        <SelectField
          value={businessType}
          onChange={setBusinessType}
          placeholder="업종 선택"
          options={BUSINESS_TYPES}
        />
      )}

      <div className="space-y-2 pt-3">
        <CheckboxRow checked={agreeTerms} onChange={setAgreeTerms} label="이용약관 동의 (필수)" />
        <CheckboxRow
          checked={agreePrivacy}
          onChange={setAgreePrivacy}
          label="개인정보 처리방침 동의 (필수)"
        />
      </div>

      <div className="pt-3">
        <PrimaryButton loading={loading} type="submit" disabled={!canSubmit}>
          회원가입
        </PrimaryButton>
      </div>

      <button
        type="button"
        onClick={onSwitch}
        className="mt-2 block w-full text-center text-sm text-muted-foreground"
      >
        이미 계정이 있으신가요? <span className="font-semibold text-primary">로그인</span>
      </button>
    </form>
  );
}

/* ---------------- Building blocks ---------------- */

function RoundedInput({
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  minLength,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      minLength={minLength}
      autoComplete={autoComplete}
      className="w-full rounded-2xl border border-border bg-white px-4 py-3.5 text-[15px] shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
    />
  );
}

function SelectField({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: readonly string[] | string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none rounded-2xl border border-border bg-white px-4 py-3.5 text-[15px] shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
          value ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
        />
      </svg>
    </div>
  );
}

function RadioTile({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center rounded-2xl border py-3.5 text-sm font-semibold shadow-sm transition ${
        selected
          ? "border-primary bg-primary/5 text-primary"
          : "border-border bg-white text-foreground"
      }`}
    >
      <span
        className={`mr-2 grid h-4 w-4 place-items-center rounded-full border-2 ${
          selected ? "border-primary" : "border-border"
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
      </span>
      {label}
    </button>
  );
}

function CheckboxRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left text-sm text-foreground"
    >
      <span
        className={`grid h-5 w-5 place-items-center rounded-md border-2 transition ${
          checked ? "border-primary bg-primary text-white" : "border-border bg-white"
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}

function PrimaryButton({
  children,
  loading,
  disabled,
  type = "button",
  onClick,
}: {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full rounded-2xl bg-primary py-4 text-[15px] font-bold text-primary-foreground shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? "잠시만요..." : children}
    </button>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      또는
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8a12 12 0 110-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1024 44c11 0 20-9 20-20 0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 006.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.3l-6.3-5.2A12 12 0 0124 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3a12 12 0 01-4.1 5.5l6.3 5.2C41.4 36 44 30.5 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
