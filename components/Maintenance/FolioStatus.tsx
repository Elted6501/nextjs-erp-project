import { FolioStatusProps } from '@/Types/Maintenance/schedule';
import React from 'react'

const FolioStatus = ({ statusSteps, progressWidth, currentIndex }: FolioStatusProps) => {
    return (
        <div className="relative flex items-center justify-between">
            <div className="absolute top-7 left-0 right-0 h-1">
                <div className="h-1 bg-gray-300 w-full" />
                <div
                    className="h-2 bg-red-600 absolute top-[-2px] z-20"
                    style={{ width: `${progressWidth}%` }}
                />
            </div>

            {statusSteps.map((step, index) => {
                const isActive = index <= currentIndex;
                return (
                    <div
                        key={step.label}
                        className="relative z-30 flex flex-col items-center w-1/4"
                    >
                        <div
                            className={`w-14 h-14 flex items-center justify-center rounded-full border-4 mb-2 transition-colors duration-300 ${isActive
                                ? "border-red-500 bg-red-600 text-white"
                                : "border-gray-300 bg-gray-100 text-gray-500"
                                }`}
                        >
                            {step.icon}
                        </div>
                        <p className="text-sm text-center text-gray-700">
                            {step.label}
                        </p>
                    </div>
                );
            })}
        </div>)
}

export default FolioStatus