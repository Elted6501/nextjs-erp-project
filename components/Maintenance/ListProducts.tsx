'use client';
import React from 'react'
import { Menu, MenuButton, MenuItems } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { ListProductsType, ProductsType } from '@/Types/Maintenance/schedule';

const ListProducts = ({ setProducts, products, prods, Quantity }: ListProductsType) => {

    const handleInputClick = (e: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLElement>, data: ProductsType) => {
        e.preventDefault();
        const input = document.getElementById(data.product_id.toString()) as HTMLInputElement;
        input.checked = !input.checked
        const existElement = products.filter(el => el.product_id === data.product_id);
        if (existElement.length > 0) {
            setProducts((values) => values.filter(item => item.product_id !== data.product_id));
        } else {
            setProducts((values) => [...values, {...data, quantity: Quantity || (Quantity && Quantity < 1) ? Quantity : 1}]);
            console.log(products );            
        }
    };

    return (
        <Menu as="div" className="w-full relative inline-block text-left " >
            {({ open }) => (
                <div>
                    <div>
                        <MenuButton onMouseDown={({ target }) => {
                            const t = target as HTMLElement;
                            return open ? "" : t.click()
                        }} className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 !pt-3 !pb-3">
                            Options
                            <ChevronDown aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
                        </MenuButton>
                    </div>

                    <MenuItems
                        className="absolute right-0 z-10 mt-2 w-auto min-w-max origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                    >
                        <div className="py-1 max-h-[37vh] overflow-y-auto">
                            <table className="table-auto w-full text-sm text-gray-700">
                                <thead>
                                    <tr className="text-left border-b border-gray-200">
                                        <th className="px-4 py-2">Select</th>
                                        <th className="px-4 py-2 whitespace-nowrap">Name</th>
                                        <th className="px-4 py-2">Price</th>
                                        <th className="px-4 py-2">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prods?.map((i) => (
                                        <tr key={i.product_id} className="hover:bg-gray-100 cursor-pointer"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleInputClick(e, i);
                                            }}
                                        >
                                            <td className="px-4 py-2">
                                                <input type="checkbox" id={i.product_id.toString()} name={i.product_id.toString()}
                                                    onChange={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleInputClick(e, i);
                                                    }}
                                                    checked={products.some(p => p.product_id === i.product_id)}
                                                />
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">{i.name}</td>
                                            <td className="px-4 py-2">{i.cost_price}</td>
                                            <td className="px-4 py-2">{i.stock}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </MenuItems>


                </div>

            )}
        </Menu >
    )
}

export default ListProducts