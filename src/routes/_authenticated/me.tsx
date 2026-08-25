import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Package,
  Heart,
  Eye,
  CheckCircle2,
  Pencil,
  Trash2,
  ChevronRight,
  Settings as SettingsIcon,
  LogOut,
  KeyRound,
  UserCog,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MobileShell } from "@/components/layout/MobileShell";
import { ListingCardHorizontal, type ListingPreview } from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { REGIONS } from "@/lib/categories";
import { CATEGORY_LABEL, type CategorySlug } from "@/lib/categories";
import { formatKRW } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/me")({
  head: () => ({ meta: [{ title: "내 정보 — SUGO" }] }),
  component: MePage,
});

type MyListing = ListingPreview & {
  status: "active" | "reserved" | "sold";
  views: number | null;
  is_active: boolean;
};

type StatusFilter = "all" | "active" | "reserved" | "sold";

const STATUS_LABEL: Record<Exclude<StatusFilter, "all">, string> = {
  active: "판매중",
  reserved: "예약중",
  sold: "거래완료",
};

function MePage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("nickname, avatar_url, region, seller_type, phone, email")
        .eq("id", user.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: myListings = [] } = useQuery({
    queryKey: ["my-listings", user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select(
          "id, title, price, price_per_ball, quantity, region, brand, photos, created_at, listing_type, category, status, views, is_active",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return (data ?? []) as unknown as MyListing[];
    },
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites", user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("favorites")
        .select(
          "listing:listings(id, title, price, price_per_ball, quantity, region, brand, photos, created_at, listing_type, category)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return (data ?? []).map((r) => r.listing as unknown as ListingPreview).filter(Boolean);
    },
  });

  // Recently viewed (from localStorage — max 20)
  const [recentIds, setRecentIds] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sugo:recent");
      setRecentIds(raw ? (JSON.parse(raw) as string[]).slice(0, 20) : []);
    } catch {
      setRecentIds([]);
    }
  }, []);

  const { data: recent = [] } = useQuery({
    queryKey: ["recent-listings", recentIds.join(",")],
    enabled: recentIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select(
          "id, title, price, price_per_ball, quantity, region, brand, photos, created_at, listing_type, category",
        )
        .in("id", recentIds);
      const map = new Map((data ?? []).map((l) => [l.id, l as unknown as ListingPreview]));
      return recentIds.map((id) => map.get(id)).filter(Boolean) as ListingPreview[];
    },
  });

  const stats = useMemo(() => {
    const total = myListings.length;
    const views = myListings.reduce((sum, l) => sum + (l.views ?? 0), 0);
    const sold = myListings.filter((l) => l.status === "sold").length;
    return { total, views, sold, favorites: favorites.length };
  }, [myListings, favorites.length]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("삭제되었어요");
      queryClient.invalidateQueries({ queryKey: ["my-listings", user.id] });
    },
    onError: () => toast.error("삭제에 실패했어요"),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const sellerTypeLabel = profile?.seller_type === "business" ? "업체" : "개인";

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-white px-2 py-3">
        <div className="flex items-center gap-2">
          <Link to="/" className="grid h-10 w-10 place-items-center" aria-label="뒤로">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold">내 정보</h1>
        </div>
      </header>

      {/* Profile header */}
      <section className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-primary-soft text-xl font-bold text-primary">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              (profile?.nickname ?? user.email ?? "U").slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-base font-bold text-foreground">
                {profile?.nickname ?? user.email}
              </p>
              <span className="inline-flex items-center rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
                {sellerTypeLabel}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {profile?.region ? `📍 ${profile.region}` : "지역 미설정"}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="mt-4 h-11 w-full rounded-2xl"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="mr-1 h-4 w-4" />
          프로필 수정
        </Button>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-4 gap-2 px-4">
        <StatCard icon={<Package className="h-5 w-5" />} label="등록 상품" value={stats.total} />
        <StatCard icon={<Heart className="h-5 w-5" />} label="관심 상품" value={stats.favorites} />
        <StatCard icon={<Eye className="h-5 w-5" />} label="조회수" value={stats.views} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="판매 완료" value={stats.sold} />
      </section>

      {/* My listings with tabs */}
      <section className="px-4 pt-8">
        <h2 className="mb-3 px-1 text-sm font-bold text-foreground">내 상품</h2>
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-surface">
            <TabsTrigger value="all" className="rounded-xl text-xs">전체</TabsTrigger>
            <TabsTrigger value="active" className="rounded-xl text-xs">판매중</TabsTrigger>
            <TabsTrigger value="reserved" className="rounded-xl text-xs">예약중</TabsTrigger>
            <TabsTrigger value="sold" className="rounded-xl text-xs">거래완료</TabsTrigger>
          </TabsList>
          {(["all", "active", "reserved", "sold"] as StatusFilter[]).map((s) => {
            const rows =
              s === "all" ? myListings : myListings.filter((l) => l.status === s);
            return (
              <TabsContent key={s} value={s} className="mt-4">
                {rows.length === 0 ? (
                  <EmptyListings />
                ) : (
                  <div className="space-y-3">
                    {rows.map((l) => (
                      <MyListingRow
                        key={l.id}
                        listing={l}
                        onDelete={() => {
                          if (confirm("이 상품을 삭제할까요?")) deleteMutation.mutate(l.id);
                        }}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </section>

      {/* Favorites */}
      <section className="px-4 pt-8">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-foreground">관심 상품</h2>
          <Link to="/favorites" className="text-xs font-medium text-muted-foreground">
            전체보기 <ChevronRight className="inline h-3 w-3" />
          </Link>
        </div>
        {favorites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
            관심상품이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.slice(0, 3).map((l) => (
              <ListingCardHorizontal key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      {/* Recently viewed */}
      <section className="px-4 pt-8">
        <h2 className="mb-3 px-1 text-sm font-bold text-foreground">최근 본 상품</h2>
        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
            최근에 본 상품이 없어요.
          </div>
        ) : (
          <div className="space-y-3">
            {recent.slice(0, 20).map((l) => (
              <ListingCardHorizontal key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      {/* Settings */}
      <section className="px-4 pb-10 pt-8">
        <h2 className="mb-3 px-1 text-sm font-bold text-foreground">
          <SettingsIcon className="mr-1 inline h-4 w-4" />
          설정
        </h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <SettingsRow
            icon={<UserCog className="h-5 w-5" />}
            label="회원정보 수정"
            onClick={() => setEditOpen(true)}
          />
          <SettingsRow
            icon={<KeyRound className="h-5 w-5" />}
            label="비밀번호 변경"
            onClick={() => setPwOpen(true)}
          />
          <SettingsRow
            icon={<LogOut className="h-5 w-5" />}
            label="로그아웃"
            onClick={signOut}
            danger
          />
        </div>
      </section>

      {/* 약관 및 정책 */}
      <section className="px-4 pb-4">
        <h2 className="mb-3 px-1 text-sm font-bold text-foreground">
          <FileText className="mr-1 inline h-4 w-4" />
          약관 및 정책
        </h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <SettingsLinkRow to="/legal/terms" label="이용약관" />
          <SettingsLinkRow to="/legal/privacy" label="개인정보처리방침" />
          <SettingsLinkRow to="/legal/business" label="사업자 정보" />
          <SettingsLinkRow to="/legal/notices" label="공지사항" />
          <SettingsLinkRow to="/legal/faq" label="자주 묻는 질문" />
        </div>
      </section>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        userId={user.id}
        initial={{
          nickname: profile?.nickname ?? "",
          region: profile?.region ?? "",
          phone: profile?.phone ?? "",
          seller_type: (profile?.seller_type as "individual" | "business") ?? "individual",
        }}
      />
      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
    </MobileShell>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-white p-3 shadow-soft">
      <span className="text-primary">{icon}</span>
      <span className="text-base font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function MyListingRow({
  listing,
  onDelete,
}: {
  listing: MyListing;
  onDelete: () => void;
}) {
  const status = listing.status ?? "active";
  return (
    <div className="rounded-2xl bg-white p-3 shadow-soft">
      <div className="flex gap-3">
        <Link
          to="/listings/$id"
          params={{ id: listing.id }}
          className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-surface"
        >
          {listing.photos?.[0] ? (
            <img
              src={listing.photos[0]}
              alt={listing.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface-strong">
              <div className="h-10 w-10 rounded-full border border-border bg-white" />
            </div>
          )}
          <span
            className={`absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              status === "active"
                ? "bg-primary text-primary-foreground"
                : status === "reserved"
                  ? "bg-foreground text-white"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {STATUS_LABEL[status]}
          </span>
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-1.5">
            {listing.category && (
              <span className="inline-flex items-center rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
                {CATEGORY_LABEL[listing.category as CategorySlug]}
              </span>
            )}
            {listing.quantity ? (
              <span className="text-[10px] text-muted-foreground">{listing.quantity}개</span>
            ) : null}
          </div>
          <Link
            to="/listings/$id"
            params={{ id: listing.id }}
            className="mt-1 line-clamp-1 text-sm font-medium text-foreground"
          >
            {listing.title}
          </Link>
          <p className="mt-0.5 text-base font-bold text-foreground">{formatKRW(listing.price)}</p>
          <p className="mt-auto text-[10px] text-muted-foreground">
            {new Date(listing.created_at).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 rounded-xl"
          onClick={() => toast.info("상품 수정 기능은 곧 제공됩니다")}
        >
          <Pencil className="mr-1 h-3.5 w-3.5" />
          수정
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 rounded-xl text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          삭제
        </Button>
      </div>
    </div>
  );
}

function EmptyListings() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-10 text-center">
      <p className="text-sm text-muted-foreground">아직 등록한 상품이 없습니다.</p>
      <Link
        to="/sell"
        className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
      >
        상품 등록하기
      </Link>
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-b border-border px-4 py-4 text-left last:border-b-0 ${
        danger ? "text-destructive" : "text-foreground"
      }`}
    >
      <span className={danger ? "text-destructive" : "text-muted-foreground"}>{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function SettingsLinkRow({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="flex w-full items-center gap-3 border-b border-border px-4 py-4 text-left text-foreground last:border-b-0"
    >
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function EditProfileDialog({
  open,
  onOpenChange,
  userId,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  initial: {
    nickname: string;
    region: string;
    phone: string;
    seller_type: "individual" | "business";
  };
}) {
  const queryClient = useQueryClient();
  const [nickname, setNickname] = useState(initial.nickname);
  const [region, setRegion] = useState(initial.region);
  const [phone, setPhone] = useState(initial.phone);
  const [sellerType, setSellerType] = useState(initial.seller_type);

  useEffect(() => {
    if (open) {
      setNickname(initial.nickname);
      setRegion(initial.region);
      setPhone(initial.phone);
      setSellerType(initial.seller_type);
    }
  }, [open, initial.nickname, initial.region, initial.phone, initial.seller_type]);

  const [saving, setSaving] = useState(false);

  async function onSave() {
    if (!nickname.trim()) {
      toast.error("닉네임을 입력해주세요");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        nickname: nickname.trim(),
        region: region || null,
        phone: phone || null,
        seller_type: sellerType,
      })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      toast.error("저장에 실패했어요");
      return;
    }
    toast.success("프로필이 저장되었어요");
    queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>프로필 수정</DialogTitle>
          <DialogDescription>다른 사용자에게 보여지는 정보를 관리하세요.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nick">닉네임</Label>
            <Input id="nick" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>판매자 유형</Label>
            <Select
              value={sellerType}
              onValueChange={(v) => setSellerType(v as "individual" | "business")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">개인</SelectItem>
                <SelectItem value="business">업체</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>지역</Label>
            <Select value={region || undefined} onValueChange={setRegion}>
              <SelectTrigger>
                <SelectValue placeholder="지역 선택" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">연락처</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={onSave} disabled={saving}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSave() {
    if (pw.length < 6) {
      toast.error("비밀번호는 6자 이상이어야 해요");
      return;
    }
    if (pw !== pw2) {
      toast.error("비밀번호가 일치하지 않아요");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("비밀번호가 변경되었어요");
    setPw("");
    setPw2("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>비밀번호 변경</DialogTitle>
          <DialogDescription>새 비밀번호를 입력해주세요.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pw">새 비밀번호</Label>
            <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw2">비밀번호 확인</Label>
            <Input id="pw2" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={onSave} disabled={saving}>
            변경
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
