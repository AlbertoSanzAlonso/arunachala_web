import React from 'react';
import lotusSpinner from '../assets/images/lotus_spinner.webp';

const PageLoader: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-bone/90 backdrop-blur-sm">
            <div className="relative flex flex-col items-center">
                <img
                    src={lotusSpinner}
                    alt="Loading..."
                    className="w-24 h-24 md:w-32 md:h-32 animate-spin-slow opacity-80"
                />
                <p className="mt-4 text-forest font-headers text-xl animate-pulse">
                    Loading...
                </p>
            </div>
        </div>
    );
};

export default PageLoader;
