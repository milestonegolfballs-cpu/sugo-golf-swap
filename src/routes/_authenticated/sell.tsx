import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronDown, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, REGIONS, type CategorySlug } from "@/lib/categories";
import { PhotoUploader } from "@/components/listings/PhotoUploader";
import { formatKRW } from "@/lib/format";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/sell")({
  head: () => ({ meta: [{ title: "상품 등록 — SUGO" }] }),
  component: SellPage,
});

type Mode = "sell" | "want";

function SellPage() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();

  const [mode, setMode] = useState<Mode>("sell");
  const [category, setCategory] = useState<CategorySlug>("new_practice");
  const [photos, setPhotos] = useState<string[]>([]);
  const [manufacturer, setManufacturer] = useState("");
  const [brand, setBrand] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [pricePerBall, setPricePerBall] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  // Auto-calc: qty × per → total; when only total edited, per is derived if qty present.
  function onQtyChange(v: string) {
    const q = v === "" ? "" : Math.max(0, Number(v));
    setQuantity(q);
    if (q !== "" && pricePerBall !== "") setPrice(Number(q) * Number(pricePerBall));
  }
  function onPerChange(v: string) {
    const p = v === "" ? "" : Math.max(0, Number(v));
    setPricePerBall(p);
    if (p !== "" && quantity !== "") setPrice(Number(quantity) * Number(p));
  }
  function onTotalChange(v: string) {
    const t = v === "" ? "" : Math.max(0, Number(v));
    setPrice(t);
    if (t !== "" && quantity !== "" && Number(quantity) > 0) {
      setPricePerBall(Math.round(Number(t) / Number(quantity)));
    }
  }

  const isPerBallCategory = category === "new_practice" || category === "used_practice";
  const total =
    typeof price === "number"
      ? price
      : typeof quantity === "number" && typeof pricePerBall === "number"
        ? quantity * pricePerBall
        : null;

  const isValid = useMemo(() => {
    if (photos.length === 0) return false;
    if (!region) return false;
    if (!quantity || Number(quantity) < 1) return false;
    if (category === "new_practice") {
      if (!manufacturer.trim() || !productName.trim()) return false;
      if (!pricePerBall || Number(pricePerBall) <= 0) return false;
    }
    if (category === "used_practice") {
      if (!pricePerBall || Number(pricePerBall) <= 0) return false;
    }
    if (category === "lost_ball") {
      if (!brand.trim() || !productName.trim()) return false;
      if (!price || Number(price) <= 0) return false;
    }
    return true;
  }, [photos, region, quantity, pricePerBall, price, category, manufacturer, brand, productName]);

  async function handleSubmit() {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      const title =
        category === "new_practice"
          ? `${manufacturer.trim()} ${productName.trim()}`.trim()
          : category === "lost_ball"
            ? `${brand.trim()} ${productName.trim()}`.trim()
            : `중고 연습공 ${quantity}개`;
      const { data, error } = await supabase
        .from("listings")
        .insert({
          user_id: user.id,
          listing_type: mode,
          category,
          title,
          description: description.trim() || null,
          region: region || null,
          brand: category === "lost_ball" ? brand.trim() || null : null,
          manufacturer: category === "new_practice" ? manufacturer.trim() || null : null,
          quantity: Number(quantity) || 1,
          price: total ?? null,
          price_per_ball: isPerBallCategory && pricePerBall !== "" ? Number(pricePerBall) : null,
          condition: null,
          photos,
        })
        .select("id")
        .single();
      if (error) throw error;
      setCreatedId(data.id);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "등록에 실패했어요");
    } finally {
      setSubmitting(false);
    }
  }

  if (createdId) {
    return (
      <SuccessScreen
        onView={() => navigate({ to: "/listings/$id", params: { id: createdId } })}
        onHome={() => navigate({ to: "/" })}
      />
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center gap-1 bg-white/90 px-2 pb-2 pt-3 backdrop-blur">
        <button
          onClick={() => navigate({ to: "/" })}
          className="grid h-10 w-10 place-items-center"
          aria-label="뒤로"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </header>

      <div className="px-5 pb-2">
        <h1 className="text-[26px] font-bold tracking-tight text-foreground">상품 등록</h1>
        <p className="mt-1 text-sm text-muted-foreground">30초 안에 상품을 등록해보세요.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex-1 space-y-7 px-5 pb-36 pt-4"
      >
        {/* Step 1 — 거래 유형 */}
        <Section step={1} title="거래 유형">
          <div className="grid grid-cols-2 gap-2.5">
            <SegmentButton active={mode === "sell"} onClick={() => setMode("sell")}>
              판매합니다
            </SegmentButton>
            <SegmentButton active={mode === "want"} onClick={() => setMode("want")}>
              구합니다
            </SegmentButton>
          </div>
        </Section>

        {/* Step 2 — 카테고리 */}
        <Section step={2} title="카테고리">
          <div className="space-y-2.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setCategory(c.slug)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition active:scale-[0.99]",
                  category === c.slug
                    ? "border-primary bg-primary-soft"
                    : "border-border bg-white",
                )}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-2xl shadow-soft">
                  {c.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-foreground">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.description}</p>
                </div>
                {category === c.slug && (
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </Section>

        {/* Photos */}
        <Section step={3} title="사진">
          <PhotoUploader userId={user.id} value={photos} onChange={setPhotos} max={10} />
          <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
            구매자가 상품 상태를 쉽게 확인할 수 있도록 선명한 사진을 등록해주세요.
          </p>
        </Section>

        {/* Step 4 — Details */}
        <Section step={4} title="상품 정보">
          <div className="space-y-4">
            {category === "new_practice" && (
              <>
                <Field label="제조사" required>
                  <TextInput
                    value={manufacturer}
                    onChange={setManufacturer}
                    placeholder="예: 볼빅, 캘러웨이"
                  />
                </Field>
                <Field label="제품명" required>
                  <TextInput
                    value={productName}
                    onChange={setProductName}
                    placeholder="예: Vivid XT AMT"
                  />
                </Field>
              </>
            )}

            {category === "lost_ball" && (
              <>
                <Field label="브랜드" required>
                  <TextInput
                    value={brand}
                    onChange={setBrand}
                    placeholder="예: Titleist, Callaway"
                  />
                </Field>
                <Field label="모델" required>
                  <TextInput
                    value={productName}
                    onChange={setProductName}
                    placeholder="예: Pro V1"
                  />
                </Field>
              </>
            )}

            <Field label="수량 (개)" required>
              <TextInput
                type="number"
                inputMode="numeric"
                value={quantity === "" ? "" : String(quantity)}
                onChange={onQtyChange}
                placeholder="예: 100"
              />
            </Field>

            {isPerBallCategory ? (
              <>
                <Field label="개당 가격 (원)" required>
                  <TextInput
                    type="number"
                    inputMode="numeric"
                    value={pricePerBall === "" ? "" : String(pricePerBall)}
                    onChange={onPerChange}
                    placeholder="예: 95"
                  />
                </Field>
                <Field label="총 가격 (원)">
                  <TextInput
                    type="number"
                    inputMode="numeric"
                    value={price === "" ? "" : String(price)}
                    onChange={onTotalChange}
                    placeholder="자동 계산됩니다"
                  />
                </Field>
                <TotalPreview
                  quantity={typeof quantity === "number" ? quantity : null}
                  perBall={typeof pricePerBall === "number" ? pricePerBall : null}
                  total={total}
                />
              </>
            ) : (
              <Field label="가격 (원)" required>
                <TextInput
                  type="number"
                  inputMode="numeric"
                  value={price === "" ? "" : String(price)}
                  onChange={onTotalChange}
                  placeholder="예: 50000"
                />
              </Field>
            )}

            <Field label="지역" required>
              <RegionPicker value={region} onChange={setRegion} />
            </Field>

            <Field label="상품 설명">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1500}
                placeholder="상품 상태, 배송 방법, 거래 조건 등을 자유롭게 작성해주세요."
                className="min-h-[140px] w-full resize-none rounded-2xl border border-border bg-white px-4 py-3.5 text-[15px] leading-relaxed outline-none transition placeholder:text-muted-foreground focus:border-primary"
              />
            </Field>
          </div>
        </Section>
      </form>

      {/* Sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-white/95 p-4 backdrop-blur safe-bottom">
        {!isValid && (
          <p className="mb-2 text-center text-[11px] text-muted-foreground">
            사진, 필수 정보를 입력하면 등록할 수 있어요
          </p>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="w-full rounded-2xl bg-primary py-4 text-[15px] font-bold text-primary-foreground shadow-soft transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
        >
          {submitting ? "등록 중..." : "등록하기"}
        </button>
      </div>
    </div>
  );
}

function Section({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {step}
        </span>
        <h2 className="text-[15px] font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SegmentButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border py-4 text-[15px] font-semibold transition active:scale-[0.99]",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-soft"
          : "border-border bg-white text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "decimal";
}) {
  return (
    <input
      type={type}
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-border bg-white px-4 py-3.5 text-[15px] outline-none transition placeholder:text-muted-foreground focus:border-primary"
    />
  );
}

function TotalPreview({
  quantity,
  perBall,
  total,
}: {
  quantity: number | null;
  perBall: number | null;
  total: number | null;
}) {
  if (!quantity || !perBall) return null;
  return (
    <div className="rounded-2xl bg-primary-soft px-4 py-3.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-medium text-primary/80">총액</p>
        <p className="text-lg font-black text-primary">{formatKRW(total ?? quantity * perBall)}</p>
      </div>
      <p className="mt-0.5 text-right text-[11px] text-primary/70">
        {quantity.toLocaleString()} × {perBall.toLocaleString()}원
      </p>
    </div>
  );
}

function RegionPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-2xl border border-border bg-white px-4 py-3.5 text-left text-[15px] outline-none transition focus:border-primary"
        >
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {value || "지역 선택"}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] rounded-2xl p-0" align="start">
        <Command>
          <CommandInput placeholder="지역 검색" />
          <CommandList>
            <CommandEmpty>결과가 없어요</CommandEmpty>
            <CommandGroup>
              {REGIONS.map((r) => (
                <CommandItem
                  key={r}
                  value={r}
                  onSelect={() => {
                    onChange(r);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", value === r ? "opacity-100" : "opacity-0")}
                  />
                  {r}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function SuccessScreen({ onView, onHome }: { onView: () => void; onHome: () => void }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center bg-background px-6 text-center">
      <div className="grid h-24 w-24 place-items-center rounded-full bg-primary-soft text-4xl">
        <PartyPopper className="h-12 w-12 text-primary" />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
        상품이 등록되었습니다.
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        지금 바로 등록한 상품을 확인해보세요.
      </p>
      <div className="mt-10 grid w-full grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onHome}
          className="rounded-2xl border border-border bg-white py-3.5 text-[15px] font-semibold text-foreground active:scale-[0.99]"
        >
          홈으로
        </button>
        <button
          type="button"
          onClick={onView}
          className="rounded-2xl bg-primary py-3.5 text-[15px] font-bold text-primary-foreground shadow-soft active:scale-[0.99]"
        >
          상품 보기
        </button>
      </div>
    </div>
  );
}
