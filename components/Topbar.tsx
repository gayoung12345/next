'use client';

import React from 'react';
import Link from 'next/link';
import { FaPen, FaComment, FaThumbsUp, FaUserEdit } from 'react-icons/fa';

const TopBar: React.FC = () => {
    // Use window.location.pathname to determine the current path
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const getLinkClassName = (path: string) => {
        const isActive = currentPath === path;
        return `
            flex items-center px-16 py-2 text-center font-normal
            ${isActive ? 'bg-gray-200 text-gray-700' : 'bg-white text-gray-500'}
            border border-gray-300
            ${isActive ? '' : 'transition-colors duration-300 hover:bg-gray-100'}
        `;
    };

    return (
        <div className='flex justify-center mb-8' style={{ marginTop: '60px', marginBottom: '20px' }}>
            <Link href='/myPage'>
                <span className={getLinkClassName('/myPage')} style={{ borderRight: 'none' }}>
                    <FaUserEdit style={{ color: '#333', margin: '8px' }} />
                    정보수정
                </span>
            </Link>
            <Link href='/myPosts'>
                <span className={getLinkClassName('/myPosts')} style={{ borderRight: 'none' }}>
                    <FaPen style={{ color: '#333', margin: '8px' }} />
                    작성글
                </span>
            </Link>
            <Link href='/myComments'>
                <span className={getLinkClassName('/myComments')} style={{ borderRight: 'none' }}>
                    <FaComment style={{ color: '#333', margin: '8px' }} />
                    댓글
                </span>
            </Link>
            <Link href='/myLikes'>
                <span className={getLinkClassName('/myLikes')}>
                    <FaThumbsUp style={{ color: '#333', margin: '8px' }} />
                    좋아요
                </span>
            </Link>
        </div>
    );
};

export default TopBar;
