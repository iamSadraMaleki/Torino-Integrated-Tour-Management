// ========== محتوای صفحه معرفی سیستم (لندینگ) ==========

export interface HeroStat {
  number: string;
  label: string;
}

export interface HeroContent {
  badge: string;
  title: string;
  titleHighlight: string;
  titleEnd: string;
  subtitle: string;
  description: string;
  buttonPrimary: string;
  buttonSecondary: string;
  stats: HeroStat[];
}

export interface LandingCity {
  id: number;
  name: string;
  image: string;
  icon: string;
}

export interface LandingPlace {
  id: number;
  name: string;
  icon: string;
  description: string;
  fullDescription: string;
  image: string;
  location: string;
  bestTime: string;
  duration: string;
  price: string;
}

export interface LandingHotel {
  id: number;
  name: string;
  stars: number;
  location: string;
  price: string;
  image: string;
  facilities: string[];
  fullDescription: string;
  address: string;
  phone: string;
  website: string;
  checkIn: string;
  checkOut: string;
  roomTypes: string[];
  nearby: string[];
}

export interface LandingFood {
  id: number;
  name: string;
  region: string;
  emoji: string;
  description: string;
  spice: string;
  image: string;
}

export interface LandingVehicle {
  id: number;
  name: string;
  type: string;
  capacity: string;
  features: string;
  class: string;
  icon: string;
  image: string;
}

/** نقشه کامل محتوای لندینگ — هر کلید یک رشته JSON است */
export type LandingContentMap = Record<string, string>;

export const LANDING_KEYS = {
  HERO: "HERO",
  CITIES: "CITIES",
  PLACES: "PLACES",
  HOTELS: "HOTELS",
  FOODS: "FOODS",
  VEHICLES: "VEHICLES",
} as const;

export function parseHero(json: string | undefined): HeroContent | null {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function parseList<T>(json: string | undefined): T[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
