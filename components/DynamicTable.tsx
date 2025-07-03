"use client";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

type ColumnConfig = {
  key: string;
  label: string;
  type: string;
};

type FilteredProducts = {
  select: boolean;
  id: string;
  product_id: number;
  warehouse_id: number;
  name: string;
  description: string;
  sku: string;
  category_id: number;
  brand: string;
  measure_unit: string;
  cost_price: number;
  sale_price: number;
  active: boolean;
  stock: number;
  supplier_name: string;
  warehouse_name: string;
  category_name: string;
};

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
  onActiveChange?: (activeStates: { id: string; active: boolean }[]) => void;
  onDataChange?: (updatedData: RowData[]) => void;
  currentPage?: number;
  onPageChange?: Dispatch<SetStateAction<number>>;
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
  actions?: {
    view?: boolean;
    accept?: boolean;
    cancel?: boolean;
  };
};

export default function DynamicTable({
  data: initialData,
  columns,
  onSelectedRowsChange,
  onActiveChange,
  onDataChange,
  actionHandlers,
  actionIcons,
  actions = {
    view: true,
    accept: true,
    cancel: true,
  },
}: Props) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isActive, setIsActive] = useState<boolean | undefined>();
  const [data, setData] = useState<RowData[]>(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    console.log("el estado es: " + isActive);
  }, [isActive]);

  const toggleRow = (rowId: string) => {
    const updated = selectedRows.includes(rowId) ? selectedRows.filter((id) => id !== rowId) : [...selectedRows, rowId];

    setSelectedRows(updated);
    if (onSelectedRowsChange) onSelectedRowsChange(updated);
  };

  const toggleActive = (rowId: string) => {
    const newData = data.map((row) => {
      if (row.id === rowId) {
        const newActive = !row.active;
        setIsActive(newActive);
        return { ...row, active: newActive };
      }
      return row;
    });

    setData(newData);
    if (onDataChange) onDataChange(newData);

    const changedRow = newData.find((row) => row.id === rowId);
    if (onActiveChange && changedRow) {
      onActiveChange([{ id: rowId, active: changedRow.active as boolean }]);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div>
        <table className="min-w-full border border-black bg-transparent text-black rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-[#a01217] text-white">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-2 text-left border-b border-black">
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
    <div>
      <table className="min-w-full border border-black bg-transparent text-black rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-[#a01217] text-white">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-2 text-left border-b border-black">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, idx) => {
            const isSelected = selectedRows.includes(row.id);

            return (
              <tr key={idx} className={`border-b border-black transition-all ${isSelected ? "bg-black/10" : "hover:bg-black/10"}`}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2">
                    {col.type === "checkbox" ? (
                      <input type="checkbox" checked={isSelected} onChange={() => toggleRow(row.id)} className="w-5 h-5 accent-red-600" />
                    ) : col.type === "switch" ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={!!row.active} onChange={() => toggleActive(row.id)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-black after:border after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:bg-[#a01217]"></div>
                      </label>
                    ) : col.type === "action" ? (

                      <div className="flex gap-2">

                        {actions.view && (
                          <button
                            onClick={() => actionHandlers?.onView?.(row.id)}
                            className="p-2 text-[#a01217] bg-[#a0121722] rounded-full hover:bg-[#a0121744]"
                          >
                            {actionIcons?.icon1 ?? <FaEye className="w-5 h-5" />}
                          </button>
                        )}

                        {actions.accept && (
                          <button
                            onClick={() => actionHandlers?.onAccept?.(row.id)}
                            className="p-2 text-[#a01217] bg-[#a0121722] rounded-full hover:bg-[#a0121744]"
                          >
                            {actionIcons?.icon2 ?? <FaEdit className="w-5 h-5" />}
                          </button>
                        )}

                        {actions.cancel && (
                          <button
                            onClick={() => actionHandlers?.onCancel?.(row.id)}
                            className="p-2 text-[#a01217] bg-[#a0121722] rounded-full hover:bg-[#a0121744]"
                          >
                            {actionIcons?.icon3 ?? <FaTrash className="w-5 h-5" />}
                          </button>
                        )}
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

      {/* Pagination controls */}
      <div className="flex items-center justify-center mt-4 gap-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded bg-[#a01217] text-white hover:bg-[#7f0e12] disabled:bg-gray-300`}
        >
          ‹
        </button>

        <span className="text-black">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded bg-[#a01217] text-white hover:bg-[#7f0e12] disabled:bg-gray-300`}
        >
          ›
        </button>
      </div>
    </div>
  );
}
