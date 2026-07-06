import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  LayoutDashboard,
  Users as UsersIcon,
  Package,
  Flag,
  Search,
  Trash2,
  Eye,
  Ban,
  ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const userId = (context as { user?: { id: string } }).user?.id;
    if (!userId) throw redirect({ to: "/auth" });
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!data) throw redirect({ to: "/" });
  },
  component: AdminPage,
});

type Tab = "overview" | "listings" | "users" | "reports";

function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white font-bold">
            S
          </div>
          <div>
            <p className="text-sm font-bold">SUGO Admin</p>
            <p className="text-[11px] text-muted-foreground">Control Panel</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          <NavItem icon={<LayoutDashboard className="h-4 w-4" />} label="Overview" active={tab === "overview"} onClick={() => setTab("overview")} />
          <NavItem icon={<Package className="h-4 w-4" />} label="Listings" active={tab === "listings"} onClick={() => setTab("listings")} />
          <NavItem icon={<UsersIcon className="h-4 w-4" />} label="Users" active={tab === "users"} onClick={() => setTab("users")} />
          <NavItem icon={<Flag className="h-4 w-4" />} label="Reports" active={tab === "reports"} onClick={() => setTab("reports")} />
        </nav>
        <div className="border-t border-border p-3">
          <button
            onClick={() => navigate({ to: "/" })}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Back to app
          </button>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-white/80 px-6 backdrop-blur lg:px-10">
          <div>
            <h1 className="text-lg font-semibold capitalize">{tab}</h1>
            <p className="text-xs text-muted-foreground">Manage SUGO marketplace</p>
          </div>
          <MobileTabs tab={tab} setTab={setTab} />
        </header>

        <main className="p-6 lg:p-10">
          {tab === "overview" && <OverviewTab />}
          {tab === "listings" && <ListingsTab />}
          {tab === "users" && <UsersTab />}
          {tab === "reports" && <ReportsTab />}
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
        active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileTabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: { key: Tab; label: string }[] = [
    { key: "overview", label: "개요" },
    { key: "listings", label: "상품" },
    { key: "users", label: "회원" },
    { key: "reports", label: "신고" },
  ];
  return (
    <div className="flex gap-1 lg:hidden">
      {items.map((i) => (
        <button
          key={i.key}
          onClick={() => setTab(i.key)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
            tab === i.key ? "bg-primary text-white" : "bg-muted text-foreground"
          }`}
        >
          {i.label}
        </button>
      ))}
    </div>
  );
}

/* ================== OVERVIEW ================== */

function OverviewTab() {
  const stats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();

      const [users, listings, active, sold, newUsers, newListings] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("listings").select("id", { count: "exact", head: true }),
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "sold"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", todayIso),
        supabase.from("listings").select("id", { count: "exact", head: true }).gte("created_at", todayIso),
      ]);
      return {
        users: users.count ?? 0,
        listings: listings.count ?? 0,
        active: active.count ?? 0,
        sold: sold.count ?? 0,
        newUsers: newUsers.count ?? 0,
        newListings: newListings.count ?? 0,
      };
    },
  });

  const recent = useQuery({
    queryKey: ["admin", "recent-listings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select("id, title, category, region, status, created_at, photos, user_id")
        .order("created_at", { ascending: false })
        .limit(8);
      const ids = Array.from(new Set((data ?? []).map((l) => l.user_id)));
      const { data: profs } = await supabase.from("profiles").select("id, nickname").in("id", ids);
      const map = new Map((profs ?? []).map((p) => [p.id, p.nickname]));
      return (data ?? []).map((l) => ({ ...l, seller: map.get(l.user_id) ?? "—" }));
    },
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="총 회원" value={stats.data?.users} tone="default" />
        <StatCard label="총 상품" value={stats.data?.listings} tone="default" />
        <StatCard label="판매중" value={stats.data?.active} tone="primary" />
        <StatCard label="거래완료" value={stats.data?.sold} tone="default" />
        <StatCard label="오늘 가입" value={stats.data?.newUsers} tone="accent" />
        <StatCard label="오늘 등록" value={stats.data?.newListings} tone="accent" />
      </div>

      <AnalyticsSection />

      <Card>
        <CardHeader title="최근 등록" description="최근 등록된 상품 8개" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <Th>상품</Th>
                <Th>카테고리</Th>
                <Th>판매자</Th>
                <Th>지역</Th>
                <Th>상태</Th>
                <Th>등록일</Th>
                <Th className="text-right">액션</Th>
              </tr>
            </thead>
            <tbody>
              {recent.data?.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <Td>
                    <div className="flex items-center gap-3">
                      <img
                        src={r.photos?.[0] ?? ""}
                        alt=""
                        loading="lazy"
                        className="h-10 w-10 rounded-lg bg-muted object-cover"
                      />
                      <span className="font-medium">{r.title}</span>
                    </div>
                  </Td>
                  <Td>{categoryLabel(r.category)}</Td>
                  <Td>{r.seller}</Td>
                  <Td>{r.region ?? "—"}</Td>
                  <Td><StatusBadge status={r.status} /></Td>
                  <Td>{formatDate(r.created_at)}</Td>
                  <Td className="text-right">
                    <Link to="/listings/$id" params={{ id: r.id }} className="text-primary hover:underline">
                      보기
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function AnalyticsSection() {
  const analytics = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - 29);
      since.setHours(0, 0, 0, 0);

      const [profs, listings] = await Promise.all([
        supabase.from("profiles").select("created_at").gte("created_at", since.toISOString()),
        supabase.from("listings").select("category, user_id"),
      ]);

      // signups per day
      const days: { date: string; users: number }[] = [];
      for (let i = 0; i < 30; i++) {
        const d = new Date(since);
        d.setDate(d.getDate() + i);
        days.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, users: 0 });
      }
      (profs.data ?? []).forEach((p) => {
        const d = new Date(p.created_at);
        const idx = Math.floor((d.getTime() - since.getTime()) / 86400000);
        if (idx >= 0 && idx < 30) days[idx].users++;
      });

      const catCount: Record<string, number> = {};
      const sellerCount: Record<string, number> = {};
      const sellerIds = new Set<string>();
      (listings.data ?? []).forEach((l) => {
        catCount[l.category] = (catCount[l.category] ?? 0) + 1;
        sellerIds.add(l.user_id);
      });

      const { data: sellerProfs } = await supabase
        .from("profiles")
        .select("id, seller_type")
        .in("id", Array.from(sellerIds));
      (sellerProfs ?? []).forEach((s) => {
        sellerCount[s.seller_type] = (sellerCount[s.seller_type] ?? 0) + 1;
      });

      return {
        signups: days,
        categories: Object.entries(catCount).map(([name, value]) => ({ name: categoryLabel(name), value })),
        sellerTypes: Object.entries(sellerCount).map(([name, value]) => ({
          name: name === "business" ? "업체" : "개인",
          value,
        })),
      };
    },
  });

  const data = analytics.data;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader title="신규 회원" description="최근 30일" />
        <div className="h-64 px-2 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.signups ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#2E7D32" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader title="회원 유형" description="가입 회원 비율" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data?.sellerTypes ?? []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {(data?.sellerTypes ?? []).map((_, i) => (
                  <Cell key={i} fill={["#2E7D32", "#94A3B8"][i % 2]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader title="카테고리별 상품 수" />
        <div className="h-64 px-2 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.categories ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2E7D32" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

/* ================== LISTINGS ================== */

function ListingsTab() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(0);
  const PAGE = 20;

  const listings = useQuery({
    queryKey: ["admin", "listings", q, category, status, page],
    queryFn: async () => {
      let query = supabase
        .from("listings")
        .select("id, title, category, region, status, created_at, photos, user_id", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE, page * PAGE + PAGE - 1);
      if (q) query = query.ilike("title", `%${q}%`);
      if (category !== "all") query = query.eq("category", category as "new_practice" | "used_practice" | "lost_ball");
      if (status !== "all") query = query.eq("status", status as "active" | "reserved" | "sold");
      const { data, count } = await query;
      const ids = Array.from(new Set((data ?? []).map((l) => l.user_id)));
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("id, nickname").in("id", ids)
        : { data: [] };
      const map = new Map((profs ?? []).map((p) => [p.id, p.nickname]));
      return {
        rows: (data ?? []).map((l) => ({ ...l, seller: map.get(l.user_id) ?? "—" })),
        count: count ?? 0,
      };
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("상품이 삭제되었어요");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: () => toast.error("삭제에 실패했어요"),
  });

  return (
    <div className="space-y-4">
      <FilterBar
        search={{ value: q, onChange: setQ, placeholder: "상품 검색" }}
        selects={[
          { value: category, onChange: setCategory, options: [
            { value: "all", label: "전체 카테고리" },
            { value: "new_practice", label: "신품 연습구" },
            { value: "used_practice", label: "중고 연습구" },
            { value: "lost_ball", label: "로스트볼" },
          ] },
          { value: status, onChange: setStatus, options: [
            { value: "all", label: "전체 상태" },
            { value: "active", label: "판매중" },
            { value: "reserved", label: "예약중" },
            { value: "sold", label: "거래완료" },
          ] },
        ]}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <Th>상품</Th>
                <Th>카테고리</Th>
                <Th>판매자</Th>
                <Th>지역</Th>
                <Th>상태</Th>
                <Th>등록일</Th>
                <Th className="text-right">액션</Th>
              </tr>
            </thead>
            <tbody>
              {listings.data?.rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <Td>
                    <div className="flex items-center gap-3">
                      <img src={r.photos?.[0] ?? ""} alt="" loading="lazy" className="h-10 w-10 rounded-lg bg-muted object-cover" />
                      <span className="font-medium">{r.title}</span>
                    </div>
                  </Td>
                  <Td>{categoryLabel(r.category)}</Td>
                  <Td>{r.seller}</Td>
                  <Td>{r.region ?? "—"}</Td>
                  <Td><StatusBadge status={r.status} /></Td>
                  <Td>{formatDate(r.created_at)}</Td>
                  <Td className="text-right">
                    <div className="inline-flex gap-1">
                      <IconLink to="/listings/$id" params={{ id: r.id }}><Eye className="h-4 w-4" /></IconLink>
                      <IconBtn onClick={() => confirm("삭제하시겠어요?") && del.mutate(r.id)} danger>
                        <Trash2 className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  </Td>
                </tr>
              ))}
              {listings.data && listings.data.rows.length === 0 && (
                <tr><Td className="py-12 text-center text-muted-foreground" colSpan={7 as unknown as number}>결과가 없어요</Td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pager page={page} setPage={setPage} count={listings.data?.count ?? 0} pageSize={PAGE} />
      </Card>
    </div>
  );
}

/* ================== USERS ================== */

function UsersTab() {
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const [q, setQ] = useState("");
  const [sellerType, setSellerType] = useState("all");
  const [region, setRegion] = useState("all");
  const [page, setPage] = useState(0);
  const PAGE = 20;

  const users = useQuery({
    queryKey: ["admin", "users", q, sellerType, region, page],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id, nickname, email, seller_type, business_type, region, created_at, is_suspended", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE, page * PAGE + PAGE - 1);
      if (q) query = query.or(`nickname.ilike.%${q}%,email.ilike.%${q}%`);
      if (sellerType !== "all") query = query.eq("seller_type", sellerType as "individual" | "business");
      if (region !== "all") query = query.eq("region", region);
      const { data, count } = await query;

      const ids = (data ?? []).map((u) => u.id);
      const { data: counts } = ids.length
        ? await supabase.from("listings").select("user_id").in("user_id", ids)
        : { data: [] };
      const map = new Map<string, number>();
      (counts ?? []).forEach((r) => map.set(r.user_id, (map.get(r.user_id) ?? 0) + 1));
      return {
        rows: (data ?? []).map((u) => ({ ...u, listingCount: map.get(u.id) ?? 0 })),
        count: count ?? 0,
      };
    },
  });

  const suspend = useMutation({
    mutationFn: async ({ id, suspend }: { id: string; suspend: boolean }) => {
      const { error } = await supabase.from("profiles").update({ is_suspended: suspend }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("상태가 변경되었어요");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: () => toast.error("실패했어요"),
  });

  const regionOptions = useMemo(() => {
    const set = new Set<string>();
    users.data?.rows.forEach((u) => u.region && set.add(u.region));
    return [{ value: "all", label: "전체 지역" }, ...Array.from(set).map((r) => ({ value: r, label: r }))];
  }, [users.data]);

  return (
    <div className="space-y-4">
      <FilterBar
        search={{ value: q, onChange: setQ, placeholder: "회원 검색 (닉네임, 이메일)" }}
        selects={[
          { value: sellerType, onChange: setSellerType, options: [
            { value: "all", label: "전체 유형" },
            { value: "individual", label: "개인" },
            { value: "business", label: "업체" },
          ] },
          { value: region, onChange: setRegion, options: regionOptions },
        ]}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <Th>닉네임</Th>
                <Th>이메일</Th>
                <Th>유형</Th>
                <Th>업종</Th>
                <Th>지역</Th>
                <Th>가입일</Th>
                <Th>상품수</Th>
                <Th className="text-right">액션</Th>
              </tr>
            </thead>
            <tbody>
              {users.data?.rows.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <Td className="font-medium">
                    {u.nickname}
                    {u.is_suspended && <span className="ml-2 rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">정지</span>}
                  </Td>
                  <Td className="text-muted-foreground">{u.email ?? "—"}</Td>
                  <Td>{u.seller_type === "business" ? "업체" : "개인"}</Td>
                  <Td>{u.business_type ?? "—"}</Td>
                  <Td>{u.region ?? "—"}</Td>
                  <Td>{formatDate(u.created_at)}</Td>
                  <Td>{u.listingCount}</Td>
                  <Td className="text-right">
                    <button
                      onClick={() => suspend.mutate({ id: u.id, suspend: !u.is_suspended })}
                      disabled={u.id === me?.id}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                        u.is_suspended ? "bg-primary/10 text-primary" : "bg-muted text-foreground"
                      } disabled:opacity-40`}
                    >
                      <Ban className="h-3 w-3" />
                      {u.is_suspended ? "해제" : "정지"}
                    </button>
                  </Td>
                </tr>
              ))}
              {users.data && users.data.rows.length === 0 && (
                <tr><Td className="py-12 text-center text-muted-foreground" colSpan={8 as unknown as number}>결과가 없어요</Td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pager page={page} setPage={setPage} count={users.data?.count ?? 0} pageSize={PAGE} />
      </Card>
    </div>
  );
}

