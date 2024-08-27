// freeBoard 자유게시판 리스트
'use client'; // Next.js에서 이 파일이 클라이언트에서 실행된다는 것을 알림

import React, { useEffect, useState } from 'react'; // React와 필요한 훅들을 import
import { useRouter } from 'next/navigation'; // Next.js의 라우터 훅을 import
import { useAuth } from '../context/AuthContext'; // 인증 컨텍스트에서 현재 사용자 정보를 가져오는 훅을 import
import { fetchPosts } from '../../lib/firestore'; // Firestore에서 게시글을 가져오는 함수 import
import Image from 'next/image'; // 'react-native'의 Image 대신 'next/image'를 사용
import { Box } from '@/components/ui/box/index.web';
import { FaArrowUp } from 'react-icons/fa';

// Post 인터페이스 정의
interface Post {
    views: number;
    comments: number;
    author: string;
    date: string;
    title: string;
    id: string;
}
// 스크롤을 페이지 상단으로 이동시키는 함수
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth', // 부드러운 스크롤 효과
    });
};

const FreeBoard = () => {
    const [posts, setPosts] = useState<Post[]>([]); // 모든 게시글을 저장하는 상태 변수
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호를 저장하는 상태 변수
    const [searchTerm, setSearchTerm] = useState(''); // 검색어를 저장하는 상태 변수
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]); // 검색어에 기반해 필터링된 게시글을 저장하는 상태 변수
    const postsPerPage = 10; // 페이지당 게시글 수 설정
    const router = useRouter(); // Next.js 라우터 객체를 생성하여 페이지 이동을 처리하는 데 사용
    const { user } = useAuth(); // 현재 사용자 정보를 인증 컨텍스트에서 가져옴

    // 컴포넌트가 마운트될 때 Firestore에서 게시글 데이터를 불러옴
    useEffect(() => {
        const loadPosts = async () => {
            try {
                const postsData = await fetchPosts(); // Firestore에서 게시글 데이터를 불러옴
                setPosts(postsData); // 전체 게시글을 상태 변수에 저장
                setFilteredPosts(postsData); // 초기에는 전체 게시글을 필터된 게시글 상태에도 저장
                console.log('Posts loaded:', postsData); // 디버깅용 로그
            } catch (error) {
                console.error('Error loading posts:', error); // 게시글 로딩 중 에러 발생 시 출력
            }
        };

        loadPosts();
    }, []); // 빈 배열을 의존성으로 설정하여 컴포넌트가 처음 마운트될 때만 실행

    // '글 작성하기' 버튼을 클릭하면 글 작성 페이지로 이동
    const handleWriteClick = () => {
        router.push('/posting');
    };

    // 게시글 제목을 클릭하면 해당 게시글의 상세보기 페이지로 이동
    const handlePostClick = (id: string) => {
        router.push(`/listPost?id=${id}`);
    };

    // 검색어 입력이 변경될 때 호출되어 검색어 상태를 업데이트
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    // '검색' 버튼을 클릭하면 검색어를 포함하는 게시글만 필터링하여 표시
    const handleSearchClick = () => {
        const results = posts.filter((post) =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPosts(results); // 필터링된 게시글을 상태 변수에 저장
        setCurrentPage(1); // 검색 결과를 처음부터 보기 위해 현재 페이지를 1로 설정
    };

    // '검색 초기화' 버튼을 클릭하면 검색어와 필터링된 게시글을 초기 상태로 되돌림
    const handleResetSearch = () => {
        setSearchTerm(''); // 검색어 상태 초기화
        setFilteredPosts(posts); // 필터링된 게시글을 전체 게시글로 초기화
        setCurrentPage(1); // 현재 페이지를 1로 설정
    };

    // 현재 페이지에 표시할 게시글의 인덱스를 계산
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

    // 페이지 번호를 클릭하면 해당 페이지로 이동
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // 날짜를 보기 좋게 포맷팅하는 함수
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 페이지 번호를 생성하는 방법을 Array.from()을 사용하여 수정
    const pageNumbers = Array.from(
        { length: Math.ceil(filteredPosts.length / postsPerPage) },
        (_, index) => index + 1
    );

    return (
        <main>
            <div>
                {/* 페이지 상단 제목 시작 */}
                <Box
                    style={{
                        position: 'relative',
                        width: '100%', // 가로를 화면에 꽉 차게 변경
                        height: '30vh', // 화면의 30% 높이
                        overflow: 'hidden',
                        marginBottom: '30px',
                    }}
                >
                    <Image
                        src='/png/freeboard.png' // 이미지 파일 경로
                        layout='fill' // 부모 요소에 맞게 이미지 크기 조절
                        objectFit='cover' // 이미지 비율 유지 및 컨테이너에 맞게 자르기
                        alt={'자유게시판'}
                        style={{}}
                    />
                    <Box
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: 'white',
                            fontSize: '42px',
                            fontWeight: '600',
                            textShadow: '3px 3px 6px rgba(0, 0, 0, 0.8)', // 강한 명암 효과 추가
                            zIndex: 1,
                            textAlign: 'center', // 텍스트 중앙 정렬
                        }}
                    >
                        자유게시판
                    </Box>
                </Box>
                {/* 페이지 상단 제목 끝 */}
                <div
                    style={{
                        display: 'flex', // flexbox 사용
                        justifyContent: 'flex-end', // 오른쪽 정렬
                        paddingRight: '20rem', // 오른쪽 패딩 추가 (선택 사항)
                    }}
                ></div>

                {/* 리스트 영역 */}
                <div style={{justifyContent: 'center'}}>
                    <div
                        style={{
                            marginTop: '60px',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        {filteredPosts.length > 0 ? (
                            <>
                                <table
                                    style={{
                                        width: '55%', // 테이블 너비 조정
                                        borderCollapse: 'collapse',
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th
                                                style={{
                                                    borderBottom:
                                                        '2px solid #ddd',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    backgroundColor: '#f9f9f9',
                                                    width: '3%', // 번호 열 너비
                                                }}
                                            >
                                                번호
                                            </th>
                                            <th
                                                style={{
                                                    borderBottom:
                                                        '2px solid #ddd',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    backgroundColor: '#f9f9f9',
                                                    width: '20%', // 글 제목 열 너비 조정
                                                }}
                                            >
                                                글 제목
                                            </th>
                                            <th
                                                style={{
                                                    borderBottom:
                                                        '2px solid #ddd',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    backgroundColor: '#f9f9f9',
                                                    width: '5%', // 작성자 열 너비
                                                }}
                                            >
                                                작성자
                                            </th>
                                            <th
                                                style={{
                                                    borderBottom:
                                                        '2px solid #ddd',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    backgroundColor: '#f9f9f9',
                                                    width: '5%', // 작성일 열 너비
                                                }}
                                            >
                                                작성일
                                            </th>
                                            <th
                                                style={{
                                                    borderBottom:
                                                        '2px solid #ddd',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    backgroundColor: '#f9f9f9',
                                                    width: '3%', // 댓글수 열 너비
                                                }}
                                            >
                                                댓글 수
                                            </th>
                                            <th
                                                style={{
                                                    borderBottom:
                                                        '2px solid #ddd',
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    backgroundColor: '#f9f9f9',
                                                    width: '3%', // 조회수 열 너비
                                                }}
                                            >
                                                조회 수
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentPosts.map((post, index) => (
                                            <tr key={post.id}>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            '1px solid #ddd',
                                                        padding: '8px',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {filteredPosts.length -
                                                        (currentPage - 1) *
                                                            postsPerPage -
                                                        index}
                                                </td>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            '1px solid #ddd',
                                                        padding: '8px',
                                                        cursor: 'pointer',
                                                        color: 'black',
                                                        textAlign: 'left',

                                                        textDecoration: 'none',
                                                        whiteSpace: 'nowrap', // 제목이 너무 길면 줄바꿈 없이 표시
                                                        overflow: 'hidden',
                                                        textOverflow:
                                                            'ellipsis', // 텍스트가 넘칠 경우 말줄임표로 표시
                                                    }}
                                                    onClick={() =>
                                                        handlePostClick(post.id)
                                                    }
                                                >
                                                    {post.title}
                                                </td>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            '1px solid #ddd',
                                                        padding: '8px',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {post.author}
                                                </td>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            '1px solid #ddd',
                                                        padding: '8px',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {formatDate(post.date)}
                                                </td>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            '1px solid #ddd',
                                                        padding: '8px',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {post.comments}
                                                </td>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            '1px solid #ddd',
                                                        padding: '8px',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {post.views}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        ) : (
                            <div className='spinner'></div>
                            // 게시글이 없을 때 메시지 표시
                        )}
                    </div>

                    {/* 검색과 페이지네이션을 아래로 이동 */}

                    {/* 글 작성하기 버튼 시작 */}
                    <div style={{width:'55%', margin:'auto', display: 'flex', justifyContent: 'flex-end'}}>
                    <button
                        type='button'
                        className='bg-red-600 text-white hover:bg-red-800 transition-colors flex items-center justify-center border-2 border-black'
                        onClick={handleWriteClick}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            width: '140px',
                            marginTop:'20px',
                                                        
                        }}
                    >
                        글쓰기
                    </button>
                    </div>
                    {/* 글 작성하기 버튼 끝 */}


                    <div
                        style={{
                            marginTop: '40px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: '',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center', // 전체를 가운데 정렬
                                marginBottom: '1rem', // 검색 버튼과 검색어 사이 간격을 rem 단위로 설정
                                width: '100%', // 부모 요소에 맞게 전체 너비를 사용
                            }}
                        >
                            {' '}
                            <div
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    width: '320px', // 고정된 너비
                                    marginRight: '20px',
                                }}
                            ></div>
                            <input
                                type='text'
                                value={searchTerm}
                                onChange={handleSearchChange} // 검색어가 변경되면 상태 업데이트
                                placeholder='검색어를 입력하세요.'
                                style={{
                                    padding: '0.5rem', // 패딩을 rem 단위로 설정
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    flex: '1', // 입력 창이 남은 공간을 차지하도록 설정
                                    marginRight: '1rem', // 검색 버튼과의 간격
                                    maxWidth: '400px', // 최대 너비를 설정하여 입력창이 너무 길어지지 않도록 함
                                }}
                            />
                            <button
                                type='button'
                                className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600'
                                onClick={handleSearchClick} // 검색 버튼 클릭 시 필터링된 게시글 표시
                                style={{
                                    flexShrink: '0', // 버튼 크기가 줄어들지 않도록 설정
                                    marginRight: '1rem', // 글 작성하기 버튼과의 간격
                                }}
                            >
                                검색
                            </button>
                            <div
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    width: '220px', // 고정된 너비
                                    marginRight: '20px',
                                }}
                            ></div>
                        </div>

                        {/* 페이지네이션 */}
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <ul
                                style={{
                                    listStyleType: 'none', // 리스트 아이템의 기본 스타일을 제거
                                    padding: 0, // 리스트의 기본 패딩을 제거
                                    display: 'flex', // 리스트 아이템을 가로로 나열하기 위해 flexbox 사용
                                    justifyContent: 'center', // 페이지네이션을 가운데 정렬
                                }}
                            >
                                {pageNumbers.map((number) => (
                                    <li
                                        key={number}
                                        style={{
                                            margin: '0 5px', // 각 페이지 번호 간의 간격 설정
                                            display: 'inline-block', // 페이지 번호가 가로로 배치되도록 설정
                                        }}
                                    >
                                        <button
                                            onClick={() => paginate(number)}
                                            style={{
                                                background:
                                                    number === currentPage
                                                        ? 'red'
                                                        : 'white', // 현재 페이지는 주황색 배경
                                                color:
                                                    number === currentPage
                                                        ? 'white'
                                                        : 'black', // 현재 페이지는 흰색 텍스트
                                                border: '1px solid #ddd', // 경계선 스타일 설정
                                                padding: '5px 10px', // 패딩 설정
                                                borderRadius: '5px', // 모서리를 둥글게 설정
                                                minWidth: '40px', // 모든 버튼의 최소 너비를 동일하게 설정하여 크기 통일
                                                textAlign: 'center', // 텍스트를 버튼 중앙에 배치
                                            }}
                                        >
                                            {number} {/* 페이지 번호 */}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                {/* 페이지 상단으로 이동하는 버튼 */}
                <button
                    onClick={scrollToTop}
                    style={{
                        color: '#ffffff',
                        backgroundColor: '#000000',
                        position: 'fixed',
                        bottom: 50,
                        right: 50,
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        zIndex: 10,
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                    }}
                >
                    <FaArrowUp
                        size={24}
                        color='#ffffff'
                    />
                </button>
            </div>
        </main>
    );
};

export default FreeBoard;
