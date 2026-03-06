import { NextResponse } from "next/server";
import { auth } from "@/auth";

function redirectToCustomerLogin(req: Request) {
  const url = new URL("/customer/login", req.url);
  url.searchParams.set("next", new URL(req.url).pathname);
  return NextResponse.redirect(url);
}

function redirectToStaffLogin(req: Request) {
  const url = new URL("/staff/login", req.url);
  url.searchParams.set("next", new URL(req.url).pathname);
  return NextResponse.redirect(url);
}

function redirectHome(req: Request) {
  return NextResponse.redirect(new URL("/", req.url));
}

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const userRole = req.auth?.user?.role;

  if (!req.auth) {
    if (pathname === "/staff/login" || pathname === "/staff/setup") {
      return NextResponse.next();
    }
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/manager") ||
      pathname.startsWith("/worker") ||
      pathname.startsWith("/staff")
    ) {
      return redirectToStaffLogin(req);
    }
    return redirectToCustomerLogin(req);
  }

  if (pathname.startsWith("/admin")) {
    if (userRole !== "ADMIN") return redirectHome(req);
  }

  if (pathname.startsWith("/manager")) {
    if (userRole !== "MANAGER" && userRole !== "ADMIN") return redirectHome(req);
  }

  if (pathname.startsWith("/worker")) {
    if (userRole !== "WORKER" && userRole !== "ADMIN") return redirectHome(req);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/manager/:path*", "/worker/:path*", "/staff/:path*"]
};
