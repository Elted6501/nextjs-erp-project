"use client";
import { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";

type ColumnConfig = {
  key: string;
  label: string;
  type: "text" | "checkbox" | "switch" | "action" | string;
};

type FilteredProducts = {
  select: true,
        id: string,
        product_id: string,
        warehouse_id: string,
        name: string,
        description: string,
        sku: string,
        category_id: string,
        brand: string,
        measure_unit: string,
        cost_price: string,
        sale_price: string,
        active: boolean,
        stock: string,
}

type RowData = {
  id: string;
  select?: boolean;
  active?: boolean;
  [key: string]: string | boolean | number | undefined;
};

type Props = {
  data: RowData[] | FilteredProducts[];
  columns: ColumnConfig[];
  onSelectedRowsChange?: (selectedIds: string[]) => void;
  onDataChange?: (updatedData: RowData[]) => void;
  actionHandlers?: {
    onView?: (rowId: string) => void;
    onEdit?: (rowId: string) => void;
    onAccept?: (rowId: string) => void;
    onCancel?: (rowId: string) => void;
    onDelete?: (rowId: string) => void;
  };
  actionIcons?: {
    icon1?: React.ReactNode;
    icon2?: React.ReactNode;
    icon3?: React.ReactNode;
  };
};

export default function DynamicTable({
  data: initialData,
  columns,
  onSelectedRowsChange,
  onDataChange,
  actionHandlers,
  actionIcons,
}: Props) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [data, setData] = useState<RowData[]>(initialData);

  useEffect(() => {
  setData(initialData);
}, [initialData]);

  const toggleRow = (rowId: string) => {
    const updated = selectedRows.includes(rowId)
      ? selectedRows.filter((id) => id !== rowId)
      : [...selectedRows, rowId];

    setSelectedRows(updated);
    if (onSelectedRowsChange) onSelectedRowsChange(updated);
  };

  const toggleActive = (rowId: string) => {
    const newData = data.map((row) => {
      if (row.id === rowId) {
        return { ...row, active: !row.active };
      }
      return row;
    });
    setData(newData);
    if (onDataChange) onDataChange(newData);
  };

  const router = useRouter();

  if (!data || data.length === 0) {
  return (
    <div>
    <table className="min-w-full border border-black bg-transparent text-black rounded-lg overflow-hidden">
      <thead>
        <tr className="bg-[#a01217] text-white">
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-4 py-2 text-left border-b border-black"
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
     </table> 
    <div className="flex justify-center items-center h-64 w-full">
      <span className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#a01217]" />
    </div>
    </div>
    );
  }

  return (
    <table className="min-w-full border border-black bg-transparent text-black rounded-lg overflow-hidden">
      <thead>
        <tr className="bg-[#a01217] text-white">
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-4 py-2 text-left border-b border-black"
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => {
          const isSelected = selectedRows.includes(row.id);

          return (
            <tr
              key={idx}
              className={`border-b border-black transition-all ${
                isSelected ? "bg-black/10" : "hover:bg-black/10"
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-2">
                  {col.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(row.id)}
                      className="w-5 h-5 accent-red-600"
                    />
                  ) : col.type === "switch" ? (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!row.active}
                        onChange={() => toggleActive(row.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-black after:border after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:bg-[#a01217]"></div>
                    </label>
                  ) : col.type === "action" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          actionHandlers?.onView?.(row.id) ??
                          router.push("/finance/pending-to-pay/" + row.id)
                        }
                        className="p-2 text-[#a01217] bg-[#a0121722] rounded-full hover:bg-[#a0121744]"
                      >
                        {actionIcons?.icon1 ?? <FaEye className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() =>
                          actionHandlers?.onAccept?.(row.id) ??
                          alert(`Editar fila ${row.id}`)
                        }
                        className="p-2 text-[#a01217] bg-[#a0121722] rounded-full hover:bg-[#a0121744]"
                      >
                        {actionIcons?.icon2 ?? <FaEdit className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() =>
                          actionHandlers?.onCancel?.(row.id) ??
                          alert(`Eliminar fila ${row.id}`)
                        }
                        className="p-2 text-[#a01217] bg-[#a0121722] rounded-full hover:bg-[#a0121744]"
                      >
                        {actionIcons?.icon3 ?? <FaTrash className="w-5 h-5" />}
                      </button>
                    </div>
                  ) : (
                    row[col.key]
                  )}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
