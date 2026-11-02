import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShieldAlert, ArrowLeft, RefreshCw } from "lucide-react";

interface AccessDeniedViewProps {
  title?: string;
  badgeText?: string;
  isModuleInactive?: boolean;
  reason?: string;
  requiredRole?: string;
  currentPath?: string;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  title,
  badgeText,
  isModuleInactive = false,
  reason,
  requiredRole,
  currentPath,
}) => {
  const { currentRole, currentUser } = useAuthStore();

  const getDefaultRedirectPath = () => {
    if (currentRole === "member") return "/portal";
    if (["public_visitor", "applicant"].includes(currentRole)) return "/";
    return "/admin";
  };

  const displayTitle = isModuleInactive
    ? "Modul Tidak Aktif"
    : title || "Akses Dibatasi (Access Denied)";
  const displayBadge = isModuleInactive
    ? "Modul Nonaktif"
    : badgeText || "Prinsip SoD";
  const displayDesc = isModuleInactive
    ? "Modul bisnis ini sedang dinonaktifkan dalam konfigurasi platform koperasi KMB."
    : "Sistem Pengendalian Internal & Hak Akses Berbasis Peran";

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-warning-base/40 shadow-subtle text-left">
        <CardHeader className="border-b border-ink-100 bg-warning-100/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning-base/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-warning-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base text-ink-900">
                  {displayTitle}
                </CardTitle>
                <Badge variant="warning" size="sm">
                  {displayBadge}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                {displayDesc}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-5 text-xs text-ink-700">
          <div className="p-3 bg-ink-50 rounded border border-ink-200 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-ink-500">Peran Anda Saat Ini:</span>
              <strong className="text-ink-900 font-semibold">{currentUser.roleName} ({currentRole})</strong>
            </div>
            {currentPath && (
              <div className="flex justify-between">
                <span className="text-ink-500">Rute yang Diminta:</span>
                <code className="font-mono text-ink-800 bg-ink-100 px-1 py-0.5 rounded">{currentPath}</code>
              </div>
            )}
            {requiredRole && (
              <div className="flex justify-between">
                <span className="text-ink-500">Otoritas yang Diperlukan:</span>
                <span className="text-forest-800 font-semibold">{requiredRole}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-ink-900">Alasan Pembatasan Akses:</p>
            <p className="text-ink-600 leading-relaxed bg-white p-3 rounded border border-ink-100">
              {reason ||
                "Berdasarkan Matriks Kewenangan (Information Architecture Seksi 5.4) dan Prinsip Separation of Duties (SoD), peran Anda saat ini tidak memiliki otorisasi untuk mengakses halaman atau fungsi ini."}
            </p>
          </div>

          <div className="text-[11px] text-ink-500 border-t border-ink-100 pt-3">
            <p>
              *Untuk menguji halaman ini dari perspektif peran yang berwenang, gunakan panel <strong>Demo Role Switcher</strong> di sudut kanan bawah antarmuka.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2 border-t border-ink-100 bg-ink-50/50 justify-between">
          <Link to={getDefaultRedirectPath()} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Kembali ke Area yang Diizinkan
            </Button>
          </Link>

          <Link to="/" className="w-full sm:w-auto">
            <Button variant="secondary" size="sm" className="w-full" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Ke Beranda Publik
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

