import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatIDR } from "@/lib/utils";
import { useToastStore } from "@/stores/toastStore";
import { useMembershipStore } from "@/features/membership/stores/membershipStore";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { FileText, CheckCircle2, ArrowRight, ArrowLeft, ShieldAlert } from "lucide-react";

// Strict validation: ID Demonstrasi diterbitkan otomatis oleh sistem (read-only), tidak diinput bebas
const registrationSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  city: z.string().min(2, "Kota domisili wajib diisi"),
  occupation: z.string().min(2, "Pekerjaan/Usaha wajib diisi"),
  simpananPokokConfirmed: z.boolean().refine((val) => val === true, "Wajib menyetujui komitmen Simpanan Pokok"),
  simpananWajibConfirmed: z.boolean().refine((val) => val === true, "Wajib menyetujui komitmen Simpanan Wajib"),
  adArtAgreed: z.boolean().refine((val) => val === true, "Wajib menyetujui AD/ART Koperasi"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export const RegistrationWizardView: React.FC = () => {
  const { addToast } = useToastStore();
  const { generateUniqueDemoId, submitApplication, savingsConfig } = useMembershipStore();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSimulatedDocUploaded, setIsSimulatedDocUploaded] = useState<boolean>(false);
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState<boolean>(false);
  const [trackingCode, setTrackingCode] = useState<string>("");
  const [submittedDemoId, setSubmittedDemoId] = useState<string>("");

  // Store is the single source of truth for generating Demo IDs (Phase 3.2 P1)
  const [assignedDemoId, setAssignedDemoId] = useState<string>(() => {
    try {
      return generateUniqueDemoId();
    } catch {
      return "";
    }
  });

  const [capacityError, setCapacityError] = useState<string | null>(() => {
    try {
      generateUniqueDemoId();
      return null;
    } catch (err: unknown) {
      return err instanceof Error ? err.message : "Kapasitas ID demonstrasi telah penuh.";
    }
  });

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      city: "Jakarta",
      occupation: "Wirausaha Kuliner UMKM",
      simpananPokokConfirmed: false,
      simpananWajibConfirmed: false,
      adArtAgreed: false,
    },
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof RegistrationFormData)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ["fullName", "email"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["city", "occupation"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const onSubmit = async (data: RegistrationFormData) => {
    // Simulate network delay 500ms
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const app = submitApplication({
        fullName: data.fullName,
        email: data.email,
        phone: "0812-3456-7890 (Simulasi)",
        city: data.city,
        address: `Jl. Demonstrasi, Wilayah ${data.city}`,
        occupation: data.occupation,
        simpananPokokConfirmed: data.simpananPokokConfirmed,
        simpananWajibConfirmed: data.simpananWajibConfirmed,
        adArtAgreed: data.adArtAgreed,
      });

      setTrackingCode(app.trackingCode);
      setSubmittedDemoId(app.demoId);
      setIsSuccessSubmitted(true);
      addToast({
        title: "Pendaftaran Berhasil Dikirim",
        message: `ID Demonstrasi resmi: ${app.demoId}. Kode pelacakan: ${app.trackingCode}`,
        type: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memproses pendaftaran.";
      setCapacityError(msg);
      addToast({
        title: "Pendaftaran Gagal",
        message: msg,
        type: "danger",
      });
    }
  };

  const handleResetForAnother = () => {
    let nextId = "";
    try {
      nextId = generateUniqueDemoId();
      setCapacityError(null);
    } catch (err: unknown) {
      setCapacityError(err instanceof Error ? err.message : "Kapasitas ID demonstrasi telah penuh.");
    }
    setAssignedDemoId(nextId);
    reset({
      fullName: "",
      email: "",
      city: "Jakarta",
      occupation: "Wirausaha Kuliner UMKM",
      simpananPokokConfirmed: false,
      simpananWajibConfirmed: false,
      adArtAgreed: false,
    });
    setIsSimulatedDocUploaded(false);
    setIsSuccessSubmitted(false);
    setCurrentStep(1);
    setTrackingCode("");
    setSubmittedDemoId("");
  };

  if (isSuccessSubmitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-4">
        <Card className="p-6 sm:p-8">
          <div className="w-14 h-14 bg-forest-100 text-forest-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">
            Pendaftaran Berhasil Diajukan
          </h2>
          <p className="text-xs text-ink-600 mb-6 leading-relaxed">
            Terima kasih telah mendaftar menjadi anggota Koperasi Konsumen Makmur Bersama Nusantara. Berkas Anda kini berstatus <strong>&quot;Menunggu Verifikasi Staf&quot;</strong>.
          </p>

          <div className="p-4 bg-ink-50 border border-ink-200 rounded-lg text-left mb-6 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-ink-500">Kode Registrasi (Demo):</span>
              <span className="font-mono font-bold text-forest-800">{trackingCode}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-ink-500">ID Demonstrasi Diterbitkan:</span>
              <span className="font-mono font-bold text-ink-800">{submittedDemoId}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-ink-500">Tahap Berikutnya:</span>
              <span className="text-ink-800 font-medium">1. Verifikasi Staf → 2. Approval Pengurus</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to={`/status-pengajuan?code=${trackingCode}`}>
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                Lacak Status Permohonan
              </Button>
            </Link>
            <Button
              variant="outline"
              size="md"
              onClick={handleResetForAnother}
            >
              Daftar Calon Lain
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10 space-y-6">
      {/* Wizard Header */}
      <div className="text-center space-y-2">
        <Badge variant="forest">Wizard Pendaftaran</Badge>
        <h1 className="text-xl sm:text-2xl font-bold text-ink-900 break-words">
          Formulir Permohonan Menjadi Anggota
        </h1>
        <p className="text-xs text-ink-600">
          Langkah {currentStep} dari 4 — Lengkapi data diri dan komitmen keanggotaan koperasi
        </p>
      </div>

      {/* Step Indicator */}
      <div className="space-y-2 border-b border-ink-200 pb-3">
        <div className="flex items-center justify-between text-xs select-none">
          {[
            { num: 1, label: "Identitas" },
            { num: 2, label: "Domisili" },
            { num: 3, label: "Dokumen Demo" },
            { num: 4, label: "Komitmen" },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-1.5 sm:gap-2 ${
                currentStep === s.num
                  ? "text-forest-800 font-bold"
                  : currentStep > s.num
                  ? "text-success-700 font-medium"
                  : "text-ink-400"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  currentStep === s.num
                    ? "bg-forest-700 text-white"
                    : currentStep > s.num
                    ? "bg-success-100 text-success-700"
                    : "bg-ink-100 text-ink-500"
                }`}
              >
                {s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>
        <p className="sm:hidden text-xs font-semibold text-forest-800 text-center">
          {[
            "1. Identitas Calon Anggota",
            "2. Domisili & Usaha",
            "3. Simulasi Unggah Dokumen",
            "4. Komitmen Simpanan & AD/ART",
          ][currentStep - 1]}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-4 min-w-0">
            {/* STEP 1: IDENTITAS */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="p-3 bg-forest-50 border border-forest-100 rounded text-xs text-forest-900 flex items-start gap-2 break-words">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-forest-700 mt-0.5" />
                  <span>
                    <strong>Keamanan Data Demonstrasi:</strong> Formulir ini murni untuk demonstrasi prototype. Dilarang memasukkan NIK 16 digit nasional asli. Sistem menerbitkan ID Demonstrasi unik secara otomatis.
                  </span>
                </div>

                {capacityError && (
                  <div className="p-3 bg-danger-100 border border-danger-base/30 rounded-lg text-xs text-danger-700 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-danger-700 mt-0.5" />
                    <span>{capacityError}</span>
                  </div>
                )}

                <Input
                  label="Nama Lengkap Sesuai Dokumen"
                  placeholder="Contoh: Siti Rahmawati"
                  {...register("fullName")}
                  errorMessage={errors.fullName?.message}
                />

                {/* Read-only Demo ID Information Display (Phase 3.2 P1) */}
                <div className="p-3.5 bg-ink-50 border border-ink-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink-800">
                      ID Demonstrasi Pendaftar
                    </span>
                    <Badge variant="forest" size="sm">
                      Diterbitkan Otomatis
                    </Badge>
                  </div>
                  <div className="font-mono text-sm font-bold text-forest-800 pt-0.5">
                    {assignedDemoId || "Kapasitas ID Penuh"}
                  </div>
                  <p className="text-[11px] text-ink-500 leading-relaxed">
                    Identitas demonstrasi sistem diterbitkan otomatis oleh store (read-only); bukan NIK nasional dan tidak dapat dimodifikasi manual oleh pendaftar.
                  </p>
                </div>

                <Input
                  label="Alamat Email Kontak"
                  type="email"
                  placeholder="nama@email.com"
                  {...register("email")}
                  errorMessage={errors.email?.message}
                />
              </div>
            )}

            {/* STEP 2: DOMISILI & PEKERJAAN */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <Select
                  label="Kota / Wilayah Domisili"
                  {...register("city")}
                  errorMessage={errors.city?.message}
                  options={[
                    { value: "Jakarta Selatan", label: "Jakarta Selatan" },
                    { value: "Jakarta Timur", label: "Jakarta Timur" },
                    { value: "Jakarta Pusat", label: "Jakarta Pusat" },
                    { value: "Jakarta Barat", label: "Jakarta Barat" },
                    { value: "Jakarta Utara", label: "Jakarta Utara" },
                    { value: "Depok", label: "Depok" },
                    { value: "Tangerang", label: "Tangerang" },
                    { value: "Bekasi", label: "Bekasi" },
                    { value: "Bogor", label: "Bogor" },
                  ]}
                />

                <Input
                  label="Pekerjaan / Bidang Usaha"
                  placeholder="Contoh: Pemilik Warung Kelontong / Karyawan"
                  {...register("occupation")}
                  errorMessage={errors.occupation?.message}
                />

                <div className="p-3 bg-ink-50 border border-ink-200 rounded text-xs text-ink-600">
                  Koperasi Konsumen Makmur Bersama terbuka untuk seluruh warga yang berdomisili atau berusaha di wilayah operasional KMB.
                </div>
              </div>
            )}

            {/* STEP 3: DOKUMEN IDENTITAS (MOCK UPLOAD) */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-ink-50 border border-dashed border-ink-300 rounded-lg text-center space-y-3">
                  <FileText className="w-10 h-10 text-ink-400 mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-ink-800">
                      Simulasi Unggah Foto KTP / Dokumen Identitas Demo
                    </h4>
                    <p className="text-[11px] text-ink-500 max-w-sm mx-auto mt-1 leading-relaxed">
                      Sistem frontend-only: Dokumen tidak dikirim ke server mana pun dan hanya disimpan sebagai status berkas simulasi lokal.
                    </p>
                  </div>

                  {!isSimulatedDocUploaded ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsSimulatedDocUploaded(true);
                        addToast({
                          title: "Dokumen Disimulasikan",
                          message: "Foto identitas demo berhasil dilampirkan secara lokal.",
                          type: "info",
                        });
                      }}
                    >
                      Klik untuk Simulasikan Unggah Foto KTP
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-xs text-forest-700 bg-forest-50 py-2 px-3 rounded border border-forest-200 max-w-xs mx-auto">
                      <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
                      <span className="truncate">ktp_simulasi_demo.jpg</span>
                      <Badge variant="success" size="sm">
                        Terlampir
                      </Badge>
                      <button
                        type="button"
                        onClick={() => setIsSimulatedDocUploaded(false)}
                        className="text-danger-700 hover:underline text-[11px] ml-1"
                      >
                        Ganti
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: KOMITMEN SIMPANAN & AD/ART (CONFIGURABLE - Phase 3.2 P1) */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="p-3.5 sm:p-4 bg-ink-100 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="font-bold text-ink-900">Kewajiban Keanggotaan KMB:</h4>
                    <Badge variant="warning" size="sm">
                      {savingsConfig.badgeLabel}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-ink-600 leading-relaxed italic bg-white/70 p-2 rounded border border-ink-200">
                    <strong>{savingsConfig.label}:</strong> {savingsConfig.disclaimer}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1 border-b border-ink-200 gap-1">
                    <span>1. Simpanan Pokok (Sekali saat bergabung)</span>
                    <strong className="text-forest-900 font-mono">
                      {formatIDR(savingsConfig.simpananPokokNominal)}
                    </strong>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1 border-b border-ink-200 gap-1">
                    <span>2. Simpanan Wajib (Rutin per bulan)</span>
                    <strong className="text-forest-900 font-mono">
                      {formatIDR(savingsConfig.simpananWajibBulanan)}/bln
                    </strong>
                  </div>
                  <p className="text-[11px] text-ink-600 pt-1 leading-relaxed">
                    *Simpanan Pokok dan Wajib adalah modal bersama anggota yang dapat diambil kembali saat berhenti dari keanggotaan sesuai ketentuan AD/ART.
                  </p>
                </div>

                <Checkbox
                  label={`Saya berkomitmen memenuhi kewajiban Simpanan Pokok (${formatIDR(savingsConfig.simpananPokokNominal)}) setelah permohonan disetujui Pengurus.`}
                  {...register("simpananPokokConfirmed")}
                />
                {errors.simpananPokokConfirmed && (
                  <p className="text-xs text-danger-700">{errors.simpananPokokConfirmed.message}</p>
                )}

                <Checkbox
                  label={`Saya berkomitmen memenuhi kewajiban Simpanan Wajib rutin bulanan (${formatIDR(savingsConfig.simpananWajibBulanan)}/bulan).`}
                  {...register("simpananWajibConfirmed")}
                />
                {errors.simpananWajibConfirmed && (
                  <p className="text-xs text-danger-700">{errors.simpananWajibConfirmed.message}</p>
                )}

                <Checkbox
                  label="Saya menyatakan tunduk pada Anggaran Dasar dan Anggaran Rumah Tangga (AD/ART) Koperasi Makmur Bersama."
                  {...register("adArtAgreed")}
                />
                {errors.adArtAgreed && (
                  <p className="text-xs text-danger-700">{errors.adArtAgreed.message}</p>
                )}
              </div>
            )}
          </CardContent>

          {/* Wizard Footer Controls */}
          <CardFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Kembali
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentStep < 4 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={nextStep}
                  disabled={!!capacityError}
                  className="w-full sm:w-auto gap-1.5"
                >
                  Selanjutnya <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  disabled={isSubmitting || !!capacityError}
                  className="w-full sm:w-auto"
                >
                  Kirimkan Permohonan Pendaftaran
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
