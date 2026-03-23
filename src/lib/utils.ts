import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateInviteCode(length:number){
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error("length must be a positive integer")
  }

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let code = ""

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    code += characters[randomIndex]
  }

  return code
}

export function formatTaskStatus(status: string) {
  return status.replaceAll("_", " ")
}

export const calculateDifference = (current: number, previous: number) => {
    return current - previous;
};