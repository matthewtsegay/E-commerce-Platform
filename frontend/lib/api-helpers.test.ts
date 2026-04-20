import { describe, expect, it } from 'vitest';
import { extractList, getApiErrorMessage } from './api-helpers';
import { sanitizeNextPath } from './auth';

describe('extractList', () => {
  it('returns array payload directly', () => {
    const payload = [{ id: 1 }];
    expect(extractList(payload)).toEqual(payload);
  });

  it('returns paginated results payload', () => {
    const payload = {
      count: 1,
      next: null,
      previous: null,
      results: [{ id: 2 }],
    };
    expect(extractList(payload)).toEqual([{ id: 2 }]);
  });
});

describe('getApiErrorMessage', () => {
  it('uses detail when present', () => {
    const error = { response: { data: { detail: 'Access denied' } } };
    expect(getApiErrorMessage(error, 'Fallback')).toBe('Access denied');
  });

  it('uses first field message array', () => {
    const error = { response: { data: { email: ['Invalid email'] } } };
    expect(getApiErrorMessage(error, 'Fallback')).toBe('Invalid email');
  });
});

describe('sanitizeNextPath', () => {
  it('accepts safe internal path', () => {
    expect(sanitizeNextPath('/checkout')).toBe('/checkout');
  });

  it('rejects external urls', () => {
    expect(sanitizeNextPath('https://evil.com')).toBe('/');
  });
});
