import { auth } from "@/auth";
import { CheckoutClient } from "./checkout-client";
import { getCatalogSnapshot } from "@/features/catalog/catalog.service";

export default async function CheckoutPage() {
  const session = await auth();
  const loggedIn = Boolean(session?.user && session.user.role === "CUSTOMER");

  const { services } = await getCatalogSnapshot();
  const prices = Object.fromEntries(services.map((s) => [s.id, s.basePrice])) as Record<
    string,
    number
  >;

  return <CheckoutClient loggedIn={loggedIn} prices={prices} />;
}
