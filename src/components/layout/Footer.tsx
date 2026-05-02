import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/site/Logo";

export const Footer = () => {
  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="container-prose grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo variant="light" />
          <p className="max-w-xs text-sm text-primary-foreground/75">
            A trusted name in veterinary pharmaceuticals — committed to better animal health since 2006.
          </p>
        </div>
        <div>
          <h4 className="mb-4 font-display text-xl">Explore</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/about" className="hover:text-primary-foreground">About Us</Link></li>
            <li><Link to="/products" className="hover:text-primary-foreground">Products</Link></li>
            <li><Link to="/certifications" className="hover:text-primary-foreground">Certifications</Link></li>
            <li><Link to="/careers" className="hover:text-primary-foreground">Careers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-display text-xl">Partner</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/distributor" className="hover:text-primary-foreground">Become a Distributor</Link></li>
            <li><Link to="/contact" className="hover:text-primary-foreground">Contact Sales</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-display text-xl">Reach Us</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>1/50, 2nd Floor, Ganga Apartment, Lalita Park, Laxmi Nagar, Delhi – 110092</span>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <a href="mailto:pleasurepharmaceuticals@gmail.com" className="break-all hover:text-primary-foreground">
                pleasurepharmaceuticals@gmail.com
              </a>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" />
              <a href="tel:+919719060717" className="hover:text-primary-foreground">+91 9719060717</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="container-prose flex flex-col items-center justify-between gap-3 py-6 text-xs text-primary-foreground/70 sm:flex-row">
          <p>© {new Date().getFullYear()} Pleasure Pharmaceuticals Pvt. Ltd. All rights reserved.</p>
          <p>Veterinary use only · Made in India</p>
        </div>
      </div>
    </footer>
  );
};
