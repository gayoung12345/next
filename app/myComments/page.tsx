'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import TopBar from '@/components/Topbar';

interface Comment {
    id: string;
    author: string;
    content: string;
    date: string;
    postId?: string; // Optional, depending on the type of comment
    recipeId?: string; // Optional, depending on the type of comment
}

const COMMENTS_PER_PAGE = 10;

const MyComments = () => {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchComments = async () => {
            if (!user) return;

            try {
                const q = query(
                    collection(db, 'comments'),
                    where('author', '==', user.email) // Use user.email or user.uid based on your schema
                );
                const querySnapshot = await getDocs(q);
                const fetchedComments: Comment[] = querySnapshot.docs.map(
                    (doc) => ({
                        id: doc.id,
                        ...(doc.data() as Omit<Comment, 'id'>),
                    })
                );

                setComments(fetchedComments);
                setSearchResults(fetchedComments); // Initialize search results with all comments
            } catch (error) {
                console.error('Error fetching comments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [user]);

    const handleSearch = () => {
        if (searchTerm) {
            const filteredComments = comments.filter((comment) =>
                comment.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(filteredComments);
        } else {
            setSearchResults(comments);
        }
        setCurrentPage(1); // Reset to first page on search
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const startIndex = (currentPage - 1) * COMMENTS_PER_PAGE;
    const endIndex = startIndex + COMMENTS_PER_PAGE;
    const currentComments = searchResults.slice(startIndex, endIndex);
    const totalPages = Math.ceil(searchResults.length / COMMENTS_PER_PAGE);

    if (loading) {
        return <div className='spinner'></div>;
    }

    return (
        <main className='p-6'>
            <TopBar />
            <h1
                className='text-3xl font-bold mb-6 text-center'
                style={{ marginTop: '40px' }}
            >
                내 댓글
            </h1>

            {searchResults.length > 0 ? (
                <div
                    className='overflow-x-auto max-w-4xl mx-auto'
                    style={{ marginTop: '60px', marginBottom: '20px' }}
                >
                    <table className='min-w-full bg-white border border-gray-300 table-auto'>
                        <thead>
                            <tr className='bg-gray-200 border-b border-gray-300'>
                                <th className='py-2 px-4 text-center text-gray-600 w-1/12 text-base'>
                                    번호
                                </th>
                                <th className='py-2 px-4 text-center text-gray-600 w-2/5 text-base'>
                                    내용
                                </th>
                                <th className='py-2 px-4 text-center text-gray-600 w-1/6 text-base'>
                                    작성자
                                </th>
                                <th className='py-2 px-4 text-center text-gray-600 w-1/6 text-base'>
                                    작성일
                                </th>
                                <th className='py-2 px-4 text-center text-gray-600 w-1/6 text-base'>
                                    Post ID
                                </th>
                                <th className='py-2 px-4 text-center text-gray-600 w-1/6 text-base'>
                                    Recipe ID
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentComments.map((comment, index) => (
                                <tr
                                    key={comment.id}
                                    className='border-b hover:bg-gray-50'
                                >
                                    <td className='py-2 px-4 text-center text-gray-500 text-sm'>
                                        {startIndex + index + 1}
                                    </td>
                                    <td className='py-2 px-4'>
                                        {comment.content}
                                    </td>
                                    <td className='py-2 px-4 text-center text-gray-500 text-sm'>
                                        {comment.author}
                                    </td>
                                    <td className='py-2 px-4 text-center text-gray-500 text-sm'>
                                        {new Date(
                                            comment.date
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className='py-2 px-4 text-center text-gray-500 text-sm'>
                                        {comment.postId || '-'}
                                    </td>
                                    <td className='py-2 px-4 text-center text-gray-500 text-sm'>
                                        {comment.recipeId || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div
                        className='flex justify-center mb-6 space-x-1'
                        style={{ marginTop: '40px', marginBottom: '30px' }}
                    >
                        <input
                            type='text'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder='검색어를 입력하세요...'
                            style={{
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                width: '400px',
                                marginRight: '4px', // 검색 버튼과의 간격 조정
                            }}
                        />
                        <button
                            onClick={handleSearch} // Ensure button click triggers search
                            type='button'
                            className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600'
                        >
                            검색
                        </button>
                    </div>

                    <div
                        className='flex justify-center mt-6'
                        style={{ marginBottom: '20px' }}
                    >
                        <nav style={{ textAlign: 'center' }}>
                            <ul
                                style={{
                                    display: 'inline-flex',
                                    listStyleType: 'none',
                                    padding: 0,
                                }}
                            >
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <li
                                        key={i + 1}
                                        style={{ margin: '0 5px' }}
                                    >
                                        <button
                                            onClick={() =>
                                                handlePageChange(i + 1)
                                            }
                                            style={{
                                                background:
                                                    i + 1 === currentPage
                                                        ? 'orange'
                                                        : 'white',
                                                color:
                                                    i + 1 === currentPage
                                                        ? 'white'
                                                        : 'black',
                                                border: '1px solid #ddd',
                                                padding: '5px 10px',
                                                borderRadius: '5px',
                                            }}
                                        >
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>
            ) : (
                <p className='text-center text-gray-600'>No comments found.</p>
            )}
        </main>
    );
};

export default MyComments;
