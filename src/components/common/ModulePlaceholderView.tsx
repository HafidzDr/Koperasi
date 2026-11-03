import React from "react";
import { Link } from "react-router-dom";
import { useConfigStore } from "@/stores/configStore";
import { BusinessModuleKey } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Info, ArrowLeft, Layers, Compass } from "lucide-react";

export interface ModulePlaceholderViewProps {
  moduleKey?: BusinessModuleKey;
  title: string;
  description: string;
  phasePlanned?: number;
  environment?: "Public" | "Portal" | "Admin";
}

export const ModulePlaceholderView: React.FC<ModulePlaceholderViewProps> = ({
  moduleKey,
  title,
  description,
  phasePlanned = 6,
  environment = "Portal",
}) => {
  const { config } = useConfigStore();

  const isModuleDisabled = moduleKey ? !config.activeModules[moduleKey] : false;

  if (isModuleDisabled) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-left">
        <Card className="border-warning-base/40 bg-white shadow-subtle">
          <CardHeader className="bg-warning-50/50 border-b border-warning-100 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="warning" size="sm" dot>Status: Modul Dinonaktifkan</Badge>
            </div>
            <CardTitle className="text-lg text-ink-900">{title}</CardTitle>
            <CardDescription className="text-xs text-ink-600">
              Modul bisnis ini saat ini dinonaktifkan dalam konfigurasi koperasi. Sesuai prinsip arsitektur modular, platform tetap berfungsi normal tanpa modul ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <p className="text-xs text-ink-600 leading-relaxed">
              Anda dapat mengaktifkan modul ini kembali melalui bilah simulasi <strong>"Modul Bisnis"</strong> atau melalui menu <strong>Pengaturan Platform</strong> pada Portal Administrasi.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link to={environment === "Admin" ? "/admin/pengaturan" : "/portal"}>
                <Button variant="outline" size="sm" leftIcon={<Layers className="w-3.5 h-3.5" />}>
                  Buka Konfigurasi Modul
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-left">
      <Card className="border-ink-200 shadow-subtle">
        <CardHeader className="bg-forest-50/40 border-b border-ink-100 pb-4">
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
            <Badge variant="forest" size="sm">
              <Compass className="w-3 h-3 mr-1 inline" />
              Rencana Pengembangan
            </Badge>
            <span className="text-xs font-semibold text-ink-500 font-mono">
              Target Rilis: Phase {phasePlanned}
            </span>
          </div>
          <CardTitle className="text-xl text-ink-900">{title}</CardTitle>
          <CardDescription className="text-xs text-ink-600">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 text-xs text-ink-700 pt-5">
          <div className="p-4 bg-warm-cream rounded-lg border border-ink-200/60 flex items-start gap-3">
            <Info className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-ink-900 block font-semibold">
                Status Rute & Desain Sistem Terintegrasi
              </strong>
              <p className="text-ink-600 leading-relaxed">
                Rute dan skema arsitektur informasi modul ini telah siap. Seluruh tata kelola RBAC, breadcrumbs, dan layout navigasi telah terhubung dengan design system KMB.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link to={environment === "Admin" ? "/admin" : environment === "Public" ? "/" : "/portal"}>
              <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Kembali ke {environment === "Admin" ? "Dashboard Administrasi" : environment === "Public" ? "Beranda" : "Portal Anggota"}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
