import React, { useState } from "react";
import { useMembershipStore } from "../stores/membershipStore";
import { Member, MemberStatus } from "../types";
import { formatIDR } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import {
  Search,
  Eye,
  Building,
} from "lucide-react";

export const MemberListView: React.FC = () => {
  const { members } = useMembershipStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const filteredMembers = members.filter((member) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      member.fullName.toLowerCase().includes(q) ||
      member.memberNumber.toLowerCase().includes(q) ||
      member.demoId.toLowerCase().includes(q) ||
      member.city.toLowerCase().includes(q) ||
      member.occupation.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === "all") return true;
    return member.status === statusFilter;
  });

  const getStatusBadge = (status: MemberStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Aktif</Badge>;
      case "under_review":
        return <Badge variant="warning">Dalam Peninjauan</Badge>;
      case "suspended":
        return <Badge variant="danger">Dibekukan</Badge>;
      case "inactive":
        return <Badge variant="neutral">Non-Aktif</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleOpenDetail = (member: Member) => {
    setSelectedMember(member);
    setIsDetailModalOpen(true);
  };

  const totalMembers = members.length;
  const countActive = members.filter((m) => m.status === "active").length;
  const countReview = members.filter((m) => m.status === "under_review").length;
  const countSuspended = members.filter((m) => m.status === "suspended").length;

  const totalSimpanan = members.reduce(
    (sum, m) => sum + (m.saldoPokok || 0) + (m.saldoWajib || 0) + (m.saldoSukarela || 0),
    0
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-ink-200 rounded-lg shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-ink-900">
              Direktori & Buku Induk Keanggotaan
            </h1>
            <Badge variant="forest" size="sm">
              BR-01.1
            </Badge>
          </div>
          <p className="text-xs text-ink-600">
            Daftar resmi seluruh anggota terdaftar Koperasi Konsumen Makmur Bersama Nusantara dengan nomor unik dan catatan simpanan awal.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white border border-ink-200 rounded-lg">
          <span className="text-[11px] text-ink-500 block">Total Anggota</span>
          <span className="text-lg font-bold text-ink-900">{totalMembers}</span>
        </div>
        <div className="p-3 bg-white border border-ink-200 rounded-lg">
          <span className="text-[11px] text-ink-500 block">Anggota Aktif</span>
          <span className="text-lg font-bold text-emerald-700">{countActive}</span>
        </div>
        <div className="p-3 bg-white border border-ink-200 rounded-lg">
          <span className="text-[11px] text-ink-500 block">Dalam Peninjauan</span>
          <span className="text-lg font-bold text-amber-600">{countReview}</span>
        </div>
        <div className="p-3 bg-white border border-ink-200 rounded-lg">
          <span className="text-[11px] text-ink-500 block">Total Saldo Simpanan</span>
          <span className="text-sm font-bold text-forest-800 font-mono">
            {formatIDR(totalSimpanan)}
          </span>
        </div>
      </div>

      {/* Filters and Table */}
      <Card className="bg-white border-ink-200">
        <div className="p-4 border-b border-ink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-1">
            {[
              { key: "all", label: "Semua Anggota" },
              { key: "active", label: `Aktif (${countActive})` },
              { key: "under_review", label: `Peninjauan (${countReview})` },
              { key: "suspended", label: `Dibekukan (${countSuspended})` },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === tab.key
                    ? "bg-forest-800 text-white"
                    : "bg-ink-50 hover:bg-ink-100 text-ink-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, nomor anggota, kota..."
              className="w-full pl-9 pr-3 py-1.5 bg-ink-50 border border-ink-200 rounded-md text-xs text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-1 focus:ring-forest-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Members Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor Anggota</TableHead>
              <TableHead>Nama & ID Demo</TableHead>
              <TableHead>Domisili & Usaha</TableHead>
              <TableHead>Tanggal Bergabung</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-ink-500">
                  Tidak ada anggota yang sesuai dengan kriteria pencarian.
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="font-mono text-xs font-bold text-forest-800">
                      {member.memberNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-xs text-ink-900">{member.fullName}</div>
                    <div className="font-mono text-[11px] text-ink-500">{member.demoId}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-ink-800">{member.city}</div>
                    <div className="text-[11px] text-ink-500">{member.occupation}</div>
                  </TableCell>
                  <TableCell className="text-xs text-ink-600">
                    {new Date(member.joinDate).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{getStatusBadge(member.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetail(member)}
                      className="gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Profil
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Detail Member Modal */}
      {selectedMember && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Buku Induk: ${selectedMember.fullName}`}
          maxWidth="lg"
        >
          <div className="space-y-6 text-left py-2 text-xs">
            {/* Digital Member Card Mockup */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-forest-800 to-forest-950 text-white shadow-subtle relative overflow-hidden">
              <div className="absolute right-3 -bottom-6 opacity-10 pointer-events-none">
                <Building className="w-40 h-40 text-white" />
              </div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-forest-200">
                    Kartu Anggota Digital KMB
                  </span>
                  <h3 className="text-base font-bold tracking-tight">
                    {selectedMember.fullName}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-forest-700/80 border border-forest-500">
                    {selectedMember.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-forest-700/60 font-mono text-[11px]">
                <div>
                  <span className="text-forest-300 block text-[10px]">Nomor Anggota:</span>
                  <span className="font-bold text-forest-100">
                    {selectedMember.memberNumber}
                  </span>
                </div>
                <div>
                  <span className="text-forest-300 block text-[10px]">ID Demonstrasi:</span>
                  <span className="text-forest-100">{selectedMember.demoId}</span>
                </div>
                <div>
                  <span className="text-forest-300 block text-[10px]">Bergabung:</span>
                  <span className="text-forest-100">
                    {new Date(selectedMember.joinDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="p-4 bg-ink-50 border border-ink-200 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-ink-500 block">Email:</span>
                <span className="text-ink-900">{selectedMember.email}</span>
              </div>
              <div>
                <span className="text-ink-500 block">Telepon:</span>
                <span className="text-ink-900">{selectedMember.phone}</span>
              </div>
              <div>
                <span className="text-ink-500 block">Kota Domisili:</span>
                <span className="text-ink-900">{selectedMember.city}</span>
              </div>
              <div>
                <span className="text-ink-500 block">Pekerjaan / Bidang Usaha:</span>
                <span className="text-ink-900">{selectedMember.occupation}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-ink-500 block">Alamat Terdaftar:</span>
                <span className="text-ink-900">{selectedMember.address}</span>
              </div>
              <div className="sm:col-span-2 pt-1 border-t border-ink-200">
                <span className="text-ink-500 block">Pejabat yang Menyetujui:</span>
                <span className="text-ink-800 font-medium">
                  {selectedMember.approvedBy}
                </span>
              </div>
            </div>

            {/* Savings Overview in Member Registry */}
            <div className="space-y-2">
              <h4 className="font-bold text-ink-900 uppercase tracking-wider text-[11px]">
                Rekapitulasi Simpanan Anggota
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-ink-200 rounded-lg">
                  <span className="text-ink-500 block text-[10px]">Simpanan Pokok</span>
                  <span className="font-bold text-ink-900 font-mono">
                    {formatIDR(selectedMember.saldoPokok || 0)}
                  </span>
                </div>
                <div className="p-3 bg-white border border-ink-200 rounded-lg">
                  <span className="text-ink-500 block text-[10px]">Simpanan Wajib</span>
                  <span className="font-bold text-ink-900 font-mono">
                    {formatIDR(selectedMember.saldoWajib || 0)}
                  </span>
                </div>
                <div className="p-3 bg-white border border-ink-200 rounded-lg">
                  <span className="text-ink-500 block text-[10px]">Simpanan Sukarela</span>
                  <span className="font-bold text-forest-800 font-mono">
                    {formatIDR(selectedMember.saldoSukarela || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
