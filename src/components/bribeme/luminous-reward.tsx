"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CalendarClock, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LuminousRewardCard({
  venueName = "Demo Cafe",
  label = "Free croissant",
  code = "BRIBE-K69CY5GQ",
  expiresAt = null,
  status = "issued",
}: {
  venueName?: string;
  label?: string;
  code?: string;
  expiresAt?: string | null;
  status?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let animationId = 0;
    let pointer: { x: number; y: number } | null = null;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== Math.floor(rect.width * dpr)) {
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);

      const wash = context.createLinearGradient(0, 0, rect.width, rect.height);
      wash.addColorStop(0, "rgba(255,255,255,0.1)");
      wash.addColorStop(0.45, "rgba(255,255,255,0.025)");
      wash.addColorStop(1, "rgba(255,255,255,0.08)");
      context.fillStyle = wash;
      context.fillRect(0, 0, rect.width, rect.height);

      const spacing = 16;
      for (let x = 0; x < rect.width + spacing; x += spacing) {
        for (let y = 0; y < rect.height + spacing; y += spacing) {
          const shimmer =
            0.22 + Math.sin(frame * 0.018 + x * 0.08 + y * 0.04) * 0.16;
          let glow = 0;

          if (pointer) {
            const distance = Math.hypot(x - pointer.x, y - pointer.y);
            glow = Math.max(0, 1 - distance / 150);
          }

          const opacity = Math.min(0.85, shimmer + glow * 0.72);
          const size = 1.2 + glow * 3.4;

          context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          context.beginPath();
          context.roundRect(x, y, size, size, 2);
          context.fill();
        }
      }

      if (!reduceMotion.matches) {
        frame += 1;
        animationId = requestAnimationFrame(draw);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const onPointerLeave = () => {
      pointer = null;
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/15 bg-neutral-950 text-white shadow-2xl shadow-black/30">
      <canvas
        aria-hidden="true"
        className="absolute inset-0 size-full opacity-80"
        ref={canvasRef}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.16),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_42%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

      <div className="relative grid gap-6 p-5 sm:p-7">
        <div className="space-y-5 text-center">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/64">{venueName}</p>
            <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {label}
            </h2>
            <p className="text-sm capitalize text-white/68">{status}</p>
          </div>

          <div className="mx-auto w-full max-w-[300px] rounded-lg border border-neutral-300 bg-white p-3 text-neutral-950 shadow-xl shadow-black/25">
            <svg
              aria-label="Reward redemption QR code"
              className="aspect-square w-full"
              role="img"
              viewBox="0 0 160 160"
            >
              <rect fill="#fff" height="160" rx="10" width="160" />
              <QrFinder x={16} y={16} />
              <QrFinder x={108} y={16} />
              <QrFinder x={16} y={108} />
              {qrModules.map(([x, y, w, h], index) => (
                <rect
                  fill="#111"
                  height={h}
                  key={`${x}-${y}-${index}`}
                  rx="2"
                  width={w}
                  x={x}
                  y={y}
                />
              ))}
            </svg>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-lg border border-white/12 bg-white/[0.08] p-4 text-center backdrop-blur">
            <p className="break-all font-mono text-2xl font-semibold tracking-normal text-white">
              {code}
            </p>
            <p className="mt-2 text-sm text-white/62">Show this at the counter</p>
          </div>

          <RewardDetail icon={<CalendarClock />}>
            {expiresAt ? `Valid until ${formatDate(expiresAt)}` : "Show staff before redeeming"}
          </RewardDetail>

          <div className="grid grid-cols-2 gap-2">
            <Button
              className="h-8 border-white/16 bg-white/[0.06] px-2 text-xs text-white hover:bg-white/12"
              size="sm"
              variant="outline"
            >
              <WalletCards className="size-3.5" />
              <span className="min-w-0 truncate">Apple Wallet</span>
            </Button>
            <Button
              className="h-8 border-white/16 bg-white/[0.06] px-2 text-xs text-white hover:bg-white/12"
              size="sm"
              variant="outline"
            >
              <WalletCards className="size-3.5" />
              <span className="min-w-0 truncate">Google Wallet</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function QrFinder({ x, y }: { x: number; y: number }) {
  return (
    <>
      <rect fill="#111" height="36" rx="4" width="36" x={x} y={y} />
      <rect fill="#fff" height="24" rx="3" width="24" x={x + 6} y={y + 6} />
      <rect fill="#111" height="12" rx="2" width="12" x={x + 12} y={y + 12} />
    </>
  );
}

function RewardDetail({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/12 bg-white/[0.06] px-3 text-sm text-white/70">
      <span className="[&_svg]:size-4">{icon}</span>
      {children}
    </div>
  );
}

const qrModules = [
  [64, 18, 8, 8],
  [80, 18, 12, 8],
  [64, 34, 18, 8],
  [92, 34, 8, 18],
  [64, 50, 8, 12],
  [80, 54, 20, 8],
  [116, 62, 8, 16],
  [136, 64, 8, 8],
  [18, 64, 10, 8],
  [36, 64, 8, 20],
  [54, 68, 14, 8],
  [76, 72, 8, 22],
  [92, 72, 18, 8],
  [126, 80, 18, 8],
  [18, 88, 24, 8],
  [54, 88, 8, 16],
  [68, 96, 28, 8],
  [104, 96, 8, 8],
  [120, 98, 24, 8],
  [64, 116, 8, 26],
  [82, 116, 16, 8],
  [108, 116, 10, 10],
  [126, 116, 18, 8],
  [82, 132, 8, 12],
  [98, 132, 28, 8],
  [138, 134, 8, 10],
] as const;
