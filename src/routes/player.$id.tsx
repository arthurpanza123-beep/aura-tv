import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { TVPlayer } from "@/components/tv/TVPlayer";
import { useState, useEffect } from "react";
import { useIptvCredentials } from "@/hooks/useIptvCredentials";
import { getPlaybackUrlFn } from "@/functions/iptv.functions";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/player/$id")({
  head: () => ({
    meta: [{ title: "Player — Central Play Plus" }],
  }),
  component: PlayerPage,
});

function PlayerPage() {
  const { id } = Route.useParams();
  const creds = useIptvCredentials();
  const [streamUrl, setStreamUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const getPlaybackUrl = useServerFn(getPlaybackUrlFn);

  useEffect(() => {
    if (!creds) return;
    getPlaybackUrl({ data: { ...creds, contentId: id, type: "movie" } })
      .then((r) => setStreamUrl(r.url))
      .catch(() => setStreamUrl(""))
      .finally(() => setLoading(false));
  }, [creds, id, getPlaybackUrl]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#2a9af0] animate-spin" />
      </div>
    );
  }

  return (
    <TVPlayer
      streamUrl={streamUrl}
      title={`Conteúdo #${id}`}
      onBack={() => window.history.back()}
    />
  );
}
