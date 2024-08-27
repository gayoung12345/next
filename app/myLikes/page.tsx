// MyLikes.tsx
'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import xml2js from 'xml2js'; // XML 데이터를 파싱하기 위한 라이브러리
import debounce from 'lodash/debounce';
import Image from 'next/image'; // Next.js Image 컴포넌트 import
import { useRouter } from 'next/navigation';
import TopBar from '@/components/Topbar';

// 타입 정의
interface Recipe {
    id: string;
    name: string;
    image: string;
    ingredients: string;
}

interface XmlResult {
    COOKRCP01: {
        row: {
            RCP_SEQ: string[];
            RCP_NM: string[];
            ATT_FILE_NO_MAIN: string[];
            RCP_PARTS_DTLS: string[];
        }[];
    };
}

const MyLikes = () => {
    const { user } = useAuth();
    const [likedRecipes, setLikedRecipes] = useState<Recipe[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        const fetchLikedRecipes = async () => {
            if (!user) return;

            try {
                const q = query(
                    collection(db, 'likes'),
                    where('userId', '==', user.uid)
                );
                const querySnapshot = await getDocs(q);
                const likedRecipeIds = querySnapshot.docs.map(
                    (doc) => doc.data().recipeId
                );

                const response = await fetch('/data/siterecipe.xml');
                const xmlData = await response.text();
                const parser = new xml2js.Parser();
                const result = (await parser.parseStringPromise(
                    xmlData
                )) as XmlResult;

                const recipes: Recipe[] = result.COOKRCP01.row.map((rec) => ({
                    id: rec.RCP_SEQ[0],
                    name: rec.RCP_NM[0],
                    image: rec.ATT_FILE_NO_MAIN[0] || '/svg/logo.svg', // 기본 이미지 경로 설정
                    ingredients: rec.RCP_PARTS_DTLS[0],
                }));

                const filteredLikedRecipes = recipes.filter((recipe) =>
                    likedRecipeIds.includes(recipe.id)
                );
                setLikedRecipes(filteredLikedRecipes);
                setSearchResults(filteredLikedRecipes);
            } catch (error) {
                console.error('Error fetching liked recipes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLikedRecipes();
    }, [user]);

    const debouncedSearch = debounce((term: string) => {
        if (term) {
            const filteredRecipes = likedRecipes.filter(
                (recipe) =>
                    recipe.name.toLowerCase().includes(term.toLowerCase()) ||
                    recipe.ingredients
                        .toLowerCase()
                        .includes(term.toLowerCase())
            );
            setSearchResults(filteredRecipes);
        } else {
            setSearchResults(likedRecipes);
        }
    }, 300);

    const handleSearch = () => {
        debouncedSearch(searchTerm);
    };

    if (loading) {
        return <div className='spinner'></div>;
    }

    return (
        <div className='p-6'>
            <TopBar />
            <h1
                className='text-3xl font-bold mb-6 text-center'
                style={{ marginTop: '40px' }}
            >
                좋아요 리스트
            </h1>

            {searchResults.length > 0 ? (
                <div style={{ marginTop: '60px', marginBottom: '20px' }}>
                    <ul className='flex flex-wrap justify-center'>
                        {searchResults.map((recipe) => (
                            <li
                                key={recipe.id}
                                className='flex flex-col items-center m-4'
                                onClick={() =>
                                    router.push(`/galleryPost?id=${recipe.id}`)
                                } // 이미지 클릭 시 페이지 이동
                            >
                                <Image
                                    src={recipe.image} // 기본 이미지 설정
                                    alt={recipe.name}
                                    width={300} // 이미지의 너비 설정
                                    height={200} // 이미지의 높이 설정
                                    className='rounded-lg mb-2 cursor-pointer' // 이미지에 포인터 커서 추가
                                    onError={(e) => {
                                        // 이미지 로드 오류 시 기본 이미지로 변경
                                        (e.target as HTMLImageElement).src =
                                            '/svg/logo.svg';
                                    }}
                                />
                                <div className='text-center'>
                                    <h2 className='text-lg font-semibold'>
                                        {recipe.name}
                                    </h2>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div
                        className='flex justify-center mb-6 space-x-1'
                        style={{ marginTop: '40px', marginBottom: '30px' }}
                    >
                        <input
                            type='text'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder='검색어를 입력하세요...'
                            style={{
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                width: '400px',
                                marginRight: '4px', // 검색 버튼과의 간격 조정
                            }}
                        />
                        <button
                            onClick={handleSearch} // 검색 버튼 클릭 시 검색 함수 호출
                            type='button'
                            className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600'
                        >
                            검색
                        </button>
                    </div>
                </div>
            ) : (
                <p className='text-center text-gray-600'>
                    No liked recipes found.
                </p>
            )}
        </div>
    );
};

export default MyLikes;
