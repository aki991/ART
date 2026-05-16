"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2, Search, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useProgrammerStore } from "@/lib/store/programmer-store";
import { useEmulatorStore } from "@/lib/store/emulator-store";
import { getMyPigeons, searchMyPigeons } from "@/app/actions/pigeons";
import type { Pigeon } from "@/lib/types/pigeon";

export function PigeonForm() {
  const [selectedPigeon, setSelectedPigeon] = useState<Pigeon | null>(null);
  const [pigeonColor, setPigeonColor] = useState("");
  const [bandPrefix, setBandPrefix] = useState("");
  const [bandMain, setBandMain] = useState("");
  const [bandBreeder, setBandBreeder] = useState("");
  const [bandPigeon, setBandPigeon] = useState("");
  const [bandYear, setBandYear] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);

  const [pigeons, setPigeons] = useState<Pigeon[]>([]);
  const [loadingPigeons, setLoadingPigeons] = useState(false);
  const [pigeonsLoaded, setPigeonsLoaded] = useState(false);

  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const bandPrefixRef = useRef<HTMLInputElement>(null);
  const bandMainRef = useRef<HTMLInputElement>(null);
  const bandBreederRef = useRef<HTMLInputElement>(null);
  const bandPigeonRef = useRef<HTMLInputElement>(null);
  const bandYearRef = useRef<HTMLInputElement>(null);

  const isProgramming = useProgrammerStore((s) => s.isProgramming);
  const programRing = useProgrammerStore((s) => s.programRing);
  const selectedRingId = useProgrammerStore((s) => s.selectedRingId);
  const clearSelectedRing = useProgrammerStore((s) => s.clearSelectedRing);
  const sessionPrograms = useProgrammerStore((s) => s.sessionPrograms);

  const programmedIdentifiers = useMemo(
    () => new Set(sessionPrograms.map((p) => p.pigeonIdentifier)),
    [sessionPrograms]
  );

  const availablePigeons = useMemo(
    () => pigeons.filter((p) => !programmedIdentifiers.has(p.full_ring_number)),
    [pigeons, programmedIdentifiers]
  );

  const emulatorSlots = useEmulatorStore((s) => s.slots);
  const insertedSlots = useMemo(
    () => emulatorSlots.filter((s) => s.status === "inserted"),
    [emulatorSlots]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!selectedRingId) return;
    const stillPresent = insertedSlots.some((s) => s.ringId === selectedRingId);
    if (!stillPresent) clearSelectedRing();
  }, [insertedSlots, selectedRingId, clearSelectedRing]);

  useEffect(() => {
    setPigeonColor("");
    setBandPrefix("");
    setBandMain("");
    setBandBreeder("");
    setBandPigeon("");
    setBandYear("");
  }, [selectedPigeon]);

  // Initial load: when dropdown is first opened, fetch all pigeons.
  useEffect(() => {
    if (!isDropdownOpen || pigeonsLoaded) return;
    let cancelled = false;
    setLoadingPigeons(true);
    void getMyPigeons().then((res) => {
      if (cancelled) return;
      setLoadingPigeons(false);
      setPigeonsLoaded(true);
      if (res.success) setPigeons(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [isDropdownOpen, pigeonsLoaded]);

  // Server-side search with debounce when user types.
  useEffect(() => {
    if (!pigeonsLoaded) return;
    if (selectedPigeon) return;

    const term = inputValue.trim();
    let cancelled = false;
    const handle = setTimeout(() => {
      setLoadingPigeons(true);
      const run = term ? searchMyPigeons(term) : getMyPigeons();
      void run.then((res) => {
        if (cancelled) return;
        setLoadingPigeons(false);
        if (res.success) setPigeons(res.data);
      });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [inputValue, pigeonsLoaded, selectedPigeon]);

  useEffect(() => {
    if (!isDropdownOpen || !anchorRef.current) return;
    const updateRect = () => {
      if (anchorRef.current) setDropdownRect(anchorRef.current.getBoundingClientRect());
    };
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const inAnchor = anchorRef.current?.contains(e.target as Node);
      const inPortal = portalRef.current?.contains(e.target as Node);
      if (!inAnchor && !inPortal) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        if (!selectedPigeon) setInputValue("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedPigeon]);

  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[highlightedIndex] as HTMLElement;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  function openDropdown() {
    if (anchorRef.current) setDropdownRect(anchorRef.current.getBoundingClientRect());
    setIsDropdownOpen(true);
  }

  function selectPigeon(pigeon: Pigeon) {
    setSelectedPigeon(pigeon);
    setInputValue(`${pigeon.full_ring_number} — ${pigeon.color}`);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  }

  function clearSelection() {
    setSelectedPigeon(null);
    setInputValue("");
    openDropdown();
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    setSelectedPigeon(null);
    openDropdown();
    setHighlightedIndex(0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isDropdownOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        openDropdown();
        setHighlightedIndex(0);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, availablePigeons.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && availablePigeons[highlightedIndex]) {
          selectPigeon(availablePigeons[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }

  const showManualFields = selectedPigeon === null;

  const federationBandNumber =
    bandPrefix && bandMain && bandBreeder && bandPigeon && bandYear
      ? `${bandPrefix.toUpperCase()}-${bandMain}-${bandBreeder}-${bandPigeon}-${bandYear}`
      : "";

  function handleBandPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").trim();
    const match = text.match(/^([A-Za-z]{1,3})(\d{1,4})[·\-](\d{1,2})[·\-](\d{1,2})[·\-](\d{2})$/);
    if (match) {
      e.preventDefault();
      setBandPrefix(match[1].toUpperCase());
      setBandMain(match[2]);
      setBandBreeder(match[3]);
      setBandPigeon(match[4]);
      setBandYear(match[5]);
      bandYearRef.current?.focus();
    }
  }

  const isDisabled =
    !selectedRingId ||
    isProgramming ||
    (selectedPigeon === null && (!pigeonColor.trim() || !federationBandNumber.trim()));

  async function handleSubmit() {
    if (!selectedRingId) {
      toast.error("Izaberi prsten klikom na red u tabeli detektovanih prstenova");
      return;
    }

    let pigeonIdentifier: string;
    let finalPigeonColor: string;

    if (selectedPigeon) {
      pigeonIdentifier = selectedPigeon.full_ring_number;
      finalPigeonColor = selectedPigeon.color;
    } else {
      pigeonIdentifier = federationBandNumber.trim();
      finalPigeonColor = pigeonColor.trim();
    }

    const result = await programRing({
      ringId: selectedRingId,
      pigeonIdentifier,
      pigeonColor: finalPigeonColor,
    });

    if (result.success) {
      toast.success("Prsten programiran", {
        description: `Ring ID ${selectedRingId} je uspešno povezan sa golubom.`,
      });
      setSelectedPigeon(null);
      setInputValue("");
      setPigeonColor("");
      setBandPrefix("");
      setBandMain("");
      setBandBreeder("");
      setBandPigeon("");
      setBandYear("");
    } else {
      toast.error("Programiranje neuspešno", {
        description: result.error,
      });
    }
  }

  const inputClass =
    "w-full px-3 py-2.5 bg-bg-input border border-border rounded-md text-lg text-text-primary placeholder:text-text-disabled focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none";

  const bandInputClass =
    "px-2 py-2.5 bg-bg-input border border-border rounded-md text-lg text-text-primary placeholder:text-text-disabled focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none text-center font-mono";

  return (
    <div className="card-redesign p-6">
      <p className="text-sm uppercase tracking-widest text-text-tertiary font-medium mb-4">
        Podaci goluba
      </p>

      <div className="mb-4">
        <label
          htmlFor="pigeon-select"
          className="block text-base font-medium text-text-secondary mb-1.5"
        >
          Golub
        </label>

        <div className="relative" ref={anchorRef}>
          <input
            ref={inputRef}
            id="pigeon-select"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => {
              openDropdown();
              if (selectedPigeon) inputRef.current?.select();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Pretraži goluba po broju..."
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            className={cn(inputClass, "pr-16")}
          />
          {selectedPigeon ? (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                clearSelection();
              }}
              aria-label="Obriši izbor"
              className="absolute right-9 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Search className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-text-disabled pointer-events-none" />
          )}
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => {
              e.preventDefault();
              if (isDropdownOpen) {
                setIsDropdownOpen(false);
                setHighlightedIndex(-1);
              } else {
                openDropdown();
                inputRef.current?.focus();
              }
            }}
            aria-label={isDropdownOpen ? "Zatvori listu" : "Otvori listu"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-tertiary transition-colors"
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-150",
                isDropdownOpen && "rotate-180"
              )}
            />
          </button>
        </div>

        {mounted && isDropdownOpen && dropdownRect &&
          createPortal(
            <div
              ref={portalRef}
              role="listbox"
              aria-label="Lista golubova"
              style={{
                position: "fixed",
                top: dropdownRect.bottom + 4,
                left: dropdownRect.left,
                width: dropdownRect.width,
                zIndex: 9999,
              }}
              className="bg-bg-surface-elevated border border-border rounded-md shadow-lg max-h-56 overflow-y-auto"
            >
              <div ref={listRef}>
                {loadingPigeons ? (
                  <div className="px-4 py-3 text-text-tertiary text-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Učitavanje...
                  </div>
                ) : availablePigeons.length === 0 ? (
                  <div className="px-4 py-3 text-text-disabled text-sm italic">
                    {pigeons.length === 0
                      ? "Niste još dodali nijednog goluba — dodajte na stranici Golubovi."
                      : inputValue.trim()
                        ? "Nema rezultata za tu pretragu"
                        : "Svi golubovi su već programirani u ovoj sesiji."}
                  </div>
                ) : (
                  availablePigeons.map((p, index) => (
                    <div
                      key={p.id}
                      role="option"
                      aria-selected={selectedPigeon?.id === p.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectPigeon(p);
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        "px-4 py-2.5 cursor-pointer text-base transition-colors border-l-2",
                        highlightedIndex === index
                          ? "bg-bg-hover border-l-accent text-text-primary"
                          : "border-l-transparent text-text-tertiary hover:bg-bg-hover hover:text-text-primary"
                      )}
                    >
                      <span className="font-mono font-medium">{p.full_ring_number}</span>
                      <span className="text-text-tertiary ml-2">— {p.color}</span>
                    </div>
                  ))
                )}
              </div>
            </div>,
            document.body
          )}

        {pigeonsLoaded && pigeons.length === 0 ? (
          <p className="text-sm text-text-tertiary mt-1.5">
            Nema dodatih golubova. Možeš popuniti polja ručno ili dodati goluba na stranici
            &apos;Golubovi&apos;.
          </p>
        ) : selectedPigeon ? (
          <p className="text-sm text-text-tertiary mt-1.5">
            Boja goluba i broj savezne alke se automatski preuzimaju iz odabranog goluba.
          </p>
        ) : (
          <p className="text-sm text-text-tertiary mt-1.5">
            Ako golub nije u listi, popuni boju i broj alke ručno.
          </p>
        )}
      </div>

      {showManualFields && (
        <>
          <div className="mb-4">
            <label
              htmlFor="pigeon-color"
              className="block text-base font-medium text-text-secondary mb-1.5"
            >
              Boja goluba <span className="text-status-error">*</span>
            </label>
            <input
              id="pigeon-color"
              type="text"
              value={pigeonColor}
              onChange={(e) => setPigeonColor(e.target.value)}
              placeholder="npr. Arap"
              className={inputClass}
            />
          </div>

          <div className="mb-6">
            <label className="block text-base font-medium text-text-secondary mb-1.5">
              Broj savezne alke <span className="text-status-error">*</span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                ref={bandPrefixRef}
                type="text"
                maxLength={3}
                value={bandPrefix}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 3);
                  setBandPrefix(val);
                  if (val.length === 3) bandMainRef.current?.focus();
                }}
                onPaste={handleBandPaste}
                placeholder="SRB"
                className={cn(bandInputClass, "w-16")}
              />
              <span className="text-text-disabled select-none font-mono">-</span>
              <input
                ref={bandMainRef}
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={bandMain}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setBandMain(val);
                  if (val.length === 4) bandBreederRef.current?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !bandMain) bandPrefixRef.current?.focus();
                }}
                placeholder="444"
                className={cn(bandInputClass, "w-16")}
              />
              <span className="text-text-disabled select-none font-mono">-</span>
              <input
                ref={bandBreederRef}
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={bandBreeder}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 2);
                  setBandBreeder(val);
                  if (val.length === 2) bandPigeonRef.current?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !bandBreeder) bandMainRef.current?.focus();
                }}
                placeholder="11"
                className={cn(bandInputClass, "w-12")}
              />
              <span className="text-text-disabled select-none font-mono">-</span>
              <input
                ref={bandPigeonRef}
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={bandPigeon}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 2);
                  setBandPigeon(val);
                  if (val.length === 2) bandYearRef.current?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !bandPigeon) bandBreederRef.current?.focus();
                }}
                placeholder="22"
                className={cn(bandInputClass, "w-12")}
              />
              <span className="text-text-disabled select-none font-mono">-</span>
              <input
                ref={bandYearRef}
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={bandYear}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 2);
                  setBandYear(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !bandYear) bandPigeonRef.current?.focus();
                }}
                placeholder="25"
                className={cn(bandInputClass, "w-12")}
              />
            </div>
          </div>
        </>
      )}

      <button
        type="button"
        disabled={isDisabled}
        onClick={() => void handleSubmit()}
        aria-label="Programiraj prsten sa unetim podacima"
        className="btn-shine-redesign w-full px-4 py-3 rounded-md inline-flex items-center justify-center gap-2 font-medium text-base transition-colors bg-accent hover:bg-accent-hover text-white disabled:bg-bg-hover disabled:text-text-disabled disabled:cursor-not-allowed"
      >
        {isProgramming ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            Programiranje...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" aria-hidden="true" />
            Programiraj prsten
          </>
        )}
      </button>
    </div>
  );
}
