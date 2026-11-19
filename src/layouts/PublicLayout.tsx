import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { BrandLogo } from "@/components/common/BrandLogo";
import { FloatingSettingsController } from "@/components/common/FloatingSettingsController";
import { useConfigStore } from "@/stores/configStore";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Menu, X, ArrowRight, Shield, Award, Users } from "lucide-react";

export const PublicLayout: React.FC = () => {
  const { config } = useConfigStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const navContainerRef = useRef<HTMLDivElement>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);

  const navLinks = [
    { label: "Beranda", href: "/" },
    { label: "Tentang Koperasi", href: "/tentang" },
    ...(config.activeModules.savings ? [{ label: "Simpanan", href: "/layanan/simpanan" }] : []),
    ...(config.activeModules.loans ? [{ label: "Pinjaman", href: "/layanan/pinjaman" }] : []),
    { label: "Cara Bergabung", href: "/cara-bergabung" },
    { label: "Lacak Status", href: "/status-pengajuan" },
    { label: "Transparansi", href: "/transparansi" },
  ];

  // 1. Throttled scroll listener using requestAnimationFrame (Scroll Collapse Interaction)
  useEffect(() => {
    let ticking = false;
    const SCROLL_DOWN_THRESHOLD = 80;
    const SCROLL_UP_THRESHOLD = 40;

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          ticking = false;
          const currentY = window.scrollY;
          if (currentY > SCROLL_DOWN_THRESHOLD) {
            setIsScrolled(true);
          } else if (currentY <= SCROLL_UP_THRESHOLD) {
            setIsScrolled(false);
            setIsExpanded(false);
          }
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 2. Collapse expanded menu on route change
  useEffect(() => {
    setIsExpanded(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // 3. Click outside & Escape key listeners when navbar is expanded while scrolled
  useEffect(() => {
    if (!isExpanded) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
        expandButtonRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  const handleOpenNav = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      setMobileMenuOpen(true);
    } else {
      setIsExpanded(true);
    }
  };

  const handleCloseNav = () => {
    setIsExpanded(false);
    expandButtonRef.current?.focus();
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink-50 text-ink-800">
      {/* 1. Public Header (Floating Fill Navbar with Scroll-Responsive Collapse) */}
      <header
        className={`sticky top-2 sm:top-3.5 z-40 w-full px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3.5 pointer-events-none transition-all duration-300 ${
          isHome ? "-mb-16 sm:-mb-20" : "mb-2 sm:mb-4"
        }`}
      >
        {!isScrolled || isExpanded ? (
          /* =========================================================================
             A. FULL FLOATING FILL NAVBAR (At Top OR When Expanded by Click)
             ========================================================================= */
          <div
            ref={navContainerRef}
            className="max-w-7xl mx-auto h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between gap-3 xl:gap-4 bg-white/95 backdrop-blur-md rounded-2xl border border-ink-200/90 shadow-md shadow-ink-950/5 pointer-events-auto transition-all duration-300 animate-in fade-in-50 zoom-in-95"
          >
            <div className="shrink-0 flex items-center">
              <BrandLogo size="md" to="/" />
            </div>

            {/* Desktop Nav (displayed on >= 1280px with clean proportional spacing) */}
            <nav className="hidden xl:flex items-center gap-3.5 2xl:gap-5 text-xs 2xl:text-sm font-medium text-ink-700 shrink-0">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`transition-colors py-1 whitespace-nowrap ${
                      isActive
                        ? "text-forest-700 font-semibold border-b-2 border-forest-700"
                        : "hover:text-forest-700"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions & Explicit Close (When scrolled & expanded) */}
            <div className="flex items-center gap-2 xl:gap-2.5 shrink-0">
              <div className="hidden sm:flex items-center gap-2 xl:gap-2.5">
                <Link to="/portal">
                  <Button variant="ghost" size="sm" className="whitespace-nowrap">
                    Masuk Portal
                  </Button>
                </Link>
                <Link to="/daftar">
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    className="whitespace-nowrap"
                  >
                    Daftar Anggota
                  </Button>
                </Link>
              </div>

              {/* Close Button when manually expanded in scrolled state */}
              {isScrolled && isExpanded && (
                <button
                  type="button"
                  onClick={handleCloseNav}
                  className="p-1.5 sm:p-2 rounded-lg text-ink-600 hover:text-ink-900 hover:bg-ink-100 transition-colors shrink-0 ml-1"
                  aria-label="Tutup navigasi"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* Mobile & Tablet Menu Trigger (up to 1279px) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="xl:hidden p-2 rounded-md text-ink-700 hover:text-ink-900 hover:bg-ink-100 shrink-0"
                aria-label="Buka menu navigasi"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
             B. COMPACT FLOATING ICON / PILL (When Scrolled Past Threshold)
             ========================================================================= */
          <div className="max-w-7xl mx-auto flex items-center justify-start pointer-events-none">
            <div className="pointer-events-auto">
              <button
                ref={expandButtonRef}
                type="button"
                onClick={handleOpenNav}
                aria-label="Buka navigasi Nusantara Maju"
                aria-expanded={false}
                className="group relative inline-flex items-center gap-2.5 px-3 py-2 rounded-full bg-forest-900/95 backdrop-blur-md text-white border border-forest-700/80 shadow-lg shadow-forest-950/20 hover:bg-forest-800 hover:border-forest-500 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-400 transition-all duration-200 cursor-pointer animate-in fade-in-50 zoom-in-95"
              >
                {/* 2D Flat Clean Geometric Brand Mark */}
                <div className="w-7 h-7 rounded-full bg-forest-800 flex items-center justify-center p-1 text-forest-100 group-hover:bg-forest-700 transition-colors shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-forest-100">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C15.87 4 19.08 6.74 19.82 10.4C17.82 9.57 15.35 9.54 12.89 10.54C10.08 11.69 8.01 14.24 7.23 17.14C5.28 15.83 4 13.57 4 12C4 7.58 7.58 4 12 4ZM9.31 18.48C9.97 15.9 11.75 13.59 14.27 12.56C16.35 11.71 18.43 11.82 20 12.71C19.95 16.73 16.71 19.97 12.69 20C11.5 20 10.35 19.45 9.31 18.48Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <span className="text-xs font-semibold tracking-tight text-white pr-1 hidden sm:inline-block">
                  Nusantara Maju
                </span>
                <Menu className="w-4 h-4 text-forest-200 group-hover:text-white transition-colors" />

                {/* Subtle Desktop Tooltip (Visible on Hover Only) */}
                <span
                  role="tooltip"
                  className="hidden lg:group-hover:block absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2.5 py-1 bg-ink-900/95 text-white text-[11px] font-medium rounded shadow-md whitespace-nowrap pointer-events-none z-50 transition-opacity"
                >
                  Nusantara Maju
                </span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Nav Drawer */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => {
          setMobileMenuOpen(false);
          setIsExpanded(false);
        }}
        title="Menu Navigasi"
        side="left"
      >
        <div className="flex flex-col space-y-4 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => {
                setMobileMenuOpen(false);
                setIsExpanded(false);
              }}
              className="text-sm font-medium text-ink-800 hover:text-forest-700 py-1.5 px-2 rounded hover:bg-ink-50"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-ink-100 flex flex-col gap-2">
            <Link
              to="/portal"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsExpanded(false);
              }}
            >
              <Button variant="secondary" size="md" className="w-full">
                Masuk Portal Anggota
              </Button>
            </Link>
            <Link
              to="/daftar"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsExpanded(false);
              }}
            >
              <Button variant="primary" size="md" className="w-full">
                Daftar Anggota Baru
              </Button>
            </Link>
          </div>
        </div>
      </Drawer>

      {/* 3. Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 4. Public Footer */}
      <footer className="bg-ink-900 text-ink-300 border-t border-ink-800 pt-12 pb-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1: Identity */}
            <div className="md:col-span-2 space-y-3">
              <BrandLogo variant="light" size="md" to="/" />
              <p className="text-ink-400 text-xs leading-relaxed max-w-md mt-2">
                {config.name} adalah lembaga koperasi konsumen berbasis gotong royong digital yang berfokus pada kesejahteraan dan kemandirian ekonomi anggota.
              </p>
              <div className="pt-2 text-ink-400 space-y-1 text-[11px] font-mono">
                <p>Status: Koperasi Konsumen Primer</p>
                <p>Identitas Sistem: {config.id}</p>
                <p>Email: {config.contact.email}</p>
                <p>Telepon: {config.contact.phone}</p>
              </div>
            </div>

            {/* Col 2: Layanan */}
            <div>
              <h4 className="font-semibold text-white uppercase tracking-wider mb-3 text-xs">
                Layanan Anggota
              </h4>
              <ul className="space-y-2 text-ink-400">
                {config.activeModules.savings && (
                  <li><Link to="/layanan/simpanan" className="hover:text-white transition-colors">Simpanan Pokok & Wajib</Link></li>
                )}
                {config.activeModules.loans && (
                  <li><Link to="/layanan/pinjaman" className="hover:text-white transition-colors">Pinjaman Modal Usaha</Link></li>
                )}
                <li><Link to="/cara-bergabung" className="hover:text-white transition-colors">Syarat & Tata Cara Anggota</Link></li>
                <li><Link to="/transparansi" className="hover:text-white transition-colors">Laporan & RAT Digital</Link></li>
              </ul>
            </div>

            {/* Col 3: Kelembagaan */}
            <div>
              <h4 className="font-semibold text-white uppercase tracking-wider mb-3 text-xs">
                Kelembagaan
              </h4>
              <ul className="space-y-2 text-ink-400">
                <li><Link to="/tentang" className="hover:text-white transition-colors">Profil Tata Kelola</Link></li>
                <li><Link to="/transparansi" className="hover:text-white transition-colors">Prinsip Gotong Royong</Link></li>
                <li><Link to="/admin" className="hover:text-white transition-colors">Portal Administrasi</Link></li>
                <li><span className="text-ink-500">Domisili: {config.address.city}, {config.address.province}</span></li>
              </ul>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="pt-6 border-t border-ink-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-ink-500 text-[11px]">
            <p className="text-center sm:text-left">
              © {new Date().getFullYear()} PT Nusantara Maju. Seluruh hak cipta dilindungi.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-forest-500 shrink-0" /> Platform Terverifikasi
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-forest-500 shrink-0" /> Tata Kelola Akuntabel
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-forest-500 shrink-0" /> Gotong Royong Modern
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Settings Controller */}
      <FloatingSettingsController />
    </div>
  );
};

