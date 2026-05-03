const TESTIMONIALS = [
  {
    name: "Alex Chen",
    handle: "@alexcinephile",
    avatar: "AC",
    text: "MovieFrame tripled my Twitter engagement. I barely touch the account anymore — the bot handles everything while I sleep.",
    stars: 5,
  },
  {
    name: "Sofia Martinez",
    handle: "@sofiafilm",
    avatar: "SM",
    text: "The quality of frames it picks is insane. It's like it has an eye for cinematography. My followers think I curate manually.",
    stars: 5,
  },
  {
    name: "Jake Thompson",
    handle: "@jakemovies",
    avatar: "JT",
    text: "Went from 200 to 8,000 followers in 3 months. The consistency of posting is what makes the algorithm love you.",
    stars: 5,
  },
  {
    name: "Priya Sharma",
    handle: "@priyaframes",
    avatar: "PS",
    text: "The analytics dashboard alone is worth the Pro plan. I can see exactly which films get the most engagement.",
    stars: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-[#F59E0B] text-sm">★</span>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-[#F9FAFB] mb-4">
          Loved by film enthusiasts
        </h2>
        <p className="text-lg text-[#9CA3AF]">
          Join thousands of creators who&apos;ve automated their cinema content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.handle}
            className="rounded-2xl bg-[#111118] border border-[#1F2937] p-6 hover:border-[#374151] transition-colors"
          >
            <Stars count={t.stars} />
            <p className="text-[#D1D5DB] text-sm leading-relaxed mt-3 mb-5">
              &ldquo;{t.text}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#EC4899] flex items-center justify-center text-xs font-bold text-[#0A0A0F]">
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F9FAFB]">{t.name}</p>
                <p className="text-xs text-[#9CA3AF]">{t.handle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
