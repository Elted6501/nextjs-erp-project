// app/employees/page.tsx
'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import DynamicTable from '@/components/DynamicTable';
import DynamicFormModal, { Field } from '@/components/DynamicFormModal';

interface Employee {
  [key: string]: string | boolean;
  id: string;
  fullName: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hireDate: string;
  active: boolean;
}

const dummyEmployees: Employee[] = [
  {
    id: '1',
    fullName: 'Alice Johnson',
    position: 'Software Engineer',
    department: 'IT',
    email: 'alice@example.com',
    phone: '555-1234',
    hireDate: '2022-01-15',
    active: true,
  },
  {
    id: '2',
    fullName: 'Bob Martinez',
    position: 'HR Manager',
    department: 'HR',
    email: 'bob@example.com',
    phone: '555-5678',
    hireDate: '2020-07-10',
    active: false,
  },
];

const columnConfig = [
  { key: 'select', label: '', type: 'checkbox' },
  { key: 'fullName', label: 'Full Name', type: 'text' },
  { key: 'position', label: 'Position', type: 'text' },
  { key: 'department', label: 'Department', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'phone', label: 'Phone', type: 'text' },
  { key: 'hireDate', label: 'Hire Date', type: 'text' },
  { key: 'active', label: 'Active', type: 'switch' },
];

export default function EmployeesPage() {
  const [employees] = useState(dummyEmployees);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const [showModal, setShowModal] = useState(false);
  const [fieldsData,setFieldsData] = useState<string[]>([]);
  const [modalTitle, setModalTitle] = useState('')

    const fields: Field[] = fieldsData.map((item) => ({
    name: item.toLowerCase(),
    label: item,
    type: 'text',
  }));

    const handleOpenModal = (fieldArray: string[], title: string) => {
      setFieldsData(fieldArray);      // actualizas los campos a mostrar
      setModalTitle(title);
      setShowModal(true);         // abres el modal
  };

  const updateArray = ["Position", "Department", "Email", "Phone","Password"]
  const addArray = ["Name","Lastname","Position","Department","Email","Phone", "Password"]


/* useEffect(() => {
  if(showModal == false){
    setShowModal(true);
  }else{
    setShowModal(false);
  }
  
}, []) */

  return (
    <div className="min-h-screen bg-[#ecebeb] p-6 space-y-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#a01217]">Employees</h1>
        <div className="flex gap-2 items-center">
          { showModal && (
            <DynamicFormModal
              title={modalTitle}
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              fields= {fields}
              onSubmit={() => alert("info submitted")}
            />
          )}
          <Dropdown
            options={[
              { label: 'All Departments', value: 'all' },
              { label: 'IT', value: 'it' },
              { label: 'HR', value: 'hr' },
            ]}
            placeholder="Filter by Department"
          />
          <Dropdown
            options={[
              { label: 'All Statuses', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
            placeholder="Filter by Status"
          />
          <Button label="Add Employee" onClick={() => handleOpenModal(addArray,'Add Employee')} />
        </div>
      </div>

      <DynamicTable
        data={employees}
        columns={columnConfig}
        onSelectedRowsChange={handleSelectionChange}
      />

      {selectedIds.length > 0 && (
        <div className="flex justify-end">
          <Button
            label={`Delete (${selectedIds.length})`}
            className="bg-black hover:opacity-80 text-white mx-2"
            onClick={() => alert(`Delete users: ${selectedIds.join(', ')}`)}
          />
          <Button
            label={`Update (${selectedIds.length})`}
            className="bg-black hover:opacity-80 text-white mx-2"
            onClick={() => {
              handleOpenModal(updateArray,'Update Employee')
              
            }}
          />
        </div>
      )}
    </div>
  );
}