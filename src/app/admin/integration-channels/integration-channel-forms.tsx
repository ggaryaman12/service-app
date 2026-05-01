"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  createChannelAction,
  rotateChannelKeyAction,
  setChannelActiveAction,
  type IntegrationChannelActionState
} from "@/app/admin/integration-channels/actions";

const SCOPES = [
  { value: "catalog:read", label: "Catalog read" },
  { value: "booking:create", label: "Booking create" },
  { value: "booking:status", label: "Booking status" }
];

const INITIAL_STATE: IntegrationChannelActionState = { status: "idle" };

type Channel = {
  id: string;
  name: string;
  scopes: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

function KeyResult({ state }: { state: IntegrationChannelActionState }) {
  if (state.status === "idle") return null;

  return (
    <div
      className={
        state.status === "error"
          ? "rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          : "rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700"
      }
    >
      <p>{state.message}</p>
      {state.apiKey ? (
        <code className="mt-2 block overflow-x-auto rounded border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900">
          {state.apiKey}
        </code>
      ) : null}
    </div>
  );
}

function RefreshOnSuccess({ state }: { state: IntegrationChannelActionState }) {
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return null;
}

export function CreateIntegrationChannelForm() {
  const [state, formAction, pending] = useActionState(createChannelAction, INITIAL_STATE);

  return (
    <section className="rounded-lg border border-neutral-200 p-4">
      <h2 className="text-sm font-semibold">Create integration channel</h2>
      <p className="mt-1 text-xs text-neutral-500">
        API keys are shown once after create or rotate. Store the key before leaving this page.
      </p>
      <form action={formAction} className="mt-3 grid gap-3">
        <input
          name="name"
          placeholder="Channel name"
          className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
          required
        />
        <fieldset className="grid gap-2 rounded-md border border-neutral-200 p-3">
          <legend className="px-1 text-xs font-medium text-neutral-600">Scopes</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {SCOPES.map((scope) => (
              <label key={scope.value} className="flex items-center gap-2 text-sm text-neutral-700">
                <input type="checkbox" name="scopes" value={scope.value} />
                {scope.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <button
            className="w-fit rounded-md bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-60"
            disabled={pending}
          >
            {pending ? "Creating..." : "Create channel"}
          </button>
          <div className="flex-1">
            <KeyResult state={state} />
          </div>
        </div>
      </form>
      <RefreshOnSuccess state={state} />
    </section>
  );
}

export function IntegrationChannelList({ channels }: { channels: Channel[] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-neutral-200">
      <div className="border-b border-neutral-200 px-4 py-3">
        <h2 className="text-sm font-semibold">Integration channels</h2>
      </div>
      <div className="divide-y divide-neutral-200">
        {channels.map((channel) => (
          <IntegrationChannelRow key={channel.id} channel={channel} />
        ))}
        {channels.length === 0 ? (
          <div className="p-4 text-sm text-neutral-600">No integration channels yet.</div>
        ) : null}
      </div>
    </section>
  );
}

function IntegrationChannelRow({ channel }: { channel: Channel }) {
  const [rotateState, rotateAction, rotatePending] = useActionState(
    rotateChannelKeyAction,
    INITIAL_STATE
  );
  const [activeState, activeAction, activePending] = useActionState(
    setChannelActiveAction,
    INITIAL_STATE
  );

  return (
    <div className="space-y-3 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium">{channel.name}</p>
            <span
              className={
                channel.active
                  ? "rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700"
                  : "rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
              }
            >
              {channel.active ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Scopes: {channel.scopes.length ? channel.scopes.join(", ") : "None"} · Created{" "}
            {new Date(channel.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={activeAction}>
            <input type="hidden" name="channelId" value={channel.id} />
            <input type="hidden" name="active" value={channel.active ? "false" : "true"} />
            <button
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-900 disabled:opacity-60"
              disabled={activePending}
            >
              {channel.active ? "Deactivate" : "Activate"}
            </button>
          </form>
          <form action={rotateAction}>
            <input type="hidden" name="channelId" value={channel.id} />
            <button
              className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-60"
              disabled={rotatePending}
            >
              {rotatePending ? "Rotating..." : "Rotate key"}
            </button>
          </form>
        </div>
      </div>
      <KeyResult state={rotateState} />
      {activeState.status === "error" ? <KeyResult state={activeState} /> : null}
      <RefreshOnSuccess state={rotateState} />
      <RefreshOnSuccess state={activeState} />
    </div>
  );
}
