import { listIntegrationChannels } from "@/features/integrations/integration-channel.service";
import {
  CreateIntegrationChannelForm,
  IntegrationChannelList
} from "@/app/(admin)/admin/integration-channels/integration-channel-forms";
import { tableExists } from "@/lib/db-meta";
import { AdminPageHeader, MetricCard } from "@/app/(admin)/admin/_components/admin-ui";
import { requireFeaturePermission } from "@/features/operations/permission-guard.service";

export const dynamic = "force-dynamic";

export default async function AdminIntegrationChannelsPage() {
  await requireFeaturePermission("integrations.manage");
  const hasIntegrationChannel = await tableExists("IntegrationChannel");
  const channels = hasIntegrationChannel ? await listIntegrationChannels() : [];
  const channelRows = channels.map((channel) => ({
    ...channel,
    createdAt: channel.createdAt.toISOString(),
    updatedAt: channel.updatedAt.toISOString()
  }));

  return (
    <div className="space-y-7">
      <AdminPageHeader
        eyebrow="Platform"
        title="Integration Channels"
        description="Create, rotate, scope, and deactivate API keys for chatbot, WhatsApp, and third-party booking channels."
      />
      {!hasIntegrationChannel ? (
        <div className="rounded-ui border border-[#f3d894] bg-[#fff7e2] p-4 text-sm font-semibold text-[#8a5a00]">
          Integration channel tables are not in this database yet. Run the Prisma migration before
          creating API keys.
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Channels"
          value={channelRows.length}
          detail="Configured API surfaces"
          tone="blue"
        />
        <MetricCard
          label="Active"
          value={channelRows.filter((channel) => channel.active).length}
          detail="Allowed to authenticate"
          tone="green"
        />
        <MetricCard
          label="Scoped access"
          value={new Set(channelRows.flatMap((channel) => channel.scopes)).size}
          detail="Unique scopes in use"
          tone="amber"
        />
      </div>
      {hasIntegrationChannel ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_24rem]">
          <IntegrationChannelList channels={channelRows} />
          <CreateIntegrationChannelForm />
        </div>
      ) : (
        <IntegrationChannelList channels={[]} />
      )}
    </div>
  );
}
