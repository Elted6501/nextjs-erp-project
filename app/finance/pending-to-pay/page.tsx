"use client";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import DynamicTable from "@/components/DynamicTable";
import { useEffect, useState } from "react";
import {
  FaFileExcel,
  FaEye,
  FaTimes,
  FaRegCheckCircle,
  /*FaPlus,*/
} from "react-icons/fa";
import styles from "@/app/finance/page.module.css";
// import { useRouter } from "next/navigation";
import toExcel from "@/lib/xlsx/toExcel";
import DateInput from "@/components/DateInput";

type PendingToPayData = {
  id: string;
  OrderId: string;
  Product: string;
  Status: string;
  DueDate: string;
  PayDate: string;
};

const ORDER_STATUS_OPTIONS = [
  { label: "Pending", value: "Pending" },
  { label: "Paid", value: "Paid" },
  { label: "Cancelled", value: "Cancelled" },
];

const TABLE_COLUMNS = [
  { key: "OrderId", label: "Order Id", type: "text" },
  { key: "Product", label: "Product", type: "text" },
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetch("/api/finance/pending_to_pay")
      .then((response) => response.json())
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformData = data.map((item: any) => ({
          id: item.payable_id,
          OrderId: item.order_id,
          Product: item.name,
          Status: item.status,
          DueDate: item.due_date,
          PayDate: item.payment_date,
        }));
        setPendingToPay(transformData);
      })
      .catch((error) => {
        console.error("Error fetching pending to pay data:", error);
      });
  }, [status]);

  const handleExportExcel = async () => {
    const sheetName = "Pending to pay";
    const content = pendingToPay.map(
      ({ OrderId, Product, Status, DueDate, PayDate }) => ({
        OrderId,
        Product,
        Status,
        DueDate,
        PayDate,
      })
    );

    const columns = [
      { label: "Order Id", value: "OrderId" },
      { label: "Product", value: "Product" },
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
      data = data.filter((item) =>
        item.Status.toLowerCase().includes(status.toLowerCase())
      );
    }
    if (description) {
      data = data.filter((item) =>
        item.OrderId.toString().includes(description.toString())
      );
    }

    setFilteredData(data);
  }, [status, description, pendingToPay]);

  const handleStatusSelect = (value: string) => {
    setDescription("");
    setStatus(value);
  };

  return (
    <main className={styles.div_principal}>
      <form>
        <div
          className={`${styles.div_principal_top} flex gap-4 mb-6 items-center`}
        >
          <div className={`${styles.div_busqueda} flex mb-6 items-center`}>
            <label
              className="text-2xl text-[#8b0f14] font-bold"
              style={{ alignSelf: "flex-start" }}
            >
              Filters
            </label>
            <div className={styles.div_hijo_busqueda}>
              {/* <input
                type="text"
                placeholder="Search by order id"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white border-[#a01217] focus:ring-[#a01217] text-black"
                value={description}
                onFocus={() => setStatus("")}
                onChange={(e) => setDescription(e.target.value)}
              /> */}
              <Dropdown
                options={ORDER_STATUS_OPTIONS}
                onSelect={handleStatusSelect}
                placeholder={status === "" ? "Select status" : status}
                className="mt-1"
              />
              <Dropdown
                options={ORDER_STATUS_OPTIONS}
                onSelect={handleStatusSelect}
                placeholder={status === "" ? "Select status" : status}
                className="mt-1"
              />
              <Dropdown
                options={ORDER_STATUS_OPTIONS}
                onSelect={handleStatusSelect}
                placeholder={status === "" ? "Select status" : status}
                className="mt-1"
              />  
              

              <DateInput
              label="Select Date:"
                selectedDate={selectedDate}
                onChange={setSelectedDate}
              />
            </div>
          </div>
          <div className="flex items-end gap-2 flex-row">
            {/* <Button
              label={
                <div className="flex items-center gap-2">
                  <span>New Pending to pay</span>
                  <FaPlus className="w-4 h-4" />
                </div>
              }
              className="bg-[#a01217] text-white hover:bg-[#8b0f14] transition-colors p-2 w-fit h-fit"
              onClick={() => router.push("/finance/pending-to-pay/create")}
            /> */}
            <Button
              label={
                <div className="flex items-center gap-2">
                  <FaFileExcel className="w-4 h-4" />
                  <span>Excel</span>
                </div>
              }
              className="bg-[#a01217] text-white hover:bg-[#8b0f14] transition-colors p-2 w-fit h-fit"
              onClick={handleExportExcel}
            />
          </div>
        </div>
      </form>
      <DynamicTable
        data={status === "" && description === "" ? pendingToPay : filteredData}
        columns={TABLE_COLUMNS}
        actionIcons={{
          icon1: <FaEye className="w-5 h-5" />,
          icon2: <FaRegCheckCircle className="w-5 h-5" />,
          icon3: <FaTimes className="w-5 h-5" />,
        }}
      />
    </main>
  );
}
