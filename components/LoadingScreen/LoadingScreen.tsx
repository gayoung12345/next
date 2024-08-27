// components/LoadingScreen.tsx
import React from 'react';

const LoadingScreen: React.FC = () => {
    return (
        <div className='fixed inset-0 bg-white flex items-center justify-center z-50'>
            <div className='flex items-center'>
                <div className='spinner'></div>
            </div>
        </div>
    );
};

export default LoadingScreen;
