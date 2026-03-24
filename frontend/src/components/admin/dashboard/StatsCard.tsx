interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export default function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <div 
      className="rounded-lg p-4 flex items-center justify-between text-white shadow-sm"
      style={{ backgroundColor: "var(--theme-dark)" }}
    >
      <div>
        <p className="text-sm opacity-80 mb-1">{title}</p>
        <h2 className="text-2xl font-semibold">{value}</h2>
      </div>
      {icon && <div className="text-white opacity-90">{icon}</div>}
    </div>
  );
}
