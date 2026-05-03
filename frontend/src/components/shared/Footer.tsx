import Link from "next/link";
import { Film } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#1F2937] bg-[#0A0A0F] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#F59E0B] flex items-center justify-center">
                <Film className="h-5 w-5 text-[#0A0A0F]" />
              </div>
              <span className="font-bold text-lg text-[#F9FAFB]">MovieFrame</span>
            </Link>
            <p className="text-sm text-[#9CA3AF] max-w-sm">
              Automate your cinematic content. Scrape beautiful movie frames and
              post them to your social media — on autopilot.
            </p>
          </div>
          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-[#F9FAFB] mb-3">Product</h4>
            <ul className="space-y-2">
              {["Features", "Pricing", "Changelog"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-[#F9FAFB] mb-3">Legal</h4>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-[#1F2937] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#6B7280]">
            © {new Date().getFullYear()} MovieFrame. All rights reserved.
          </p>
          <p className="text-xs text-[#6B7280]">Built for cinephiles 🎬</p>
        </div>
      </div>
    </footer>
  );
}
