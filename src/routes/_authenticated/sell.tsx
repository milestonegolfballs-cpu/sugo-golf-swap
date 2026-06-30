import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, CONDITIONS, REGIONS, type CategorySlug } from "@/lib/categories";
import { PhotoUploader } from "@/components/listings/PhotoUploader";

export const Route = createFileRoute("/_authenticated/sell")({
  head: () => ({ meta: [{ title: "판매하기 — SUGO" }] }),
  component: SellPage,
});

type Mode = "sell" | "want";

function SellPage() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const [step, setStep] = useState<"type" | "form">("type");
  const [mode, setMode] = useState<Mode>("sell");
  const [category, setCategory] = useState<CategorySlug>("new_practice");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-white px-2 py-3">
        <button
          onClick={() => (step === "form" ? setStep("type") : navigate({ to: "/" }))}
          className="grid h-10 w-10 place-items-center"
          aria-label="뒤로"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold">{step === "type" ? "어떤 글을 올릴까요?" : (mode === "sell" ? "판매하기" : "구해요 등록")}</h1>
      </header>

      {step === "type" ? (
        <TypeStep
          mode={mode}
          setMode={setMode}
          category={category}
          setCategory={setCategory}
          onNext={() => setStep("form")}
        />
      ) : (
        <FormStep userId={user.id} mode={mode} category={category} onDone={(id) => navigate({ to: "/listings/$id", params: { id } })} />
      )}
    </div>
  );
}

function TypeStep({
  mode,
  setMode,
  category,
  setCategory,
  onNext,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  category: CategorySlug;
  setCategory: (c: CategorySlug) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex-1 px-5 py-6">
      <p className="text-sm font-medium text-muted-foreground">유형</p>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <TypeCard label="판매합니다" emoji="🏷️" active={mode === "sell"} onClick={() => setMode("sell")} />
        <TypeCard label="구합니다" emoji="📢" active={mode === "want"} onClick={() => setMode("want")} />
      </div>

      <p className="mt-7 text-sm font-medium text-muted-foreground">카테고리</p>
      <div className="mt-2 space-y-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setCategory(c.slug)}
            className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
              category === c.slug ? "border-primary bg-primary-soft" : "border-border bg-white"
            }`}
          >
            <span className="text-2xl">{c.emoji}</span>
            <div>
              <p className="text-sm font-bold text-foreground">{c.label}</p>
              <p className="text-xs text-muted-foreground">{c.description}</p>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        className="mt-8 w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground"
      >
        다음
      </button>
    </div>
  );
}

function TypeCard({ label, emoji, active, onClick }: { label: string; emoji: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-xl border p-5 transition ${
        active ? "border-primary bg-primary-soft" : "border-border bg-white"
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-sm font-bold text-foreground">{label}</span>
    </button>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary";

function FormStep({
  userId,
  mode,
  category,
  onDone,
}: {
  userId: string;
  mode: Mode;
  category: CategorySlug;
  onDone: (id: string) => void;
}) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState("");
  const [brand, setBrand] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number | "">("");
  const [pricePerBall, setPricePerBall] = useState<number | "">("");
  const [condition, setCondition] = useState<string>("A");
  const [submitting, setSubmitting] = useState(false);

  // Category-specific fields
  const showManufacturer = category === "new_practice";
  const showBrand = category === "lost_ball" || category === "new_practice";
  const showCondition = category === "used_practice";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toast.error("제목을 입력해 주세요");
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("listings")
        .insert({
          user_id: userId,
          listing_type: mode,
          category,
          title: title.trim(),
          description: description.trim() || null,
          region: region || null,
          brand: showBrand ? brand.trim() || null : null,
          manufacturer: showManufacturer ? manufacturer.trim() || null : null,
          quantity: Number(quantity) || 1,
          price: price === "" ? null : Number(price),
          price_per_ball: pricePerBall === "" ? null : Number(pricePerBall),
          condition: showCondition ? (condition as "S" | "A" | "B" | "C") : null,
          photos,
        })
        .select("id")
        .single();
      if (error) throw error;
      toast.success("등록이 완료되었어요");
      onDone(data.id);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "등록에 실패했어요");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 space-y-5 px-5 py-5 pb-32">
      <Field label="사진" required={mode === "sell"}>
        <PhotoUploader userId={userId} value={photos} onChange={setPhotos} />
      </Field>

      <Field label="제목" required>
        <input
          className={inputCls}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 타이틀리스트 Pro V1 신품 30구"
          maxLength={80}
          required
        />
      </Field>

      <Field label="설명">
        <textarea
          className={`${inputCls} min-h-[120px] resize-none`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="상품 상태, 거래 방법 등을 자세히 적어주세요."
          maxLength={1500}
        />
      </Field>

      <Field label="거래 지역">
        <select className={inputCls} value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">선택하세요</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>

      {showManufacturer && (
        <Field label="제조사">
          <input
            className={inputCls}
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            placeholder="예: 볼빅, 캘러웨이"
          />
        </Field>
      )}

      {showBrand && (
        <Field label="브랜드">
          <input
            className={inputCls}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="예: Titleist Pro V1"
          />
        </Field>
      )}

      {showCondition && (
        <Field label="상태">
          <select className={inputCls} value={condition} onChange={(e) => setCondition(e.target.value)}>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="수량(개)">
          <input
            type="number"
            min={1}
            className={inputCls}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </Field>
        <Field label="개당 가격(원)">
          <input
            type="number"
            min={0}
            className={inputCls}
            value={pricePerBall}
            onChange={(e) => setPricePerBall(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </Field>
      </div>

      <Field label={mode === "sell" ? "총 가격(원)" : "희망 가격(원)"}>
        <input
          type="number"
          min={0}
          className={inputCls}
          value={price}
          onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="비워두면 '가격 협의'로 표시됩니다"
        />
      </Field>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-border bg-white p-4 safe-bottom">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "등록 중..." : mode === "sell" ? "판매 등록하기" : "구해요 등록하기"}
        </button>
      </div>
    </form>
  );
}
