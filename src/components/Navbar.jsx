import { Menu, X, Home, Archive, Compass, HelpCircle, UserCircle, Shirt, Sparkles, LogOut, User, ChevronDown, ArrowBigDown, ArrowBigRight, ArrowRightCircleIcon, ArrowRightToLine } from "lucide-react";
import { useLocation, Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavbar } from "../context/NavbarContext";
import { PrimaryButton, GhostButton } from "./Buttons";
import OutfitSidebar from "./OutfitSidebar";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "../Data/DataOfCard";
import Logo from "../assets/Logo/Logo.avif";
import AvatarWithBadge from "./AvatarWithBadge";
import maleImg from "../assets/Gender/men.avif";
import femaleImg from "../assets/Gender/woman.avif";
import { BsArrowBarRight, BsArrowRight } from "react-icons/bs";

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const scrollY = useRef(0);
  const { user, logout } = useAuth();
  const { navbarVisible, navbarMode } = useNavbar();
  const location = useLocation();

  // Prevent page scroll while the mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    setIsLoggingOut(false);
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  const displayName = user?.name?.split(" ")[0] || user?.name || "Profile";

  const getNavIcon = (name) => {
    const normalized = name.toLowerCase();
    switch (normalized) {
      case "home":
        return Home;
      case "main wardrobe":
        return Archive;
      case "discover":
        return Compass;
      case "faq":
        return HelpCircle;
      case "wardrobe":
        return Shirt;
      case "tryon":
        return Sparkles;
      case "dashboard":
      case "user profile":
      case "profile":
        return UserCircle;
      default:
        return Home;
    }
  };

  const navItemClass = ({ isActive }) =>
    `group flex items-center gap-3 w-full rounded-3xl px-4 py-3 text-sm transition ${
      isActive
        ? "bg-slate-800/80 text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
        : "text-white/90 hover:bg-white/10 hover:text-white"
    }`;

  const desktopLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm transition duration-200 ${
      isActive ? "text-white bg-violet-500/10 border border-violet-400/20" : "text-gray-300 hover:text-white"
    }`;

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (navbarMode === "always") {
        setIsVisible(true);
      } else if (navbarMode === "hidden") {
        setIsVisible(false);
      } else {
        // auto mode (default)
        if (currentY <= 0) {
          setIsVisible(true);
        } else if (currentY > scrollY.current + 10) {
          setIsVisible(false);
        } else if (currentY < scrollY.current - 10) {
          setIsVisible(true);
        }
      }
      scrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navbarMode]);

  // Apply navbar visibility from context
  useEffect(() => {
    if (navbarMode === "always") {
      setIsVisible(navbarVisible);
    } else if (navbarMode === "hidden") {
      setIsVisible(false);
    }
  }, [navbarVisible, navbarMode]);


  const linkClass =
    "px-3 py-2 rounded-md text-gray-300 hover:text-white transition duration-200";

  const mobileNavItemClass =
    "flex items-center gap-3 w-full rounded-2xl px-4 py-3 text-sm text-white/90 hover:bg-white/10 hover:text-white transition-all duration-200";

  const submenuButtonClass =
    "flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm text-white/90 hover:bg-white/10 hover:text-white transition";

  return (
    <motion.nav
      className="fixed top-5 left-0 right-0 z-50 px-4"
      initial={{ y: -120, opacity: 0 }}
      animate={{ y: isVisible ? 0 : -120, opacity: isVisible ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, mass: 1 }}
    >
      {/* NAV CONTAINER */}
      <div className="max-w-7xl h-[70px] box-border mx-auto flex items-center justify-between gap-3 bg-gradient-to-b from-black/60 via-black/40 to-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-3">
        {/* Logo */}
        <Link to="/">
          <img src={Logo} alt="logo" loading="lazy" className="h-12 w-[80px]" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-6 text-sm">
          {navLinks.map((link) =>
            link.dropdown ? (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button className={linkClass}>{link.name}</button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={dropdownVariants}
                      className="absolute top-full left-0 mt-4 w-52 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col gap-2"
                    >
                      {link.dropdown.map((item) => (
                        <NavLink
                          key={item.name}
                          to={item.path}
                          className={linkClass}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          {item.name}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <NavLink key={link.name} to={link.href} className={linkClass}>
                {link.name}
              </NavLink>
            ),
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/profile-user" className={linkClass}>
                <div className="flex flex-col items-center gap-1 text-center mt-1">
                  <AvatarWithBadge
                    src={user?.photo || (user?.gender === "female" ? femaleImg : maleImg)}
                    alt={displayName}
                    size="md"
                    shape="square"
                  />
                  <span className="text-sm text-white">{displayName}</span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl whitespace-nowrap flex items-center gap-2"
              >
                <LogOut className="inline" size={16} />
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Logging out...
                  </>
                ) : (
                  "Logout"
                )}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className={linkClass}>
                <User />
              </button>
              <PrimaryButton onClick={() => navigate("/signup")} className="px-2  whitespace-nowrap">
                Get Started
              </PrimaryButton>
            </>
          )}
        </div>

        {/* Mobile header user + button */}
        <div className="flex items-center gap-3 lg:hidden">
          {user && (
            <Link to="/profile-user" className="flex flex-col items-center gap-1 text-center text-white text-sm font-medium">
              <AvatarWithBadge
                src={user?.photo || (user?.gender === "female" ? femaleImg : maleImg)}
                alt={displayName}
                size="sm"
                shape="square"
              />
              <span className="text-xs">{displayName}</span>
            </Link>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl  text-white shadow-lg shadow-black/20"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {location.pathname === "/" && !isOpen && <OutfitSidebar />}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]  backdrop-blur-xl p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28 }}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-full max-w-sm ml-auto rounded-[32px] p-6 flex flex-col"
            >
              <button onClick={() => setIsOpen(false)} className="self-end p-2 text-white">
                <X size={20} />
              </button>

              <div className="mt-8 flex-1 overflow-y-auto">
                {navLinks.map((link) =>
                  link.dropdown ? (
                    <div key={link.name} className="mb-3">
                      <button
                        onClick={() => setOpenSubmenu(openSubmenu === link.name ? "" : link.name)}
                        className={submenuButtonClass}
                      >
                        <span>{link.name}</span>
                        <ChevronDown size={14} className={`transition-transform ${openSubmenu === link.name ? "rotate-180" : ""}`} />
                      </button>
                      {openSubmenu === link.name && (
                        <div className="mt-2 space-y-1 pl-2">
                          {link.dropdown.map((item) => {
                            const Icon = getNavIcon(item.name);
                            return (
                              <NavLink
                                key={item.name}
                                to={item.path}
                                className={mobileNavItemClass}
                                onClick={() => setIsOpen(false)}
                              >
                                <Icon size={16} />
                                <span>{item.name}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <NavLink
                      key={link.name}
                      to={link.href}
                      className={mobileNavItemClass}
                      onClick={() => setIsOpen(false)}
                    >
                      {(() => {
                        const Icon = getNavIcon(link.name);
                        return <Icon size={16} />;
                      })()}
                      <span>{link.name}</span>
                    </NavLink>
                  ),
                )}
              </div>

              <div className="pt-6 space-y-3">
                {user ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full py-3 bg-violet-600 rounded-2xl text-white text-sm font-semibold"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        navigate("/signup");
                        setIsOpen(false);
                      }}
                      className="w-full py-3 bg-violet-600 rounded-2xl text-white text-sm font-semibold"
                    >
                      Get Started
                    </button>
                    <button
                      onClick={() => {
                        navigate("/login");
                        setIsOpen(false);
                      }}
                      className="w-full text-sm font-semibold text-white/80 hover:text-white transition"
                    >
                    already have an account? Log in 
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
