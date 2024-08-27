'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import TopBar from '@/components/Topbar';

interface Post {
    id: string;
    title: string;
    author: string;
    content: string;
    comments: number;
    views: number;
    date: string;
}

const POSTS_PER_PAGE = 10;

const MyPosts = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Default to descending order

    useEffect(() => {
        const fetchPosts = async () => {
            if (!user) return;

            try {
                const q = query(
                    collection(db, 'posts'),
                    where('author', '==', user.email)
                );
                const querySnapshot = await getDocs(q);
                const fetchedPosts: Post[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Post, 'id'>),
                }));

                setPosts(fetchedPosts);
                setSearchResults(fetchedPosts); // 초기 검색 결과는 전체 게시글로 설정
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [user]);

    const handleSearch = () => {
        if (searchTerm) {
            const filteredPosts = posts.filter(
                (post) =>
                    post.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    post.content
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            );
            setSearchResults(filteredPosts);
            setCurrentPage(1); // Reset to first page on search
        } else {
            setSearchResults(posts);
            setCurrentPage(1); // Reset to first page on clear search
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    // Sort posts based on the selected sortOrder
    const sortedResults = [...searchResults].sort((a, b) => {
        if (sortOrder === 'desc') {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
    });
    const currentPosts = sortedResults.slice(startIndex, endIndex);
    const totalPages = Math.ceil(sortedResults.length / POSTS_PER_PAGE);

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
                내 게시글
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
                                    글 제목
                                </th>
                                <th className='py-2 px-4 text-center text-gray-600 w-1/6 text-base'>
                                    작성자
                                </th>
                                <th className='py-2 px-4 text-center text-gray-600 w-1/6 text-base'>
                                    댓글수
                                </th>
                                <th className='py-2 px-4 text-center text-gray-600 w-1/6 text-base'>
                                    조회수
                                </th>
                                <th className='py-2 px-4 text-center text-gray-600 w-2/5 whitespace-nowrap text-base'>
                                    작성일
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPosts.map((post, index) => (
                                <tr
                                    key={post.id}
                                    className='border-b hover:bg-gray-50'
                                >
                                    <td className='py-2 px-4 text-center text-gray-500 text-sm'>
                                        {startIndex + index + 1}
                                    </td>
                                    <td className='py-2 px-4'>
                                        <a
                                            href={`/post/${post.id}`}
                                            className='text-black hover:underline'
                                        >
                                            {post.title}
                                        </a>
                                    </td>
                                    <td className='py-2 px-4 text-center text-gray-500 text-sm'>
                                        {post.author}
                                    </td>
                                    <td className='py-2 px-4 text-center text-gray-500 text-sm'>
                                        {post.comments}
                                    </td>
                                    <td className='py-2 px-4 text-center text-gray-500 text-sm'>
                                        {post.views}
                                    </td>
                                    <td className='py-2 px-4 text-center text-gray-500 text-sm whitespace-nowrap'>
                                        {new Date(
                                            post.date
                                        ).toLocaleDateString()}
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
                            onClick={handleSearch}
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
                <p className='text-center text-gray-600'>No posts found.</p>
            )}
        </main>
    );
};

export default MyPosts;
