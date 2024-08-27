// AuthContext 인증상태를 전역적으로 관리하기 위한 컨텍스트
'use client'; // Next.js에서 이 파일이 클라이언트에서 실행된 다는 것을 알림

import React, { createContext, useContext, useState, useEffect } from 'react'; // React와 필요한 훅들을 import
import { auth } from '../../lib/firebaseConfig'; // Firebase 설정 파일에서 인증 객체를 import
import { onAuthStateChanged, User } from 'firebase/auth'; // Firebase의 인증 관련 함수와 User 타입을 import

// AuthContext에서 사용할 타입을 정의, user는 Firebase의 User 객체이거나 null일 수 있음
interface AuthContextType {
    user: User | null;
    loading: boolean;
}

// AuthContext 생성, 초기값은 undefined로 설정
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 컴포넌트는 앱의 인증 상태를 관리하며, 하위 컴포넌트에 인증 정보를 제공함
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    // user 상태를 관리하는 useState 훅, 초기값은 null
    const [user, setUser] = useState<User | null>(null);

    // loading
    const [loading, setLoading] = useState(true); // 초기 상태는 true로 설정

    // 컴포넌트가 마운트될 때 Firebase의 인증 상태를 확인하고 user 상태를 업데이트
    useEffect(() => {
        // onAuthStateChanged는 인증 상태가 변경될 때 호출되는 Firebase 함수
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // 상태 변경 시 user 값을 업데이트
            setUser(user);
            setLoading(false); // 인증 상태가 변경된 후 로딩 완료
        });

        // 컴포넌트가 언마운트될 때 구독을 해제함으로써 메모리 누수를 방지
        return () => unsubscribe();
    }, []);

    // AuthContext.Provider를 통해 하위 컴포넌트에 user 상태를 제공
    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
            {/* AuthProvider의 하위 컴포넌트들이 children으로 전달됨 */}
        </AuthContext.Provider>
    );
};

// useAuth 훅은 AuthContext를 사용해 인증 상태를 가져오는 간단한 인터페이스를 제공
export const useAuth = () => {
    // useContext 훅을 사용해 AuthContext를 가져옴
    const context = useContext(AuthContext);
    // AuthProvider 내부가 아닌 곳에서 이 훅을 사용하려고 하면 에러를 던짐
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    // context를 반환, context에는 user 상태가 포함되어 있음
    return context;
};
