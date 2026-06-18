import React from "react";
import DailyAccounting from "./DailyAccounting/DailyAccounting";
import WeeklyAccounting from "./WeeklyAccounting";
import MonthlyAccounting from "./MonthAccounting/MonthlyAccounting";

const TABS = [
  { label: "Diario", value: "Diario", component: <DailyAccounting /> },
  { label: "Semanal", value: "Semanal", component: <WeeklyAccounting /> },
  { label: "Mensual", value: "Mensual", component: <MonthlyAccounting /> },
];

/**
 * AccountingTabs - Tabbed view for daily, weekly, and monthly accounting.
 * Uses a simple state-based tab system without external routing.
 */
function AccountingTabs() {
  const [activeTab, setActiveTab] = React.useState("Diario");

  return (
    <div>
      {/* Tab headers */}
      <div className="flex border-b border-teal-400 shadow-md">
        {TABS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setActiveTab(value)}
            className={`w-1/3 h-8 text-sm font-medium transition-colors duration-200 border-b-2 ${
              activeTab === value
                ? "text-teal-700 border-teal-700 bg-white/50"
                : "text-pink-800 border-transparent hover:text-teal-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="p-0">
        {TABS.map(({ value, component }) =>
          activeTab === value ? (
            <div key={value}>{component}</div>
          ) : null
        )}
      </div>
    </div>
  );
}

export default AccountingTabs;