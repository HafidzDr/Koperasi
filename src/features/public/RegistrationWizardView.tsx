import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatIDR } from "@/lib/utils";
import { useToastStore } from "@/stores/toastStore";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { FileText, CheckCircle2, ArrowRight, ArrowLeft, ShieldAlert } from "lucide-react";

// Strict Demo ID format DEMO-ID-XXXX, NO national NIK validation
const registrationSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  demoId: z.string().regex(/^DEMO-ID-\d{4}$/, "Format ID Demonstrasi wajib DEMO-ID-XXXX (contoh: DEMO-ID-0005)"),
  email: z.string().email("Format email tidak valid"),
  city: z.string().min(2, "Kota domisili wajib diisi"),
  occupation: z.string().min(2, "Pekerjaan/Usaha wajib diisi"),
  simpananPokokConfirmed: z.boolean().refine((val) => val === true, "Wajib menyetujui kewajiban Simpanan Pokok"),
  simpananWajibConfirmed: z.boolean().refine((val) => val === true, "Wajib menyetujui kewajiban Simpanan Wajib"),
  adArtAgreed: z.boolean().refine((val) => val === true, "Wajib menyetujui AD/ART Koperasi"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export const RegistrationWizardView: React.FC = () => {
  const { addToast } = useToastStore();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSimulatedDocUploaded, setIsSimulatedDocUploaded] = useState<boolean>(false);
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState<boolean>(false);
  const [trackingCode, setTrackingCode] = useState<string>("");

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      demoId: "DEMO-ID-0005",
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
      fieldsToValidate = ["fullName", "demoId", "email"];
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

  const onSubmit = async (_data: RegistrationFormData) => {
    // Simulate network delay 700ms
    await new Promise((resolve) => setTimeout(resolve, 700));

    const generatedCode = `REG-${Date.now().toString().slice(-6)}`;
    setTrackingCode(generatedCode);
    setIsSuccessSubmitted(true);

    addToast({
      type: "success",
      title: "Pendaftaran Berhasil Dikirim",
      message: `Kode registrasi Anda: ${generatedCode}. Berkas masuk antrean verifikasi staf.`,
    });
  };

  if (isSuccessSubmitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <Card className="text-center p-8 border-forest-600 bg-white">
          <div className="w-14 h-14 bg-forest-100 text-forest-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <Badge variant="success" size="md" className="mb-2">
            Permohonan Terkirim
          </Badge>
          <h2 className="text-xl font-bold text-ink-900 mb-2">
            Pendaftaran Berhasil Diterima
          </h2>
          <p className="text-xs text-ink-600 leading-relaxed max-w-md mx-auto mb-6">
            Terima kasih telah mendaftar menjadi anggota Koperasi Konsumen Makmur Bersama Nusantara. Berkas Anda kini berstatus <strong>"Menunggu Verifikasi Staf"</strong>.
          </p>

          <div className="p-4 bg-ink-50 border border-ink-200 rounded-lg text-left mb-6 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-ink-500">Kode Registrasi (Demo):</span>
              <span className="font-mono font-bold text-forest-800">{trackingCode}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-ink-500">Format ID Anggota:</span>
              <span className="font-mono text-ink-800">DEMO-ID-0005</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-ink-500">Tahap Berikutnya:</span>
              <span className="text-ink-800 font-medium">1. Verifikasi Staf → 2. Approval Pengurus</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsSuccessSubmitted(false);
                setCurrentStep(1);
              }}
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
            "2. Domisili & Pekerjaan",
            "3. Simulasi Dokumen Demo",
            "4. Komitmen Simpanan & AD/ART",
          ][currentStep - 1]}
        </p>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-4 min-w-0">
            {/* STEP 1: IDENTITAS */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="p-3 bg-forest-50 border border-forest-100 rounded text-xs text-forest-900 flex items-start gap-2 break-words">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-forest-700 mt-0.5" />
                  <span>
                    <strong>Keamanan Data Demonstrasi:</strong> Formulir ini murni untuk demonstrasi prototype. Dilarang memasukkan NIK 16 digit nasional asli. Gunakan format tunggal ID Demonstrasi yang telah disediakan.
                  </span>
                </div>

                <Input
                  label="Nama Lengkap Sesuai Dokumen"
                  placeholder="Contoh: Siti Rahmawati"
                  {...register("fullName")}
                  errorMessage={errors.fullName?.message}
                />

                <Input
                  label="ID Demonstrasi (Format Tunggal: DEMO-ID-XXXX)"
                  placeholder="DEMO-ID-0005"
                  isTabular
                  {...register("demoId")}
                  errorMessage={errors.demoId?.message}
                  helperText="Format identitas demonstrasi sintetis; bukan NIK nasional."
                />

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
                  options={[
                    { value: "Jakarta", label: "DKI Jakarta" },
                    { value: "Bogor", label: "Bogor" },
                    { value: "Depok", label: "Depok" },
                    { value: "Tangerang", label: "Tangerang" },
                    { value: "Bekasi", label: "Bekasi" },
                    { value: "Lainnya", label: "Lainnya di Indonesia" },
                  ]}
                  {...register("city")}
                  errorMessage={errors.city?.message}
                />

                <Input
                  label="Pekerjaan / Bidang Usaha"
                  placeholder="Contoh: Pelaku Usaha Kuliner / Karyawan Swasta"
                  {...register("occupation")}
                  errorMessage={errors.occupation?.message}
                />
              </div>
            )}

            {/* STEP 3: SIMULASI UNGGAH DOKUMEN */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-ink-300 rounded-lg p-4 sm:p-6 text-center space-y-3 bg-ink-50/50">
                  <FileText className="w-8 h-8 text-forest-700 mx-auto shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-ink-900">
                      Simulasi Dokumen Identitas Contoh
                    </h4>
                    <p className="text-xs text-ink-600 max-w-sm mx-auto mt-1">
                      Sistem prototype ini <strong>tidak menyimpan file biner atau string base64</strong> dari komputer Anda demi privasi dan keamanan.
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
                          type: "info",
                          title: "Dokumen Contoh Diterapkan",
                          message: "Placeholder 'SIMULATED DOCUMENT' berhasil disematkan.",
                        });
                      }}
                      className="w-full sm:w-auto text-xs px-3 py-2"
                    >
                      Gunakan Dokumen Contoh Demo
                    </Button>
                  ) : (
                    <div className="p-2.5 sm:p-3 bg-white border border-forest-600 rounded-md inline-flex flex-wrap items-center justify-center gap-2 text-xs text-forest-900 font-mono">
                      <span className="font-bold text-[11px] sm:text-xs">SIMULATED DOCUMENT</span>
                      <Badge variant="success" size="sm">
                        Terlampir (Mock)
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

            {/* STEP 4: KOMITMEN SIMPANAN & AD/ART */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="p-3.5 sm:p-4 bg-ink-100 rounded-lg space-y-2 text-xs">
                  <h4 className="font-bold text-ink-900">Kewajiban Keanggotaan KMB:</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1 border-b border-ink-200 gap-1">
                    <span>1. Simpanan Pokok (Sekali saat bergabung)</span>
                    <strong className="text-forest-900 font-mono">{formatIDR(100000)}</strong>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1 border-b border-ink-200 gap-1">
                    <span>2. Simpanan Wajib (Rutin per bulan)</span>
                    <strong className="text-forest-900 font-mono">{formatIDR(50000)}/bln</strong>
                  </div>
                  <p className="text-[11px] text-ink-600 pt-1 leading-relaxed">
                    *Simpanan Pokok dan Wajib adalah modal bersama anggota yang dapat diambil kembali saat berhenti dari keanggotaan sesuai AD/ART.
                  </p>
                </div>

                <Checkbox
                  label="Saya berkomitmen menyetorkan Simpanan Pokok sebesar Rp 100.000 setelah disetujui."
                  {...register("simpananPokokConfirmed")}
                />
                {errors.simpananPokokConfirmed && (
                  <p className="text-xs text-danger-700">{errors.simpananPokokConfirmed.message}</p>
                )}

                <Checkbox
                  label="Saya berkomitmen menyetorkan Simpanan Wajib sebesar Rp 50.000 setiap bulan."
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
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={prevStep}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                className="w-full sm:w-auto"
              >
                Sebelumnya
              </Button>
            ) : (
              <div className="hidden sm:block" />
            )}

            {currentStep < 4 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={nextStep}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="w-full sm:w-auto"
              >
                Selanjutnya
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                rightIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                className="w-full sm:w-auto"
              >
                Kirim Permohonan
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
