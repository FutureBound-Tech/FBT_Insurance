import { Shield, Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = [
  { to: "/", label: "Home" },
  { to: "/calculator", label: "Premium Calculator" },
  { to: "/assessment", label: "Free Assessment" },
  { to: "/agent-login", label: "Agent Login" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">FBT Insurance</span>
                <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
                  LIC Agent Pro Platform
                </p>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-gray-400 mb-6">
              Helping you find the perfect LIC policy with personalized recommendations. 
              Trusted by 50,000+ families across India.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                IRDAI Registered
              </span>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-semibold text-white">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-gray-500 shrink-0" />
                <div>
                  <p className="text-gray-300">+91 1800-XXX-XXXX</p>
                  <p className="text-xs text-gray-500">Mon-Sat, 9AM-7PM</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-gray-500 shrink-0" />
                <div>
                  <p className="text-gray-300">support@fbtinsurance.in</p>
                  <p className="text-xs text-gray-500">24/7 Email Support</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-gray-500 shrink-0" />
                <div>
                  <p className="text-gray-300">Mumbai, Maharashtra</p>
                  <p className="text-xs text-gray-500">India</p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-white"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-gray-500">
            &copy; {year} FBT Insurance. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Privacy Policy</span>
            <span className="h-3 w-px bg-gray-700" />
            <span>Terms of Service</span>
            <span className="h-3 w-px bg-gray-700" />
            <span>IRDAI Reg. No. XXXXX</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
