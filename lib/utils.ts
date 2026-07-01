import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = "USD"): string {
  const formatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency === "CDF" ? "CDF" : "USD",
    minimumFractionDigits: 2,
  });
  return formatter.format(value);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

////////////////////////////////////////
///////// generate hslColor ///////////
const getHashOfString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  return hash;
};

const normalizeHash = (hash: number, min: number, max: number) => {
  return Math.floor((hash % (max - min)) + min);
};

const generateHSL = (name: string) => {
  const hRange = [0, 360];
  const sRange = [50, 75];
  const lRange = [25, 60];
  const hash = getHashOfString(name);
  const h = normalizeHash(hash, hRange[0], hRange[1]);
  const s = normalizeHash(hash, sRange[0], sRange[1]);
  const l = normalizeHash(hash, lRange[0], lRange[1]);
  return [h, s, l];
};

export const getHSLColor = (name: string) => {
  const hsl = generateHSL(name);

  return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
};

