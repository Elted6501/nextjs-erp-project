'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import DynamicTable from '@/components/DynamicTable';
import styles from './page.module.css';

const columns = [
  { key: 'select', label: '', type: 'checkbox' },
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'brand', label: 'Brand', type: 'text' },
  { key: 'stock', label: 'Quantity', type: 'text' },
  { key: 'sale_price', label: 'Price', type: 'text' },
  { key: 'active', label: 'Active', type: 'switch' },
];

export default function InventoryPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tableData, setTableData] = useState([]);
  const [warehouseList, setWarehouseList] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [productTypeList, setProductTypeList] = useState([]);

  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);


  const [currentPage, setCurrentPage] = useState(1);

  interface FilteredProducts {
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

  const [filteredData, setFilteredData] = useState<FilteredProducts[]>([]);

  useEffect(() => {
    fetch('/api/inventory/warehouses')
      .then(res => res.json())
      .then(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const warehouse_list = data.map((item: any) => ({
            warehouse_id: item.warehouse_id,
            label: item.name,
            value: item.warehouse_id.toString()
          }));
          setWarehouseList(warehouse_list);
        }
      );
  }, []);

  useEffect(() => {
    fetch('/api/inventory/product_type')
      .then(res => res.json())
      .then(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const category_list = data.map((item: any) => ({
            category_id: item.category_id,
            label: item.name,
            value: item.category_id.toString()
          }));
          setProductTypeList(category_list);
        }
      );
  }, []);

  useEffect(() => {
    fetch('/api/inventory/suppliers')
      .then(res => res.json())
      .then(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const suppliers_list = data.map((item: any) => ({
            supplier_id: item.supplier_id,
            label: item.name,
            value: item.supplier_id.toString()
          }));
          setSuppliersList(suppliers_list);
        }
      );
  }, []);

  useEffect(() => {
    fetch('/api/inventory/products')
      .then(res => res.json())
      .then(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const transformed = data.map((item: any) => ({
            select: true,
            id: item.product_id.toString(),
            product_id: item.product_id,
            warehouse_id: item.warehouse_id,
            name: item.name,
            description: item.description,
            sku: item.sku,
            category_id: item.category_id,
            brand: item.brand,
            measure_unit: item.measure_unit,
            cost_price: item.cost_price,
            sale_price: item.sale_price,
            active: item.active,
            stock: item.stock,
            supplier_id: item.supplier_id,
          }));
          setTableData(transformed);
        }
      );
  }, []);

  useEffect(() => {
    let filtered = [...tableData];

    if (selectedWarehouse) {
      filtered = filtered.filter(item => item['warehouse_id'] === Number(selectedWarehouse));
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item['category_id'] === Number(selectedCategory));
    }

    if (selectedSupplier) {
      filtered = filtered.filter(item => item['supplier_id'] === Number(selectedSupplier));
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [selectedWarehouse, selectedCategory, selectedSupplier, tableData]);

  return (
    <div className="flex">
      <div className={`flex flex-col flex-1 ${styles.contentBackground}`}>
        <h1 className="text-2xl font-bold mb-4 text-black">Inventory Module</h1>
        <div className="flex gap-4 mb-6">
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
              setCurrentPage(1);
            }}
          />
        </div>

        <DynamicTable
          data={filteredData}
          columns={columns}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onSelectedRowsChange={(ids) => setSelectedIds(ids)}
        />

        <div className="mt-4 flex flex-wrap gap-4">
          <Button
            label="Remove"
            onClick={() => {
              console.log('IDs seleccionados para eliminar:', selectedIds);
              alert('Eliminar: ' + selectedIds.join(', '));
            }}
          />
          <Button label="Register product" onClick={() => alert('Register product')} />
          <Button label="Register entry" onClick={() => alert('Register entry')} />
          <Button label="Change warehouse" onClick={() => alert('Change warehouse')} />
        </div>
      </div>
    </div>
  );
}
