import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { BrandLogo } from "@/components/common/BrandLogo";
import { DemoRoleSwitcher } from "@/components/common/DemoRoleSwitcher";
import { useConfigStore } from "@/stores/configStore";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Menu, ArrowRight, Shield, Award, Users } from "lucide-react";

export const PublicLayout: React.FC = () => {
  const { config } = useConfigStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "Beranda", href: "/" },
    { label: "Tentang Koperasi", href: "/tentang" },
    ...(config.activeModules.savings ? [{ label: "Simpanan", href: "/layanan/simpanan" }] : []),
    ...(config.activeModules.loans ? [{ label: "Pinjaman", href: "/layanan/pinjaman" }] : []),
    { label: "Cara Bergabung", href: "/cara-bergabung" },
    { label: "Transparansi", href: "/transparansi" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ink-50 text-ink-800">
      {/* 1. Global Demo Switcher Bar */}
      <DemoRoleSwitcher />

      {/* 2. Public Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-none border-b border-ink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <BrandLogo size="md" to="/" />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-ink-700">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`transition-colors py-1 ${
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

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/portal">
              <Button variant="ghost" size="sm">
                Masuk Portal
              </Button>
            </Link>
            <Link to="/daftar">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Daftar Anggota
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-md text-ink-700 hover:text-ink-900 hover:bg-ink-100"
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Menu Navigasi"
        side="left"
      >
        <div className="flex flex-col space-y-4 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-ink-800 hover:text-forest-700 py-1.5 px-2 rounded hover:bg-ink-50"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-ink-100 flex flex-col gap-2">
            <Link to="/portal" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" size="md" className="w-full">
                Masuk Portal Anggota
              </Button>
            </Link>
            <Link to="/daftar" onClick={() => setMobileMenuOpen(false)}>
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
                {config.name} ({config.acronym}) adalah lembaga koperasi gotong royong digital yang berfokus pada kesejahteraan dan kemandirian ekonomi anggota.
              </p>
              <div className="pt-2 text-ink-400 space-y-1 text-[11px] font-mono">
                <p>Badan Hukum (Demo): {config.legalNumber}</p>
                <p>NIKOP (Demo): {config.cooperativeRegistrationNumber}</p>
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
                  <li><Link to="/layanan/simpanan" className="hover:text-white transition-colors">Simpanan Sukarela & Berjangka</Link></li>
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
                <li><Link to="/tentang" className="hover:text-white transition-colors">Profil Pengurus & Pengawas</Link></li>
                <li><Link to="/transparansi" className="hover:text-white transition-colors">Prinsip Gotong Royong</Link></li>
                <li><Link to="/admin" className="hover:text-white transition-colors">Portal Administrasi</Link></li>
                <li><span className="text-ink-500">Alamat: {config.address.street}</span></li>
              </ul>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="pt-6 border-t border-ink-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-ink-500 text-[11px]">
            <p>
              © {new Date().getFullYear()} {config.name}. Seluruh hak cipta dilindungi.
            </p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-forest-500" /> Prototipe Demonstrasi
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-forest-500" /> Data 100% Sintetis
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-forest-500" /> Multi-Peran Terpadu
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
