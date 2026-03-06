import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutClient } from "@/app/checkout/checkout-client";

export default async function CheckoutPage() {
  const session = await auth();
  const loggedIn = Boolean(session?.user && session.user.role === "CUSTOMER");

  const services = await prisma.service.findMany({
    select: { id: true, basePrice: true }
  });
  const prices = Object.fromEntries(services.map((s) => [s.id, s.basePrice])) as Record<
    string,
    number
  >;

  return <CheckoutClient loggedIn={loggedIn} prices={prices} />;
}

