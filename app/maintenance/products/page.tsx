'use client'
import BlockInformation from '@/components/Maintenance/BlockInformation'
import ListProducts from '@/components/Maintenance/ListProducts'
import { ProductsType } from '@/Types/Maintenance/schedule'
import { ShoppingCart, Trash } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const Products = () => {
  const [products, setProducts] = useState<ProductsType[]>([]);
  const [prod, setProd] = useState<ProductsType[]>();
  const [Quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    fetch("../api/inventory/products")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setProd(data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className='w-full h-full flex pt-13 items-center flex-col'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 min-w-1/2'>
        <BlockInformation icon='Products' text='Products Available' value={prod?.length ?? 0} />
        <BlockInformation icon='Cart' text='Products Added' value={products} />
      </div>

      <div className='min-w-1/2 max-w-1/2 grid grid-cols-2 gap-4 justify-center mb-6'>
        <div className='w-full'>
          <ListProducts prods={prod ?? []} products={products} Quantity={Quantity} setProducts={setProducts}></ListProducts>
        </div>

        <div className='w-full flex items-center gap-4'>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            required
            value={Quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            placeholder="1"
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
        </div>

      </div>
      {
        products.length > 0 ? (
          <table className="max-w-1/2">
            <thead style={{ background: 'linear-gradient(#a01217 0% 50%, #880f14 100%)' }}>
              <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="px-6 py-4 text-white">Product</th>
                <th className="px-6 py-4 text-white">Sku</th>
                <th className="px-6 py-4 text-white">Cost</th>
                <th className="px-6 py-4 text-white text-center">Sale Price</th>
                <th className="px-6 py-4 text-white text-right">Quantity</th>
                <th className="px-6 py-4 text-white text-right">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <ShoppingCart size={48} className="text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">Your cart is empty</p>
                      <p className="text-gray-400 text-sm">Add products to start a sale</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{row.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="text-sm text-gray-500 font-mono">{row.sku}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.cost_price}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{row.sale_price}</td>

                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {row.quantity}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      <button className='hover:cursor-pointer' onClick={()=>setProducts((values) => values.filter(item => item.product_id !== row.product_id))}>
                        <Trash/>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : <></>
      }
    </div>
  )
}

export default Products