/* ================== REPORTS ================== */

function ReportsTab() {
  const qc = useQueryClient();
  const reports = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reports")
        .select("id, listing_id, reporter_id, reason, status, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      const listingIds = Array.from(new Set((data ?? []).map((r) => r.listing_id)));
      const reporterIds = Array.from(new Set((data ?? []).map((r) => r.reporter_id)));
      const [listings, reporters] = await Promise.all([
        listingIds.length ? supabase.from("listings").select("id, title, user_id").in("id", listingIds) : Promise.resolve({ data: [] as { id: string; title: string; user_id: string }[] }),
        reporterIds.length ? supabase.from("profiles").select("id, nickname").in("id", reporterIds) : Promise.resolve({ data: [] as { id: string; nickname: string }[] }),
      ]);
      const sellerIds = Array.from(new Set((listings.data ?? []).map((l) => l.user_id)));
      const { data: sellers } = sellerIds.length
        ? await supabase.from("profiles").select("id, nickname").in("id", sellerIds)
        : { data: [] as { id: string; nickname: string }[] };
      const lm = new Map((listings.data ?? []).map((l) => [l.id, l]));
      const rm = new Map((reporters.data ?? []).map((r) => [r.id, r.nickname]));
      const sm = new Map((sellers ?? []).map((s) => [s.id, s.nickname]));
      return (data ?? []).map((r) => {
        const l = lm.get(r.listing_id);
        return {
          ...r,
          product: l?.title ?? "삭제된 상품",
          product_id: l?.id,
          seller: l ? sm.get(l.user_id) ?? "—" : "—",
          seller_id: l?.user_id,
          reporter: rm.get(r.reporter_id) ?? "—",
        };
      });
    },
  });

  const update = useMutation({
    mutationFn: async (input: { action: "ignore" | "remove" | "suspend"; report: { id: string; product_id?: string; seller_id?: string } }) => {
      const { action, report } = input;
      if (action === "ignore") {
        await supabase.from("reports").update({ status: "ignored", resolved_at: new Date().toISOString() }).eq("id", report.id);
      } else if (action === "remove" && report.product_id) {
        await supabase.from("listings").delete().eq("id", report.product_id);
        await supabase.from("reports").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", report.id);
      } else if (action === "suspend" && report.seller_id) {
        await supabase.from("profiles").update({ is_suspended: true }).eq("id", report.seller_id);
        await supabase.from("reports").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", report.id);
      }
    },
    onSuccess: () => {
      toast.success("처리되었어요");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: () => toast.error("처리에 실패했어요"),
  });

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <Th>상품</Th>
              <Th>판매자</Th>
              <Th>사유</Th>
              <Th>신고자</Th>
              <Th>날짜</Th>
              <Th>상태</Th>
              <Th className="text-right">액션</Th>
            </tr>
          </thead>
          <tbody>
            {reports.data?.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <Td className="font-medium">
                  {r.product_id ? (
                    <Link to="/listings/$id" params={{ id: r.product_id }} className="hover:underline">
                      {r.product}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">{r.product}</span>
                  )}
                </Td>
                <Td>{r.seller}</Td>
                <Td className="max-w-xs truncate">{r.reason}</Td>
                <Td>{r.reporter}</Td>
                <Td>{formatDate(r.created_at)}</Td>
                <Td><ReportStatus status={r.status} /></Td>
                <Td className="text-right">
                  {r.status === "open" ? (
                    <div className="inline-flex gap-1">
                      <ActionBtn onClick={() => update.mutate({ action: "ignore", report: r })}>무시</ActionBtn>
                      <ActionBtn danger onClick={() => confirm("상품을 삭제하시겠어요?") && update.mutate({ action: "remove", report: r })}>상품 삭제</ActionBtn>
                      <ActionBtn danger onClick={() => confirm("판매자를 정지하시겠어요?") && update.mutate({ action: "suspend", report: r })}>판매자 정지</ActionBtn>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">처리 완료</span>
                  )}
                </Td>
              </tr>
            ))}
            {reports.data && reports.data.length === 0 && (
              <tr><Td className="py-12 text-center text-muted-foreground" colSpan={7 as unknown as number}>신고 내역이 없어요</Td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ================== UI atoms ================== */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-border bg-white shadow-sm ${className}`}>{children}</div>;
}

function CardHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b border-border px-6 py-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value?: number; tone: "default" | "primary" | "accent" }) {
  const toneCls = tone === "primary" ? "text-primary" : tone === "accent" ? "text-foreground" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-bold tabular-nums ${toneCls}`}>{value?.toLocaleString() ?? "—"}</p>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left font-medium ${className}`}>{children}</th>;
}
function Td({ children, className = "", colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-primary/10 text-primary",
    reserved: "bg-amber-100 text-amber-700",
    sold: "bg-muted text-muted-foreground",
  };
  const label: Record<string, string> = { active: "판매중", reserved: "예약중", sold: "거래완료" };
  return <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-muted"}`}>{label[status] ?? status}</span>;
}

