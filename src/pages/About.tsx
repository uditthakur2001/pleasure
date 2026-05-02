import { PageHeader } from "@/components/site/PageHeader";
import manufacturingImg from "@/assets/manufacturing.jpg";
import { Award, Heart, Microscope, Users } from "lucide-react";

const values = [
  { icon: Heart, title: "Animal welfare", text: "Every formulation is designed with the health and comfort of livestock at heart." },
  { icon: Microscope, title: "Scientific rigor", text: "Backed by veterinary expertise, sound chemistry and tested manufacturing standards." },
  { icon: Award, title: "Quality first", text: "GMP-grade processes ensure consistency batch after batch." },
  { icon: Users, title: "Farmer trust", text: "We exist to make Indian farming families more prosperous." },
];

const About = () => (
  <>
    <PageHeader
      eyebrow="About Us"
      title="A pharmaceutical company built around animal health."
      description="Established in 2006 in Delhi, Pleasure Pharmaceuticals Pvt. Ltd. is a veterinary pharmaceutical company committed to better livestock health and the prosperity of Indian farmers."
    />

    <section className="container-prose grid gap-12 py-20 lg:grid-cols-2 lg:py-28">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-card">
        <img src={manufacturingImg} alt="Pharmaceutical manufacturing facility" loading="lazy" width={1600} height={1024} className="h-full w-full object-cover" />
      </div>
      <div>
        <span className="eyebrow mb-4">Our Mission</span>
        <h2 className="text-4xl md:text-5xl">Healthier animals, stronger farms.</h2>
        <p className="mt-5 text-muted-foreground">
          For nearly two decades we have focused on a single mission — developing dependable veterinary medicines that help farmers raise healthier livestock. From injections and boluses to nutritional powders and herbal tonics, our portfolio supports cattle, buffalo and small ruminants at every stage of life.
        </p>
        <p className="mt-4 text-muted-foreground">
          Every product that carries the Pleasure Pharmaceuticals name is the result of careful formulation, quality manufacturing and feedback from the veterinarians and farmers who use it in the field every day.
        </p>
      </div>
    </section>

    <section className="bg-secondary/40 py-20">
      <div className="container-prose">
        <div className="mb-12 max-w-2xl">
          <span className="eyebrow mb-3">Our Values</span>
          <h2 className="text-4xl md:text-5xl">What guides our work.</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6 shadow-card">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-2xl text-primary">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default About;
