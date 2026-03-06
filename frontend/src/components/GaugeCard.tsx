import React from "react";
// import GaugeChart from "react-gauge-chart";

interface GaugeCardProps {
  value: number;
  min: number;
  max: number;
  label: string;
  unit?: string;
  color: string; // Tailwind color class, e.g. 'blue-600'
  sublabel?: string;
}

const colorMap: Record<string, string> = {
  blue: "#2563eb",
  orange: "#f59e42",
  red: "#ef4444",
  green: "#22c55e",
};

const GaugeCard: React.FC<GaugeCardProps> = ({ value, min, max, label, unit, color, sublabel }) => {
  const gaugeColor = colorMap[color] || color;
  const percent = Math.max(0, Math.min(1, (value - min) / (max - min)));

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 shadow p-4 flex flex-col items-center justify-center min-w-[140px] min-h-[180px] ">
      <div className="w-52 h-40 flex items-center justify-center ">
        {/* <GaugeChart
          id="gauge-chart3"
          nrOfLevels={1}
          colors={[gaugeColor]}
          arcWidth={0.4}
          percent={percent}
          textColor="white"
          hideText={true}
          style={{ width: "100%", height: "70%",}}
        /> */}
      </div>
      <div className="flex flex-col items-center justify-center text-center w-full mt-2">
        <div className="text-lg font-bold text-white">
          {unit ? `${value} ${unit}` : value}
        </div>
        <div className="flex justify-between w-full px-2 mt-1 text-xs text-gray-500">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
      <div className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1">
        {label}
        {sublabel && <span className="ml-1 text-gray-400">{sublabel}</span>}
      </div>
    </div>
  );
};

export default GaugeCard; 