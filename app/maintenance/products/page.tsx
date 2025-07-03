'use client'
import Button from '@/components/Button'
import BlockInformation from '@/components/Maintenance/BlockInformation'
import Inputs from '@/components/Maintenance/Inputs'
import ListProducts from '@/components/Maintenance/ListProducts'
import { MaintenanceType, Mechanic, ProductsType } from '@/Types/Maintenance/schedule'
import { ShoppingCart, Trash } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { getRole } from './getRole'
import { useRouter } from 'next/navigation'

const Products = () => {
  const [products, setProducts] = useState<ProductsType[]>([]);
  const [prod, setProd] = useState<ProductsType[]>();
  const [folioInput, setFolioInput] = useState<string>('');
  const [Quantity, setQuantity] = useState<number>(1);
  const [step, setStep] = useState<number>(0);
  const [maintenance, setMaintenance] = useState<MaintenanceType>();
  const [mechanic, setMechanic] = useState<Mechanic>();
  const [price, setPrice] = useState<number>(0);
  const router = useRouter();

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

  useEffect(() => {
    if (step === 2) {
      const total = products.reduce((acc, p) => {
        const qty = p.quantity ?? 1;
        return acc + p.cost_price * qty;
      }, 0);

      setPrice(total);
    }
  }, [step, products]);


  const handlePurchaseItems = async () => {
    const response = await fetch('../api/inventory/products');
    const data = await response.json();
    if (!data.error) {
      setStep(2);
    }
  }

  useEffect(() => {
    (async () => {
      const response = await getRole();
      setMechanic(response);
    })();
  }, [])

  const handleCheckStatus = async () => {
    if (folioInput.trim() !== "") {
      try {
        const response = await fetch("../api/maintenance/tracking/maintenance?folio=" + folioInput.toString());
        const data = await response.json();

        if (data.error) {
          console.error(data.error);
        } else {
          setMaintenance(data.data[0]);
          setStep(1);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };


  return (
    <>
      {step == 0
        ? (
          <main
            className="min-h-screen px-6 py-10 text-black"
            style={{ backgroundColor: "#ecebeb" }}
          >
            <div className="max-w-2xl mx-auto p-8 rounded-xl shadow space-y-8 border border-gray-200 bg-white">
              <h1 className="text-3xl font-bold text-red-600 text-center">
                Appointment Tracking
              </h1>

              <div className="space-y-4">
                <label className="block text-gray-600 font-medium">
                  Enter your folio
                </label>
                <Inputs placeholder="Ej. ABC123456" setValue={setFolioInput} value={folioInput} title="" />

                <button onClick={handleCheckStatus} className="bg-red-700 text-white px-6 py-3 rounded-lg w-full hover:bg-red-900" >
                  Select Maintenance
                </button>
              </div>
            </div>
          </main>
        ) : step == 1 ? (
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
            <table className="max-w-1/2 mb-10">
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
              {
                products.length > 0 ? (
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
                            <button className='hover:cursor-pointer' onClick={() => setProducts((values) => values.filter(item => item.product_id !== row.product_id))}>
                              <Trash />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                ) : <></>
              }
            </table>
            {products.length > 0 ? <Button label='Purchase Items' className='!pt-4 !pb-4' onClick={handlePurchaseItems} /> : <></>}

          </div>
        ) : (
          <div>
            <div className="flex flex-col items-center space-y-6">
              <h2 className="text-2xl font-bold text-red-700">Summary</h2>
              <div className="bg-white border border-red-400 shadow-md rounded-xl px-6 py-4 max-w-3xl w-full font-mono text-gray-900">
                <div className="grid grid-cols-3 gap-x-8 text-sm font-semibold text-red-600 border-b border-red-200 pb-2 mb-2">
                  <div>Number of Products</div>
                  <div>Mechanic</div>
                  <div>Maintenance Folio</div>
                </div>
                <div className="grid grid-cols-3 gap-x-8 text-sm border-b border-red-100 pb-2 mb-4">
                  <div>{products.length}</div>
                  <div>{mechanic?.first_name} {mechanic?.last_name}</div>
                  <div>{maintenance?.maintenance_folio}</div>
                </div>

                <div className="text-sm font-semibold text-red-600 border-b border-red-200 pb-1 mb-1">
                  Services
                </div>
                <div className="text-sm border-b border-red-100 pb-3 mb-4">
                  {maintenance?.notes.split('.')[1]}
                </div>

                <div className="grid grid-cols-2 gap-x-8 text-sm font-semibold text-red-600 border-b border-red-200 pb-2 mb-2">
                  <div>Total</div>
                  <div>Date & Time</div>
                </div>
                <div className="grid grid-cols-2 gap-x-8 text-sm border-b border-red-100 pb-2 mb-4">
                  <div>{price}</div>
                  <div>
                    {new Date().toLocaleDateString()}
                  </div>
                </div>

                <div className="text-sm font-semibold text-red-600 pb-1">Products</div>
                <div className="text-sm">
                  {products.map(p => p.name).join(',')}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/maintenance')}
                  className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 px-5 py-2 rounded-lg text-white text-sm font-semibold shadow"
                >
                  Finish
                </button>
                <button
                  onClick={() => {
                    const printContents = document.querySelector(
                      "div.bg-white.border"
                    )?.innerHTML;
                    const originalContents = document.body.innerHTML;
                    document.body.innerHTML = printContents ?? "";
                    window.print();
                    document.body.innerHTML = originalContents;
                    window.location.reload();
                  }}
                  className="bg-white border border-red-600 text-red-600 hover:bg-red-50 px-5 py-2 rounded-lg text-sm font-semibold shadow transition-colors"
                >
                  Print / Download
                </button>
              </div>
            </div>
          </div>
        )
      }
    </>
  )
}

export default Products