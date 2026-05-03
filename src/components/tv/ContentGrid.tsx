import { ContentCard } from "./ContentCard";
import type { ContentItem } from "@/server/tmdb.functions";

interface ContentGridProps {
  items: ContentItem[];
}

export function ContentGrid({ items }: ContentGridProps) {
  return (
    <div className="grid grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8 gap-3 px-4">
      {items.map((item, i) => (
        <ContentCard key={`${item.id}-${i}`} item={item} index={i} />
      ))}
    </div>
  );
}
