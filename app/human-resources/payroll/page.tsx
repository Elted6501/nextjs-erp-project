'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import DynamicTable from '@/components/DynamicTable';

const employees = [
  { label: 'Alice Johnson', value: '1' },
  { label: 'Bob Martinez', value: '2' },
  { label: 'Charlie Smith', value: '3' },
];

const dummyPayroll = [
  {
    id: '1',
    employeeName: 'Alice Johnson',
    baseSalary: '$2,500',
    bonuses: '$200',
    deductions: '$50',
    payPeriod: '2024-06-01 to 2024-06-15',
    paymentDate: '2024-06-16',
  },
  {
    id: '2',
    employeeName: 'Bob Martinez',
    baseSalary: '$2,000',
    bonuses: '$150',
    deductions: '$30',
    payPeriod: '2024-06-01 to 2024-06-15',
    paymentDate: '2024-06-16',
  },
  {
    id: '3',
    employeeName: 'Charlie Smith',
    baseSalary: '$2,200',
    bonuses: '$100',
    deductions: '$20',
    payPeriod: '2024-06-01 to 2024-06-15',
    paymentDate: '2024-06-16',
  },
];

const columns = [
  { key: 'select', label: '', type: 'checkbox' },
  { key: 'employeeName', label: 'Employee Name', type: 'text' },
  { key: 'baseSalary', label: 'Base Salary', type: 'text' },
  { key: 'bonuses', label: 'Bonuses', type: 'text' },
  { key: 'deductions', label: 'Deductions', type: 'text' },
  { key: 'payPeriod', label: 'Pay Period', type: 'text' },
  { key: 'paymentDate', label: 'Payment Date', type: 'text' },
];

export default function PayrollPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [payroll] = useState(dummyPayroll);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });


  interface PayrollItem {
    id: string;
    employeeName: string;
    baseSalary: string;
    bonuses: string;
    deductions: string;
    payPeriod: string;
    paymentDate: string;
  }

  // Render action buttons for each row
  const renderActions = (row: PayrollItem) => (
    <div className="flex gap-2">
      <Button
        label="Download Payslip"
        onClick={() => alert(`Download payslip for: ${row.employeeName}`)}
        className="bg-blue-600 text-white px-2 py-1 rounded"
      />
      <Button
        label="View History"
        onClick={() => alert(`View payroll history for: ${row.employeeName}`)}
        className="bg-gray-600 text-white px-2 py-1 rounded"
      />
      <Button
        label="Recalculate"
        onClick={() => alert(`Recalculate payroll for: ${row.employeeName}`)}
        className="bg-yellow-500 text-white px-2 py-1 rounded"
      />
    </div>
  );


  // Adapt columns for DynamicTable
  const tableColumns = columns.map(col =>
    col.key === 'actions'
      ? { ...col, render: renderActions }
      : col
  );

  return (
    <div className="min-h-screen bg-[#ecebeb] p-6 space-y-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#a01217]">Payroll</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <Dropdown
            options={employees}
            placeholder="Filter by employee"

          />
          <input
            type="date"
            value={dateRange.from}
            onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
            className="border rounded px-2 py-1"
            placeholder="From"
          />
          <span>-</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
            className="border rounded px-2 py-1"
            placeholder="To"
          />
          <Button label="Clear Filters" onClick={() => alert('Llama a la funcion clear filters')} />
          <Button label="Generate Payroll" onClick={() => alert('Generate Payroll')} />
        </div>
      </div>

      <DynamicTable
        data={payroll}
        columns={tableColumns}
        onSelectedRowsChange={setSelectedIds}
      />

      {selectedIds.length > 0 && (
        <div className="flex justify-end">
          <Button
            label={`Download Payslip (${selectedIds.length})`}
            className="bg-blue-600 text-white"
            onClick={() => alert(`Download payslips for: ${selectedIds.join(', ')}`)}
          />
        </div>
      )}
    </div>
  );
}