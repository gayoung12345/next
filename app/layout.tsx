// app/layout.tsx
import { AuthProvider } from './context/AuthContext'; // 인증 컨텍스트 가져오기
import Header from './ui/Header';
import Footer from './ui/Footer';
import { Inter } from 'next/font/google';
import './globals.css'; // 글로벌 CSS 파일 불러오기

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='ko'>
            <body className={inter.className}>
                <AuthProvider>
                    <div className='flex flex-col h-screen'>
                        {/* Header */}
                        <Header />
                        <main className='flex-grow'>{children}</main>
                        {/* Footer */}
                        <Footer />
                    </div>
                </AuthProvider>
            </body>
        </html>
    );
}
