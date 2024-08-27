import { withGluestackUI } from '@gluestack/ui-next-adapter';
/** @type {import('next').NextConfig} */

const nextConfig = {
    transpilePackages: ['nativewind', 'react-native-css-interop'],
    images: {
        domains: [
            'www.foodsafetykorea.go.kr',
            'firebasestorage.googleapis.com',
            '2bob.co.kr',
        ], // 허용할 도메인 추가
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    // output: 'export', // 정적 HTML 파일 생성을 위한 설정
    distDir: 'out', // 빌드 아티팩트를 'out' 폴더에 저장
};

export default withGluestackUI(nextConfig);
