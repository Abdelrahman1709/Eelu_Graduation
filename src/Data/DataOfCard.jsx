import { ShelvingUnit, BookHeart, MirrorRound, Rose } from "lucide-react";
import First from "../assets/HowWork/image/try.avif";
import second from "../assets/HowWork/image/howYouLike.avif";
import third from "../assets/HowWork/image/Upload.avif";
import { MdFacebook } from "react-icons/md";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
export const featuresData = [
  {
    icon: <ShelvingUnit className="w-6 h-6" />,
    title: " Organize your wardrobe",
    desc: "Storage all your clothes digitally and categorize them by type, occasion, and season",
  },
  {
    icon: <MirrorRound className="w-6 h-6" />,
    title: " AI Try-On",
    desc: "Virtually try on clothes before wearing them and see how they look on you",
  },
  {
    icon: <Rose className="w-6 h-6" />,
    title: "plan Your Outfits",
    desc: "Get AI-generated outfit suggestions based on your wardrobe and the occasion",
  },
];
export const HowWorksData = [
  {
    img: third,
    title: "Add Your Clothes",
    desc: "Upload photos of your clothes and let our AI organize them for you",
  },
  {
    img: First,
    title: "All Clothes in One Place",
    desc: "View your organized wardrobe and see all your clothes in one place",
  },
  {
    img: second,
    title: "Try On Your Clothes",
    desc: "Virtually try on clothes before wearing them and see how they look on you",
  },
];

export const plansData = [
  {
    id: "starter",
    name: "Starter",
    price: "$499",
    desc: "Best for early-stage startups.",
    credits: "One-time",
    features: [
      "Project discovery & planning",
      "UI/UX design",
      "Basic website development",
      "1 revision round",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Growth",
    price: "$1,499",
    desc: "Growing teams and businesses.",
    credits: "Monthly",
    features: [
      "Everything in Starter",
      "Advanced UI/UX design",
      "Custom development",
      "Performance optimization",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "ultra",
    name: "Scale",
    price: "$3,999",
    desc: "For brands ready to scale fast.",
    credits: "Custom",
    features: [
      "Everything in Growth",
      "Dedicated project manager",
      "Ongoing optimization",
      "Marketing & growth support",
      "Chat + Email support",
    ],
  },
];

export const faqData = [
  {
    question: "How does ITLALA generate personalized outfit recommendations?",
    answer:
      "ITLALA uses advanced AI algorithms to analyze your preferences, style choices and trends. Based on your selections and interactions, it suggests outfits tailored specifically to your fashion taste.",
  },
  {
    question: "How does the virtual try-on feature actually work?",
    answer:
      "Our virtual try-on technology uses AI image processing to simulate outfits on your photo. This allows you to preview different looks in real time before making any fashion decisions.",
  },
  {
    question: "Is my uploaded photo safe and securely stored?",
    answer:
      "Yes. We prioritize user privacy and data protection. Your images are processed securely and are never shared with third parties without your consent or authorization.",
  },
  {
    question: "Can I use ITLALA for different styles and occasions?",
    answer:
      "Absolutely. ITLALA supports multiple fashion styles including casual, formal and seasonal trends. The AI adapts to your needs whether you're dressing for work, events or everyday wear.",
  },
];

// shared navigation links (regular and protected) used by Navbar
export const navLinks = [
  { name: "Home", href: "/" },
  { name: "Wardrobe", href: "/features/wardrobe" },
  { name: "TryOn", href: "/features/tryOn" },
  { name: "Discover", href: "/#services" },
  { name: "FAQ", href: "/#faq" },
];

export const footerLinks = [
  {
    title: "Pages",
    links: [
      { name: "Home", url: "/" },
      { name: "Discover", href: "/#features" },
      { name: "FAQ", url: "/#faq" },
      { name: "wardrobe", path: "/features/wardrobe" },
      { name: "TryOn", path: "/features/tryOn" },
      { name: "User Profile", path: "/profile-user" },
      { name: "Explore", url: "/wardrobe" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", url: "#" },
      { name: "Terms of Service", url: "#" },
    ],
  },
  {
    title: "Connect",
    links: [
      { name: "LinkedIn", url: "#", icon: <FaLinkedin /> },
      { name: "Instagram", url: "#", icon: <FaInstagram /> },
      { name: "Facebook", url: "#", icon: <MdFacebook /> },
    ],
  },
];
