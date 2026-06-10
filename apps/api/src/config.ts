import 'dotenv/config';

const required = (key: string): string => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
};

export const config = {
  port:           parseInt(process.env.PORT ?? '4000'),
  nodeEnv:        process.env.NODE_ENV ?? 'development',
  isDev:          (process.env.NODE_ENV ?? 'development') !== 'production',

  jwtSecret:      process.env.JWT_SECRET ?? 'dev-secret-change-in-prod',
  jwtExpiresIn:   process.env.JWT_EXPIRES_IN ?? '15m',
  refreshExpires: '7d',

  postgresUrl:    process.env.POSTGRES_URL ?? 'postgresql://vmp:vmppass@localhost:5432/vmpdb',
  redisUrl:       process.env.REDIS_URL    ?? 'redis://localhost:6379',

  proxmox: {
    url:         process.env.PROXMOX_URL   ?? 'https://localhost:8006/api2/json',
    token:       process.env.PROXMOX_TOKEN ?? '',
    node:        process.env.PROXMOX_NODE  ?? 'pve',
    verifyTls:   process.env.PROXMOX_VERIFY_TLS !== 'false',
  },

  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',

  rateLimit: {
    windowMs:  60_000,
    max:       200,
    authMax:   process.env.NODE_ENV === 'production' ? 5 : 100,
  },
} as const;
