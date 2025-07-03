'use client'
import { ProductsType } from '@/Types/Maintenance/schedule'
import { Package, ShoppingCart } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const BlockInformation = ({ icon, value, text }: { icon: string, value: ProductsType[] | number, text: string }) => {
    const [quantity, setQuantity] = useState<number>(0);
    useEffect(()=>{
        if(typeof value !== 'number'){
            setQuantity(value.length);
        }
    },[value]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{text}</p>
                    <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value : quantity}</p>
                </div>
                {icon === 'Products' ? <Package /> : icon === 'Cart' ? <ShoppingCart />  :  <></>}
            </div>
        </div>
    )
}

export default BlockInformation