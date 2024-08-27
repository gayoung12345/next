'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '../../lib/firebaseConfig';
import { onAuthStateChanged, updatePassword } from 'firebase/auth';
import { FaPen, FaComment, FaThumbsUp } from 'react-icons/fa';
import TopBar from '@/components/Topbar';

function MyPage() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setFormData((prevData) => ({
                    ...prevData,
                    username: user.email || '',
                }));
                setLoading(false);
            } else {
                setError('사용자가 로그인되어 있지 않습니다.');
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const { password, confirmPassword } = formData;

        if (password === '' || confirmPassword === '') {
            setError('새 비밀번호와 비밀번호 확인을 입력하세요.');
            return;
        }

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const user = auth.currentUser;
            if (user) {
                await updatePassword(user, password);
                alert('비밀번호가 성공적으로 변경되었습니다.');
                window.location.reload();
            } else {
                setError('사용자가 로그인되어 있지 않습니다.');
            }
        } catch (error: any) {
            setError('비밀번호 변경 중 오류가 발생했습니다: ' + error.message);
        }
    };

    if (loading) {
        return <div className='spinner'></div>;
    }

    return (
        <main className='p-6'>
            <TopBar /> {/* Add the TopBar component */}

            <div className='flex flex-col space-y-4'>
                <h1
                    className='text-2xl font-bold mb-6'
                    style={{
                        textAlign: 'center',
                        marginBottom: '16px',
                    }}
                >
                    회원정보 확인/수정하기
                </h1>
                <div className='mx-auto' style={{ width:'45%', marginTop: '60px', marginBottom: '20px' }}>
                <hr className='h-px my-8 bg-gray-300 border-0 dark:bg-gray-700'></hr>

                {error && <p className='text-red-500 text-center'>{error}</p>}
                <form
                    onSubmit={handleSubmit}
                    className='w-full flex flex-col space-y-4'
                >
                    <div className='flex items-center space-x-4'>
                        <label
                            htmlFor='username'
                            className='w-1/3 text-gray-700 text-center'
                        >
                            이메일
                        </label>
                        <input
                            type='text'
                            id='username'
                            name='username'
                            value={formData.username}
                            readOnly
                            className='border border-gray-300 p-2 rounded w-2/3 bg-gray-100 cursor-not-allowed'
                        />
                    </div>
                    <hr className='my-8' />
                    <div className='flex items-center space-x-4'>
                        <label
                            htmlFor='password'
                            className='w-1/3 text-gray-700 text-center'
                        >
                            새 비밀번호
                        </label>
                        <input
                            type='password'
                            id='password'
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                            className='border border-gray-300 p-2 rounded w-2/3'
                        />
                    </div>
                    <hr className='my-8' />
                    <div className='flex items-center space-x-4'>
                        <label
                            htmlFor='confirmPassword'
                            className='w-1/3 text-gray-700 text-center'
                        >
                            비밀번호 확인
                        </label>
                        <input
                            type='password'
                            id='confirmPassword'
                            name='confirmPassword'
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className='border border-gray-300 p-2 rounded w-2/3'
                        />
                    </div>
                    <hr className='my-8' />
                    <button
                        type='submit'
                        className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 w-1/3 mx-auto'
                        style={{ marginTop: '60px', marginBottom: '40px' }}
                    >
                        수정하기
                    </button>
                </form>
                </div>

            </div>
        </main>
    );
}

export default MyPage;
