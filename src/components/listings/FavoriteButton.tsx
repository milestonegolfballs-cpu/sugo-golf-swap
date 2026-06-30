import { Heart } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function FavoriteButton({
  listingId,
  size = "md",
}: {
  listingId: string;
  size?: "sm" | "md";
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setUserId(s?.user?.id ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const { data: isFav = false } = useQuery({
    enabled: !!userId,
    queryKey: ["fav", listingId, userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("listing_id", listingId)
        .eq("user_id", userId!)
        .maybeSingle();
      return !!data;
    },
  });

  const toggle = useMutation({
    mutationFn: async () => {
      if (!userId) {
        navigate({ to: "/auth" });
        return;
      }
      if (isFav) {
        await supabase
          .from("favorites")
          .delete()
          .eq("listing_id", listingId)
          .eq("user_id", userId);
      } else {
        await supabase.from("favorites").insert({ listing_id: listingId, user_id: userId });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fav", listingId] });
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const dim = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const ico = size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]";

  return (
    <button
      type="button"
      aria-label={isFav ? "관심상품 해제" : "관심상품 추가"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle.mutate();
      }}
      className={`${dim} grid place-items-center rounded-full bg-white/90 shadow-soft backdrop-blur transition active:scale-95`}
    >
      <Heart
        className={`${ico} ${isFav ? "fill-primary text-primary" : "text-foreground"}`}
        strokeWidth={1.8}
      />
    </button>
  );
}
