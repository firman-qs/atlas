import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const ACCESS_TOKEN_COOKIE = "atlas_access_token";
export const REFRESH_TOKEN_COOKIE = "atlas_refresh_token";

type AuthCookieOptions = Partial<ResponseCookie>;

function baseCookieOptions(): AuthCookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

export function accessTokenCookie(value: string): ResponseCookie {
  return {
    name: ACCESS_TOKEN_COOKIE,
    value,
    ...baseCookieOptions(),
  };
}

export function refreshTokenCookie(value: string): ResponseCookie {
  return {
    name: REFRESH_TOKEN_COOKIE,
    value,
    ...baseCookieOptions(),
  };
}

export function clearAccessTokenCookie(): ResponseCookie {
  return {
    name: ACCESS_TOKEN_COOKIE,
    value: "",
    ...baseCookieOptions(),
    maxAge: 0,
  };
}

export function clearRefreshTokenCookie(): ResponseCookie {
  return {
    name: REFRESH_TOKEN_COOKIE,
    value: "",
    ...baseCookieOptions(),
    maxAge: 0,
  };
}
