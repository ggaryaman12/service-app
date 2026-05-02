"use server";

import { revalidatePath } from "next/cache";

import {
  createIntegrationChannel,
  rotateIntegrationChannelKey,
  setIntegrationChannelActive
} from "@/features/integrations/integration-channel.service";
import { requireFeaturePermission } from "@/features/operations/permission-guard.service";

const INTEGRATION_CHANNELS_PATH = "/integration-channels";

export type IntegrationChannelActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  apiKey?: string;
  channelId?: string;
};

const initialState: IntegrationChannelActionState = { status: "idle" };

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export async function createChannelAction(
  _state: IntegrationChannelActionState,
  formData: FormData
): Promise<IntegrationChannelActionState> {
  try {
    await requireFeaturePermission("integrations.manage");
    const result = await createIntegrationChannel({
      name: String(formData.get("name") ?? ""),
      scopes: formData.getAll("scopes")
    });
    revalidatePath(INTEGRATION_CHANNELS_PATH);
    return {
      status: "success",
      message: "Channel created. Copy this key now; it will not be shown again.",
      apiKey: result.apiKey,
      channelId: result.channel.id
    };
  } catch (error) {
    return { ...initialState, status: "error", message: getErrorMessage(error) };
  }
}

export async function rotateChannelKeyAction(
  _state: IntegrationChannelActionState,
  formData: FormData
): Promise<IntegrationChannelActionState> {
  try {
    await requireFeaturePermission("integrations.manage");
    const channelId = String(formData.get("channelId") ?? "");
    const result = await rotateIntegrationChannelKey(channelId);
    revalidatePath(INTEGRATION_CHANNELS_PATH);
    return {
      status: "success",
      message: "Key rotated. Copy this key now; it will not be shown again.",
      apiKey: result.apiKey,
      channelId: result.channel.id
    };
  } catch (error) {
    return { ...initialState, status: "error", message: getErrorMessage(error) };
  }
}

export async function setChannelActiveAction(
  _state: IntegrationChannelActionState,
  formData: FormData
): Promise<IntegrationChannelActionState> {
  try {
    await requireFeaturePermission("integrations.manage");
    const channelId = String(formData.get("channelId") ?? "");
    await setIntegrationChannelActive(channelId, formData.get("active") === "true");
    revalidatePath(INTEGRATION_CHANNELS_PATH);
    return { status: "success", message: "Channel status updated.", channelId };
  } catch (error) {
    return { ...initialState, status: "error", message: getErrorMessage(error) };
  }
}
