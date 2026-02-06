import { describe, it, expect } from 'vitest';
import { 
  createPageUrl, 
  sanitizeInput, 
  debounce,
  formatCurrency,
  formatNumber,
  isValidEmail,
  isValidUrl,
  truncateText,
  generateId,
  storage,
  sleep,
  isBrowser
} from '../utils';

/**
 * Tests for utility functions
 * Comprehensive test coverage for all utility functions
 */
describe('createPageUrl', () => {
  it('should convert page name to URL format', () => {
    expect(createPageUrl('Home')).toBe('/Home');
    expect(createPageUrl('Dashboard')).toBe('/Dashboard');
  });

  it('should replace spaces with hyphens', () => {
    expect(createPageUrl('Profile Settings')).toBe('/Profile-Settings');
    expect(createPageUrl('My Portfolio')).toBe('/My-Portfolio');
  });

  it('should handle single word names', () => {
    expect(createPageUrl('Portfolio')).toBe('/Portfolio');
  });

  it('should handle multiple spaces', () => {
    expect(createPageUrl('My New Page')).toBe('/My-New-Page');
  });
});

describe('sanitizeInput', () => {
  it('should remove script tags', () => {
    const input = 'Hello <script>alert("XSS")</script> World';
    expect(sanitizeInput(input)).toBe('Hello  World');
  });

  it('should remove event handlers with quotes', () => {
    const input = '<div onclick="alert()">Click me</div>';
    expect(sanitizeInput(input)).toBe('<div>Click me</div>');
  });

  it('should remove event handlers without quotes', () => {
    const input = '<div onclick=alert()>Click me</div>';
    expect(sanitizeInput(input)).toBe('<div>Click me</div>');
  });

  it('should remove javascript: protocols', () => {
    const input = '<a href="javascript:alert()">Link</a>';
    expect(sanitizeInput(input)).toBe('<a href="alert()">Link</a>');
  });

  it('should handle empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });
});

describe('debounce', () => {
  it('should delay function execution', async () => {
    let callCount = 0;
    const debouncedFn = debounce(() => callCount++, 100);
    
    debouncedFn();
    debouncedFn();
    debouncedFn();
    
    expect(callCount).toBe(0);
    
    await sleep(150);
    expect(callCount).toBe(1);
  });
});

describe('formatCurrency', () => {
  it('should format USD currency', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('should handle negative numbers', () => {
    expect(formatCurrency(-500)).toBe('-$500');
  });

  it('should support custom locale', () => {
    expect(formatCurrency(1234.56, 'EUR', 'de-DE')).toContain('1');
  });
});

describe('formatNumber', () => {
  it('should format thousands with K', () => {
    expect(formatNumber(1500)).toBe('1.5K');
  });

  it('should format millions with M', () => {
    expect(formatNumber(2500000)).toBe('2.5M');
  });

  it('should format billions with B', () => {
    expect(formatNumber(3500000000)).toBe('3.5B');
  });

  it('should return number as string for values < 1000', () => {
    expect(formatNumber(999)).toBe('999');
  });
});

describe('isValidEmail', () => {
  it('should validate correct email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
    expect(isValidEmail('user.name@example.co.uk')).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('test @example.com')).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('should validate correct URL', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
  });

  it('should reject invalid URL', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('://invalid')).toBe(false);
  });
});

describe('truncateText', () => {
  it('should truncate long text', () => {
    const text = 'This is a very long text that should be truncated';
    expect(truncateText(text, 20)).toBe('This is a very long...');
  });

  it('should not truncate short text', () => {
    expect(truncateText('Short', 10)).toBe('Short');
  });

  it('should handle exact length', () => {
    expect(truncateText('Exact', 5)).toBe('Exact');
  });
});

describe('generateId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should generate non-empty string', () => {
    const id = generateId();
    expect(id.length).toBeGreaterThan(0);
  });

  it('should use crypto.randomUUID when available', () => {
    // In modern browsers, crypto.randomUUID should be available
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      const id = generateId();
      // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    }
  });

  it('should fallback to timestamp-based ID when crypto.randomUUID is not available', () => {
    const originalRandomUUID = crypto.randomUUID;
    crypto.randomUUID = undefined;
    
    const id = generateId();
    expect(id).toBeDefined();
    expect(id.length).toBeGreaterThan(0);
    
    crypto.randomUUID = originalRandomUUID;
  });
});

describe('storage', () => {
  it('should store and retrieve values', () => {
    storage.set('test-key', 'test-value');
    expect(storage.get('test-key')).toBe('test-value');
  });

  it('should remove values', () => {
    storage.set('test-key', 'test-value');
    storage.remove('test-key');
    expect(storage.get('test-key')).toBe(null);
  });

  it('should return null for non-existent keys', () => {
    expect(storage.get('non-existent-key')).toBe(null);
  });

  it('should return true when set succeeds', () => {
    expect(storage.set('success-key', 'value')).toBe(true);
  });

  it('should return true when remove succeeds', () => {
    storage.set('remove-key', 'value');
    expect(storage.remove('remove-key')).toBe(true);
  });

  it('should handle localStorage errors gracefully', () => {
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error('Storage error');
    };
    
    expect(storage.get('test-key')).toBe(null);
    
    Storage.prototype.getItem = originalGetItem;
  });

  it('should handle setItem errors gracefully', () => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error('Storage full');
    };
    
    expect(storage.set('test-key', 'value')).toBe(false);
    
    Storage.prototype.setItem = originalSetItem;
  });

  it('should handle removeItem errors gracefully', () => {
    const originalRemoveItem = Storage.prototype.removeItem;
    Storage.prototype.removeItem = () => {
      throw new Error('Storage error');
    };
    
    expect(storage.remove('test-key')).toBe(false);
    
    Storage.prototype.removeItem = originalRemoveItem;
  });
});

describe('isBrowser', () => {
  it('should return true in browser environment', () => {
    expect(isBrowser()).toBe(true);
  });
});

describe('sanitizeInput edge cases', () => {
  it('should handle data: protocol', () => {
    const input = '<a href="data:text/html,<script>alert(1)</script>">Link</a>';
    const result = sanitizeInput(input);
    expect(result).not.toContain('data:');
  });

  it('should handle vbscript: protocol', () => {
    const input = '<a href="vbscript:msgbox(1)">Link</a>';
    const result = sanitizeInput(input);
    expect(result).not.toContain('vbscript:');
  });

  it('should handle multiple event handlers', () => {
    const input = '<div onclick="alert(1)" onmouseover="alert(2)">Test</div>';
    const result = sanitizeInput(input);
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('onmouseover');
  });
});

describe('formatCurrency edge cases', () => {
  it('should handle large numbers', () => {
    const result = formatCurrency(999999999);
    expect(result).toContain('999');
  });

  it('should handle decimal precision', () => {
    const result = formatCurrency(100.999);
    expect(result).toMatch(/10[01]/); // Can be $100 or $101 depending on rounding
  });
});

describe('generateId edge cases', () => {
  it('should generate different IDs on consecutive calls', () => {
    const ids = new Set();
    for (let i = 0; i < 10; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(10);
  });
});
