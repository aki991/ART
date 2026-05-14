import { toast } from "sonner";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

// Validates an image file (JPG/PNG, ≤2MB) and reads it as a base64 data URL.
// Calls onSuccess with the data URL, or shows a toast on validation failure.
export function readImageFile(
  file: File,
  onSuccess: (dataUrl: string) => void
): void {
  if (file.type !== "image/jpeg" && file.type !== "image/png") {
    toast.error("Dozvoljene su samo JPG i PNG slike.");
    return;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    toast.error("Slika ne sme biti veća od 2MB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") onSuccess(reader.result);
  };
  reader.readAsDataURL(file);
}
