'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import xml2js from 'xml2js';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

// 이미지 예시 데이터
const slides = [
    { id: 1, image: '/png/img3.png' },
    { id: 2, image: '/png/img2.png' },
    { id: 3, image: '/png/img1.png' },
];

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

// 레시피 데이터 타입
interface Recipe {
    id: string;
    name: string;
    image: string;
    ingredients: string;
    manual: string;
    calories: string;
}

interface BoxProps extends React.HTMLProps<HTMLDivElement> {
    style?: React.CSSProperties;
    onClick?: () => void;
}

interface TextProps extends React.HTMLProps<HTMLParagraphElement> {
    style?: React.CSSProperties;
}

// Box 컴포넌트 정의
const Box: React.FC<BoxProps> = ({ style, onClick, children }) => (
    <div
        style={style}
        onClick={onClick}
    >
        {children}
    </div>
);

// Text 컴포넌트 정의
const Text: React.FC<TextProps> = ({ style, children }) => (
    <p style={style}>{children}</p>
);

export default function Home() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [firebaseRecipes, setFirebaseRecipes] = useState<Recipe[]>([]);
    const itemsPerPage = 4;
    const router = useRouter();

    const nextSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prevSlide) =>
            prevSlide === 0 ? slides.length - 1 : prevSlide - 1
        );
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await fetch('/data/siterecipe.xml');
                const xmlData = await response.text();
                const parser = new xml2js.Parser();
                const result = await parser.parseStringPromise(xmlData);

                const recipeData = result.COOKRCP01.row.map((recipe: any) => ({
                    id: recipe.RCP_SEQ[0],
                    name: recipe.RCP_NM[0],
                    image: recipe.ATT_FILE_NO_MAIN[0] || '/svg/logo.svg',
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

    useEffect(() => {
        const fetchFirebaseRecipes = async () => {
            try {
                const userRecipeSnapshot = await getDocs(
                    collection(db, 'userRecipe')
                );
                const testRecipeSnapshot = await getDocs(
                    collection(db, 'testRecipe')
                );
                const fetchedRecipes: Recipe[] = [];

                userRecipeSnapshot.forEach((doc) => {
                    fetchedRecipes.push({
                        id: doc.id,
                        ...doc.data(),
                    } as Recipe);
                });
                testRecipeSnapshot.forEach((doc) => {
                    const data = doc.data();
                    fetchedRecipes.push({
                        id: doc.id,
                        name: data.title,
                        image: data['main-image'],
                        ingredients: '', // 데이터가 없으므로 빈 문자열
                        manual: '', // 데이터가 없으므로 빈 문자열
                        calories: '', // 데이터가 없으므로 빈 문자열
                    } as Recipe);
                });

                setFirebaseRecipes(fetchedRecipes);
            } catch (error) {
                console.error('Error fetching recipes from Firebase:', error);
            }
        };

        fetchFirebaseRecipes();
    }, []);

    const handleImageClick = (id: string) => {
        router.push(`/galleryPost?id=${id}`);
    };

    const handleMoreClick = () => {
        router.push('/siteRecipe');
    };

    const handlejoinClick = () => {
        router.push('/signup');
    };

    const handlefreeClick = () => {
        router.push('/freeboard');
    };

    const handleUserRecipeClick = () => {
        router.push('/userRecipe');
    };

    return (
        <main>
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '56.25%', // 비율 유지
                    height: 0, // 높이를 0으로 설정
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        transition: 'transform 0.5s ease',
                        transform: `translateX(-${currentSlide * 100}%)`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                    }}
                >
                    {slides.map((slide) => (
                        <div
                            key={slide.id}
                            style={{
                                minWidth: '100%',
                                height: '100%',
                                position: 'relative',
                            }}
                        >
                            <Image
                                src={slide.image}
                                alt={`Slide ${slide.id}`}
                                layout='fill'
                                objectFit='cover'
                                priority={true} // 이미지 우선 로딩 설정
                            />
                        </div>
                    ))}
                </div>

                <button
                    onClick={prevSlide}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '10px',
                        transform: 'translateY(-50%)',
                        zIndex: 1,
                        width: '80px',
                        height: '80px',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '36px',
                    }}
                >
                    &#10094; {/* Left arrow */}
                </button>

                <button
                    onClick={nextSlide}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        right: '10px',
                        transform: 'translateY(-50%)',
                        zIndex: 1,
                        width: '80px',
                        height: '80px',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '36px',
                    }}
                >
                    &#10095; {/* Right arrow */}
                </button>

                <div
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        justifyContent: 'center',
                        zIndex: 1,
                    }}
                >
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            onClick={() => goToSlide(index)}
                            style={{
                                width: '15px',
                                height: '15px',
                                margin: '0 5px',
                                borderRadius: '50%',
                                backgroundColor:
                                    currentSlide === index
                                        ? 'black'
                                        : 'lightgray',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s',
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* 공식레시피 */}
            <div
                style={{
                    width: '100%',
                    backgroundColor: 'white',
                    padding: '40px 0',
                }}
            >
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <h1
                        className='butt'
                        style={{
                            fontWeight: 'bold',
                            marginTop: '20px',
                            textAlign: 'center',
                            margin: 'auto',
                            fontSize: '22px',
                            cursor: 'pointer',
                            width: 'max-content',
                        }}
                        onClick={handleMoreClick}
                        onMouseEnter={() => speakText('공식레시피')}
                    >
                        공식레시피
                    </h1>

                    <hr
                        style={{
                            marginTop: '15px',
                            backgroundColor: '#BDBDBD',
                            border: 'none',
                            height: '1px',
                            width: '80%',
                            margin: 'auto',
                        }}
                    />
                    <div
                        style={{
                            marginTop: '20px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                        }}
                    >
                        {recipes.slice(0, itemsPerPage).map((recipe) => (
                            <div
                                key={recipe.id}
                                className='box-container'
                                onClick={() => handleImageClick(recipe.id)}
                                onMouseEnter={() => speakText(recipe.name)}
                            >
                                <div className='image-container'>
                                    <Image
                                        src={recipe.image}
                                        alt={recipe.name}
                                        width={250}
                                        height={250}
                                        style={{ borderRadius: '4px' }}
                                    />
                                    <div className='image-overlay'>
                                        <Text
                                            style={{
                                                fontSize: '18px',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            상세 보기
                                        </Text>
                                    </div>
                                </div>
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
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 텍스트 영역 */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '20px 0',
                    textAlign: 'center',
                    color: 'black',
                    marginTop: '50px',
                    marginBottom: '50px',
                }}
            >
                <h1 style={{ fontSize: '40px', fontWeight: 'bold' }}>
                    눈으로 보고 귀로 듣는 요리
                </h1>
                <p style={{ fontSize: '18px' }}>
                    <i style={{ fontSize: '14px' }}>TTS로 들으면서 편하게</i>
                    <br />
                    <br />
                    다른 사람들과 함께 맛있는 이야기를 나눠요
                </p>
                <br />
                <br />
                <button
                    style={{
                        border: '1px solid gray',
                        borderRadius: '5px',
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        color: 'black',
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'background-color 0.1s',
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                            'rgba(170,170,170,0.3)')
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                            'rgba(255,255,255,0.3)')
                    }
                    onClick={handlejoinClick}
                >
                    Join Us
                </button>
            </div>

            {/* 사용자레시피 및 자유게시판 */}
            <div
                style={{
                    width: '100%',
                    backgroundColor: 'white',
                    padding: '20px 0',
                }}
            >
                {/* 텍스트 및 버튼 영역2 */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10%',
                        zIndex: 1,
                        marginTop: '50px',
                        marginBottom: '50px',
                    }}
                >
                    {/* 왼쪽 이미지 */}
                    <div
                        style={{
                            width: '300px',
                            height: '300px',
                            position: 'relative',
                        }}
                    >
                        <Image
                            src='/png/mainC.png' // 이미지 경로
                            alt='Description'
                            layout='fill'
                            objectFit='cover'
                            style={{ borderRadius: '10px' }}
                        />
                    </div>

                    {/* 오른쪽 텍스트 및 버튼 영역 */}
                    <div
                        style={{
                            textAlign: 'left',
                            color: 'black',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%',
                            width: '400px',
                        }}
                    >
                        <h1
                            style={{
                                fontSize: '22px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                            }}
                            className='butt'
                            onClick={handleUserRecipeClick}
                            onMouseEnter={() => speakText('모두의레시피')}
                        >
                            모두의레시피
                        </h1>
                        <hr
                            style={{
                                marginTop: '10px',
                                backgroundColor: '#BDBDBD',
                                border: 'none',
                                height: '1px',
                            }}
                        />
                        <p style={{ marginTop: '10px', fontSize: '14px' }}>
                            서로의 이야기를 공유하며 요리하는 공간
                        </p>
                        <div
                            style={{
                                marginTop: '5px',
                                display: 'flex',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <button
                                className='bg-red-600 text-white hover:bg-red-800'
                                style={{
                                    borderRadius: '5px',
                                    padding: '8px 15px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.1s',
                                }}
                                onClick={handleUserRecipeClick}
                            >
                                GO
                            </button>
                        </div>

                        <h1
                            style={{
                                marginTop: '30px',
                                fontSize: '22px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                            }}
                            className='butt'
                            onClick={handlefreeClick}
                            onMouseEnter={() => speakText('자유게시판')}
                        >
                            자유게시판
                        </h1>
                        <hr
                            style={{
                                marginTop: '10px',
                                backgroundColor: '#BDBDBD',
                                border: 'none',
                                height: '1px',
                            }}
                        />
                        <p style={{ marginTop: '10px', fontSize: '14px' }}>
                            궁금한 것이 있다면? 질문해도 좋아요!
                        </p>
                        <div
                            style={{
                                marginTop: '5px',
                                display: 'flex',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <button
                                className='bg-red-600 text-white hover:bg-red-800'
                                style={{
                                    borderRadius: '5px',
                                    padding: '8px 15px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.1s',
                                }}
                                onClick={handlefreeClick}
                            >
                                GO
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div
                style={{
                    backgroundColor: 'white',
                    width: '100%',
                    height: '20px',
                }}
            ></div>
            <div
                style={{
                    width: '100%',
                    height: '200px',
                    backgroundImage: 'url(/png/mainA.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            ></div>
            <div
                style={{
                    backgroundColor: 'white',
                    width: '100%',
                    height: '50px',
                }}
            ></div>
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: -1,
                        opacity: 0.6,
                    }}
                >
                    <Image
                        src='/png/mainE.png'
                        alt='Background'
                        layout='fill'
                        objectFit='cover'
                    />
                </div>
            </div>
            <style jsx>{`
                .butt {
                    position: relative;
                    transition: color 0.3s ease;
                    text-decoration: none;
                    font-size: 18px; /* 텍스트 크기 고정 */
                }

                .butt:hover {
                    color: #db0000; /* 호버 시 텍스트 색상 변경 */
                }

                .butt::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    bottom: -4px; /* 텍스트 아래 4px 위치 */
                    width: 0;
                    height: 3px; /* 밑줄 두께 */
                    background-color: #db0000; /* 밑줄 색상 */
                    transition: width 0.3s ease; /* 애니메이션 효과 */
                }

                .butt:hover::after {
                    width: 100%;
                }

                .box-container {
                    position: relative;
                    padding: 16px;
                    background-color: white;
                    margin: 10px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    cursor: pointer;
                    width: 250px;
                    overflow: hidden;
                }

                .image-container {
                    position: relative;
                }

                .image-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: rgba(0, 0, 0, 0.6);
                    color: white;
                    opacity: 0;
                    transition: opacity 0.3s;
                    border-radius: 8px;
                    z-index: 10;
                }

                .image-container:hover .image-overlay {
                    opacity: 1;
                }
            `}</style>
        </main>
    );
}
