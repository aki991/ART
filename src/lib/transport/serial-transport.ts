/**
 * src/lib/transport/serial-transport.ts
 *
 * Web Serial transport ka DK baznoj stanici (glavna_baza firmware).
 * Čita linije sa J-Link VCOM porta (115200 8N1):
 *
 *   #TLM,<ring4hex>,<alt_m>,<ts_ms>,<rssi_dbm>,<bat_mv>[,<pressure_pa>]
 *   #EVT,CONNECTED,<ring4hex> | #EVT,DISCONNECTED | #EVT,BOOT
 *
 * Singleton — deli ga connection-store (connect/disconnect gesture) i
 * useSerialTelemetry hook (frame stream). Radi samo u Chrome/Edge,
 * na localhost ili HTTPS.
 */

export interface TlmFrame {
  ringId: string;        // 4 hex znaka, uppercase
  altitudeMeters: number;
  deviceTsMs: number;    // timestamp_ms sa prstena (uptime/epoch)
  rssiDbm: number;
  batteryMv: number;
  pressurePa: number;    // sirov pritisak u Pa; 0 ako ga uređaj ne šalje
  receivedAt: number;    // Date.now() u trenutku prijema
}

type FrameHandler = (frame: TlmFrame) => void;
type EventHandler = (event: string) => void;
type DisconnectHandler = () => void;

const TLM_PREFIX = "#TLM,";
const EVT_PREFIX = "#EVT,";
const RING_ID_RE = /^[0-9A-F]{4}$/;

class SerialTransport {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private closing = false;

  private frameHandlers = new Set<FrameHandler>();
  private eventHandlers = new Set<EventHandler>();
  private disconnectHandlers = new Set<DisconnectHandler>();

  /** Poslednji primljeni frame (za deviceInfo/bateriju pre starta trke). */
  lastFrame: TlmFrame | null = null;

  get connected(): boolean {
    return this.port !== null;
  }

  onFrame(h: FrameHandler): () => void {
    this.frameHandlers.add(h);
    return () => this.frameHandlers.delete(h);
  }

  onEvent(h: EventHandler): () => void {
    this.eventHandlers.add(h);
    return () => this.eventHandlers.delete(h);
  }

  onDisconnect(h: DisconnectHandler): () => void {
    this.disconnectHandlers.add(h);
    return () => this.disconnectHandlers.delete(h);
  }

  /**
   * MORA biti pozvan iz user-gesture lanca (klik), bez await-a pre poziva —
   * navigator.serial.requestPort() inače baca SecurityError.
   */
  async connect(): Promise<void> {
    if (this.port) return;

    if (typeof navigator === "undefined" || !("serial" in navigator)) {
      throw new Error(
        "Web Serial API nije podržan u ovom pretraživaču — koristi Chrome ili Edge."
      );
    }

    // Filter na SEGGER J-Link VID (0x1366). Ako ti se port ne pojavi u
    // dijalogu, obriši `filters` pa biraj ručno.
    const port = await navigator.serial.requestPort({
      filters: [{ usbVendorId: 0x1366 }],
    });
    await port.open({ baudRate: 115200 });

    this.port = port;
    this.closing = false;
    void this.readLoop(port);
  }

  async disconnect(): Promise<void> {
    if (!this.port) return;
    this.closing = true;
    try {
      await this.reader?.cancel();
    } catch {
      /* reader je možda već mrtav — readLoop finally čisti ostalo */
    }
  }

  private async readLoop(port: SerialPort): Promise<void> {
    const decoder = new TextDecoder();
    let buf = "";

    try {
      while (port.readable && !this.closing) {
        this.reader = port.readable.getReader();
        try {
          for (;;) {
            const { value, done } = await this.reader.read();
            if (done) break;
            if (!value) continue;

            buf += decoder.decode(value, { stream: true });

            let nl: number;
            while ((nl = buf.indexOf("\n")) >= 0) {
              const line = buf.slice(0, nl).trim();
              buf = buf.slice(nl + 1);
              if (line) this.handleLine(line);
            }
            // Guard protiv smeća bez newline-a (npr. pogrešan baud rate)
            if (buf.length > 4096) buf = "";
          }
        } catch {
          // Greška čitanja (kabl izvučen i sl.) — while uslov odlučuje
          // da li ima smisla ponovo uzeti reader.
        } finally {
          try {
            this.reader?.releaseLock();
          } catch {
            /* ignore */
          }
          this.reader = null;
        }
      }
    } finally {
      try {
        await port.close();
      } catch {
        /* ignore */
      }
      this.port = null;
      this.closing = false;
      this.lastFrame = null;
      this.disconnectHandlers.forEach((h) => h());
    }
  }

  private handleLine(line: string): void {
    if (line.startsWith(EVT_PREFIX)) {
      const evt = line.slice(EVT_PREFIX.length);
      this.eventHandlers.forEach((h) => h(evt));
      return;
    }
    if (!line.startsWith(TLM_PREFIX)) return;

    const parts = line.split(",");
    if (parts.length < 6) return;

    const ringId = parts[1].toUpperCase();
    const altitudeMeters = Number(parts[2]);
    const deviceTsMs = Number(parts[3]);
    const rssiDbm = Number(parts[4]);
    const batteryMv = Number(parts[5]);
    // Sedmo polje (sirov pritisak) postoji samo na novijem firmveru — stari
    // salje 6 polja i tada ostaje 0, pa telemetrija pada na alt_m fallback.
    const pressurePa = parts.length >= 7 ? Number(parts[6]) : 0;

    if (!RING_ID_RE.test(ringId)) return;
    if (!Number.isFinite(altitudeMeters)) return;

    const frame: TlmFrame = {
      ringId,
      altitudeMeters,
      deviceTsMs: Number.isFinite(deviceTsMs) ? deviceTsMs : 0,
      rssiDbm: Number.isFinite(rssiDbm) ? rssiDbm : 0,
      batteryMv: Number.isFinite(batteryMv) ? batteryMv : 0,
      pressurePa: Number.isFinite(pressurePa) && pressurePa > 0 ? pressurePa : 0,
      receivedAt: Date.now(),
    };

    this.lastFrame = frame;
    this.frameHandlers.forEach((h) => h(frame));
  }
}

export const serialTransport = new SerialTransport();