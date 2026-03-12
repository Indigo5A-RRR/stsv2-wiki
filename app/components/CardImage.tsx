"use client";

import Image from "next/image";
import { useState } from "react";

interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  containerClassName?: string;
  /** 列表项用 lazy，详情页主图用 priority */
  priority?: boolean;
}

export function CardImage({
  src,
  alt,
  className,
  fill,
  sizes,
  width,
  height,
  containerClassName,
  priority = false,
}: CardImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-800 text-slate-500 text-sm ${containerClassName || className || ""}`}
        style={fill ? {} : { width, height }}
      >
        暂无图片
      </div>
    );
  }

  const isExternal = src.startsWith("http");
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const imgSrc = src.startsWith("/") && basePath ? `${basePath}${src}` : src;
  const img = (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={`${className || ""} ${!loaded ? "opacity-0" : "opacity-100"} transition-opacity duration-200`}
      sizes={sizes}
      unoptimized={isExternal}
      loading={priority ? "eager" : "lazy"}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
    />
  );

  const container = (
    <div className={`relative overflow-hidden ${containerClassName || ""}`} style={fill ? {} : { width, height }}>
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-slate-700/60"
          aria-hidden
        />
      )}
      {img}
    </div>
  );

  return container;
}
