export function HeroSection() {
  return (
    <section className="flex min-h-[calc(100dvh-(var(--frame-gap)*2))] flex-col justify-center gap-6 px-6 pb-16 pt-28 sm:px-10 sm:pb-20 sm:pt-32">
      <p className="text-surface-muted text-sm">galen.green</p>
      <h1 className="text-surface-strong text-4xl font-semibold tracking-tight sm:text-5xl">
        Fixed frame.
      </h1>
      <p className="text-surface-body max-w-2xl text-lg leading-8">
        First block: a black border around the edge of the viewport with rounded
        corners, fixed in place, with the page scrolling inside it.
      </p>
    </section>
  );
}
