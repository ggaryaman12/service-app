"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  createChannelAction,
  rotateChannelKeyAction,
  setChannelActiveAction,
  type IntegrationChannelActionState
} from "./actions";

const SCOPES = [
  { value: "catalog:read", label: "Catalog read" },
  { value: "booking:create", label: "Booking create" },
  { value: "booking:status", label: "Booking status" }
];

const INITIAL_STATE: IntegrationChannelActionState = { status: "idle" };
const inputClass =
  "min-h-11 rounded-ui-sm border border-[#ded5c6] bg-white px-3 py-2 text-sm text-[#191816] outline-none transition focus:border-[#b99a50] focus:ring-2 focus:ring-[#f3b43f]/30";
const darkButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-ui-sm bg-[#191816] px-4 text-sm font-black text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2a2824] active:translate-y-0 disabled:opacity-60";
const lightButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-ui-sm border border-[#ded5c6] bg-white px-4 text-sm font-black text-[#191816] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#fbf8ef] active:translate-y-0 disabled:opacity-60";

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
          ? "rounded-ui-sm border border-[#f2c0b9] bg-[#fff0ee] p-3 text-sm font-semibold text-[#b42318]"
          : "rounded-ui-sm border border-[#f3d894] bg-[#fff7e2] p-3 text-sm font-semibold text-[#8a5a00]"
      }
    >
      <p>{state.message}</p>
      {state.apiKey ? (
        <code className="mt-2 block overflow-x-auto rounded-ui-sm border border-[#ded5c6] bg-white px-3 py-2 text-xs text-[#191816]">
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
    <section className="overflow-hidden rounded-ui border border-[#e1d8ca] bg-white shadow-[0_18px_42px_rgba(25,24,22,0.05)]">
      <div className="border-b border-[#eee6d8] px-4 py-4">
        <h2 className="text-sm font-black">Create integration channel</h2>
        <p className="mt-1 text-xs text-[#7a7268]">
        API keys are shown once after create or rotate. Store the key before leaving this page.
        </p>
      </div>
      <form action={formAction} className="grid gap-4 p-4">
        <input
          name="name"
          placeholder="Channel name"
          className={inputClass}
          required
        />
        <fieldset className="grid gap-2 rounded-ui-sm border border-[#ded5c6] bg-[#fbfaf6] p-3">
          <legend className="px-1 text-xs font-black uppercase tracking-[0.12em] text-[#766f64]">
            Scopes
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {SCOPES.map((scope) => (
              <label key={scope.value} className="flex items-center gap-2 text-sm font-bold text-[#5f574c]">
                <input type="checkbox" name="scopes" value={scope.value} />
                {scope.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-3">
          <button
            className={darkButtonClass}
            disabled={pending}
          >
            {pending ? "Creating..." : "Create channel"}
          </button>
          <KeyResult state={state} />
        </div>
      </form>
      <RefreshOnSuccess state={state} />
    </section>
  );
}

export function IntegrationChannelList({ channels }: { channels: Channel[] }) {
  return (
    <section className="overflow-hidden rounded-ui border border-[#e1d8ca] bg-white shadow-[0_18px_42px_rgba(25,24,22,0.05)]">
      <div className="border-b border-[#eee6d8] px-4 py-4">
        <h2 className="text-sm font-black">Integration channels</h2>
        <p className="mt-1 text-xs text-[#7a7268]">Key material is never shown after creation or rotation.</p>
      </div>
      <div className="divide-y divide-[#f0e9dc]">
        {channels.map((channel) => (
          <IntegrationChannelRow key={channel.id} channel={channel} />
        ))}
        {channels.length === 0 ? (
          <div className="p-10 text-center text-sm font-medium text-[#7a7268]">No integration channels yet.</div>
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
    <div className="space-y-3 p-4 transition-colors hover:bg-[#fffaf0]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-black">{channel.name}</p>
            <span
              className={
                channel.active
                  ? "rounded-full bg-[#e8f6ee] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#147a42] ring-1 ring-[#b9e5ca]"
                  : "rounded-full bg-[#f3efe7] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#5f574c] ring-1 ring-[#ded5c6]"
              }
            >
              {channel.active ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="mt-2 text-xs font-medium text-[#7a7268]">
            Scopes: {channel.scopes.length ? channel.scopes.join(", ") : "None"} · Created{" "}
            {new Date(channel.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={activeAction}>
            <input type="hidden" name="channelId" value={channel.id} />
            <input type="hidden" name="active" value={channel.active ? "false" : "true"} />
            <button
              className={lightButtonClass}
              disabled={activePending}
            >
              {channel.active ? "Deactivate" : "Activate"}
            </button>
          </form>
          <form action={rotateAction}>
            <input type="hidden" name="channelId" value={channel.id} />
            <button
              className={darkButtonClass}
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
