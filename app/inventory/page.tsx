'use client';

import { useState} from 'react';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import DynamicTable from '@/components/DynamicTable';
import AlertDialog from '@/components/AlertDialog';
import styles from './page.module.css';
import { GoAlertFill } from "react-icons/go";
import { FaSearch } from "react-icons/fa";
import DynamicFormModal from '@/components/DynamicFormModal';
import { Field } from '@/components/DynamicFormModal';
import { useProductMovements } from './hooks/useProductMovements';

const columns = [
  { key: 'select', label: '', type: 'checkbox' },
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'brand', label: 'Brand', type: 'text' },
  { key: 'warehouse_name', label: 'Warehouse', type: 'text' },
  { key: 'supplier_name', label: 'Supplier', type: 'text' },
  { key: 'category_name', label: 'Type', type: 'text' },
  { key: 'stock', label: 'Quantity', type: 'text' },
  { key: 'sale_price', label: 'Price', type: 'text' },
  { key: 'active', label: 'Active', type: 'switch' },
];

export default function InventoryPage() {

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [productState, setProductState] = useState<{ id: string; active: boolean }[]>([]);
  const [tableData, setTableData] = useState<FilteredProducts[]>([]);
  const [warehouseList, setWarehouseList] = useState<Option[]>([]);
  const [suppliersList, setSuppliersList] = useState<Option[]>([]);
  const [productTypeList, setProductTypeList] = useState<Option[]>([]);

  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  /* const [warehouseApiList, setWarehouseApiList] = useState<string[] | null>(null);
  const [categoryApiList, setCategoryApiList] = useState<string[] | null>(null);
  const [supplierApiList, setSupplierApiList] = useState<string[] | null>(null); */

  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [shouldDelete, setShouldDelete] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [inputValue, setInputValue] = useState<string>('');
  const [filteredData, setFilteredData] = useState<FilteredProducts[]>([]);
  const [filteredByDropdown, setFilteredByDropdown] = useState<FilteredProducts[]>([]);

  interface FilteredProducts {
    select: boolean;
    id: string;
    product_id: number;
    warehouse_id: number;
    supplier_id: number;
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
  }

  interface Option {
    label: string;
    value: string;
  }

  const productFields = [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'description', label: 'Description', type: 'text' },
    { name: 'brand', label: 'Brand', type: 'text' },
    { name: 'warehouse_name', label: 'Warehouse', type: 'select', options: warehouseList },
    { name: 'supplier_name', label: 'Supplier', type: 'select', options: suppliersList },
    { name: 'category_name', label: 'Type', type: 'select', options: productTypeList },
    { name: 'measure_unit', label: 'Measure Unit', type: 'select', options: [{ label: 'piece', value: 'piece' }, { label: 'liter', value: 'liter' }, { label: 'kg', value: 'kg' }] },
    { name: 'cost_price', label: 'Cost Price', type: 'number' },
    { name: 'sale_price', label: 'Sale Price', type: 'number' },
    { name: 'stock', label: 'Quantity', type: 'number' },
    { name: 'active', label: 'Active', type: 'switch' },
  ] satisfies Field[];

  useProductMovements(
    setTableData,
    tableData,
    selectedWarehouse,
    selectedCategory,
    selectedSupplier,
    setFilteredByDropdown,
    setFilteredData,
    setCurrentPage,
    setWarehouseList,
    setProductTypeList,
    setSuppliersList,
    inputValue,
    filteredByDropdown,
    selectedIds,
    setShowRemove,
    productState,
    shouldDelete,
    setSelectedIds,
    setShouldDelete,
    /* setWarehouseApiList,
    setCategoryApiList,
    setSupplierApiList */
  )
  
  return (
    <div className="flex">
      <div className={`flex flex-col flex-1 ${styles.contentBackground}`}>
        <h1 className="text-2xl font-bold mb-4 text-black">Inventory Module</h1>
        <div className="flex gap-4 mb-6">
          {
            showAlertDialog && (
              <AlertDialog
                title='alerta'
                icon={<GoAlertFill className="w-10 h-10" />}
                content='¿Está seguro que quiere eliminar el siguiente producto de la base de datos?'
                onSuccess={() => {
                  setShouldDelete(true);
                  setShowAlertDialog(false);
                }}
                onCancel={() => setShowAlertDialog(false)}
              />
            )
          }
          <Dropdown
            options={warehouseList}
            placeholder="Select Warehouse"
            onSelect={value => setSelectedWarehouse(value)}
            value={selectedWarehouse}
          />
          <Dropdown
            options={productTypeList}
            placeholder="Select Product Type"
            onSelect={value => setSelectedCategory(value)}
            value={selectedCategory}
          />
          <Dropdown
            options={suppliersList}
            placeholder="Select Supplier"
            onSelect={value => setSelectedSupplier(value)}
            value={selectedSupplier}
          />
          <Button
            label="Clear Filters"
            onClick={() => {
              setSelectedWarehouse(null);
              setSelectedCategory(null);
              setSelectedSupplier(null);
              setInputValue('');
              setCurrentPage(1);
            }}
          />
          <div className="flex items-center gap-2">
            <label className="text-[#8b0f14] font-bold">
              Search:
            </label>
            <input
              type="text"
              placeholder="Search by name"
              className="border border-gray-300 rounded px-2 py-1 w-64"
              value={inputValue}
              onFocus={() => {
                setSelectedWarehouse(null);
                setSelectedCategory(null);
                setSelectedSupplier(null);
              }}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
            />
            <Button
              label={
                <div className="flex items-center gap-2">
                  <FaSearch className="w-4 h-4" />
                </div>
              }
              className="bg-[#a01217] text-white hover:bg-[#8b0f14] transition-colors p-2 w-fit h-fit"
              onClick={() => { }}
            />
          </div>
        </div>

        <DynamicTable
          data={filteredData}
          columns={columns}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onSelectedRowsChange={ids => setSelectedIds(ids)}
          onActiveChange={(states) => setProductState(states)}
        />

        <div className="mt-4 flex flex-wrap gap-4">
          {showRemove && (
            <Button
              label="Remove"
              onClick={() => {
                setShowAlertDialog(true);
              }}
            />
          )}
          <Button label="Register product" onClick={() => setShowProductModal(true)} />
          <Button label="Register entry" onClick={() => alert('Register entry')} />
          <Button label="Change warehouse" onClick={() => alert('Change warehouse')} />
        </div>
        {showProductModal && (
          <DynamicFormModal
            title="Register New Product"
            isOpen={showProductModal}
            onClose={() => setShowProductModal(false)}
            fields={productFields}
            onSubmit={(data) => {
              console.log("Form submitted with:", data);
            }}
          />
        )}
      </div>
    </div>
  );
}
