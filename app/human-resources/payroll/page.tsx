'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import DynamicTable from '@/components/DynamicTable';
import * as XLSX from 'xlsx';
import { FaSearch } from 'react-icons/fa';

const columns = [
  { key: 'select', label: '', type: 'checkbox' },
  { key: 'name', label: 'Employee Name', type: 'text' },
  { key: 'baseSalary', label: 'Base Salary', type: 'text' },
  { key: 'deductions', label: 'Deductions', type: 'text' },
  { key: 'workedHours', label: 'Worked Hours', type: 'text' }, // Added column
  { key: 'netPayment', label: 'Net Payment', type: 'text' },
  { key: 'payPeriod', label: 'Pay Period', type: 'text' },
  { key: 'paymentDate', label: 'Payment Date', type: 'text' },
];

type PayrollRow = {
  id: string;
  employeeId: number;
  name: string;
  baseSalary: string;
  deductions: string;
  workedHours: string; // Added field
  netPayment: string;
  payPeriod: string;
  paymentDate: string;
};

export default function PayrollPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]); // changed from number[] to string[]
  const [payrollData, setPayrollData] = useState<PayrollRow[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchText, setSearchText] = useState('');

  const fetchPayrollData = async () => {
    if (!fromDate || !toDate) return;

    // Fetch payroll data (which already includes workedHours)
    const payrollRes = await fetch(`/api/payroll/data?from=${fromDate}&to=${toDate}`);
    const payrollRaw = await payrollRes.json();

    const today = new Date().toISOString().split('T')[0];

    const processed: PayrollRow[] = payrollRaw.map((emp: any) => {
      const base = Number(emp.baseSalary) || 0;
      const ded = Number(emp.deductions) || 0;
      const net = base - ded;
      return {
        id: String(emp.employeeId),
        employeeId: emp.employeeId,
        name: emp.name,
        baseSalary: emp.baseSalary,
        deductions: emp.deductions,
        workedHours: emp.workedHours, // Use value from API
        netPayment: net.toFixed(2),
        payPeriod: `${fromDate} to ${toDate}`,
        paymentDate: today,
      };
    });

    setPayrollData(processed);
  };

  const filteredData = payrollData.filter((row) =>
    row.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const exportToExcel = () => {
    const dataToExport = filteredData.map(row => ({
      'Employee Name': row.name,
      'Base Salary': row.baseSalary,
      'Deductions': row.deductions,
      'Worked Hours': row.workedHours, // Add to export
      'Net Payment': row.netPayment,
      'Pay Period': row.payPeriod,
      'Payment Date': row.paymentDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll');
    XLSX.writeFile(workbook, 'payroll.xlsx');
  };

  return (
    <div className="min-h-screen bg-[#ecebeb] p-6 space-y-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#a01217]">Payroll</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2">
            <FaSearch className="w-4 h-4 text-[#a01217]" />
            <input
              type="text"
              placeholder="Search employee"
              className="border border-gray-300 rounded px-2 py-1 w-64"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <Button label="Load Payroll" onClick={fetchPayrollData} />
          <Button label="Export CSV" onClick={exportToExcel} />
        </div>
      </div>

      {(!fromDate || !toDate || payrollData.length === 0) ? (
        <div className="text-center text-gray-600 py-10 text-lg">
          Please select payment dates and press Load Payroll
        </div>
      ) : (
        <DynamicTable
          data={filteredData}
          columns={columns}
          onSelectedRowsChange={(ids) => setSelectedIds(ids)}
        />
      )}

      {selectedIds.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button
            label={`Generate Payroll for ${selectedIds.length} selected`}
            className="bg-green-600 text-white"
            onClick={() => alert('Coming soon...')}
          />
        </div>
      )}
    </div>
  );
}
