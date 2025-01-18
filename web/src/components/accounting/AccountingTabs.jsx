import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import React from "react";
import DailyAccounting from "./DailyAccounting";

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
      desc: "Contenido semanal",
    },
    {
      label: "Mensual",
      value: "Mensual",
      desc:  "Contenido Mensual",
    },   
  ];

  return (
    <Tabs value={activeTab}>
      <TabsHeader
        className="rounded-none border-b border-blue-gray-50 bg-transparent p-0"
        indicatorProps={{
          className:
            "bg-transparent border-b-2 border-pink-700 shadow-none rounded-none",
        }}
      >
        {data.map(({ label, value }) => (
          <Tab
            key={value}
            value={value}
            onClick={() => setActiveTab(value)}
            className={activeTab === value ? "text-gray-900 text-lg font-bold w-1/3 h-12" : "w-1/3 text-lg h-12"}
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