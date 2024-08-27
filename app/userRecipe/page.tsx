'use client';
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useRouter } from 'next/navigation';
import { FaArrowUp } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';
import { Box } from '@/components/ui/box/index.web';
interface Recipe {
    id: string;
    title: string;
    images?: {
        'main-image'?: string;
    };
    'main-image'?: string;
}
interface GridProps extends React.HTMLProps<HTMLDivElement> {
    children: React.ReactNode;
}
const Grid: React.FC<GridProps> = ({ children, style, ...props }) => (
    <div
        style={style}
        {...props}
    >
        {children}
    </div>
);
const UserRecipe = () => {
    const { user } = useAuth();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();
    useEffect(() => {
        const fetchRecipes = async () => {
            setLoading(true);
            const userRecipeSnapshot = await getDocs(
                collection(db, 'userRecipe')
            );
            const testRecipeSnapshot = await getDocs(
                collection(db, 'testRecipe')
            );
            const fetchedRecipes: Recipe[] = [];
            userRecipeSnapshot.forEach((doc) => {
                fetchedRecipes.push({ id: doc.id, ...doc.data() } as Recipe);
            });
            testRecipeSnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedRecipes.push({
                    id: doc.id,
                    title: data.title,
                    'main-image': data['main-image'],
                } as Recipe);
            });
            setRecipes(fetchedRecipes);
            setLoading(false);
        };
        fetchRecipes();
    }, []);
    
    const handleRecipeClick = (id: string) => {
        router.push(`/userRecipe/${id}`);
    };
    const handleWriteRecipeClick = () => {
        if (user) {
            router.push('/recipeWrite');
        } else {
            alert('로그인 해주세요.');
            router.push('/login');
        }
    };
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };
    const handleWriteClick = () => {
        router.push('/recipeWrite');
    };
    // Function to handle Text-to-Speech
    const speakText = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    };
    return (
        <main>
            <Box
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '30vh',
                    overflow: 'hidden',
                    marginBottom: '30px',
                }}
            >
                <Image
                    src='/png/userRecipe.png'
                    layout='fill'
                    objectFit='cover'
                    alt={'자유게시판'}
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
                        textShadow: '3px 3px 6px rgba(0, 0, 0, 0.8)',
                        zIndex: 1,
                        textAlign: 'center',
                    }}
                >
                    레시피 갤러리
                </Box>
            </Box>
            <Grid>
                <div
                    style={{
                        width: '70%',
                        margin: 'auto',
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}
                >
                    <button
                        type='button'
                        className='bg-red-600 text-white hover:bg-red-800 transition-colors border-2 border-black'
                        onClick={handleWriteClick}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            width: '150px',
                        }}
                    >
                        레시피 등록하기
                    </button>
                </div>
                {loading ? (
                    <div className='spinner'></div>
                ) : (
                    <div className='relative max-w-6xl mx-auto p-4'>
                        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                            {recipes.map((recipe) => (
                                <div
                                    key={recipe.id}
                                    style={{
                                        position: 'relative',
                                        padding: '16px',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                        transition: 'transform 0.3s',
                                        borderRadius: '8px',
                                    }}
                                    onClick={() => handleRecipeClick(recipe.id)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform =
                                            'scale(1.05)';
                                        speakText(recipe.title); // Trigger TTS when hovering
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform =
                                            'scale(1)';
                                    }}
                                >
                                    <div style={{ position: 'relative' }}>
                                        <Image
                                            src={
                                                (recipe.images?.[
                                                    'main-image'
                                                ] as string) ||
                                                (recipe['main-image'] as string)
                                            }
                                            alt={recipe.title}
                                            style={{
                                                width: '100%',
                                                height: '200px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                            }}
                                            width={400}
                                            height={200}
                                        />
                                        <div
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
                                                handleRecipeClick(recipe.id)
                                            }
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.opacity =
                                                    '1';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.opacity =
                                                    '0';
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '18px',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                상세 보기
                                            </span>
                                        </div>
                                    </div>
                                    <h2
                                        style={{
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            marginTop: '8px',
                                            textAlign: 'center',
                                        }}
                                    >
                                        {recipe.title}
                                    </h2>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className='fixed right-8 bottom-80 md:right-12 md:bottom-80 z-10'>
                    <button
                        onClick={scrollToTop}
                        style={{
                            color: '#FFFFFF',
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
                            color='#FFFFFF'
                        />
                    </button>
                </div>
            </Grid>
        </main>
    );
};
export default UserRecipe;
