import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
export function safeJsonParse(str: string) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return []; // fallback if invalid JSON
    }
}