"use client";
import { useState } from "react";

type ColumnConfig = {
  key: string;
  label: string;
  type?: "text" | "checkbox" | "switch" | "action" | "string";
};

type RowData = {
  id: string;
  select?: boolean;
  active?: boolean;
  [key: string]: string | boolean | number | undefined;
};

type Props = {
  data: RowData[];
  columns: ColumnConfig[];
  onSelectedRowsChange?: (selectedIds: string[]) => void;
  onDataChange?: (updatedData: RowData[]) => void; // opcional para subir cambios de active
};

export default function DynamicTable({ data: initialData, columns, onSelectedRowsChange, onDataChange }: Props) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [data, setData] = useState<RowData[]>(initialData);

  const toggleRow = (rowId: string) => {
    const updated = selectedRows.includes(rowId)
      ? selectedRows.filter(id => id !== rowId)
      : [...selectedRows, rowId];

    setSelectedRows(updated);
    if (onSelectedRowsChange) onSelectedRowsChange(updated);
  };

  const toggleActive = (rowId: string) => {
    const newData = data.map(row => {
      if (row.id === rowId) {
        return { ...row, active: !row.active };
      }
      return row;
    });
    setData(newData);
    if (onDataChange) onDataChange(newData);
  };

  return (
    <table className="min-w-full border border-black bg-transparent text-black rounded-lg overflow-hidden">
      <thead>
        <tr className="bg-[#a01217] text-white">
          {columns.map((col) => (
            <th key={col.key} className="px-4 py-2 text-left border-b border-black">{col.label}</th>
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
                isSelected
                  ? "bg-black/10"
                  : "hover:bg-black/10"
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
