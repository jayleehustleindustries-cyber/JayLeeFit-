import ProgramPackForm from "@/components/program-pack-form";

export default async function ProgramPackPage({
  searchParams,
}: {
  searchParams: Promise<{ src?: string }>;
}) {
  const { src } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">Free download</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-wide sm:text-5xl">
        BUILD YOUR OWN TRAINING PROGRAM.
      </h1>

      <div className="mt-8 flex flex-col gap-6 font-sans text-base leading-relaxed text-chalk/90">
        <p>
          This is the same system I use with 1-on-1 clients, turned into a
          copy-paste pack you can run with any AI chat. Drop it in, answer a
          few questions about your schedule, equipment, and goals, and walk
          away with a training program built around your actual life — not
          a generic template.
        </p>
        <p>No spam. Just the pack, sent straight to your inbox.</p>
      </div>

      <ProgramPackForm source={src || "direct"} />
    </div>
  );
}
