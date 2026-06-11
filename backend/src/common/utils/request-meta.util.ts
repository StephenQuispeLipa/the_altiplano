import type { Request } from 'express';
import { UAParser } from 'ua-parser-js';

export interface ClientMeta {
  ipAddress: string;
  browser: string;
  userAgent: string;
}

function normalizeIp(raw: string | null | undefined): string | null {
  if (!raw) return null;

  let ip = raw.trim();
  if (!ip) return null;

  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7);
  }

  if (ip === '::1') {
    return '127.0.0.1';
  }

  return ip;
}

function firstForwardedIp(forwarded: string | string[] | undefined): string | null {
  if (!forwarded) return null;

  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const first = value.split(',')[0]?.trim();
  return normalizeIp(first);
}

export function getClientMeta(req: Request): ClientMeta {
  const ipAddress =
    firstForwardedIp(req.headers['x-forwarded-for']) ||
    normalizeIp(typeof req.headers['x-real-ip'] === 'string' ? req.headers['x-real-ip'] : undefined) ||
    normalizeIp(req.ip) ||
    normalizeIp(req.socket?.remoteAddress) ||
    'unknown';

  const userAgent = req.headers['user-agent'] ?? '';
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const browserLabel = [browser.name, browser.version].filter(Boolean).join(' ') || 'Desconocido';

  return {
    ipAddress,
    browser: browserLabel,
    userAgent,
  };
}
