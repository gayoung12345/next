// login 로그인
'use client'; // 클라이언트 사이드에서 실행됨

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebaseConfig'; // Firebase 설정 파일 경로
import Link from 'next/link';

export default function LoginPage() {
    // 이메일 입력 상태를 관리하는 useState 훅
    const [email, setEmail] = useState('');
    // 비밀번호 입력 상태를 관리하는 useState 훅
    const [password, setPassword] = useState('');
    // 오류 메시지 상태를 관리하는 useState 훅
    const [error, setError] = useState('');

    // useRouter 훅을 사용하여 라우터 인스턴스 생성
    const router = useRouter();

    // 로그인 버튼 클릭 시 호출되는 함수
    const handleLogin = async () => {
        try {
            // Firebase 인증 API를 통해 이메일과 비밀번호로 로그인 시도
            await signInWithEmailAndPassword(auth, email, password);
            console.log('로그인 성공');
            // 로그인 성공 후 메인 페이지로 리다이렉트
            router.push('/'); // 메인 페이지로 리다이렉트
        } catch (error) {
            // 에러가 Error 인스턴스인 경우 메시지를 설정
            if (error instanceof Error) {
                console.error('로그인 오류:', error.message);
                setError('로그인 실패: ' + error.message); // 사용자에게 보다 구체적인 오류 메시지 제공
            } else {
                // 에러가 Error 인스턴스가 아닌 경우
                console.error('로그인 오류:', error);
                setError('로그인 실패: 알 수 없는 오류');
            }
        }
    };

    return (
        <div
            style={{
                // 전체 화면을 중앙에 정렬
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh', // 전체 화면 높이 설정
            }}
        >
            <div
                style={{
                    /* 로그인 창 크기 조절 */
                    display: 'flex',
                    flexDirection: 'column', // 세로 방향으로 요소 배치
                    alignItems: 'center', // 중앙 정렬
                    width: '400px', // 로그인 박스의 너비 설정
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // 박스 그림자
                    backgroundColor: 'white', // 배경색
                }}
            >
                <h1
                className='text-2xl font-bold mb-6'
                style={{
                    textAlign: 'center',
                    marginBottom: '16px',
                }}>
                    로그인
                </h1>
                
                <div style={{ width: '100%', marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        아이디
                    </label>
                    <input
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='아이디를 입력하세요'
                        style={{
                            width: '100%', // 입력 필드 너비 설정
                            padding: '10px',
                            boxSizing: 'border-box',
                            border: '1px solid #ddd', // 입력 필드 테두리
                            borderRadius: '4px',
                        }}
                    />
                </div>
                <div style={{ width: '100%', marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        비밀번호
                    </label>
                    <input
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='비밀번호를 입력하세요'
                        style={{
                            width: '100%', // 입력 필드 너비 설정
                            padding: '10px',
                            boxSizing: 'border-box',
                            border: '1px solid #ddd', // 입력 필드 테두리
                            borderRadius: '4px',
                        }}
                    />
                </div>
                <button
                    onClick={handleLogin} // 로그인 함수 호출
                    style={{
                        width: '100%', // 버튼 너비 설정
                        padding: '10px',
                        backgroundColor: '#DB0000', // 버튼 배경색
                        color: 'white', // 버튼 글자색
                        border: 'none', // 버튼 테두리 제거
                        borderRadius: '4px',
                        cursor: 'pointer', // 버튼 클릭 시 포인터 커서로 변경
                    }}
                >
                    로그인
                </button>
                {/* 오류 메시지가 있을 경우 표시 */}
                {error && (
                    <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>
                )}
                <Link href='/signup'>
                <div style={{ marginTop: '10px', fontSize: '14px' }}>
                    <span
                        style={{
                            cursor: 'pointer', // 클릭 시 포인터 커서로 변경
                            color: '#A50000', // 링크 색상
                        }}
                    >
                        회원가입
                    </span>
                </div>
                </Link>
            </div>
        </div>
    );
}
