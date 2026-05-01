import { listIntegrationChannels } from "@/features/integrations/integration-channel.service";
import {
  CreateIntegrationChannelForm,
  IntegrationChannelList
} from "@/app/admin/integration-channels/integration-channel-forms";

export const dynamic = "force-dynamic";

export default async function AdminIntegrationChannelsPage() {
  const channels = await listIntegrationChannels();
  const channelRows = channels.map((channel) => ({
    ...channel,
    createdAt: channel.createdAt.toISOString(),
    updatedAt: channel.updatedAt.toISOString()
  }));

  return (
    <div className="space-y-6">
      <CreateIntegrationChannelForm />
      <IntegrationChannelList channels={channelRows} />
    </div>
  );
}
