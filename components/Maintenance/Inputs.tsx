import React from 'react'

const Inputs = ({ value, setValue, placeholder, title }: { value: string, setValue: (value: string) => void, placeholder: string, title: string }) => {
    return (
        <div className={title === 'Plates' ? 'col-span-2' : ''}>
            <label className="block font-semibold mb-2">{title}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder={placeholder}
                required
            />
        </div>
    )
}

export default Inputs