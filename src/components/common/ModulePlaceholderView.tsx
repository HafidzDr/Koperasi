import React from "react";
import { Link } from "react-router-dom";
import { useConfigStore } from "@/stores/configStore";
import { BusinessModuleKey } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Info, ArrowLeft, Layers } from "lucide-react";

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
  phasePlanned = 3,
  environment = "Portal",
}) => {
  const { config } = useConfigStore();

  const isModuleDisabled = moduleKey ? !config.activeModules[moduleKey] : false;

  if (isModuleDisabled) {
    return (
      <div className="max-w-xl mx-auto py-12 text-left">
        <Card className="border-warning-base/40 bg-white">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="warning">Status: Modul Nonaktif</Badge>
            </div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              Modul bisnis ini saat ini dinonaktifkan dalam konfigurasi koperasi. Sesuai prinsip arsitektur modular, platform tetap berfungsi normal tanpa modul ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-ink-600 leading-relaxed">
              Anda dapat mengaktifkan modul ini kembali melalui bilah atas <strong>"Modul Bisnis"</strong> atau melalui menu <strong>Pengaturan Platform</strong> pada Portal Administrasi.
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
    <div className="max-w-2xl mx-auto py-10 text-left">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-1">
            <Badge variant="forest">Fondasi Phase 2 Aktif</Badge>
            <span className="text-xs font-semibold text-ink-500 font-mono">
              Implementasi Penuh: Phase {phasePlanned}
            </span>
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-ink-700">
          <div className="p-4 bg-ink-50 rounded-lg border border-ink-200 flex items-start gap-3">
            <Info className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-ink-900 block font-semibold">
                Status Rute & Desain Sistem Terintegrasi
              </strong>
              <p className="text-ink-600 leading-relaxed">
                Rute ini telah terdaftar dalam arsitektur informasi, layout shell telah aktif, dan siap menerima antarmuka interaktif pada fase implementasi fitur terkait.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Link to={environment === "Admin" ? "/admin" : "/portal"}>
              <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Kembali ke Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
