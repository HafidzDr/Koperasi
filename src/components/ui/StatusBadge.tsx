import React from "react";
import { Badge, BadgeProps } from "./Badge";

export interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
}

const statusMap: Record<
  string,
  { label: string; variant: BadgeProps["variant"]; dot?: boolean }
> = {
  // Membership / Lifecycle
  active: { label: "Aktif", variant: "success", dot: true },
  aktif: { label: "Aktif", variant: "success", dot: true },
  approved: { label: "Disetujui", variant: "success", dot: true },
  disetujui: { label: "Disetujui", variant: "success", dot: true },
  paid: { label: "Lunas", variant: "success", dot: true },
  paid_off: { label: "Lunas", variant: "success", dot: true },
  disbursed: { label: "Dicairkan", variant: "forest", dot: true },
  dicairkan: { label: "Dicairkan", variant: "forest", dot: true },

  // In-review / Pending
  pending: { label: "Menunggu", variant: "warning", dot: true },
  menunggu: { label: "Menunggu", variant: "warning", dot: true },
  submitted: { label: "Diajukan", variant: "info", dot: true },
  diajukan: { label: "Diajukan", variant: "info", dot: true },
  under_review: { label: "Dalam Verifikasi", variant: "warning", dot: true },
  dalam_peninjauan: { label: "Dalam Peninjauan", variant: "warning", dot: true },
  recommended: { label: "Direkomendasikan", variant: "forest", dot: true },
  scheduled: { label: "Terjadwal", variant: "info", dot: false },

  // Warning / Danger / Inactive
  overdue: { label: "Menunggak", variant: "danger", dot: true },
  terlambat: { label: "Terlambat", variant: "danger", dot: true },
  rejected: { label: "Ditolak", variant: "danger", dot: true },
  ditolak: { label: "Ditolak", variant: "danger", dot: true },
  cancelled: { label: "Dibatalkan", variant: "neutral", dot: false },
  dibatalkan: { label: "Dibatalkan", variant: "neutral", dot: false },
  reversed: { label: "Dibalik", variant: "warning", dot: true },
  frozen: { label: "Dibekukan", variant: "danger", dot: true },
  dibekukan: { label: "Dibekukan", variant: "danger", dot: true },
  resigned: { label: "Keluar", variant: "neutral", dot: false },
  deceased: { label: "Meninggal Dunia", variant: "neutral", dot: false },
  written_off: { label: "Hapus Buku", variant: "danger", dot: true },
  draft: { label: "Draft", variant: "neutral", dot: false },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "sm",
  className,
}) => {
  const normalized = (status || "").toLowerCase().trim();
  const config = statusMap[normalized] || {
    label: status || "Unknown",
    variant: "neutral",
    dot: false,
  };

  return (
    <Badge
      variant={config.variant}
      size={size}
      dot={config.dot}
      className={className}
    >
      {config.label}
    </Badge>
  );
};

