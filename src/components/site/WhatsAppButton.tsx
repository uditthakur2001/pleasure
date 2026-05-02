import { MessageCircle } from "lucide-react";

export const WhatsAppButton = () => {
  const phone = "919568106161";
  const text = encodeURIComponent("Hi Pleasure Pharmaceuticals, I would like to know more about your products.");
  return (
    <a
      href={`https://wa.me/${phone}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[hsl(142_70%_40%)] text-white shadow-elevated transition-smooth hover:scale-110"
    >
      <MessageCircle className="h-7 w-7" />
      <span className="absolute -inset-1 -z-10 animate-ping rounded-full bg-[hsl(142_70%_40%)] opacity-30" />
    </a>
  );
};
