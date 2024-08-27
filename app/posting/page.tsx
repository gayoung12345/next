'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic'; // dynamic import 사용
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';

// TextEditor 컴포넌트를 동적 로딩으로 변경하여 서버 사이드 렌더링 방지
const TextEditor = dynamic(
    () => import('@/components/text-editor/text-editor'),
    {
        ssr: false, // 서버 사이드 렌더링 비활성화
    }
);

const Posting = () => {
    const [title, setTitle] = useState(''); // 제목을 관리하는 상태
    const [content, setContent] = useState(''); // 내용을 관리하는 상태
    const router = useRouter(); // 페이지 이동을 관리하는 Next.js의 라우터
    const { user } = useAuth(); // 현재 로그인된 사용자의 정보를 가져옴

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault(); // 폼 제출 시 페이지 리로드를 방지

        if (user) {
            // 사용자가 로그인되어 있을 경우
            try {
                await addDoc(collection(db, 'posts'), {
                    title, // 제목
                    content, // 내용
                    author: user.email, // 작성자 (로그인된 사용자)
                    date: new Date().toISOString(), // 작성일 (현재 시간)
                    comments: 0, // 댓글 수 초기값
                    views: 0, // 조회수 초기값
                });

                alert('글이 작성되었습니다!'); // 작성 완료 알림
                router.push('/freeBoard'); // 작성 후 게시판으로 이동
            } catch (error) {
                console.error('Error adding document: ', error); // 오류 발생 시 콘솔에 출력
            }
        } else {
            alert('로그인이 필요합니다.'); // 로그인하지 않은 경우 알림
            router.push('/login'); // 로그인 페이지로 이동
        }
    };

    const handleGoBack = () => {
        router.push('/freeBoard'); // 뒤로가기 버튼 클릭 시 게시판으로 이동
    };

    return (
        <main>
            <div style={{ padding: '20px' }}>
                <h1 style={{ textAlign: 'center', fontSize: '36px' }}>
                    글 작성하기
                </h1>
                <form onSubmit={handleSubmit}>
                    <div
                        style={{
                            marginTop: '40px',
                            marginBottom: '20px',
                            textAlign: 'left',
                        }}
                    >
                        <label
                            htmlFor='title'
                            style={{
                                display: 'block',
                                marginBottom: '10px',
                                textAlign: 'left',
                                marginLeft: '20%',
                            }}
                        ></label>
                        <input
                            id='title'
                            type='text'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder='제목을 입력하세요'
                            style={{
                                width: '60%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                display: 'block',
                                margin: '0 auto',
                                verticalAlign: 'top', // 상단 정렬
                            }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <label
                            htmlFor='content'
                            style={{
                                display: 'block',
                                marginBottom: '10px',
                                textAlign: 'left',
                                marginLeft: '20%',
                            }}
                        ></label>
                        <div
                            style={{
                                width: '60%',
                                margin: '0 auto',
                                marginBottom: '60px',
                            }}
                        >
                            {/* TextEditor의 아래에 더 넓은 여유 공간 추가 */}
                            <TextEditor
                                content={content}
                                setContent={setContent}
                                placeholder='내용을 입력하세요' // TextEditor에 대한 기본 placeholder 추가
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '20px',
                        }}
                    >
                        <button
                            type='button'
                            onClick={handleGoBack}
                            className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600'
                            style={{ marginRight: '10px' }} // 버튼 사이 간격
                        >
                            뒤로가기
                        </button>
                        <button
                            type='submit'
                            className='bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600'
                        >
                            작성하기
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default Posting;
