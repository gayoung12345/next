// siteRecipe 공식레시피 리스트
'use client';

import {
    CSSProperties,
    HTMLProps,
    ReactNode,
    useEffect,
    useState,
} from 'react';
import Image from 'next/image';
import xml2js from 'xml2js';
import { useRouter } from 'next/navigation';
import { FaArrowUp } from 'react-icons/fa';

// TTS 기능을 구현하는 함수
const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = 'ko-KR'; // 한국어 설정 (필요에 따라 변경 가능)
        window.speechSynthesis.speak(speech);
    } else {
        console.error('TTS 기능을 지원하지 않는 브라우저입니다.');
    }
};

////////////// 임시 Box, Text 컴포넌트 //////////////
interface BoxProps {
    children: ReactNode;
    style?: CSSProperties;
    [key: string]: any;
}

const Box: React.FC<BoxProps> = ({ children, style, ...props }) => (
    <div
        style={style}
        {...props}
    >
        {children}
    </div>
);

interface TextProps extends HTMLProps<HTMLParagraphElement> {
    children: ReactNode;
    style?: CSSProperties;
}

const Text: React.FC<TextProps> = ({ children, style, ...props }) => (
    <p
        style={style}
        {...props}
    >
        {children}
    </p>
);

/////////////////////////////////////////////////////////////////////////////////

// 임시 Grid 컴포넌트 - 그리드 레이아웃을 제공
interface GridProps extends React.HTMLProps<HTMLDivElement> {
    children: React.ReactNode; // children의 타입을 React.ReactNode로 명시
}

const Grid: React.FC<GridProps> = ({ children, style, ...props }) => (
    <div
        style={style}
        {...props}
    >
        {children}
    </div>
);

// 스크롤을 페이지 상단으로 이동시키는 함수
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth', // 부드러운 스크롤 효과
    });
};

const SiteRecipe = () => {
    // 레시피 데이터를 저장하는 상태
    const [recipes, setRecipes] = useState([]);
    // 페이지당 아이템 수 상태, 기본값은 8
    const [itemsPerPage, setItemsPerPage] = useState(8);
    // 페이지 이동을 위한 useRouter 훅
    const router = useRouter();

    // 컴포넌트가 마운트될 때 XML 데이터를 가져오는 효과
    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                // XML 파일을 비동기적으로 가져옴
                const response = await fetch('/data/siterecipe.xml');
                const xmlData = await response.text();
                const parser = new xml2js.Parser();
                // XML 데이터를 JavaScript 객체로 변환
                const result = await parser.parseStringPromise(xmlData);

                // 레시피 데이터를 정리하여 상태에 저장
                const recipeData = result.COOKRCP01.row.map((recipe: any) => ({
                    id: recipe.RCP_SEQ[0],
                    name: recipe.RCP_NM[0],
                    image: recipe.ATT_FILE_NO_MAIN[0] || '/svg/logo.svg', // 기본 이미지 경로 설정
                    ingredients: recipe.RCP_PARTS_DTLS[0],
                    manual: recipe.MANUAL01[0],
                    calories: recipe.INFO_ENG[0],
                }));

                setRecipes(recipeData);
            } catch (error) {
                console.error('Error parsing XML:', error);
            }
        };

        fetchRecipes();
    }, []);

    // 이미지 클릭 시 상세 페이지로 이동하는 함수
    const handleImageClick = (id: any) => {
        router.push(`/galleryPost?id=${id}`);
    };

    // 현재 페이지에 표시할 레시피 목록 계산
    const currentRecipes = recipes.slice(0, itemsPerPage);

    // 스크롤 이벤트 핸들러
    const handleScroll = () => {
        const scrollTop = window.scrollY; // 현재 스크롤 위치
        const windowHeight = window.innerHeight; // 현재 뷰포트 높이
        const documentHeight = document.documentElement.offsetHeight; // 전체 문서 높이

        // 스크롤이 문서 하단에 가까워지면 더 많은 아이템을 로드
        if (scrollTop + windowHeight >= documentHeight - 200) {
            // 200px 남았을 때 로드
            if (itemsPerPage < recipes.length) {
                setItemsPerPage((prev) => prev + 1); // 아이템 수 1개씩 증가
            }
        }
    };

    // 스크롤 이벤트 리스너 추가 및 제거
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [itemsPerPage, recipes]);

    return (
        <div>
            {/* 페이지 상단 제목 시작   */}
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
                    src='/png/recipe-title.png' // 이미지 파일 경로
                    alt='공식 레시피'
                    layout='fill' // 부모 요소에 맞게 이미지 크기 조절
                    objectFit='cover' // 이미지 비율 유지 및 컨테이너에 맞게 자르기
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
                    공식 레시피
                </Box>
            </Box>{' '}
            {/* 페이지 상단 제목 끝 */}
            {/* 레시피 그리드 컨테이너 */}
            <Box
                style={{
                    position: 'relative',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center', // 수직 중앙 정렬 추가
                    minHeight: '200px', // 충분한 높이 확보
                }}
            >
                {currentRecipes.length > 0 ? (
                    <Grid
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '14px',
                            marginBottom: '24px',
                            maxWidth: '1000px',
                            width: '100%',
                        }}
                    >
                        {currentRecipes.map((recipe: any) => (
                            <Box
                                key={recipe.id}
                                style={{
                                    position: 'relative',
                                    padding: '16px',
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                }}
                                onClick={() => handleImageClick(recipe.id)}
                                onMouseEnter={() => speakText(recipe.name)} // TTS 기능 호출
                            >
                                <Box style={{ position: 'relative' }}>
                                    <Image
                                        src={recipe.image}
                                        alt={recipe.name}
                                        width={250}
                                        height={250}
                                        style={{ borderRadius: '4px' }}
                                    />
                                    <Box
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor:
                                                'rgba(0, 0, 0, 0.6)',
                                            color: 'white',
                                            opacity: 0,
                                            transition: 'opacity 0.3s',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() =>
                                            handleImageClick(recipe.id)
                                        }
                                        onMouseEnter={(e: any) => {
                                            e.currentTarget.style.opacity = '1';
                                        }}
                                        onMouseLeave={(e: any) => {
                                            e.currentTarget.style.opacity = '0';
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: '18px',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            상세 보기
                                        </Text>
                                    </Box>
                                </Box>
                                <Text
                                    style={{
                                        fontSize: '12px',
                                        marginTop: '8px',
                                        color: '#8C8C8C',
                                    }}
                                >
                                    {recipe.calories} kcal
                                </Text>
                                <Text
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        marginTop: '2px',
                                    }}
                                >
                                    {recipe.name}
                                </Text>
                            </Box>
                        ))}
                    </Grid>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            height: '100%', // 또는 원하는 높이 설정
                        }}
                    >
                        <div className='spinner'></div>
                    </div>
                )}
            </Box>
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
    );
};

export default SiteRecipe;
