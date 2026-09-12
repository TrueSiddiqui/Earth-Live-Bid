const rateMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  entry.count++;
  if (entry.count > maxRequests) {
    return false;
  }
  return true;
}
