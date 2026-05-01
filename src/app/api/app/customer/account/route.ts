import { getCustomerAccount } from "@/features/account/account.service";
import { requireCustomer } from "@/features/auth/session.service";
import { jsonError, jsonOk } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireCustomer();
    return jsonOk(await getCustomerAccount(user.id));
  } catch (error) {
    return jsonError(error);
  }
}
