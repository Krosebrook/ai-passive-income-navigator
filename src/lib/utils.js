import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges Tailwind CSS class names
 * Uses clsx for conditional class names and tailwind-merge to handle conflicts
 * 
 * @param {...(string|Object|Array)} inputs - Class names to combine
 * @returns {string} Merged class names
 * 
 * @example
 * // Basic usage
 * cn('px-2 py-1', 'bg-blue-500')
 * // Returns: 'px-2 py-1 bg-blue-500'
 * 
 * @example
 * // Conditional classes
 * cn('text-base', isActive && 'font-bold')
 * // Returns: 'text-base font-bold' (if isActive is true)
 * 
 * @example
 * // Overriding classes (tailwind-merge handles conflicts)
 * cn('px-2', 'px-4')
 * // Returns: 'px-4' (later class wins)
 * 
 * @example
 * // Object syntax
 * cn('text-base', { 'text-lg': isLarge, 'font-bold': isBold })
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 

/**
 * Checks if the application is running inside an iframe
 * Useful for detecting embedded contexts or iframe-based integrations
 * 
 * @type {boolean}
 * @example
 * if (isIframe) {
 *   console.log('Running in iframe');
 * }
 */
export const isIframe = window.self !== window.top;
