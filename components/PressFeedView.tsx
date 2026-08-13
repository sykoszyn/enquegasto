import { ReactNode } from "react";
import { PressPost } from "@/lib/types";
import { Newspaper, MessageCircle, Mic2 } from "lucide-react";

interface PressFeedViewProps {
  posts: PressPost[];
}

const KIND_META: Record<PressPost["kind"], { icon: ReactNode; color: string; tag: string }> = {
  fan: { icon: <MessageCircle size={14} />, color: "text-sky-400", tag: "Fan" },
  br_fan: { icon: <MessageCircle size={14} />, color: "text-emerald-400", tag: "Torcida BR" },
  caster: { icon: <Mic2 size={14} />, color: "text-hltv-yellow", tag: "Desk / Cast" },
  press: { icon: <Newspaper size={14} />, color: "text-cs-orange", tag: "Prensa" }
};

export default function PressFeedView({ posts }: PressFeedViewProps) {
  if (posts.length === 0) {
    return (
      <div className="bg-cs-panel border border-cs-border rounded-lg p-6 text-center">
        <Newspaper size={24} className="mx-auto text-cs-muted mb-2" />
        <p className="text-sm text-cs-muted">Todavía no hay reacciones. Jugá algunos partidos para que la escena empiece a hablar de vos.</p>
      </div>
    );
  }

  return (
    <div className="bg-cs-panel border border-cs-border rounded-lg p-4 space-y-3 max-h-[32rem] overflow-y-auto">
      {posts.map((post) => {
        const meta = KIND_META[post.kind];
        return (
          <div key={post.id} className="flex gap-3 p-3 rounded border border-cs-border bg-cs-panel2">
            <div className={`mt-0.5 ${meta.color}`}>{meta.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-cs-text truncate">{post.author}</p>
                <span className={`text-[10px] uppercase tracking-wide ${meta.color}`}>{meta.tag}</span>
              </div>
              <p className="text-xs text-cs-muted mt-0.5">{post.handle}</p>
              <p className="text-sm text-cs-text mt-1.5 leading-snug">{post.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
