import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { formatIDR } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { TrendingUp } from "lucide-react";

export interface MonthlyFinancialRecord {
  month: string;
  simpanan: number; // Realisasi Simpanan (#2D5636)
  pinjaman: number; // Pembanding: Realisasi Pinjaman (#737373)
  angsuran: number; // Sorotan: Angsuran Diterima (#B45309)
}

const defaultData: MonthlyFinancialRecord[] = [
  { month: "Jun", simpanan: 45_000_000, pinjaman: 30_000_000, angsuran: 22_000_000 },
  { month: "Jul", simpanan: 52_000_000, pinjaman: 35_000_000, angsuran: 26_500_000 },
  { month: "Agu", simpanan: 48_000_000, pinjaman: 40_000_000, angsuran: 29_000_000 },
  { month: "Sep", simpanan: 61_000_000, pinjaman: 45_000_000, angsuran: 33_500_000 },
  { month: "Okt", simpanan: 68_000_000, pinjaman: 50_000_000, angsuran: 38_000_000 },
  { month: "Nov", simpanan: 74_500_000, pinjaman: 55_000_000, angsuran: 42_000_000 },
];

export interface FinancialTrendChartProps {
  data?: MonthlyFinancialRecord[];
  className?: string;
}

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

export const FinancialTrendChart: React.FC<FinancialTrendChartProps> = ({
  data = defaultData,
  className,
}) => {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm">Tren Realisasi Keuangan Operasional</CardTitle>
          <CardDescription>Visualisasi akumulasi kas dan peredaran dana</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-xs text-ink-500">
          Data historis realisasi finansial belum tersedia untuk periode ini.
        </CardContent>
      </Card>
    );
  }

  const formatShortIDR = (val: number) => {
    if (val >= 1_000_000) {
      return `Rp ${(val / 1_000_000).toFixed(0)} Jt`;
    }
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-ink-200 rounded-lg shadow-elevation p-3 text-xs space-y-1.5 min-w-[200px]">
          <p className="font-bold text-ink-900 border-b border-ink-100 pb-1">Bulan: {label} 2026</p>
          {payload.map((entry: TooltipPayloadEntry, index: number) => (
            <div key={`tooltip-${index}`} className="flex justify-between items-center gap-3">
              <span className="flex items-center gap-1.5 text-ink-600">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name}:</span>
              </span>
              <span className="font-mono font-semibold text-ink-900 tabular-nums">
                {formatIDR(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-forest-700" />
              <CardTitle className="text-base text-ink-900">
                Tren Realisasi Arus Dana Operasional (6 Bulan Terakhir)
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-ink-500">
              Perbandingan realisasi simpanan masuk, pencairan pinjaman, dan tertagihnya angsuran
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-ink-500 font-mono">
            <span>Standar Palet Institusi</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
              <XAxis
                dataKey="month"
                stroke="#686868"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#D4D4D4" }}
              />
              <YAxis
                stroke="#686868"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatShortIDR}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
              />
              {/* Realisasi: #2D5636 */}
              <Bar
                dataKey="simpanan"
                name="Realisasi Simpanan"
                fill="#2D5636"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              {/* Pembanding: #737373 */}
              <Bar
                dataKey="pinjaman"
                name="Pencairan Pinjaman"
                fill="#737373"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              {/* Sorotan: #B45309 */}
              <Bar
                dataKey="angsuran"
                name="Angsuran Tertagih"
                fill="#B45309"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
