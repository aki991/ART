"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { readImageFile } from "@/lib/settings/image-upload";
import { requestClubCreation } from "@/app/actions/clubs";

interface CreateClubRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateClubRequestModal({
  isOpen,
  onClose,
}: CreateClubRequestModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setCity("");
      setLogo(null);
    }
  }, [isOpen]);

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) readImageFile(file, setLogo);
  }

  const canSubmit = name.trim().length > 0 && city.trim().length > 0 && !pending;

  function handleSubmit() {
    if (!canSubmit) return;
    const clubName = name.trim();
    const clubCity = city.trim();
    startTransition(async () => {
      const result = await requestClubCreation({
        name: clubName,
        city: clubCity,
        logoDataUrl: logo,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onClose();
      toast.success("Zahtev poslat", {
        description: `Vaš zahtev za kreiranje kluba "${clubName}" čeka odobrenje Super Admina.`,
      });
      router.refresh();
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Zahtev za kreiranje kluba"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Odustani
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={pending}
          >
            Pošalji zahtev
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <p className="text-sm text-white/60">
          Vaš zahtev će biti prosleđen Super Adminu na odobrenje. Po odobrenju
          postajete administrator novog kluba.
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Dodaj logo kluba"
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-brand/40 group relative"
          >
            <Avatar src={logo} name={name || "K"} size="lg" />
            <span className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" aria-hidden="true" />
            </span>
          </button>
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                <Camera className="w-4 h-4" aria-hidden="true" />
                Logo
              </Button>
              {logo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLogo(null)}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  Ukloni
                </Button>
              )}
            </div>
            <p className="text-sm text-white/40">Opciono — JPG ili PNG, do 2MB.</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleLogoFile}
            className="hidden"
          />
        </div>

        <Input
          label="Naziv kluba"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="npr. GK Velika Plana"
        />
        <Input
          label="Lokacija (grad)"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="npr. Velika Plana"
        />
      </div>
    </Modal>
  );
}
