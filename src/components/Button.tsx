const base =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold whitespace-nowrap transition select-none active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary: "bg-white text-ink shadow-lg shadow-black/20 hover:bg-accent",
  ghost: "bg-white/8 text-white ring-1 ring-white/15 ring-inset backdrop-blur-md hover:bg-white/15",
};

export function buttonClass(variant: keyof typeof variants = "primary", className = "") {
  return `${base} ${variants[variant]} ${className}`;
}
