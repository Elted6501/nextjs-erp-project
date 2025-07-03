import { useEffect } from "react";

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

export function useProductMovements(

  setTableData: (data: FilteredProducts[]) => void,
  tableData: FilteredProducts[],
  selectedWarehouse: string | null,
  selectedCategory: string | null,
  selectedSupplier: string | null,
  setFilteredByDropdown: (data: FilteredProducts[]) => void,
  setFilteredData: (data: FilteredProducts[]) => void,
  setCurrentPage: (page: number) => void,
  setWarehouseList: (list: Option[]) => void,
  setProductTypeList: (list: Option[]) => void,
  setSuppliersList: (list: Option[]) => void,
  inputValue: string,
  filteredByDropdown: FilteredProducts[],
  selectedIds: string[],
  setShowRemove: (show: boolean) => void,
  productState: { id: string; active: boolean }[],
  shouldDelete: boolean,
  setSelectedIds: (ids: string[]) => void,
  setShouldDelete: (show: boolean) => void,
  setWarehouseOptions: (options: {label: string, value: string}[]) => void,
  setSupplierOptions: (options: {label: string, value: string}[]) => void,
  setCategoryOptions: (options: {label: string, value: string}[]) => void
  /* setWarehouseApiList: (list: string[]) => void,
  setCategoryApiList: (list: string[]) => void,
  setSupplierApiList: (list: string[]) => void */

) {
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
            name: item.name,
            description: item.description,
            sku: item.sku,
            brand: item.brand,
            measure_unit: item.measure_unit,
            cost_price: item.cost_price,
            sale_price: item.sale_price,
            active: item.active,
            stock: item.stock,
            supplier_id: item.supplier_id,
            supplier_name: item.supplier_name,
            warehouse_id: item.warehouse_id,
            warehouse_name: item.warehouse_name,
            category_id: item.category_id,
            category_name: item.category_name
          }));
          setTableData(transformed);
        }
      );
  }, [setTableData]);

  // Dentro de useProductMovements, después del primer useEffect
