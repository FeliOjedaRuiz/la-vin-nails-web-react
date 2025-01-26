import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import React from "react";
import DailyAccounting from "./DailyAccounting";
import WeeklyAccounting from "./WeeklyAccounting";
import MonthlyAccounting from "./MonthlyAccounting";

function AccountingTabs() {
  const [activeTab, setActiveTab] = React.useState("Diario");

  const data = [
    {
      label: "Diario",
      value: "Diario",
      desc: <DailyAccounting />,
    },
    {
      label: "Semanal",
      value: "Semanal",
      desc: <WeeklyAccounting />,
    },
    {
      label: "Mensual",
      value: "Mensual",
      desc:  <MonthlyAccounting />,
    },   
  ];

  return (
    <Tabs value={activeTab}>
      <TabsHeader
        className="rounded-none bg-transparent border-b border-teal-400 p-0 shadow-md"
        indicatorProps={{
          className:
            "bg-transparent border-b-2 bg-white/50 border-teal-700 shadow-none rounded-none",
        }}
      >
        {data.map(({ label, value }) => (
          <Tab
            key={value}
            value={value}
            onClick={() => setActiveTab(value)}
            className={activeTab === value ? "text-teal-700 font-medium w-1/3 h-8 " : "w-1/3 h-8 text-pink-800"}
          >
            {label}
          </Tab>
        ))}
      </TabsHeader>
      <TabsBody>
        {data.map(({ value, desc }) => (
          <TabPanel key={value} value={value} className="p-0">
            {desc}
          </TabPanel>
        ))}
      </TabsBody>
    </Tabs>
  )
}

export default AccountingTabs