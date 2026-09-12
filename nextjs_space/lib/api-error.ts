import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
export class ApiError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function apiError(error: unknown) {
  if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError) return NextResponse.json({ error: error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') }, { status: 400 });
  if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid JSON request' }, { status: 400 });
  const code = (error as { code?: string })?.code;
  if (code === 'P2034' || code === 'P2002') return NextResponse.json({ error: 'This request conflicts with a recent update. Refresh and try again.' }, { status: 409 });
  console.error('Request failed', error);
  return NextResponse.json({ error: 'Request could not be completed' }, { status: 500 });
}
