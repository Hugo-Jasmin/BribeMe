import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function errorJson(error: unknown, status = 500) {
  if (error instanceof ZodError) {
    return json({ error: "Validation failed", issues: error.issues }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  return json({ error: message }, { status });
}
