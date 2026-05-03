import { Film, Share2, BarChart3, Link, Clock, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: Film,
    title: "Cinematic Scraping",
    description:
      "Automatically discovers and downloads high-quality film frames from film-grab.com with smart duplicate detection.",
    color: "#F59E0B",
  },
  {
    icon: Share2,
    title: "Multi-Platform Posting",
    description:
      "Post to Twitter/X, Instagram, and Reddit with platform-optimised formatting, hashtags, and captions.",
    color: "#6366F1",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description:
      "Track your post history, success rates, and engagement trends with beautiful charts and insights.",
    color: "#EC4899",
  },
  {
    icon: Link,
    title: "Platform Connections",
    description:
      "Securely connect all your social accounts and manage credentials from a single dashboard.",
    color: "#10B981",
  },
  {
    icon: Clock,
    title: "Scheduled Automation",
    description:
      "Set it and forget it. Configure run intervals and let MovieFrame post on your behalf 24/7.",
    color: "#F59E0B",
  },
  {
    icon: Shield,
    title: "Duplicate Prevention",
    description:
      "Content-hash tracking ensures you never post the same frame twice, keeping your feed fresh.",
    color: "#6366F1",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-[#F9FAFB] mb-4">
          Everything you need to{" "}
          <span className="gradient-text">dominate your niche</span>
        </h2>
        <p className="text-lg text-[#9CA3AF] max-w-2xl mx-auto">
          Built for film enthusiasts who want to grow their audience without
          spending hours curating content manually.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feat) => (
          <div
            key={feat.title}
            className="rounded-2xl bg-[#111118] border border-[#1F2937] p-6 hover:border-[#374151] transition-all duration-300 group"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${feat.color}15` }}
            >
              <feat.icon className="h-6 w-6" style={{ color: feat.color }} />
            </div>
            <h3 className="text-base font-semibold text-[#F9FAFB] mb-2">
              {feat.title}
            </h3>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              {feat.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
