import { Link } from "react-router-dom";

export const Logo = ({
  variant = "default",
}: {
  variant?: "default" | "light";
}) => {
  const text = variant === "light" ? "text-primary-foreground" : "text-primary";
  const sub =
    variant === "light"
      ? "text-primary-foreground/70"
      : "text-muted-foreground";
  return (
    <Link
      to="/"
      className="group flex items-center gap-3"
      aria-label="Pleasure Pharmaceuticals home"
    >
      <span className="grid h-10 w-10 place-items-center rounded-md  text-primary-foreground shadow-soft transition-smooth group-hover:bg-primary-glow">
        <img src="/public/pleasaure logo.svg" alt="logo" className="h-10 w-10" />
      </span>
      <span className="leading-tight">
        <span className={`block font-display text-lg ${text}`}>
          Pleasure Pharmaceuticals
        </span>
        <span
          className={`block text-[10px] font-medium uppercase tracking-[0.18em] ${sub}`}
        >
          Veterinary · Since 2006
        </span>
      </span>
    </Link>
  );
};
