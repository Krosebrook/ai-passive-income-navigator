export function createPageUrl(pageName: string) {
    return '/' + pageName.replace(/ /g, '-');
}

/**
 * IMPORTANT SECURITY NOTE:
 * This is a BASIC sanitization function for demonstration purposes.
 * For PRODUCTION use, you MUST use a dedicated HTML sanitization library like DOMPurify.
 * 
 * Install DOMPurify:
 *   npm install dompurify
 * 
 * Usage with DOMPurify:
 *   import DOMPurify from 'dompurify';
 *   const clean = DOMPurify.sanitize(dirtyInput);
 * 
 * Known limitations of this basic implementation:
 * - Does not handle nested or malformed script tags
 * - Does not handle encoded characters (e.g., &lt;script&gt;)
 * - Does not handle all XSS vectors (data URIs, SVG, etc.)
 * - Should NOT be used for security-critical operations
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';
    
    // Development-only warning
    if (import.meta.env.DEV) {
        console.warn('[SECURITY] Using basic sanitization. For production, use DOMPurify library.');
    }
    
    // BASIC sanitization - NOT production-ready
    // Remove script tags and their content
    let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi, '');
    
    // Remove on* event handlers
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
    
    // Remove dangerous URL schemes
    sanitized = sanitized.replace(/(javascript|data|vbscript):/gi, '');
    
    return sanitized.trim();
}

/**
 * Debounce function to limit the rate at which a function can fire
 * Useful for search inputs, resize handlers, etc.
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    
    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format currency with proper locale and symbol
 * @param amount - The amount to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale for formatting (default: 'en-US')
 */
export function formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatNumber(num: number): string {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Comprehensive email validation regex (RFC 5322 simplified)
// Matches: local-part@domain
// - Local part: alphanumeric, dots, plus, hyphens, underscores
// - Domain: alphanumeric with hyphens, can have subdomains
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validate email address
 * Uses a comprehensive regex pattern that handles most valid email formats
 * For production, consider using a dedicated email validation library for edge cases
 */
export function isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Truncate text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Generate a random ID
 * Uses crypto.randomUUID() if available (modern browsers), falls back to timestamp-based ID
 */
export function generateId(): string {
    // Use crypto.randomUUID() for better uniqueness if available
    if (isBrowser() && typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Check if code is running in browser
 */
export function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

/**
 * Safe localStorage access with fallback
 */
export const storage = {
    get(key: string): string | null {
        if (!isBrowser()) return null;
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    
    set(key: string, value: string): boolean {
        if (!isBrowser()) return false;
        try {
            localStorage.setItem(key, value);
            return true;
        } catch {
            return false;
        }
    },
    
    remove(key: string): boolean {
        if (!isBrowser()) return false;
        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    },
};

/**
 * Delay execution (useful for testing and async operations)
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}