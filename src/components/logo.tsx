import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

/**
 * Placeholder wordmark — the uploaded synch.png has no usable image data
 * (it's effectively solid black, brightest pixel ~59/255 RGB, so it renders
 * as a black box on any background). Swap this for an <img> once a version
 * with real contrast (transparent or light background) is available; nothing
 * else in the app needs to change.
 */
// export function Logo({ className, mark = true }: { className?: string; mark?: boolean }) {
//   return (
//     <div className={cn("flex items-center gap-2", className)}>
//       {mark && (
//         <span className="flex size-7 items-center justify-center rounded-[0.4rem] bg-[var(--color-primary)] font-display text-sm font-bold text-white">
//           S
//         </span>
//       )}
//       <span className="font-display text-lg font-semibold tracking-tight text-[var(--color-ink)]">
//         EBS
//       </span>
//     </div>
//   );
// }




export function Logo({
  className,
  mark = true,
}: {
  className?: string;
  mark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {mark && (
        <div className="h-7 w-7 overflow-hidden rounded-[0.4rem]">
          <img
            src={logo}
            alt="Entacrest Business Suite Logo"
            className="h-full w-full object-contain"
          />
        </div>
      )}
      <span className="font-display text-lg font-semibold tracking-tight text-[var(--color-ink)]">
        EBS
      </span>
    </div>
  );
}