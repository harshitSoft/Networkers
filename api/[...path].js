export const config = { runtime: "edge" };

export default async function proxy(request) {
  const origin = request.headers.get("origin");
  const configuredOrigins = (process.env.FRONTEND_ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const allowedOrigins = new Set([
    "http://localhost:5173",
    "https://networkers.family",
    "https://www.networkers.family",
    ...configuredOrigins,
  ]);
  const allowOrigin = origin && allowedOrigins.has(origin) ? origin : "https://networkers.family";
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const backendOrigin = process.env.BACKEND_API_URL?.replace(/\/+$/, "");
  if (!backendOrigin) {
    return Response.json(
      { success: false, message: "BACKEND_API_URL is not configured", data: null },
      { status: 503, headers: corsHeaders },
    );
  }

  const incoming = new URL(request.url);
  const target = new URL(`${incoming.pathname}${incoming.search}`, backendOrigin);
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("x-forwarded-host");

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });
  const responseHeaders = new Headers(upstream.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => responseHeaders.set(key, value));
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
