"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  children: React.ReactNode;
  fallbackHref?: string;
  className?: string;
};

export function BackButton({ children, fallbackHref = "/", className }: BackButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <a
      href={fallbackHref}
      onClick={handleClick}
      className={className ?? "text-sm text-emerald-400 hover:underline"}
    >
      {children}
    </a>
  );
}
