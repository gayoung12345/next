// logout 로그아웃
'use client'; // 클라이언트 사이드에서 실행됨

import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebaseConfig'; // Firebase 설정 파일 경로
import { useRouter } from 'next/navigation'; // Next.js 라우터 훅

export default function LogoutPage() {
    // useRouter 훅을 사용하여 라우터 인스턴스 생성
    const router = useRouter();

    useEffect(() => {
        // 로그아웃을 처리하는 비동기 함수
        const logout = async () => {
            try {
                // Firebase 인증에서 로그아웃 수행
                await signOut(auth);
                // 로그아웃 후 메인 페이지로 리다이렉트
                router.push('/'); // 메인 페이지로 이동
            } catch (error: any) {
                // 로그아웃 실패 시 오류 메시지 콘솔에 출력
                console.error('로그아웃 실패:', error.message);
            }
        };

        // 컴포넌트가 마운트된 후 로그아웃 함수 호출
        logout();
    }, [router]); // router가 변경될 때마다 useEffect가 실행됨

    return <div>로그아웃 중...</div>; // 로그아웃 진행 중 표시되는 메시지
}
