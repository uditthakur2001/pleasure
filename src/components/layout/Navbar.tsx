import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Menu, X } from "lucide-react";

import { successAlert, confirmAlert } from "@/lib/alert";

import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
  { to: "/contact", label: "Contact" },
];

const adminLoggedIn = localStorage.getItem("adminLoggedIn");

const employeeLoggedIn = localStorage.getItem("isLoggedIn");

const privateLinks = adminLoggedIn
  ? [
      {
        to: "/admin",
        label: "Dashboard",
      },

      {
        to: "/profile",
        label: "Profile",
      },
    ]
  : [
      {
        to: "/dashboard",
        label: "Dashboard",
      },

      {
        to: "/profile",
        label: "Profile",
      },
    ];

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("isLoggedIn") ||
      !!localStorage.getItem("adminLoggedIn"),
  );

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    onScroll();

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    setIsLoggedIn(
      !!localStorage.getItem("isLoggedIn") ||
        !!localStorage.getItem("adminLoggedIn"),
    );
  }, [location]);

  const logout = async () => {
    const result = await confirmAlert(
      "Logout?",
      "You will be logged out of your account",
    );

    if (!result.isConfirmed) return;

    // SUPABASE LOGOUT
    await supabase.auth.signOut();

    // CLEAR STORAGE
    localStorage.removeItem("isLoggedIn");

    localStorage.removeItem("employeeName");

    localStorage.removeItem("employeeEmail");

    localStorage.removeItem("employeeId");

    localStorage.removeItem("adminLoggedIn");

    // UPDATE APP STATE
    window.dispatchEvent(new Event("storage"));

    successAlert("Logged Out Successfully");

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };
  const links = isLoggedIn ? privateLinks : publicLinks;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/90 backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="container-prose flex h-20 items-center justify-between gap-6">
        <Logo />

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "text-primary"
                    : "text-foreground/70 hover:text-primary",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Right Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {!isLoggedIn ? (
            <>
              <Button asChild variant="hero" size="sm">
                <Link to="/distributor">Become Distributor</Link>
              </Button>

              <Button asChild variant="outline" size="sm">
                <Link to="/login">Login</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="destructive" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="grid h-10 w-10 place-items-center rounded-md border border-border lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container-prose flex flex-col gap-1 py-4">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-3 text-base font-medium",
                    isActive
                      ? "bg-secondary text-primary"
                      : "text-foreground/80",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}

            {!isLoggedIn ? (
              <div className="mt-2 flex flex-col gap-3">
                <Button asChild variant="hero">
                  <Link to="/distributor" onClick={() => setOpen(false)}>
                    Become Distributor
                  </Link>
                </Button>

                <Button asChild variant="outline">
                  <Link to="/login" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-4 px-2">
                {/* <Link
      to="/dashboard"
      onClick={() => setOpen(false)}
      className="text-base font-medium text-foreground/80 transition hover:text-primary"
    >
      Dashboard
    </Link>

    <Link
      to="/profile"
      onClick={() => setOpen(false)}
      className="text-base font-medium text-foreground/80 transition hover:text-primary"
    >
      Profile
    </Link> */}

                <Button
                  variant="destructive"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                >
                  Logout
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
