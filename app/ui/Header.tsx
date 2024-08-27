'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import xml2js from 'xml2js';
import Link from 'next/link';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';

const logoSrc = '/svg/logo.svg';

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, loading: authLoading } = useAuth(); // 로딩 상태를 가져옴
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await fetch('/data/siterecipe.xml');
                const xmlData = await response.text();
                const parser = new xml2js.Parser();
                const result = await parser.parseStringPromise(xmlData);

                const recipes = result.COOKRCP01.row.map((rec: any) => ({
                    id: rec.RCP_SEQ[0],
                    name: rec.RCP_NM[0],
                    image: rec.ATT_FILE_NO_MAIN[0] || '/svg/logo.svg',
                    ingredients: rec.RCP_PARTS_DTLS[0],
                    manual: [
                        {
                            image: rec.MANUAL_IMG01[0],
                            text: rec.MANUAL01[0],
                        },
                        {
                            image: rec.MANUAL_IMG02[0],
                            text: rec.MANUAL02[0],
                        },
                        {
                            image: rec.MANUAL_IMG03[0],
                            text: rec.MANUAL03[0],
                        },
                    ].filter((item) => item.image && item.text),
                    calories: rec.INFO_ENG[0],
                    protein: rec.INFO_PRO[0],
                    fat: rec.INFO_FAT[0],
                    sodium: rec.INFO_NA[0],
                }));

                setRecipes(recipes);
            } catch (error) {
                console.error('Error parsing XML:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, []);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (term) {
            const filteredRecipes = Array.isArray(recipes)
                ? recipes.filter(
                      (recipe: any) =>
                          recipe.name
                              ?.toLowerCase()
                              .includes(term.toLowerCase()) ||
                          recipe.ingredients
                              ?.toLowerCase()
                              .includes(term.toLowerCase())
                  )
                : [];
            setSearchResults(filteredRecipes);
        } else {
            setSearchResults([]);
        }
    };

    const handleMenuClick = (href: string) => {
        setMenuOpen(false);
        window.location.href = href;
    };

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    const speakText = (text: string) => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko';
        window.speechSynthesis.speak(utterance);
    };

    if (authLoading) {
        return <LoadingScreen />; // 로딩 중일 때 로딩 스크린을 렌더링
    }

    return (
        <nav className='bg-white text-black px-6 sm:px-24 flex items-center justify-between w-full'>
            <div
                className='flex-shrink-0'
                // onMouseEnter={() => speakText('홈')}
                style={{ marginRight: '20px', marginLeft: '40px' }}
            >
                <Link href='/'>
                    <Image
                        src={logoSrc}
                        alt='logo'
                        width={220}
                        height={140}
                    />
                </Link>
            </div>
            <div className='flex-grow flex items-center justify-center space-x-6 ml-12 hidden xl:flex'>
                {/* <button
                    onClick={() => handleMenuClick('/')}
                    onMouseEnter={() => speakText('홈')}
                    className='block butt'
                    style={{ fontSize: '18px', width:'max-content' }}
                >
                    홈
                </button> */}
                <button
                    onClick={() => handleMenuClick('/siteRecipe')}
                    onMouseEnter={() => speakText('공식레시피')}
                    className='block butt'
                    style={{ fontSize: '18px', width: 'max-content' }}
                >
                    공식레시피
                </button>
                <button
                    onClick={() => handleMenuClick('/userRecipe')}
                    onMouseEnter={() => speakText('모두의레시피')}
                    className='block butt'
                    style={{ fontSize: '18px', width: 'max-content' }}
                >
                    모두의레시피
                </button>
                <button
                    onClick={() => handleMenuClick('/freeBoard')}
                    onMouseEnter={() => speakText('자유게시판')}
                    className='block butt'
                    style={{ fontSize: '18px', width: 'max-content' }}
                >
                    자유게시판
                </button>
                {user ? (
                    <>
                        <button
                            onClick={() => handleMenuClick('/myPage')}
                            onMouseEnter={() => speakText('마이페이지')}
                            className='block butt'
                            style={{ fontSize: '18px', width: 'max-content' }}
                        >
                            마이페이지
                        </button>
                        <button
                            onClick={() => handleMenuClick('/logout')}
                            onMouseEnter={() => speakText('로그아웃')}
                            className='block butt'
                            style={{ fontSize: '18px', width: 'max-content' }}
                        >
                            로그아웃
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => handleMenuClick('/signup')}
                            onMouseEnter={() => speakText('회원가입')}
                            className='block butt'
                            style={{ fontSize: '18px', width: 'max-content' }}
                        >
                            회원가입
                        </button>
                        <button
                            onClick={() => handleMenuClick('/login')}
                            onMouseEnter={() => speakText('로그인')}
                            className='block butt'
                            style={{ fontSize: '18px', width: 'max-content' }}
                        >
                            로그인
                        </button>
                    </>
                )}
            </div>
            <div className='relative flex-grow flex justify-center'>
                <div className='relative'>
                    <input
                        type='text'
                        className='bg-transparent border border-gray-300 text-black p-2 text-lg focus:outline-none focus:border-gray-300 rounded-3xl pr-10'
                        placeholder=' 오늘의 메뉴'
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{
                            borderRadius: '32px',
                            borderWidth: '1px',
                            borderColor: '#D1D5DB',
                            fontSize: '16px',
                            width: '100%',
                            maxWidth: '400px',
                            textAlign: 'center',
                        }}
                    />
                    <button
                        className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                        onClick={() => handleSearch(searchTerm)}
                        style={{ cursor: 'pointer' }}
                    >
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                            className='w-6 h-6'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M21 21l-4.35-4.35m2.1-5.35a7 7 0 11-14 0 7 7 0 0114 0z'
                            />
                        </svg>
                    </button>
                </div>
                {searchResults.length > 0 && (
                    <div className='dropdown-menu absolute bg-white shadow-lg rounded-lg p-4 mt-4 w-full max-w-lg max-h-60 overflow-y-auto'>
                        <ul>
                            {searchResults.map((recipe: any) => (
                                <li
                                    key={recipe.id}
                                    className='p-2 border-b last:border-b-0'
                                >
                                    <button
                                        onClick={() =>
                                            handleMenuClick(
                                                `/galleryPost?id=${recipe.id}`
                                            )
                                        }
                                        className='hover:text-red-600 w-full text-left'
                                    >
                                        {recipe.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <div className='relative xl:hidden'>
                <button
                    onClick={toggleMenu}
                    className='focus:outline-none'
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        className='w-6 h-6'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M4 6h16M4 12h16m-7 6h7'
                        />
                    </svg>
                </button>
                {menuOpen && (
                    <div className='absolute top-full right-0 bg-white shadow-md rounded-lg p-4 w-48 max-h-60 overflow-y-auto z-50'>
                        {/* <button
                onClick={() => handleMenuClick('/')}
                className='block butt'
                style={{margin:'5px'}}
            >
                홈
            </button> */}
                        <button
                            onClick={() => handleMenuClick('/siteRecipe')}
                            className='block butt'
                            style={{ margin: '5px' }}
                        >
                            공식레시피
                        </button>
                        <button
                            onClick={() => handleMenuClick('/userRecipe')}
                            className='block butt'
                            style={{ margin: '5px' }}
                        >
                            모두의레시피
                        </button>
                        <button
                            onClick={() => handleMenuClick('/freeBoard')}
                            className='block butt'
                            style={{ margin: '5px' }}
                        >
                            자유게시판
                        </button>
                        {user ? (
                            <>
                                <button
                                    onClick={() => handleMenuClick('/myPage')}
                                    className='block butt'
                                    style={{ margin: '5px' }}
                                >
                                    마이페이지
                                </button>
                                <button
                                    onClick={() => handleMenuClick('/logout')}
                                    className='block butt'
                                    style={{ margin: '5px' }}
                                >
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleMenuClick('/signup')}
                                    className='block butt'
                                    style={{ margin: '5px' }}
                                >
                                    회원가입
                                </button>
                                <button
                                    onClick={() => handleMenuClick('/login')}
                                    className='block butt'
                                    style={{ margin: '5px' }}
                                >
                                    로그인
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
            <style jsx>{`
                .butt {
                    position: relative;
                    transition: color 0.3s ease;
                    text-decoration: none;
                    font-size: 18px; /* 텍스트 크기 고정 */
                }

                .butt:hover {
                    color: #DB0000; /* 호버 시 텍스트 색상 변경 */
                }

                .butt::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    bottom: -4px; /* 텍스트 아래 4px 위치 */
                    width: 0;
                    height: 3px; /* 밑줄 두께 */
                    background-color: #DB0000; /* 밑줄 색상 */
                    transition: width 0.3s ease; /* 애니메이션 효과 */
                }

                .butt:hover::after {
                    width: 100%;
                }
            `}</style>
        </nav>
    );
};

export default Header;
