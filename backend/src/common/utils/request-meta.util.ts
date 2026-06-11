import { Request } from 'express';
import { UAParser } from 'ua-parser-js';

export interface ClientMeta {
  ipAddress: string;
  browser: string;
  userAgent: string;
}

export function getClientMeta(req: Request): ClientMeta {
  const forwarded = req.headers['x-forwarded-for'];
  const ip =
    (typeof forwarded === 'string'
      ? forwarded.split(',')[0]?.trim()
      : Array.isArray(forwarded)
        ? forwarded[0]
        : null) ||
    req.ip ||
    req.socket?.remoteAddress ||
    'unknown';

  const userAgent = req.headers['user-agent'] ?? '';
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const browserLabel = [browser.name, browser.version].filter(Boolean).join(' ') || 'Desconocido';

  return {
    ipAddress: ip,
    browser: browserLabel,
    userAgent,
  };
}
