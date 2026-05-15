"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Send, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select, type SelectOption } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { APP_VERSION } from "@/data/app-meta";

const TOPIC_OPTIONS: SelectOption[] = [
  { value: "bug", label: "Bug / Greška" },
  { value: "suggestion", label: "Predlog" },
  { value: "question", label: "Pitanje" },
  { value: "other", label: "Drugo" },
];

const MAX_ATTACHMENTS = 3;
const MAX_TOTAL_BYTES = 5 * 1024 * 1024;
const DESC_MIN = 20;
const DESC_MAX = 2000;
const TITLE_MAX = 100;

interface Attachment {
  id: string;
  name: string;
  size: number;
  dataUrl: string;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function ContactSupportForm() {
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [touched, setTouched] = useState({
    topic: false,
    title: false,
    description: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  function markTouched(field: "topic" | "title" | "description") {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  async function addFiles(files: File[]) {
    if (files.length === 0) return;
    const slotsLeft = MAX_ATTACHMENTS - attachments.length;
    if (slotsLeft <= 0) {
      toast.error(`Možete priložiti najviše ${MAX_ATTACHMENTS} slike.`);
      return;
    }
    let total = attachments.reduce((sum, a) => sum + a.size, 0);
    const accepted: File[] = [];
    for (const file of files) {
      if (accepted.length >= slotsLeft) {
        toast.error(`Možete priložiti najviše ${MAX_ATTACHMENTS} slike.`);
        break;
      }
      if (file.type !== "image/jpeg" && file.type !== "image/png") {
        toast.error(`"${file.name}" — dozvoljene su samo JPG i PNG slike.`);
        continue;
      }
      if (total + file.size > MAX_TOTAL_BYTES) {
        toast.error("Ukupna veličina priloga ne sme preći 5MB.");
        break;
      }
      total += file.size;
      accepted.push(file);
    }
    if (accepted.length === 0) return;
    const read = await Promise.all(
      accepted.map(async (file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        dataUrl: await fileToDataUrl(file),
      }))
    );
    setAttachments((prev) => [...prev, ...read]);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    void addFiles(files);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    void addFiles(Array.from(e.dataTransfer.files));
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  const titleTrimmed = title.trim();
  const descTrimmed = description.trim();
  const topicValid = topic !== "";
  const titleValid = titleTrimmed.length > 0;
  const descValid = descTrimmed.length >= DESC_MIN;
  const canSubmit = topicValid && titleValid && descValid && !submitting;

  const topicError =
    touched.topic && !topicValid ? "Izaberite temu." : undefined;
  const titleError =
    touched.title && !titleValid ? "Obavezno polje." : undefined;
  const descError =
    touched.description && descTrimmed.length === 0
      ? "Obavezno polje."
      : descTrimmed.length > 0 && descTrimmed.length < DESC_MIN
        ? `Najmanje ${DESC_MIN} karaktera.`
        : undefined;

  async function handleSubmit() {
    if (!canSubmit) return;

    setSubmitting(true);
    const systemInfo = {
      appVersion: APP_VERSION,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timestamp: new Date().toISOString(),
    };
    // Frontend-only: real backend submission will be wired up later.
    console.log("Support request:", {
      topic,
      title: titleTrimmed,
      description: descTrimmed,
      attachments: attachments.map((a) => ({ name: a.name, size: a.size })),
      systemInfo,
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitting(false);
    toast.success("Poruka poslata ✓");

    setTopic("");
    setTitle("");
    setDescription("");
    setAttachments([]);
    setTouched({ topic: false, title: false, description: false });
  }

  return (
    <div className="card-redesign p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-text-primary font-rajdhani">
          Kontakt podrška
        </h2>
        <p className="text-sm text-text-tertiary mt-0.5">
          Naišli ste na problem ili imate predlog? Javite nam se.
        </p>
      </div>

      <Select
        label="Tema"
        placeholder="Izaberite temu..."
        options={TOPIC_OPTIONS}
        value={topic}
        onChange={setTopic}
        onBlur={() => markTouched("topic")}
        error={topicError}
      />

      <Input
        label="Naslov"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => markTouched("title")}
        maxLength={TITLE_MAX}
        placeholder="Kratak naslov problema ili predloga"
        error={titleError}
      />

      <div>
        <label
          htmlFor="support-description"
          className="block text-base font-medium text-text-secondary mb-1.5"
        >
          Opis problema <span className="text-status-error ml-0.5">*</span>
        </label>
        <div className="relative">
          <textarea
            id="support-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => markTouched("description")}
            maxLength={DESC_MAX}
            rows={5}
            placeholder="Opišite problem ili predlog (najmanje 20 karaktera)..."
            aria-invalid={descError ? true : undefined}
            className={cn(
              "w-full px-4 py-2.5 pb-7 bg-bg-input border rounded-md text-base text-text-primary placeholder:text-text-disabled focus:ring-2 focus:outline-none transition-colors resize-y min-h-[120px]",
              descError
                ? "border-status-error/60 focus:border-status-error focus:ring-status-error/20"
                : "border-border focus:border-accent focus:ring-accent/20"
            )}
          />
          <span
            className={cn(
              "absolute bottom-2 right-3 text-xs pointer-events-none",
              description.trim().length > 0 && description.trim().length < DESC_MIN
                ? "text-status-warning/70"
                : "text-text-disabled"
            )}
          >
            {description.length} / {DESC_MAX}
          </span>
        </div>
        {descError && (
          <p className="mt-1 text-sm text-status-error">{descError}</p>
        )}
      </div>

      {/* Attachments */}
      <div>
        <label className="block text-base font-medium text-text-secondary mb-1.5">
          Prilozi{" "}
          <span className="text-text-disabled font-normal">
            (opciono — do 3 slike, 5MB ukupno)
          </span>
        </label>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileRef.current?.click();
            }
          }}
          aria-label="Dodaj sliku — kliknite ili prevucite"
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed py-6 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
            dragOver
              ? "border-accent/60 bg-accent-light"
              : "border-border-strong bg-bg-input hover:border-border-strong"
          )}
        >
          <ImagePlus className="w-5 h-5 text-text-disabled" aria-hidden="true" />
          <span className="text-sm text-text-tertiary">
            Dodaj sliku — kliknite ili prevucite ovde
          </span>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {attachments.map((a) => (
              <div
                key={a.id}
                className="relative w-16 h-16 rounded-md overflow-hidden border border-border group"
              >
                <img
                  src={a.dataUrl}
                  alt={a.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                <button
                  type="button"
                  onClick={() => removeAttachment(a.id)}
                  aria-label={`Ukloni ${a.name}`}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 text-text-secondary hover:text-text-primary hover:bg-black flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm text-text-disabled leading-relaxed">
        Uz poruku ćemo automatski poslati i vaš email i osnovne podatke o
        sistemu (verzija aplikacije, browser, OS) radi lakšeg rešavanja
        problema.
      </p>

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
          loading={submitting}
        >
          {!submitting && <Send className="w-4 h-4" aria-hidden="true" />}
          Pošalji poruku
        </Button>
      </div>
    </div>
  );
}
