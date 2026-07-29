import type { Metadata } from "next";
import { Newspaper, Mail } from "lucide-react";
import PageShell from "../../components/shared/PageShell";

export const metadata: Metadata = {
  title: "Newsroom | NexShip",
  description: "News, announcements and media resources from NexShip.",
  alternates: { canonical: "/newsroom" },
};

export default function NewsroomPage() {
  return (
    <PageShell
      eyebrow="Newsroom"
      title="News &"
      highlight="announcements."
      description="Updates on our Karachi launch, product releases and expansion plans will be posted here as they happen."
    >
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-white/[0.04] px-8 py-14 text-center backdrop-blur-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-accent/10">
          <Newspaper className="h-6 w-6 text-accent" strokeWidth={1.75} />
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold text-white">
          Nothing published yet
        </h3>
        <p className="max-w-sm font-body text-sm leading-6 text-muted">
          We're just getting started in Karachi. Check back soon for updates
          on new features, city launches and partnerships.
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-border bg-white/[0.03] px-6 py-6 text-center">
        <p className="font-body text-sm text-muted">
          Press &amp; media inquiries
        </p>
        <a
          href="mailto:nexship.courier@gmail.com?subject=Media%20Inquiry"
          className="inline-flex items-center gap-2 font-body text-sm font-semibold text-accent transition-colors hover:text-emerald-300"
        >
          <Mail className="h-4 w-4" />
          nexship.courier@gmail.com
        </a>
      </div>
    </PageShell>
  );
}
