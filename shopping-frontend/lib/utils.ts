import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price: number | string) => {
  return typeof price === "string"
    ? Number.parseFloat(price).toFixed(2)
    : price.toFixed(2);
};
