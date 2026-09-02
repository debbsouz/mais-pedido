const TIME_ZONE = "America/Sao_Paulo";

export interface BusinessHourRow {
  dayOfWeek: number;
  isClosed: boolean;
  opensAt: string | null;
  closesAt: string | null;
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getZonedNow(now: Date): { dayOfWeek: number; minutes: number } {
  const zoned = new Date(
    now.toLocaleString("en-US", { timeZone: TIME_ZONE }),
  );

  return {
    dayOfWeek: zoned.getDay(),
    minutes: zoned.getHours() * 60 + zoned.getMinutes(),
  };
}

/**
 * Se está dentro do horário programado agora (fuso America/Sao_Paulo).
 * Retorna `null` quando não existe nenhum horário configurado — nesse
 * caso não há restrição vinda do horário, só o interruptor manual.
 *
 * Considera o dia anterior também, pra cobrir horário que passa da
 * meia-noite (ex.: sexta 18h às 02h).
 */
export function isWithinBusinessHours(
  hours: BusinessHourRow[],
  now: Date = new Date(),
): boolean | null {
  if (hours.length === 0) {
    return null;
  }

  const { dayOfWeek, minutes } = getZonedNow(now);
  const yesterday = (dayOfWeek + 6) % 7;

  const today = hours.find((hour) => hour.dayOfWeek === dayOfWeek);
  const previous = hours.find((hour) => hour.dayOfWeek === yesterday);

  if (today && !today.isClosed && today.opensAt && today.closesAt) {
    const opens = toMinutes(today.opensAt);
    const closes = toMinutes(today.closesAt);

    if (opens <= closes) {
      if (minutes >= opens && minutes < closes) {
        return true;
      }
    } else if (minutes >= opens) {
      return true;
    }
  }

  if (
    previous &&
    !previous.isClosed &&
    previous.opensAt &&
    previous.closesAt
  ) {
    const opens = toMinutes(previous.opensAt);
    const closes = toMinutes(previous.closesAt);

    if (opens > closes && minutes < closes) {
      return true;
    }
  }

  return false;
}

export const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

export const WEEKDAY_SHORT_LABELS = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
] as const;