useEffect(() => {
  // Obtener warehouses
  fetch('/api/inventory/warehouses')
    .then(res => res.json())
    .then(data => {
      const options = data.map((item: any) => ({
        label: item.name,
        value: item.warehouse_id.toString()
      }));
      setWarehouseOptions(options);
    });

  // Obtener suppliers
  fetch('/api/inventory/suppliers')
    .then(res => res.json())
    .then(data => {
      const options = data.map((item: any) => ({
        label: item.name,
        value: item.supplier_id.toString()
      }));
      setSupplierOptions(options);
    });

  // Obtener categories
  fetch('/api/inventory/categories')
    .then(res => res.json())
    .then(data => {
      const options = data.map((item: any) => ({
        label: item.name,
        value: item.category_id.toString()
      }));
      setCategoryOptions(options);
    });
}, [setWarehouseOptions, setSupplierOptions, setCategoryOptions]);

  /* useEffect(() => {
    fetch('/api/inventory/warehouses')
    .then(res => res.json())
    .then(
        (data) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const transformed = data.map((item: any) => ({
            warehouse_id: item.warehouse_id,
            name: item.name
          }));
          setWarehouseApiList(transformed);
        }
    )
  },[setWarehouseApiList]);

  useEffect(() => {
    fetch('/api/inventory/category')
    .then(res => res.json())
    .then(
        (data) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const transformed = data.map((item: any) => ({
            category_id: item.category_id,
            name: item.name
          }));
          setCategoryApiList(transformed);
        }
    )
  },[setCategoryApiList]);

  useEffect(() => {
    fetch('/api/inventory/suppliers')
    .then(res => res.json())
    .then(
        (data) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const transformed = data.map((item: any) => ({
            supplier_id: item.supplier_id,
            name: item.name
          }));
          setSupplierApiList(transformed);
        }
    )
  },[setSupplierApiList]); */

  useEffect(() => {
    let filtered = [...tableData];

    if (selectedWarehouse) {
      filtered = filtered.filter(item =>
        item.warehouse_name === selectedWarehouse
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(item =>
        item.category_name === selectedCategory
      );
    }

    if (selectedSupplier) {
      filtered = filtered.filter(item =>
        item.supplier_name === selectedSupplier
      );
    }

    setFilteredByDropdown(filtered);
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [selectedWarehouse, selectedCategory, selectedSupplier, tableData, setFilteredByDropdown, setFilteredData, setCurrentPage]);

  useEffect(() => {
    const warehouses = Array.from(
      new Set(tableData.map(p => p.warehouse_name))
    ).map(name => ({
      label: name,
      value: name,
    }));
    setWarehouseList(warehouses);

    const categories = Array.from(
      new Set(tableData.map(p => p.category_name))
    ).map(name => ({
      label: name,
      value: name,
    }));
    setProductTypeList(categories);

    const suppliers = Array.from(
      new Set(tableData.map(p => p.supplier_name))
    ).map(name => ({
      label: name,
      value: name,
    }));
    setSuppliersList(suppliers);
  }, [setProductTypeList, setSuppliersList, setWarehouseList, tableData]);

  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredData(filteredByDropdown);
      return;
    }

    const query = inputValue.toLowerCase();
    const result = tableData.filter(item =>
      item.name.toLowerCase().includes(query)
    );

    setFilteredData(result);
    setCurrentPage(1);
  }, [inputValue, tableData, filteredByDropdown, setFilteredData, setCurrentPage]);

  useEffect(() => {

    console.log("Cantidad de ids seleccionadas: " + selectedIds.length);


    if (selectedIds.length > 0) {
      setShowRemove(true);
    } else {
      setShowRemove(false);
    }
  }, [selectedIds, setShowRemove]);

  useEffect(() => {
    if (productState.length === 0) return;

    const updateActiveStatus = async () => {
      try {
        const res = await fetch('/api/inventory/update-active', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productState),
        });

        const result = await res.json();

        if (result.success) {
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
                  name: item.name,
                  description: item.description,
                  sku: item.sku,
                  brand: item.brand,
                  measure_unit: item.measure_unit,
                  cost_price: item.cost_price,
                  sale_price: item.sale_price,
                  active: item.active,
                  stock: item.stock,
                  supplier_id: item.supplier_id,
                  supplier_name: item.supplier_name,
                  warehouse_id: item.warehouse_id,
                  warehouse_name: item.warehouse_name,
                  category_id: item.category_id,
                  category_name: item.category_name
                }));
                setTableData(transformed);
              }
            );
        } else {
          console.error("Error updating products", result.errors);
        }
      } catch (error) {
        console.error("Error calling API", error);
      }
    };
    updateActiveStatus();
  }, [productState, setTableData]);

  useEffect(() => {
    if (!shouldDelete || selectedIds.length === 0) return;

    const removeProduct = async () => {
      try {
        const res = await fetch('/api/inventory/remove-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedIds),
        });
        const result = await res.json();
        if (result.success) {
          const res = await fetch('/api/inventory/products');
          const data = await res.json();

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const transformed = data.map((item: any) => ({
            select: true,
            id: item.product_id.toString(),
            product_id: item.product_id,
            name: item.name,
            description: item.description,
            sku: item.sku,
            brand: item.brand,
            measure_unit: item.measure_unit,
            cost_price: item.cost_price,
            sale_price: item.sale_price,
            active: item.active,
            stock: item.stock,
            supplier_id: item.supplier_id,
            supplier_name: item.supplier_name,
            warehouse_id: item.warehouse_id,
            warehouse_name: item.warehouse_name,
            category_id: item.category_id,
            category_name: item.category_name
          }));

          setTableData(transformed);
          setSelectedIds([]);
          setShouldDelete(false);
        } else {
          console.error("Error updating products", result.errors);
        }
      } catch (error) {
        console.error("Error calling API", error);
      }
    };

    removeProduct();
  }, [selectedIds, setSelectedIds, setShouldDelete, setTableData, shouldDelete]);
}