"use client";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import DynamicTable from "@/components/DynamicTable";
import { useEffect, useState } from "react";
import { FaFileExcel, FaMoneyBill, FaRegCalendarTimes } from "react-icons/fa";
import styles from "@/app/finance/page.module.css";
import toExcel from "@/lib/xlsx/toExcel";

type PendingToPayData = {
  id: string;
  OrderId: string;
  Products: string;
  Status: string;
  DueDate: string;
  PayDate: string;
};

const ORDER_STATUS_OPTIONS = [
  { label: "Unpaid", value: "Unpaid" },
  { label: "Paid", value: "Paid" },
  { label: "Cancelled", value: "Cancelled" },
  { label: "Expired", value: "Expired" },
];

const ORDER_DATE_OPTIONS = [
  { label: "Close to due date", value: "Cloese to due date" },
  { label: "Close to pay date", value: "Close to pay date" },
];

const TABLE_COLUMNS = [
  { key: "OrderId", label: "Order Id", type: "text" },
  { key: "Products", label: "Products", type: "text" },
  { key: "Status", label: "Status", type: "text" },
  { key: "DueDate", label: "Due Date", type: "text" },
  { key: "PayDate", label: "Pay Date", type: "text" },
  { key: "Actions", label: "Actions", type: "action" },
];

export default function PendingToPayPage() {
  // const router = useRouter();
  const [pendingToPay, setPendingToPay] = useState<PendingToPayData[]>([]);
  const [filteredData, setFilteredData] = useState<PendingToPayData[]>([]);
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    fetch("/api/finance/pending_to_pay")
      .then((response) => response.json())
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformData = data.map((pendingToPay: any) => ({
          id: pendingToPay.payable_id,
          OrderId: pendingToPay.order_id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Products: pendingToPay.products.map((product: any) => product.product_name).join(", "),
          Status: pendingToPay.payment_status,
          DueDate: pendingToPay.due_date,
          PayDate: pendingToPay.payment_date,
        }));
        setPendingToPay(transformData);
      })
      .catch((error) => {
        console.error("Error fetching pending to pay data:", error);
      });
  }, [status, description]);

  const handleExportExcel = async () => {
    const sheetName = "Pending to pay";
    const content = pendingToPay.map(({ OrderId, Products, Status, DueDate, PayDate }) => ({
      OrderId,
      Products,
      Status,
      DueDate,
      PayDate,
    }));

    const columns = [
      { label: "Order Id", value: "OrderId" },
      { label: "Products", value: "Products" },
      { label: "Status", value: "Status" },
      { label: "Due Date", value: "DueDate" },
      { label: "Pay Date", value: "PayDate" },
    ];

    try {
      await toExcel(sheetName, columns, content);
      alert("Excel file created successfully");
    } catch (error) {
      console.error("Error creating Excel file:", error);
      alert("Failed to create Excel file");
    }
  };

  useEffect(() => {
    let data = pendingToPay;

    if (status) {
      data = data.filter((item) => item.Status.includes(status));
    }
    if (description) {
      data = data.filter((item) => item.OrderId.toString().includes(description.toString()));
    }

    setFilteredData(data);
  }, [status, description, date, pendingToPay]);

  const handleStatusSelect = (value: string) => {
    setDescription("");
    setDate("");
    setStatus(value);
  };

  const handleDateSelect = (value: string) => {
    setDescription("");
    setStatus("");
    setDate(value);
  };

  return (
    <main className={styles.div_principal}>
      <div className={`${styles.div_principal_top} flex gap-2 mb-6 items-center`}>
        <div className={`${styles.div_busqueda} gap-y-3 flex items-center w-full`}>
          <label className="text-2xl text-[#8b0f14] font-bold" style={{ alignSelf: "flex-start" }}>
            Pending to pay
          </label>
          <div className={"{$styles.div_hijo_busqueda} flex justify-between items-center w-full"}>
            <div className="flex gap-4 items-center w-full max-w-4xl">
              <input
                type="text"
                placeholder="Search by Order ID"
                className="w-[300px] px-4 border rounded-lg focus:outline-none focus:ring-2 bg-white border-[#a01217] focus:ring-[#a01217] text-black h-[37px]"
                value={description}
                onFocus={() => {
                  setStatus("");
                }}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Dropdown options={ORDER_STATUS_OPTIONS} onSelect={handleStatusSelect} placeholder={status === "" ? "Select status" : status} />
              <Dropdown options={ORDER_DATE_OPTIONS} onSelect={handleDateSelect} placeholder={date === "" ? "Select type date" : date} />
            </div>
            <div>
              <Button
                label={
                  <div className="flex items-center justify-center gap-2 w-full h-full">
                    <FaFileExcel className="w-4 h-4" />
                    <span>Excel</span>
                  </div>
                }
                className="bg-[#a01217] text-white hover:bg-[#8b0f14] transition-colors px-4 h-[37px] rounded-lg flex items-center justify-center"
                onClick={handleExportExcel}
              />
            </div>
          </div>
        </div>
      </div>

      <DynamicTable
        data={status || description || date ? filteredData : pendingToPay}
        columns={TABLE_COLUMNS}
        actionIcons={{
          icon2: <FaMoneyBill className="w-5 h-5" />,
          icon3: <FaRegCalendarTimes className="w-5 h-5" />,
        }}
        actions={{
          view: false,
          accept: true,
          cancel: true,
        }}
      />
    </main>
  );
}
