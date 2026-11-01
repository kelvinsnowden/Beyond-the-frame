import { Experience } from "@/components/providers/Experience";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/sections/Preloader";
import { Hero } from "@/components/sections/Hero";
import { Studio } from "@/components/sections/Studio";
import { Services } from "@/components/sections/Services";
import { Approach } from "@/components/sections/Approach";
import { Process } from "@/components/sections/Process";
import { Testimonials } from "@/components/sections/Testimonials";
import { Work } from "@/components/work/Work";
import { Contact } from "@/components/contact/Contact";
import { Cursor } from "@/components/ui/Cursor";
import { Grain } from "@/components/ui/Grain";
import { Marquee } from "@/components/ui/Marquee";
import { ImageTrail } from "@/components/ui/ImageTrail";
import { FilmShowcase } from "@/components/film/FilmShowcase";
import { projects, services } from "@/content/site";

/** Every still from the portfolio, in order, for the trail band. */
const trailImages = Array.from(new Set(projects.flatMap((p) => [p.cover, ...p.gallery])));

export default function Home() {
  return (
    <Experience>
      <Preloader />
      <Header />
      <main id="main">
        <Hero />
        <Studio />
        <ImageTrail keys={trailImages} className="border-y border-line">
          <Marquee
            items={[...services.map((s) => s.title), "Photography", "Film"]}
            className="display py-6 text-[clamp(3.5rem,10vw,10rem)] leading-none md:py-12"
          />
          <p className="label pointer-events-none absolute bottom-3 right-[clamp(1rem,3.2vw,3rem)] hidden text-mute md:block">
            Move across to develop
          </p>
        </ImageTrail>
        <Work />
        <FilmShowcase />
        <Services />
        <Approach />
        <Process />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <Cursor />
      <Grain />
    </Experience>
  );
}
