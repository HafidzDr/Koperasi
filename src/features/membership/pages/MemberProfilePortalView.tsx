import React from "react";
import { useAuthStore } from "@/stores/authStore";
import { useMembershipStore } from "../stores/membershipStore";
import { formatIDR } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Building,
  CheckCircle2,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  PiggyBank,
} from "lucide-react";

export const MemberProfilePortalView: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { members, getMemberByDemoId } = useMembershipStore();

  // Strictly scoped to the authenticated member (BR-01.1 & Seksi 5.4 Member Boundary V~)
  const memberDemoId = currentUser.memberId || "DEMO-ID-0001";
  const member = getMemberByDemoId(memberDemoId) || members[0];

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-ink-200 rounded-lg shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-ink-900">
              Profil Anggota & Kartu Digital
            </h1>
            <Badge variant="forest" size="sm">
              Hak Akses Anggota
            </Badge>
          </div>
          <p className="text-xs text-ink-600">
            Data keanggotaan resmi yang tercatat di Buku Induk Koperasi Konsumen Makmur Bersama Nusantara.
          </p>
        </div>
        <div>
          <Badge variant="success" size="md" className="gap-1.5 py-1 px-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            Status: {member.status === "active" ? "Anggota Aktif Sah" : member.status}
          </Badge>
        </div>
      </div>

      {/* Digital Member Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-forest-800 via-forest-900 to-ink-900 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none">
          <Building className="w-64 h-64 text-white" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-forest-200 uppercase block">
              Koperasi Konsumen Makmur Bersama Nusantara
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
              {member.fullName}
            </h2>
            <span className="text-xs text-forest-300 font-mono">
              ID Demonstrasi: {member.demoId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-forest-700/80 border border-forest-500 text-emerald-100 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> ANGGOTA AKTIF
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-forest-700/60 font-mono text-xs">
          <div>
            <span className="text-[10px] uppercase text-forest-300 block">
              Nomor Anggota:
            </span>
            <span className="font-bold text-sm text-white">
              {member.memberNumber}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-forest-300 block">
              Tanggal Bergabung:
            </span>
            <span className="text-forest-100">
              {new Date(member.joinDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-forest-300 block">
              Simpanan Pokok:
            </span>
            <span className="text-forest-100">
              {formatIDR(member.saldoPokok)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-forest-300 block">
              Simpanan Wajib:
            </span>
            <span className="text-forest-100">
              {formatIDR(member.saldoWajib)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Profile Details & Obligations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Biodata */}
        <Card className="bg-white border-ink-200 md:col-span-2">
          <CardHeader className="border-b border-ink-100 pb-3">
            <CardTitle className="text-sm font-bold text-ink-900 flex items-center gap-2">
              <User className="w-4 h-4 text-forest-700" />
              Biodata & Kontak Terdaftar
            </CardTitle>
            <CardDescription className="text-xs text-ink-500">
              Data resmi yang tersimpan di sistem keanggotaan koperasi
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-ink-500 block mb-0.5">Nama Lengkap:</span>
                <span className="font-semibold text-ink-900">{member.fullName}</span>
              </div>
              <div>
                <span className="text-ink-500 block mb-0.5">Nomor Anggota (KMB):</span>
                <span className="font-mono font-bold text-forest-800">
                  {member.memberNumber}
                </span>
              </div>
              <div>
                <span className="text-ink-500 block mb-0.5">Email:</span>
                <span className="text-ink-900 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-ink-400" /> {member.email}
                </span>
              </div>
              <div>
                <span className="text-ink-500 block mb-0.5">Telepon (Simulasi):</span>
                <span className="text-ink-900 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-ink-400" /> {member.phone}
                </span>
              </div>
              <div>
                <span className="text-ink-500 block mb-0.5">Kota Domisili:</span>
                <span className="text-ink-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-ink-400" /> {member.city}
                </span>
              </div>
              <div>
                <span className="text-ink-500 block mb-0.5">Pekerjaan / Bidang Usaha:</span>
                <span className="text-ink-900 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-ink-400" /> {member.occupation}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-ink-500 block mb-0.5">Alamat Domisili:</span>
                <span className="text-ink-900">{member.address}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-ink-100 flex items-center justify-between text-[11px] text-ink-500">
              <span>Disetujui oleh: <strong>{member.approvedBy}</strong></span>
              <span>Hak Suara RAT: <strong>1 Orang = 1 Suara</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Cooperative Rights & Obligations */}
        <Card className="bg-white border-ink-200">
          <CardHeader className="border-b border-ink-100 pb-3">
            <CardTitle className="text-sm font-bold text-ink-900 flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-forest-700" />
              Kewajiban & Hak Anggota
            </CardTitle>
            <CardDescription className="text-xs text-ink-500">
              Berdasarkan AD/ART Koperasi KMB
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="p-3 bg-forest-50/70 border border-forest-200 rounded-lg space-y-1">
              <span className="font-semibold text-forest-900 block">
                Simpanan Pokok:
              </span>
              <p className="text-ink-700">
                Lunas ({formatIDR(member.saldoPokok)}) — Disetor saat pertama menjadi anggota.
              </p>
            </div>

            <div className="p-3 bg-forest-50/70 border border-forest-200 rounded-lg space-y-1">
              <span className="font-semibold text-forest-900 block">
                Simpanan Wajib Bulanan:
              </span>
              <p className="text-ink-700">
                {formatIDR(member.simpananWajibBulanan)} / bulan (Saldo saat ini: {formatIDR(member.saldoWajib)}).
              </p>
            </div>

            <div className="p-3 bg-ink-50 border border-ink-200 rounded-lg space-y-1">
              <span className="font-semibold text-ink-900 block">
                Partisipasi Usaha & RAT:
              </span>
              <p className="text-ink-600">
                Berhak berbelanja di unit waserda, mengajukan pinjaman, dan memiliki 1 hak suara dalam RAT tahunan.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
