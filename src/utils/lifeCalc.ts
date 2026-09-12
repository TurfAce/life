export interface UserConfig {
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  expectedAge: number; // e.g. 80
  subtractSleepHoursDaily: number; // e.g. 8 hours
  screenDrainSpeed: number; // e.g. 1.0 (1x speed), 1.5x, 2.0x
}

export interface SessionLog {
  id: string;
  type: 'SCREEN_OFF_PRESERVED' | 'SCREEN_ON_DRAINED';
  startTime: number;
  endTime: number;
  durationMs: number;
  formattedDuration: string;
}

export interface RemainingTimeDetails {
  totalMs: number;
  remainingMs: number;
  elapsedMs: number;
  screenOnDeductedMs: number;
  preservedLifeMs: number;
  netImpactMs: number;
  percentageRemaining: number;
  years: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  decisecond: number; // 0-9 (1st decimal place of seconds)
}

export const DEFAULT_CONFIG: UserConfig = {
  birthDate: '1998-01-01',
  birthTime: '00:00',
  expectedAge: 80,
  subtractSleepHoursDaily: 0,
  screenDrainSpeed: 1.0, // Default 1.0x (1 second per second speed)
};

export function calculateRemainingLife(
  config: UserConfig,
  totalScreenOnDeductedMs: number = 0,
  totalPreservedLifeMs: number = 0,
  nowTimestamp: number = Date.now()
): RemainingTimeDetails {
  const birthTimestamp = new Date(`${config.birthDate}T${config.birthTime}:00`).getTime();
  const endTimestamp = new Date(birthTimestamp).setFullYear(
    new Date(birthTimestamp).getFullYear() + config.expectedAge
  );

  const rawTotalLifespanMs = endTimestamp - birthTimestamp;
  const sleepRatio = (24 - config.subtractSleepHoursDaily) / 24;
  const effectiveTotalMs = rawTotalLifespanMs * sleepRatio;

  const rawElapsedMs = Math.max(0, nowTimestamp - birthTimestamp);
  const effectiveElapsedMs = rawElapsedMs * sleepRatio;

  const baseRemainingMs = Math.max(0, effectiveTotalMs - effectiveElapsedMs);

  // Apply speed multiplier to active screen-on time drain
  const speed = config.screenDrainSpeed || 1.0;
  const adjustedScreenOnDrain = totalScreenOnDeductedMs * (speed - 1.0);

  const netImpactMs = totalPreservedLifeMs - adjustedScreenOnDrain;
  const finalRemainingMs = Math.max(0, baseRemainingMs + netImpactMs);

  const percentageRemaining = Math.max(0, Math.min(100, (finalRemainingMs / effectiveTotalMs) * 100));

  // Time unit breakdown
  const secFactor = 1000;
  const minFactor = secFactor * 60;
  const hourFactor = minFactor * 60;
  const dayFactor = hourFactor * 24;
  const yearFactor = dayFactor * 365.25;

  const years = Math.floor(finalRemainingMs / yearFactor);
  const remAfterYears = finalRemainingMs % yearFactor;

  const days = Math.floor(remAfterYears / dayFactor);
  const remAfterDays = remAfterYears % dayFactor;

  const hours = Math.floor(remAfterDays / hourFactor);
  const remAfterHours = remAfterDays % hourFactor;

  const minutes = Math.floor(remAfterHours / minFactor);
  const remAfterMins = remAfterHours % minFactor;

  const seconds = Math.floor(remAfterMins / secFactor);
  const milliseconds = Math.floor(remAfterMins % secFactor);
  const decisecond = Math.floor(milliseconds / 100); // 1st decimal digit (0-9)

  return {
    totalMs: effectiveTotalMs,
    remainingMs: finalRemainingMs,
    elapsedMs: effectiveElapsedMs,
    screenOnDeductedMs: totalScreenOnDeductedMs,
    preservedLifeMs: totalPreservedLifeMs,
    netImpactMs,
    percentageRemaining,
    years,
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    decisecond
  };
}

export function formatMsToReadable(ms: number): string {
  const totalSeconds = Math.floor(Math.abs(ms) / 1000);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs}時間 ${mins}分 ${secs}秒`;
  }
  if (mins > 0) {
    return `${mins}分 ${secs}秒`;
  }
  return `${secs}秒`;
}
