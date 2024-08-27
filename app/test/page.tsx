'use client';

import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, db } from '@/lib/firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';

const Test: React.FC = () => {
    return (
        <main className='flex flex-col items-center'>
            <div className='w-full max-w-6xl p-4 border border-gray-300'></div>
        </main>
    );
};

export default Test;