function ReportStatus({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: "bg-amber-100 text-amber-700",
    ignored: "bg-muted text-muted-foreground",
    resolved: "bg-primary/10 text-primary",
  };
  const label: Record<string, string> = { open: "대기", ignored: "무시", resolved: "처리완료" };
  return <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-muted"}`}>{label[status] ?? status}</span>;
}

function IconLink({ to, params, children }: { to: string; params: Record<string, string>; children: React.ReactNode }) {
  return (
    <Link
      to={to as "/listings/$id"}
      params={params as { id: string }}
      className="grid h-8 w-8 place-items-center rounded-md border border-border bg-white text-muted-foreground hover:bg-muted"
    >
      {children}
    </Link>
  );
}
function IconBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`grid h-8 w-8 place-items-center rounded-md border border-border bg-white hover:bg-muted ${
        danger ? "text-destructive" : "text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}
function ActionBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
        danger ? "border-destructive/30 text-destructive hover:bg-destructive/5" : "border-border text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function FilterBar({
  search,
  selects,
}: {
  search: { value: string; onChange: (v: string) => void; placeholder: string };
  selects: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-white p-3 shadow-sm">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          placeholder={search.placeholder}
          className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>
      {selects.map((s, i) => (
        <select
          key={i}
          value={s.value}
          onChange={(e) => s.onChange(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {s.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ))}
    </div>
  );
}

function Pager({ page, setPage, count, pageSize }: { page: number; setPage: (n: number) => void; count: number; pageSize: number }) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
      <span>총 {count.toLocaleString()}개 · {page + 1} / {totalPages}</span>
      <div className="flex gap-1">
        <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="rounded-md border border-border px-3 py-1 disabled:opacity-40">이전</button>
        <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="rounded-md border border-border px-3 py-1 disabled:opacity-40">다음</button>
      </div>
    </div>
  );
}

function categoryLabel(c: string) {
  return { new_practice: "신품 연습구", used_practice: "중고 연습구", lost_ball: "로스트볼" }[c] ?? c;
}
function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
