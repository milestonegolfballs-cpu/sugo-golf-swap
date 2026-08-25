import { type ReactNode } from "react";

// 트래픽이 생기면 이 자리에 실제 광고 스크립트/이미지를 꽂으면 됩니다.
// 지금은 자리만 예약해두는 형태 — children이 없으면 조용히 아무것도
// 렌더링하지 않아서, 광고가 없는 지금 상태에서도 레이아웃이 어색해지지
// 않습니다.
export function AdBanner({
  slot,
  children,
  className = "",
}: {
  slot?: string;
  children?: ReactNode;
  className?: string;
}) {
  if (!children) return null;

  return (
    <div
      data-ad-slot={slot}
      className={`mx-4 overflow-hidden rounded-2xl bg-surface ring-1 ring-border ${className}`}
    >
      <div className="flex items-center justify-between px-3 pt-2">
        <span className="text-[10px] font-medium tracking-wide text-muted-foreground/60">
          AD
        </span>
      </div>
      <div className="px-3 pb-3">{children}</div>
    </div>
  );
}
