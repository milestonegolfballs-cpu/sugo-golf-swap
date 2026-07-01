import type { SVGProps } from "react";

const SIZE = 40;

export function NewPracticeBallIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="신품 연습공"
      {...props}
    >
      <circle cx="24" cy="24" r="20" fill="#FFFFFF" stroke="#2E7D32" strokeWidth="2" />
      <circle cx="24" cy="24" r="18" fill="#F7F8FA" />
      <g fill="#2E7D32" opacity="0.15">
        <circle cx="24" cy="14" r="1.6" />
        <circle cx="18" cy="17" r="1.6" />
        <circle cx="30" cy="17" r="1.6" />
        <circle cx="24" cy="20" r="1.6" />
        <circle cx="15" cy="24" r="1.6" />
        <circle cx="21" cy="24" r="1.6" />
        <circle cx="27" cy="24" r="1.6" />
        <circle cx="33" cy="24" r="1.6" />
        <circle cx="18" cy="31" r="1.6" />
        <circle cx="24" cy="34" r="1.6" />
        <circle cx="30" cy="31" r="1.6" />
      </g>
      <circle cx="36" cy="12" r="6" fill="#2E7D32" />
      <path
        d="M36 9.5V14.5M33.5 12H38.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function UsedPracticeBallIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="중고 연습공"
      {...props}
    >
      <circle cx="24" cy="24" r="20" fill="#FFFFFF" stroke="#2E7D32" strokeWidth="2" />
      <circle cx="24" cy="24" r="18" fill="#F7F8FA" />
      <g fill="#2E7D32" opacity="0.15">
        <circle cx="24" cy="14" r="1.6" />
        <circle cx="18" cy="17" r="1.6" />
        <circle cx="30" cy="17" r="1.6" />
        <circle cx="24" cy="20" r="1.6" />
        <circle cx="15" cy="24" r="1.6" />
        <circle cx="21" cy="24" r="1.6" />
        <circle cx="27" cy="24" r="1.6" />
        <circle cx="33" cy="24" r="1.6" />
        <circle cx="18" cy="31" r="1.6" />
        <circle cx="24" cy="34" r="1.6" />
        <circle cx="30" cy="31" r="1.6" />
      </g>
      <path
        d="M24 12C30.627 12 36 17.373 36 24C36 30.627 30.627 36 24 36"
        stroke="#2E7D32"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M29 19L35 15L32 22"
        stroke="#2E7D32"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 29L13 33L16 26"
        stroke="#2E7D32"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LostBallIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="로스트볼"
      {...props}
    >
      <circle cx="24" cy="24" r="20" fill="#FFFFFF" stroke="#2E7D32" strokeWidth="2" />
      <circle cx="24" cy="24" r="18" fill="#F7F8FA" />
      <g fill="#2E7D32" opacity="0.15">
        <circle cx="24" cy="14" r="1.6" />
        <circle cx="18" cy="17" r="1.6" />
        <circle cx="30" cy="17" r="1.6" />
        <circle cx="24" cy="20" r="1.6" />
        <circle cx="15" cy="24" r="1.6" />
        <circle cx="21" cy="24" r="1.6" />
        <circle cx="27" cy="24" r="1.6" />
        <circle cx="33" cy="24" r="1.6" />
        <circle cx="18" cy="31" r="1.6" />
        <circle cx="24" cy="34" r="1.6" />
        <circle cx="30" cy="31" r="1.6" />
      </g>
      <path
        d="M24 31V37"
        stroke="#2E7D32"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M20 35L24 39L28 35"
        stroke="#2E7D32"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CategoryBallIcon({
  slug,
  ...props
}: { slug: "new_practice" | "used_practice" | "lost_ball" } & SVGProps<SVGSVGElement>) {
  if (slug === "new_practice") return <NewPracticeBallIcon {...props} />;
  if (slug === "used_practice") return <UsedPracticeBallIcon {...props} />;
  return <LostBallIcon {...props} />;
}
