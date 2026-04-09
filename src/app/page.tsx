import { ViewportFrame } from "@/components/layout/viewport-frame";
import { FloatingMenu } from "@/components/navigation/floating-menu";
import { HeroSection } from "@/components/sections/hero-section";

const sections = [
  {
    title: "Frame block",
    body: "The border stays pinned to the viewport while the content moves inside it.",
  },
  {
    title: "Rounded corners",
    body: "The inner surface is clipped by the frame so the shell feels like one fixed object.",
  },
  {
    title: "Scroll container",
    body: "Only this interior area scrolls. The body itself stays locked in place.",
  },
];

export default function HomePage() {
  return (
    <ViewportFrame overlay={<FloatingMenu />}>
      <main className="flex min-h-full flex-col gap-12">
        <HeroSection />

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-12">
          {sections.map((section) => (
            <section
              key={section.title}
              className="flex min-h-[70vh] flex-col justify-center gap-4 px-6 sm:px-10"
            >
              <p className="text-surface-muted text-sm">Block</p>
              <h2 className="text-surface-strong text-3xl font-semibold tracking-tight">
                {section.title}
              </h2>
              <p className="text-surface-body max-w-2xl text-lg leading-8">
                {section.body}
              </p>
            </section>
          ))}

          <div className="h-16 sm:h-20" />
        </div>
      </main>
    </ViewportFrame>
  );
}
