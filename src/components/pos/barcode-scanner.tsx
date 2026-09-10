import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Camera, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Dual-mode barcode scanner, shared between the product form (Phase 1,
 * prefilling the barcode field) and the checkout screen (Phase 2, adding to
 * cart) — a single `onScan(barcode)` callback covers both.
 *
 *  - Hardware scanners act as keyboard input into a focused text field —
 *    an auto-focused input that fires onScan on Enter covers this with no
 *    extra library.
 *  - Camera fallback uses the native BarcodeDetector API where available,
 *    falling back to @zxing/browser (wraps @zxing/library) elsewhere.
 */

// Minimal ambient type for the native API — not yet in lib.dom.d.ts.
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect(source: HTMLVideoElement): Promise<DetectedBarcode[]>;
}
declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats?: string[] }) => BarcodeDetectorLike;
  }
}

const BARCODE_FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "qr_code"];

export function BarcodeScanner({
  onScan,
  triggerLabel = "Scan barcode",
}: {
  onScan: (barcode: string) => void;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualValue, setManualValue] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stopCameraRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  // Stop the camera whenever the dialog closes or the component unmounts.
  useEffect(() => {
    if (!open) stopCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function stopCamera() {
    stopCameraRef.current?.();
    stopCameraRef.current = null;
    setCameraActive(false);
  }

  function handleScan(code: string) {
    stopCamera();
    setManualValue("");
    setOpen(false);
    onScan(code);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const code = e.currentTarget.value.trim();
    if (code) handleScan(code);
  }

  async function startCamera() {
    setCameraError(null);
    const video = videoRef.current;
    if (!video) return;

    if (window.BarcodeDetector) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
        await video.play();
        setCameraActive(true);

        const detector = new window.BarcodeDetector({ formats: BARCODE_FORMATS });
        let cancelled = false;
        const tick = async () => {
          if (cancelled) return;
          try {
            const results = await detector.detect(video);
            if (results.length > 0) {
              handleScan(results[0].rawValue);
              return;
            }
          } catch {
            // No barcode in this frame — expected most of the time, ignore.
          }
          frameId = requestAnimationFrame(tick);
        };
        let frameId = requestAnimationFrame(tick);

        stopCameraRef.current = () => {
          cancelled = true;
          cancelAnimationFrame(frameId);
          stream.getTracks().forEach((track) => track.stop());
        };
      } catch {
        setCameraError("Couldn't access the camera. Check permissions, or type the barcode below.");
      }
      return;
    }

    // Fallback: no native BarcodeDetector — use zxing, which manages its
    // own getUserMedia call and stream attachment.
    try {
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromVideoDevice(undefined, video, (result) => {
        if (result) handleScan(result.getText());
      });
      setCameraActive(true);
      stopCameraRef.current = () => controls.stop();
    } catch {
      setCameraError("Couldn't access the camera. Check permissions, or type the barcode below.");
    }
  }

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <ScanLine className="size-4" />
        {triggerLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scan barcode</DialogTitle>
            <DialogDescription>Use a handheld scanner, or point a camera at the barcode.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="scanner-hardware-input">Scanner input</Label>
              <Input
                id="scanner-hardware-input"
                ref={inputRef}
                autoFocus
                placeholder="Focus here and scan, or type the code and press Enter"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="relative overflow-hidden rounded-[var(--radius-chip)] border border-[var(--color-line)] bg-black">
              <video
                ref={videoRef}
                className="aspect-video w-full object-cover"
                muted
                playsInline
                hidden={!cameraActive}
              />
              {!cameraActive && (
                <div className="flex aspect-video w-full items-center justify-center">
                  <Camera className="size-8 text-[var(--color-muted)]" />
                </div>
              )}
            </div>

            {cameraError && <p className="text-xs text-[var(--color-status-overdue)]">{cameraError}</p>}

            {!cameraActive && (
              <Button type="button" variant="secondary" size="sm" className="w-full" onClick={startCamera}>
                <Camera className="size-4" />
                Use camera
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
