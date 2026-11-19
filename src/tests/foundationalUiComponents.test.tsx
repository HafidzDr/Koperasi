// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  Button,
  IconButton,
  Input,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Badge,
  StatusBadge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatCard,
  Modal,
  ConfirmationDialog,
  Tooltip,
  Tabs,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
  Pagination,
  Breadcrumb,
  Alert,
  LoadingState,
  Skeleton,
  EmptyState,
  ErrorState,
} from "@/components/ui";
import { BrowserRouter } from "react-router-dom";

describe("STAGE 1 — Foundational UI Components Quality Gates", () => {
  afterEach(() => {
    cleanup();
  });
  describe("1. Button & IconButton", () => {
    it("renders primary and destructive variants correctly", () => {
      render(
        <div>
          <Button variant="primary">Simpan Data</Button>
          <Button variant="destructive">Hapus Rekord</Button>
        </div>
      );
      expect(screen.getByText("Simpan Data")).toBeDefined();
      expect(screen.getByText("Hapus Rekord")).toBeDefined();
    });

    it("displays loading spinner and disables button when isLoading is true", () => {
      render(<Button isLoading>Memproses...</Button>);
      const btn = screen.getByRole("button");
      expect(btn.hasAttribute("disabled")).toBe(true);
    });

    it("renders IconButton with accessible label", () => {
      render(<IconButton aria-label="Buka Pengaturan" />);
      const btn = screen.getByRole("button", { name: "Buka Pengaturan" });
      expect(btn).toBeDefined();
    });
  });

  describe("2. Input & Textarea", () => {
    it("renders input with accessible label and helper text", () => {
      render(
        <Input
          label="Nomor Induk Anggota"
          helperText="Format: NIA-XXXXX"
          placeholder="Masukkan NIA"
        />
      );
      expect(screen.getByLabelText("Nomor Induk Anggota")).toBeDefined();
      expect(screen.getByText("Format: NIA-XXXXX")).toBeDefined();
    });

    it("displays error message and sets aria-invalid when errorMessage is provided", () => {
      render(
        <Input
          label="Email"
          errorMessage="Email tidak valid"
        />
      );
      const input = screen.getByLabelText("Email");
      expect(input.getAttribute("aria-invalid")).toBe("true");
      expect(screen.getByText("Email tidak valid")).toBeDefined();
    });

    it("toggles password visibility when showPasswordToggle is enabled", () => {
      render(
        <Input
          type="password"
          label="Kata Sandi"
          showPasswordToggle
        />
      );
      const input = screen.getByLabelText("Kata Sandi") as HTMLInputElement;
      expect(input.type).toBe("password");

      const toggleBtn = screen.getByLabelText("Tampilkan kata sandi");
      fireEvent.click(toggleBtn);
      expect(input.type).toBe("text");

      fireEvent.click(screen.getByLabelText("Sembunyikan kata sandi"));
      expect(input.type).toBe("password");
    });
  });

  describe("3. Select Component", () => {
    it("renders options array correctly", () => {
      const options = [
        { value: "daily", label: "Harian" },
        { value: "monthly", label: "Bulanan" },
      ];
      render(<Select label="Frekuensi" options={options} defaultValue="monthly" />);
      const select = screen.getByLabelText("Frekuensi") as HTMLSelectElement;
      expect(select.value).toBe("monthly");
      expect(screen.getByText("Harian")).toBeDefined();
    });
  });

  describe("4. Checkbox, Radio, and Switch", () => {
    it("handles Checkbox state change and label association", () => {
      const handleChange = vi.fn();
      render(
        <Checkbox
          label="Saya menyetujui AD/ART"
          description="Wajib untuk aktivasi"
          onChange={handleChange}
        />
      );
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalled();
      expect(screen.getByText("Saya menyetujui AD/ART")).toBeDefined();
    });

    it("renders RadioGroup and handles radio selection", () => {
      render(
        <RadioGroup label="Metode Pembayaran">
          <Radio name="payment" value="transfer" label="Transfer Bank" />
          <Radio name="payment" value="cash" label="Tunai di Kantor" />
        </RadioGroup>
      );
      expect(screen.getByText("Metode Pembayaran")).toBeDefined();
      expect(screen.getByLabelText("Transfer Bank")).toBeDefined();
    });

    it("handles Switch state toggle", () => {
      const handleToggle = vi.fn();
      render(
        <Switch
          checked={false}
          onCheckedChange={handleToggle}
          label="Notifikasi Email"
        />
      );
      const switchBtn = screen.getByRole("switch");
      fireEvent.click(switchBtn);
      expect(handleToggle).toHaveBeenCalledWith(true);
    });
  });

  describe("5. Badge & StatusBadge", () => {
    it("renders Badge variants with dot indicator", () => {
      render(<Badge variant="forest" dot>Nusantara Maju</Badge>);
      expect(screen.getByText("Nusantara Maju")).toBeDefined();
    });

    it("maps domain statuses in StatusBadge accurately", () => {
      const { rerender } = render(<StatusBadge status="active" />);
      expect(screen.getByText("Aktif")).toBeDefined();

      rerender(<StatusBadge status="pending" />);
      expect(screen.getByText("Menunggu")).toBeDefined();

      rerender(<StatusBadge status="overdue" />);
      expect(screen.getByText("Menunggak")).toBeDefined();
    });
  });

  describe("6. Card & StatCard", () => {
    it("renders Card structure with warm header styling", () => {
      render(
        <Card variant="warm">
          <CardHeader>
            <CardTitle>Ringkasan Portofolio</CardTitle>
          </CardHeader>
          <CardContent>Saldo Simpanan: Rp 50.000.000</CardContent>
        </Card>
      );
      expect(screen.getByText("Ringkasan Portofolio")).toBeDefined();
      expect(screen.getByText("Saldo Simpanan: Rp 50.000.000")).toBeDefined();
    });

    it("renders StatCard with value, trend, and featured variant", () => {
      render(
        <StatCard
          variant="featured"
          title="Total SHU Terdistribusi"
          value="Rp 120.000.000"
          trend={{ value: "+12.5%", direction: "up", label: "vs tahun lalu" }}
        />
      );
      expect(screen.getByText("Total SHU Terdistribusi")).toBeDefined();
      expect(screen.getByText("Rp 120.000.000")).toBeDefined();
      expect(screen.getByText("+12.5%")).toBeDefined();
    });
  });

  describe("7. Modal & ConfirmationDialog", () => {
    it("renders Modal when isOpen is true and calls onClose on Escape", () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Detail Anggota">
          <p>Informasi detail</p>
        </Modal>
      );
      expect(screen.getByText("Detail Anggota")).toBeDefined();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleClose).toHaveBeenCalled();
    });

    it("renders ConfirmationDialog and calls onConfirm on button click", () => {
      const handleConfirm = vi.fn();
      const handleClose = vi.fn();
      render(
        <ConfirmationDialog
          isOpen={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title="Konfirmasi Penutupan Buku"
          message="Apakah Anda yakin ingin menutup buku periode ini?"
          confirmLabel="Ya, Tutup Buku"
          variant="destructive"
        />
      );
      expect(screen.getByText("Konfirmasi Penutupan Buku")).toBeDefined();
      fireEvent.click(screen.getByText("Ya, Tutup Buku"));
      expect(handleConfirm).toHaveBeenCalled();
    });
  });

  describe("8. Tooltip Component", () => {
    it("displays tooltip content on hover", () => {
      render(
        <Tooltip content="Informasi Hak Suara RAT" delayMs={0}>
          <button>Bantuan</button>
        </Tooltip>
      );
      const trigger = screen.getByText("Bantuan");
      fireEvent.mouseEnter(trigger);
      expect(screen.getByRole("tooltip")).toBeDefined();
      expect(screen.getByText("Informasi Hak Suara RAT")).toBeDefined();
    });
  });

  describe("9. Tabs Component", () => {
    it("handles tab switching and renders badge", () => {
      const handleTabChange = vi.fn();
      const tabOptions = [
        { id: "active", label: "Aktif", badge: 12 },
        { id: "pending", label: "Antrean", badge: 3 },
      ];
      render(<Tabs tabs={tabOptions} activeTab="active" onTabChange={handleTabChange} />);
      expect(screen.getByText("Aktif")).toBeDefined();
      expect(screen.getByText("12")).toBeDefined();

      fireEvent.click(screen.getByText("Antrean"));
      expect(handleTabChange).toHaveBeenCalledWith("pending");
    });
  });

  describe("10. Table Components", () => {
    it("renders Table with TableHeader, TableBody, and TableFooter", () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Anggota</TableHead>
              <TableHead>Simpanan Wajib</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Ahmad Fauzi</TableCell>
              <TableCell>Rp 100.000</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell>Rp 100.000</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
      expect(screen.getByText("Nama Anggota")).toBeDefined();
      expect(screen.getByText("Ahmad Fauzi")).toBeDefined();
      expect(screen.getByText("Total")).toBeDefined();
    });
  });

  describe("11. Pagination & Breadcrumb", () => {
    it("renders Pagination and fires onPageChange", () => {
      const handlePageChange = vi.fn();
      render(<Pagination currentPage={2} totalPages={5} onPageChange={handlePageChange} />);
      expect(screen.getByText("2")).toBeDefined();
      expect(screen.getByText("5")).toBeDefined();

      fireEvent.click(screen.getByLabelText("Halaman sebelumnya"));
      expect(handlePageChange).toHaveBeenCalledWith(1);
    });

    it("renders Breadcrumb with router links", () => {
      const items = [
        { label: "Portal", href: "/portal" },
        { label: "Simpanan", href: "/portal/simpanan" },
        { label: "Rincian Mutasi" },
      ];
      render(
        <BrowserRouter>
          <Breadcrumb items={items} />
        </BrowserRouter>
      );
      expect(screen.getByText("Portal")).toBeDefined();
      expect(screen.getByText("Simpanan")).toBeDefined();
      expect(screen.getByText("Rincian Mutasi")).toBeDefined();
    });
  });

  describe("12. Alert Component", () => {
    it("renders Alert with title and close callback", () => {
      const handleClose = vi.fn();
      render(
        <Alert variant="warning" title="Peringatan Likuiditas" onClose={handleClose}>
          Rasio likuiditas di bawah 20%.
        </Alert>
      );
      expect(screen.getByText("Peringatan Likuiditas")).toBeDefined();
      expect(screen.getByText("Rasio likuiditas di bawah 20%.")).toBeDefined();
      fireEvent.click(screen.getByLabelText("Tutup pemberitahuan"));
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe("13. LoadingState, Skeleton, EmptyState, ErrorState", () => {
    it("renders LoadingState with custom message", () => {
      render(<LoadingState message="Menghitung alokasi SHU..." />);
      expect(screen.getByText("Menghitung alokasi SHU...")).toBeDefined();
    });

    it("renders Skeleton element with accessible aria-hidden", () => {
      render(<Skeleton className="w-24 h-4" data-testid="skeleton" />);
      const skeleton = screen.getByTestId("skeleton");
      expect(skeleton.getAttribute("aria-hidden")).toBe("true");
    });

    it("renders EmptyState with action button", () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          title="Belum Ada Pinjaman"
          description="Anda belum memiliki fasilitas pembiayaan aktif."
          actionLabel="Ajukan Pinjaman"
          onAction={handleAction}
        />
      );
      expect(screen.getByText("Belum Ada Pinjaman")).toBeDefined();
      fireEvent.click(screen.getByText("Ajukan Pinjaman"));
      expect(handleAction).toHaveBeenCalled();
    });

    it("renders ErrorState with retry button", () => {
      const handleRetry = vi.fn();
      render(
        <ErrorState
          title="Koneksi Terputus"
          message="Gagal memuat mutasi simpanan."
          onRetry={handleRetry}
        />
      );
      expect(screen.getByText("Koneksi Terputus")).toBeDefined();
      fireEvent.click(screen.getByText("Coba Lagi"));
      expect(handleRetry).toHaveBeenCalled();
    });
  });
});
