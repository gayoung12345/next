'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/lib/firebaseConfig';
import { FaArrowUp } from 'react-icons/fa';
import {
    FaHeart,
    FaPause,
    FaPlay,
    FaStop,
    FaTrash,
    FaVolumeUp,
} from 'react-icons/fa';
import TextToSpeechDiv from '@/components/tts/textToSpeech';
import {
    doc,
    query,
    where,
    collection,
    addDoc,
    getDoc,
    getDocs,
    deleteDoc,
} from 'firebase/firestore';
import Image from 'next/image';

interface Recipe {
    title: string;
    description: string;
    category: {
        method: string;
        ingredient: string;
    };
    images: {
        'main-image': string;
    };
    steps: {
        description: string;
        image: string | null;
    }[];
    ingredients: {
        name: string;
        quantity: string;
        unit: string;
    }[];
    user: string;
}
// 스크롤을 페이지 상단으로 이동시키는 함수
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth', // 부드러운 스크롤 효과
    });
};

interface Comment {
    userId: string;
    userEmail: string | null;
    text: string;
    recipeId: string;
}

const RecipeDetail = ({ params }: { params: { id: string } }) => {
    const [liked, setLiked] = useState(false);
    const router = useRouter();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const { id } = params;
    const [speechRate, setSpeechRate] = useState<number>(1);
    const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(
        null
    );
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [user, setUser] = useState<any | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const checkIfLiked = async () => {
            if (user && recipe) {
                const likesRef = collection(db, 'likes');
                const q = query(
                    likesRef,
                    where('recipeId', '==', id),
                    where('userId', '==', user.uid)
                );
                const querySnapshot = await getDocs(q);

                setLiked(!querySnapshot.empty);
            }
        };

        checkIfLiked();
    }, [user, recipe]);

    const speakText = (text: string) => {
        if ('speechSynthesis' in window) {
            const newUtterance = new SpeechSynthesisUtterance(text);
            newUtterance.rate = speechRate; // Set speech rate
            setUtterance(newUtterance);
            speechSynthesis.speak(newUtterance);
            setIsSpeaking(true);
        } else {
            console.warn('Speech synthesis not supported in this browser.');
        }
    };

    const handleTtsClick = () => {
        if (recipe) {
            // 레시피 이름 읽어주기
            speakText(recipe.title);

            // 메뉴얼 읽어주기
            recipe.steps.forEach((item) => {
                speakText(item.description);
            });
        }
    };

    const handleRateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSpeechRate(parseFloat(event.target.value));
    };

    const handlePauseClick = () => {
        if ('speechSynthesis' in window && isSpeaking) {
            speechSynthesis.pause();
        }
    };

    const handleResumeClick = () => {
        if ('speechSynthesis' in window && isSpeaking) {
            speechSynthesis.resume();
        }
    };

    const handleStopClick = () => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const handleBackClick = () => {
        router.back();
    };

    const handleLikeToggle = async () => {
        if (user) {
            const likesRef = collection(db, 'likes');
            const q = query(
                likesRef,
                where('recipeId', '==', id),
                where('userId', '==', user.uid)
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // 좋아요가 없는 경우, 좋아요 추가
                try {
                    await addDoc(likesRef, {
                        recipeId: id,
                        userId: user.uid,
                    });
                    setLiked(true);
                } catch (error) {
                    console.error('Error adding like:', error);
                }
            } else {
                // 좋아요가 있는 경우, 좋아요 제거
                try {
                    querySnapshot.forEach(async (doc) => {
                        await deleteDoc(doc.ref);
                    });
                    setLiked(false);
                } catch (error) {
                    console.error('Error removing like:', error);
                }
            }
        } else {
            // 로그인하지 않은 경우 알림과 리다이렉트
            alert('좋아요를 클릭하려면 로그인해야 합니다.');
            router.push('/login'); // 로그인 페이지로 리다이렉트
        }
    };

    const handleAddComment = async () => {
        if (user) {
            if (newComment.trim()) {
                try {
                    await addDoc(collection(db, 'comments'), {
                        recipeId: id,
                        userId: user.uid,
                        text: newComment,
                        timestamp: new Date(),
                    });
                    setComments((prevComments) => [
                        ...prevComments,
                        {
                            userId: user.uid,
                            userEmail: user.email || 'unknown',
                            text: newComment,
                            recipeId: id,
                        },
                    ]);
                    setNewComment('');
                } catch (error) {
                    console.error('Error adding comment:', error);
                }
            }
        } else {
            // 로그인하지 않은 경우 알림과 리다이렉트
            alert('댓글을 작성하려면 로그인해야 합니다.');
            router.push('/login'); // 로그인 페이지로 리다이렉트
        }
    };

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'comments'));
                const commentsList = querySnapshot.docs.map((doc) =>
                    doc.data()
                ) as Comment[];

                // 댓글 목록에서 recipeId가 일치하는 댓글만 필터링
                const filteredComments = commentsList.filter(
                    (comment) => comment.recipeId === id
                );

                setComments(filteredComments);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        if (recipe) {
            fetchComments();
        }
    }, [recipe]);

    useEffect(() => {
        const fetchRecipe = async () => {
            if (id) {
                let docRef = doc(db, 'userRecipe', id);
                let docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setRecipe(docSnap.data() as Recipe);
                } else {
                    // If the recipe is not in 'userRecipe', check 'testRecipe'
                    docRef = doc(db, 'testRecipe', id);
                    docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const testRecipeData = docSnap.data();
                        // Adjust data to match the structure of Recipe interface
                        const adjustedRecipe: Recipe = {
                            user: '',
                            title: testRecipeData.title || '',
                            description: testRecipeData.description || '',
                            category: {
                                method: testRecipeData.category?.method || '',
                                ingredient:
                                    testRecipeData.category?.ingredient || '',
                            },

                            images: {
                                'main-image': testRecipeData['main-image']
                                    ? testRecipeData['main-image']
                                    : '',
                            },
                            steps: testRecipeData.steps || [],
                            ingredients: testRecipeData.ingredients
                                ? testRecipeData.ingredients.map(
                                      (ingredient: string) => {
                                          const [name, quantity, unit] =
                                              ingredient.split(' ');
                                          return { name, quantity, unit };
                                      }
                                  )
                                : [],
                        };
                        setRecipe(adjustedRecipe);
                    } else {
                        console.error('No such document!');
                        router.push('/404');
                    }
                }
            }
        };

        fetchRecipe();
    }, [id]);

    const handleDeleteRecipe = async () => {
        if (confirm('정말로 이 레시피를 삭제하시겠습니까?')) {
            try {
                // 레시피 삭제
                await deleteDoc(doc(db, 'userRecipe', id));
                alert('레시피가 삭제되었습니다.');
                router.push('/'); // 홈으로 리다이렉트
            } catch (error) {
                console.error('Error deleting recipe:', error);
            }
        }
    };

    if (!recipe) return <div className='spinner'></div>;

    return (
        <main
            className='max-w-4xl mx-auto p-4'
            style={{ marginTop: '120px' }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '24px',
                }}
            >
                {/* 이미지 */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center', // 중앙 정렬
                    }}
                >
                    <Image
                        src={recipe.images['main-image']}
                        alt={recipe.title}
                        width={400}
                        height={400}
                        style={{
                            width: '400PX',
                            height: '400PX',
                            marginBottom: '22px', // 이미지와 버튼 사이의 간격
                            marginRight: '22px',
                        }}
                    />
                    {/* TTS 버튼 영역 */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: '16px',
                            marginTop: '20px',
                            marginBottom: '16px',
                        }}
                    >
                        <button
                            onClick={handleTtsClick}
                            style={{
                                color: '#ffffff',
                                backgroundColor: '#DB0000',
                                width: 80,
                                height: 40,
                                borderRadius: 20,
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '16px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                transition:
                                    'background-color 0.3s, box-shadow 0.3s, color 0.3s',
                            }}
                            onMouseDown={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#A50000';
                            }}
                            onMouseUp={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#DB0000';
                            }}
                        >
                            <FaVolumeUp size={20} />
                        </button>
                        <select
                            value={speechRate}
                            onChange={handleRateChange}
                            style={{
                                width: 80,
                                height: 40,
                                borderRadius: 20,
                                border: '1px solid #ddd',
                                padding: '0 10px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                boxSizing: 'border-box',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            }}
                        >
                            <option value={0.5}>0.5배속</option>
                            <option value={1}>1배속</option>
                            <option value={2}>2배속</option>
                        </select>
                        <button
                            onClick={handlePauseClick}
                            style={{
                                color: '#ffffff',
                                backgroundColor: '#DB0000',
                                width: 80,
                                height: 40,
                                borderRadius: 20,
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '16px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                transition:
                                    'background-color 0.3s, box-shadow 0.3s, color 0.3s',
                            }}
                            onMouseDown={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#A50000';
                            }}
                            onMouseUp={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#DB0000';
                            }}
                        >
                            <FaPause size={15} />
                        </button>
                        <button
                            onClick={handleResumeClick}
                            style={{
                                color: '#ffffff',
                                backgroundColor: '#DB0000',
                                width: 80,
                                height: 40,
                                borderRadius: 20,
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '16px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                transition:
                                    'background-color 0.3s, box-shadow 0.3s, color 0.3s',
                            }}
                            onMouseDown={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#A50000';
                            }}
                            onMouseUp={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#DB0000';
                            }}
                        >
                            <FaPlay size={15} />
                        </button>
                        <button
                            onClick={handleStopClick}
                            style={{
                                color: '#ffffff',
                                backgroundColor: '#DB0000',
                                width: 80,
                                height: 40,
                                borderRadius: 20,
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '16px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                transition:
                                    'background-color 0.3s, box-shadow 0.3s, color 0.3s',
                            }}
                            onMouseDown={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#A50000';
                            }}
                            onMouseUp={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#DB0000';
                            }}
                        >
                            <FaStop size={15} />
                        </button>
                    </div>
                </div>

                {/* 제목, 설명, 재료를 세로로 나열 */}
                <div style={{ padding: '16px', flex: '1' }}>
                    {/* 제목 */}
                    <TextToSpeechDiv>
                        <div
                            style={{
                                display: 'flex', // 가로 정렬
                                alignItems: 'center', // 수직 정렬
                                marginBottom: '16px',
                            }}
                        >
                            <h1
                                style={{
                                    fontSize: '32px',
                                    fontWeight: '600',
                                    color: '#383838',
                                    marginRight: '16px',
                                }}
                            >
                                {recipe.title}
                            </h1>

                            <div style={{ display: 'flex' }}>
                                <button
                                    onClick={handleLikeToggle}
                                    style={{
                                        background: 'none',
                                        cursor: 'pointer',
                                        display: 'flex', // 가로 정렬
                                        alignItems: 'center', // 세로 정렬
                                        color: '#DB0000', // 텍스트 색상 주황색
                                        fontSize: '24px', // 텍스트 크기
                                        fontWeight: '600', // 텍스트 두께
                                        transition:
                                            'background-color 0.3s, color 0.3s', // 색상 변경 시 부드러운 전환 효과
                                    }}
                                >
                                    <FaHeart color={liked ? 'red' : 'gray'} />
                                </button>
                            </div>
                        </div>
                    </TextToSpeechDiv>
                    {/* 설명 */}
                    <TextToSpeechDiv>
                        <div
                            style={{
                                fontSize: '15px',
                                color: '#5c5c5c',
                            }}
                        >
                            <p>{recipe.description}</p>
                        </div>
                    </TextToSpeechDiv>

                    {/* 재료 */}
                    <TextToSpeechDiv>
                        <h2
                            style={{
                                fontSize: '21px',
                                fontWeight: '600',
                                marginTop: '32px',
                                marginBottom: '8px',
                                color: '#383838',
                            }}
                        >
                            재료
                        </h2>
                        <div
                            style={{
                                fontSize: '15px',
                                marginBottom: '8px',
                                color: '#5c5c5c',
                            }}
                        >
                            {recipe.ingredients.map((ingredient, index) => (
                                <div key={index}>
                                    {ingredient.name} {ingredient.quantity}{' '}
                                    {ingredient.unit}
                                </div>
                            ))}
                        </div>
                    </TextToSpeechDiv>
                </div>
            </div>

            {/* 회색 박스 */}
            <div
                style={{
                    marginTop: '80px',
                    marginBottom: '100px',
                }}
            >
                {/* 조리법 */}
                <TextToSpeechDiv>
                    <h2
                        style={{
                            fontSize: '21px',
                            fontWeight: '600',
                            marginBottom: '24px',
                            color: '#383838',
                        }}
                    >
                        ※ 조리법
                    </h2>
                    <div>
                        {recipe.steps.map((step, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '18px',
                                }}
                            >
                                {step.image && (
                                    <Image
                                        width={200}
                                        height={200}
                                        src={step.image}
                                        alt={`Step ${index + 1}`}
                                        style={{
                                            objectFit: 'cover',
                                            marginRight: '18px',
                                        }}
                                    />
                                )}

                                <p style={{ fontSize: '16px' }}>
                                    {index + 1}. {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </TextToSpeechDiv>
            </div>
            <div
                style={{
                    margin: '0 auto', // 중앙 정렬
                    marginTop: '80px',
                    marginBottom: '50px',
                }}
            >
                <h2
                    style={{
                        fontSize: '21px',
                        fontWeight: '600',
                        marginTop: '32px',
                        marginBottom: '18px',
                        color: '#383838',
                    }}
                >
                    댓글
                </h2>
                <div
                    style={{
                        display: 'flex',
                        gap: '8px', // 입력 필드와 버튼 사이의 간격
                        marginBottom: '8px',
                    }}
                >
                    <textarea
                        value={newComment} // 댓글 입력 필드
                        onChange={
                            (e) => setNewComment(e.target.value) // 입력된 댓글을 상태로 저장
                        }
                        rows={3}
                        placeholder='댓글을 작성하세요.'
                        style={{
                            flex: '1', // 가로 공간을 최대한 차지하도록 설정
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '16px',
                            boxSizing: 'border-box',
                            height: 80,
                        }}
                    />
                    <button
                        onClick={handleAddComment} // 댓글 작성 버튼 클릭 시 handleAddComment 호출
                        style={{
                            color: '#ffffff',
                            backgroundColor: '#DB0000', // 기본 주황색
                            height: 80,
                            borderRadius: 4,
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '16px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            transition:
                                'background-color 0.3s, box-shadow 0.3s, color 0.3s',
                            padding: '0 16px', // 버튼 내 여백
                        }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.backgroundColor = '#A50000'; // 클릭 시 색상
                            e.currentTarget.style.color = '#ffffff'; // 클릭 시 글씨 색상
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.backgroundColor = '#DB0000'; // 기본 색상으로 복구
                            e.currentTarget.style.color = '#ffffff'; // 기본 글씨 색상
                        }}
                    >
                        댓글 작성
                    </button>
                </div>
                {comments.map((comment, index) => (
                    <div
                        key={index}
                        style={{
                            border: '1px solid #ddd',
                            padding: '8px',
                            marginBottom: '8px',
                            borderRadius: '4px',
                        }}
                    >
                        <p
                            style={{
                                fontSize: '16px',
                                color: '#DB0000',
                                marginBottom: '4px',
                            }}
                        >
                            {comment.userEmail}
                        </p>
                        <p style={{ fontSize: '15px', color: '#5c5c5c' }}>
                            {comment.text}
                        </p>
                    </div>
                ))}
            </div>
            {user && user.email === recipe.user && (
                <button
                    onClick={handleDeleteRecipe}
                    className='flex items-center p-2 border rounded bg-red-500 text-white'
                >
                    <FaTrash
                        size={24}
                        className='mr-2'
                    />
                    Delete Recipe
                </button>
            )}
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
        </main>
    );
};

export default RecipeDetail;
