interface PosterWallProps {
  images: string[];
  columns?: number;
  className?: string;
}

/** Slowly drifting columns of key art, used as a decorative background. */
export function PosterWall({ images, columns = 5, className = "" }: PosterWallProps) {
  if (images.length === 0) return null;

  // Every column gets enough posters to fill the screen twice over, which the
  // marquee animation needs to loop seamlessly.
  const perColumn = Math.max(6, Math.ceil(images.length / columns));
  const grid = Array.from({ length: columns }, (_, column) =>
    Array.from(
      { length: perColumn },
      (_, row) => images[(column * perColumn + row * 3 + column) % images.length]!,
    ),
  );

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="absolute -inset-[20%] flex -rotate-12 gap-3 sm:gap-4">
        {grid.map((column, i) => (
          <div
            key={i}
            className={`flex flex-1 flex-col gap-3 sm:gap-4 ${i % 2 ? "motion-safe:animate-marquee-down" : "motion-safe:animate-marquee-up"}`}
            style={{ animationDuration: `${80 + i * 17}s` }}
          >
            {[...column, ...column].map((src, j) => (
              <img
                key={j}
                src={src}
                alt=""
                decoding="async"
                className="aspect-[2/3] w-full rounded-xl object-cover sm:rounded-2xl"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
