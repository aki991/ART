import type { PigeonProfile } from "./types";

// FNV-1a hash for deterministic seed from ringId string
function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return Math.abs(h);
}

interface ThermalState {
  active: boolean;
  boost: number;
  endMs: number;
}

export class FlightSimulator {
  private readonly profile: PigeonProfile;
  private startTime: Date;
  private lastAltitude: number = 250;

  // Wind — deterministic from ringId
  private readonly windPeriodMs: number;
  private readonly windPhase: number;

  // Thermal — stochastic per session
  private thermal: ThermalState = { active: false, boost: 0, endMs: 0 };

  constructor(profile: PigeonProfile, startTime: Date) {
    this.profile = profile;
    this.startTime = startTime;
    this.lastAltitude = 250;

    const seed = hashString(profile.ringId);
    this.windPeriodMs = 30_000 + (seed % 30_001); // 30–60 s
    this.windPhase = ((seed % 1000) / 1000) * Math.PI * 2;
  }

  getCurrentAltitude(now: Date): number {
    const elapsedMs = now.getTime() - this.startTime.getTime();
    const elapsedS = elapsedMs / 1000;
    const cruising = this.profile.cruisingAltitude;

    let target: number;

    if (elapsedS < 25) {
      // Takeoff: exponential easing from 250 m toward 80% of cruising
      const progress = elapsedS / 25;
      const eased = 1 - Math.exp(-progress * 4);
      const takeoffCeiling = Math.max(250, cruising * 0.8);
      target = 250 + (takeoffCeiling - 250) * eased;
    } else {
      // Cruising: oscillate around cruising altitude
      const wind =
        Math.sin((elapsedMs / this.windPeriodMs) * Math.PI * 2 + this.windPhase) * 15;
      target = cruising + wind;

      // Thermal bursts
      const nowMs = now.getTime();
      if (!this.thermal.active && Math.random() < 0.05) {
        this.thermal = {
          active: true,
          boost: 20 + Math.random() * 30,
          endMs: nowMs + 3_000 + Math.random() * 2_000,
        };
      }
      if (this.thermal.active) {
        if (nowMs < this.thermal.endMs) {
          target += this.thermal.boost;
        } else {
          this.thermal = { active: false, boost: 0, endMs: 0 };
        }
      }
    }

    // Micro-noise ±2 m (Box-Muller approximation)
    target += (Math.random() + Math.random() - 1) * 2;

    // Smooth: cap change per step at 50 m
    const delta = target - this.lastAltitude;
    const clamped = Math.max(-50, Math.min(50, delta));
    const next = Math.max(200, this.lastAltitude + clamped);

    this.lastAltitude = next;
    return next;
  }

  reset(startTime: Date): void {
    this.startTime = startTime;
    this.lastAltitude = 250;
    this.thermal = { active: false, boost: 0, endMs: 0 };
  }
}
