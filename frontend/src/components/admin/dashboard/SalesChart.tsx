import { useState, useEffect, useRef } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export interface CatalogChartItem {
  label: string;
  value: number;
}

interface SalesChartProps {
  /** Chart shows published count per catalog type when provided */
  catalogData?: CatalogChartItem[];
}

export default function SalesChart({ catalogData = [] }: SalesChartProps) {
  const [themeColor, setThemeColor] = useState("#A8734B");
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateThemeColor = () => {
      const root = document.documentElement;
      const computedColor = getComputedStyle(root).getPropertyValue("--theme-primary").trim();
      if (computedColor) {
        setThemeColor(computedColor);
      }
    };

    updateThemeColor();
    const interval = setInterval(updateThemeColor, 1000);
    return () => clearInterval(interval);
  }, []);

  const data = catalogData.length
    ? catalogData.map((d) => ({ name: d.label, count: d.value }))
    : [];

  const maxCount = data.length ? Math.max(...data.map((d) => d.count), 1) : 10;

  return (
    <div ref={chartRef} className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Catalog items (published)</h3>
      </div>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No catalog types or no data to display.
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#666", fontSize: 12 }}
                axisLine={{ stroke: "#e0e0e0" }}
              />
              <YAxis
                tick={{ fill: "#666", fontSize: 12 }}
                axisLine={{ stroke: "#e0e0e0" }}
                domain={[0, maxCount]}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "8px 12px",
                }}
                labelStyle={{ color: "#333", fontWeight: 600 }}
                formatter={(value: number) => [`${value} published`, "Count"]}
                labelFormatter={(label) => label}
              />
              <Bar dataKey="count" name="Published" radius={[4, 4, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={index} fill={themeColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
