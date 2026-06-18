import { footerLinks } from "../Data/DataOfCard";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Logo from "../assets/Logo/Logo.avif";
export default function Footer() {
  // Helper function to render links properly
  const renderLink = (link) => {
    const content = (
      <span className="flex items-center gap-2">
        {link.icon && (
          <span className=" text-lg transition-all group-hover:text-[#8b5cf6]">
            {link.icon}
          </span>
        )}
        <span>{link.name}</span>
      </span>
    );

    // If has path property, use Link for routing
    if (link.path) {
      return (
        <Link to={link.path} className="group hover:text-white transition">
          {content}
        </Link>
      );
    }

    // Otherwise use regular a tag
    return (
      <a
        href={link.href || link.url}
        className="group hover:text-white transition"
      >
        {content}
      </a>
    );
  };

  return (
    <motion.footer
      className="bg-white/6 border-t border-white/6 pt-10 text-gray-300 border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-white/10">
          <div>
            <Link className="relative inline-block" to="/">
              <span
                aria-hidden
                className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-20 h-6 rounded-full blur-2xl opacity-80 -z-10"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(139,92,246,0.45), rgba(99,102,241,0.25))",
                }}
              />
              <img
                src={Logo}
                alt="logo"
                loading="lazy"
                className="h-12 w-[80px] transition-all duration-300 relative"
              />
            </Link>
            <p className="max-w-[410px] mt-6 text-sm leading-relaxed">
              We Are Itlala - A Fashion Tech Startup Revolutionizing the Way You
              Shop for Clothes. Our AI-Powered Platform Offers Personalized
              Recommendations, Virtual Try-On, and a Seamless Shopping
              Experience Tailored Just for You.
            </p>
          </div>

          <div className="flex flex-wrap justify-between w-full md:w-[45%] gap-5">
            {/* Render Footer Links */}
            {footerLinks.map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold text-base text-white md:mb-5 mb-2">
                  {section.title}
                </h3>
                <ul className="text-sm space-y-1">
                  {section.links.map((link, i) => (
                    <li key={i}>{renderLink(link)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="py-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()}{" "}
          <a
            href="https://prebuiltui.com/tailwind-templates?ref=pixel-forge"
            target="_blank"
          >
            ITLALA
          </a>{" "}
          • Distributed by{" "}
          <a href="#" target="_blank" className="hover:text-sky-950 transition-all">
            Itlala Team
          </a>
          . All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
}
