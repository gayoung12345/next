// galleryPost 공식레시피 상세보기
'use client'; // 이 줄을 추가하여 이 파일이 클라이언트 컴포넌트임을 명시합니다.

import React, {
    CSSProperties,
    HTMLProps,
    ReactNode,
    useEffect,
    useState,
} from 'react'; // React와 필요한 훅들을 import
import { useRouter } from 'next/navigation'; // Next.js의 라우팅 훅을 import
import Image from 'next/image'; // 이미지 최적화를 위한 Next.js Image 컴포넌트
import xml2js from 'xml2js'; // XML 데이터를 파싱하기 위한 라이브러리
import {
    FaArrowLeft,
    FaPause,
    FaPlay,
    FaStop,
    FaHeart,
    FaVolumeUp,
} from 'react-icons/fa'; // 아이콘을 위한 라이브러리
import { db, auth } from '../../lib/firebaseConfig'; // Firebase 설정 파일 import
import { onAuthStateChanged, User } from 'firebase/auth'; // Firebase 인증 상태 변화를 감지하는 함수
import {
    query,
    where,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
} from 'firebase/firestore'; // Firestore 관련 함수들 import
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

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

// 타입 정의
interface Recipe {
    calories: ReactNode;
    protein: ReactNode;
    fat: ReactNode;
    sodium: ReactNode;
    ingredients: ReactNode;
    image: string | StaticImport;
    manual: any;
    name: string;
    id: string;
    // 기타 속성들
}
interface Comment {
    userId: string;
    userEmail: string | null;
    // userName: string;
    text: string;
    recipeId: string;
}

const GalleryPost = () => {
    const router = useRouter(); // 페이지 이동을 위한 라우터 객체 생성
    const [recipe, setRecipe] = useState<Recipe | null>(null); // 레시피 데이터를 저장할 상태 변수
    const [loading, setLoading] = useState(true); // 데이터 로딩 상태를 관리하는 변수
    const [speechRate, setSpeechRate] = useState(1); // TTS 재생 속도를 관리하는 상태 변수
    const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(
        null
    ); // TTS Utterance 객체를 저장할 상태 변수
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false); // 현재 TTS가 재생 중인지 여부를 저장하는 상태 변수
    const [isPaused, setIsPaused] = useState<boolean>(false); // 현재 TTS가 일시 정지 상태인지 여부를 저장하는 상태 변수
    const [liked, setLiked] = useState<boolean>(false); // 현재 사용자가 좋아요를 눌렀는지 여부를 저장하는 상태 변수
    const [newComment, setNewComment] = useState(''); // 새 댓글 내용을 저장할 상태 변수
    const [comments, setComments] = useState<Comment[]>([]); // 댓글 목록을 저장할 상태 변수
    const [user, setUser] = useState<User | null>(null); // 현재 로그인한 사용자 정보를 저장할 상태 변수
    const [searchTerm, setSearchTerm] = useState(''); // 검색어를 저장할 상태 변수

    // 상태 타입을 SpeechSynthesisUtterance | null로 설정

    // 레시피 데이터를 가져오는 useEffect
    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const url = new URL(window.location.href); // 현재 URL을 가져옴
                const recipeId = url.searchParams.get('id'); // URL의 쿼리 파라미터에서 레시피 ID를 추출

                const response = await fetch('/data/siterecipe.xml'); // XML 데이터를 가져옴
                const xmlData = await response.text(); // 텍스트 형태로 XML 데이터를 파싱
                const parser = new xml2js.Parser(); // XML 파서를 생성
                const result = await parser.parseStringPromise(xmlData); // XML 데이터를 파싱하여 JavaScript 객체로 변환

                const recipes = result.COOKRCP01.row; // 레시피 목록을 가져옴
                const foundRecipe = recipes.find(
                    (rec: any) => rec.RCP_SEQ[0] === recipeId
                ); // URL에서 추출한 레시피 ID와 일치하는 레시피를 찾음

                if (foundRecipe) {
                    // 레시피 데이터를 구조화하여 상태 변수에 저장
                    const recipeData = {
                        id: foundRecipe.RCP_SEQ[0],
                        name: foundRecipe.RCP_NM[0],
                        image:
                            foundRecipe.ATT_FILE_NO_MAIN[0] || '/svg/logo.svg',
                        ingredients: foundRecipe.RCP_PARTS_DTLS[0],
                        manual: [
                            {
                                image: foundRecipe.MANUAL_IMG01[0],
                                text: foundRecipe.MANUAL01[0],
                            },
                            {
                                image: foundRecipe.MANUAL_IMG02[0],
                                text: foundRecipe.MANUAL02[0],
                            },
                            {
                                image: foundRecipe.MANUAL_IMG03[0],
                                text: foundRecipe.MANUAL03[0],
                            },
                        ].filter((item) => item.image && item.text),
                        calories: foundRecipe.INFO_ENG[0],
                        protein: foundRecipe.INFO_PRO[0],
                        fat: foundRecipe.INFO_FAT[0],
                        sodium: foundRecipe.INFO_NA[0],
                    };
                    setRecipe(recipeData as any); // 상태 변수에 레시피 데이터 저장
                }
            } catch (error) {
                console.error('Error parsing XML:', error); // 에러 발생 시 콘솔에 출력
            } finally {
                setLoading(false); // 데이터 로딩이 끝난 후 상태 업데이트
            }
        };

        fetchRecipe(); // 레시피 데이터를 가져오는 함수 호출
    }, []); // 빈 배열을 의존성으로 하여 컴포넌트 마운트 시 한 번만 실행

    // Firebase 인증 상태를 감지하여 사용자 정보를 가져오는 useEffect
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => unsubscribe(); // 컴포넌트 언마운트 시 구독 해제
    }, []);

    useEffect(() => {
        const checkIfLiked = async () => {
            if (user && recipe) {
                const likesRef = collection(db, 'likes');
                const q = query(
                    likesRef,
                    where('recipeId', '==', recipe.id),
                    where('userId', '==', user.uid)
                );
                const querySnapshot = await getDocs(q);

                setLiked(!querySnapshot.empty); // 좋아요를 이미 눌렀다면 liked 상태를 true로 설정
            }
        };

        checkIfLiked();
    }, [user, recipe]); // user와 recipe 상태가 변경될 때마다 실행

    //////////////////////////////////////// TTS 관련 ///////////////////////////////////////////

    // 텍스트를 음성으로 읽어주는 함수
    const speakText = (text: string) => {
        if ('speechSynthesis' in window) {
            const newUtterance = new SpeechSynthesisUtterance(text); // 새 Utterance 객체 생성
            newUtterance.rate = speechRate; // TTS 속도 설정
            setUtterance(newUtterance);
            speechSynthesis.speak(newUtterance); // TTS 재생
            setIsSpeaking(true); // TTS 재생 중 상태로 설정
        } else {
            console.warn('Speech synthesis not supported in this browser.');
        }
    };

    // TTS 재생 버튼 클릭 시 호출되는 함수
    const handleTtsClick = () => {
        if (recipe) {
            // 레시피 이름과 메뉴얼 텍스트를 음성으로 읽어줌
            speakText(recipe.name);
            recipe.manual.forEach((item: { text: string }) => {
                speakText(item.text);
            });
        }
    };

    // TTS 속도 변경 시 호출되는 함수
    const handleRateChange = (event: any) => {
        setSpeechRate(parseFloat(event.target.value)); // 선택된 속도로 업데이트
    };

    // TTS 일시정지 및 재개 함수
    const handlePauseOrResumeClick = () => {
        if ('speechSynthesis' in window) {
            if (isSpeaking) {
                if (isPaused) {
                    speechSynthesis.resume(); // TTS 재개
                    setIsPaused(false);
                } else {
                    speechSynthesis.pause(); // TTS 일시 정지
                    setIsPaused(true);
                }
            }
        }
    };

    // TTS 중지 버튼 클릭 시 호출되는 함수
    const handleStopClick = () => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel(); // TTS 중지
            setIsSpeaking(false); // TTS 재생 상태 해제
        }
    };

    ////////////////////////////////////////////////////////////////////////////////////////////

    // 좋아요 버튼 클릭 시 호출되는 함수
    const handleLikeToggle = async () => {
        if (user && recipe) {
            const likesRef = collection(db, 'likes');
            const q = query(
                likesRef,
                where('recipeId', '==', recipe.id),
                where('userId', '==', user.uid)
            );

            try {
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    // 좋아요가 없는 경우, 좋아요 추가
                    await addDoc(likesRef, {
                        recipeId: recipe.id,
                        userId: user.uid,
                    });
                    setLiked(true);
                } else {
                    // 좋아요가 있는 경우, 좋아요 제거
                    const deletePromises = querySnapshot.docs.map((doc) =>
                        deleteDoc(doc.ref)
                    );
                    await Promise.all(deletePromises);
                    setLiked(false);
                }
            } catch (error) {
                console.error('Error handling like:', error);
            }
        } else {
            // 로그인하지 않은 경우 알림과 리다이렉트
            if (!user) {
                alert('좋아요를 클릭하려면 로그인해야 합니다.');
                router.push('/login'); // 로그인 페이지로 리다이렉트
            }
            // recipe가 null인 경우에 대한 추가 처리 로직이 필요한 경우 여기에 작성
            if (recipe === null) {
                return <div>레시피를 찾을 수 없습니다.</div>;
            }
        }
    };

    // 새 댓글을 추가하는 함수
    const handleAddComment = async () => {
        if (user) {
            if (recipe && newComment.trim()) {
                try {
                    await addDoc(collection(db, 'comments'), {
                        recipeId: recipe.id,
                        userId: user.uid,
                        userEmail: user.email,
                        text: newComment,
                        timestamp: new Date(),
                    });

                    // 댓글 추가
                    setComments((prevComments) => [
                        ...prevComments,
                        {
                            userId: user.uid,
                            userEmail: user.email,
                            // userName: user.name,
                            text: newComment,
                            recipeId: recipe.id,
                        },
                    ]);

                    setNewComment(''); // 댓글 입력 필드 초기화
                } catch (error) {
                    console.error('Error adding comment:', error);
                }
            } else {
                console.warn(
                    '댓글 내용이 비어 있거나 레시피가 선택되지 않았습니다.'
                );
            }
        } else {
            // 로그인하지 않은 경우 알림과 리다이렉트
            alert('댓글을 작성하려면 로그인해야 합니다.');
            router.push('/login'); // 로그인 페이지로 리다이렉트
        }
    };

    // Firestore에서 댓글 데이터를 가져오는 useEffect
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'comments'));

                const commentsList: Comment[] = querySnapshot.docs
                    .map((doc) => {
                        const data = doc.data() as Comment;

                        // 데이터 검증 (선택 사항)
                        if (
                            typeof data.userId === 'string' &&
                            (typeof data.userEmail === 'string' ||
                                data.userEmail === null) &&
                            typeof data.text === 'string' &&
                            typeof data.recipeId === 'string'
                        ) {
                            return data;
                        } else {
                            console.warn('Invalid comment data:', data);
                            return null; // 필터링하여 무시할 수 있음
                        }
                    })
                    .filter((comment): comment is Comment => comment !== null); // null 제외

                // 댓글 목록에서 recipeId가 일치하는 댓글만 필터링
                setComments(
                    commentsList.filter(
                        (comment) => comment.recipeId === recipe?.id
                    )
                );
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        if (recipe) {
            fetchComments(); // 레시피가 로드된 후 댓글 데이터 가져오기
        }
    }, [recipe]);

    return (
        <main style={{ marginTop: '120px' }}>
            <Box style={{ padding: '16px' }}>
                {loading ? (
                    <p style={{ textAlign: 'center', fontSize: '18px' }}>
                        레시피를 불러오는 중입니다...
                    </p>
                ) : recipe ? (
                    <div style={{ maxWidth: '800px', margin: 'auto' }}>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row', // 가로 정렬
                                alignItems: 'flex-start', // 상단 정렬
                                marginBottom: '60px',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center', // 중앙 정렬
                                }}
                            >
                                <Image
                                    src={recipe.image}
                                    alt={recipe.name}
                                    width={400}
                                    height={400}
                                    style={{
                                        marginBottom: '22px', // 이미지와 버튼 사이의 간격
                                        marginRight: '22px',
                                    }}
                                />

                                {/* TTS 재생 버튼 */}
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        marginTop: '8px',
                                        marginBottom: '16px',
                                        marginRight: '22px',
                                    }}
                                >
                                    <button
                                        onClick={handleTtsClick} // TTS 재생 클릭 시 handleTtsClick 호출
                                        style={{
                                            color: '#ffffff',
                                            backgroundColor: '#DB0000', // 기본 주황색
                                            width: 80,
                                            height: 40,
                                            borderRadius: 20,
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            boxShadow:
                                                '0 4px 8px rgba(0,0,0,0.1)',
                                            transition:
                                                'background-color 0.3s, box-shadow 0.3s, color 0.3s',
                                        }}
                                        onMouseDown={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                                '#A50000'; // 클릭 시 색상 변경
                                            e.currentTarget.style.color =
                                                '#ffffff'; // 클릭 시 글씨 색상
                                        }}
                                        onMouseUp={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                                '#DB0000'; // 기본 색상으로 복구
                                            e.currentTarget.style.color =
                                                '#ffffff'; // 기본 글씨 색상
                                        }}
                                    >
                                        <FaVolumeUp size={20} />
                                    </button>
                                    <select
                                        value={speechRate}
                                        onChange={handleRateChange} // 속도 변경 시 handleRateChange 호출
                                        style={{
                                            width: 100,
                                            height: 40,
                                            borderRadius: 20,
                                            border: '1px solid #ddd',
                                            padding: '0 10px',
                                            fontSize: '16px',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            boxSizing: 'border-box',
                                            boxShadow:
                                                '0 4px 8px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        <option value={0.5}>0.5배속</option>
                                        <option value={1.5}>1배속</option>
                                        <option value={2.5}>2배속</option>
                                    </select>
                                    <button
                                        onClick={handlePauseOrResumeClick}
                                        style={{
                                            color: '#ffffff',
                                            backgroundColor: isPaused
                                                ? '#A50000'
                                                : '#DB0000', // 상태에 따라 색상 변경
                                            width: 80,
                                            height: 40,
                                            borderRadius: 20,
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            boxShadow:
                                                '0 4px 8px rgba(0,0,0,0.1)',
                                            transition:
                                                'background-color 0.3s, box-shadow 0.3s, color 0.3s',
                                        }}
                                        onMouseDown={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                                isPaused
                                                    ? '#DB0000'
                                                    : '#A50000'; // 클릭 시 색상
                                            e.currentTarget.style.color =
                                                '#ffffff'; // 클릭 시 글씨 색상
                                        }}
                                        onMouseUp={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                                isPaused
                                                    ? '#A50000'
                                                    : '#DB0000'; // 기본 색상으로 복구
                                            e.currentTarget.style.color =
                                                '#ffffff'; // 기본 글씨 색상
                                        }}
                                    >
                                        {isPaused ? (
                                            <FaPlay size={15} />
                                        ) : (
                                            <FaPause size={15} />
                                        )}
                                    </button>
                                    <button
                                        onClick={handleStopClick} // TTS 정지 클릭 시 handleStopClick 호출
                                        style={{
                                            color: '#ffffff',
                                            backgroundColor: '#DB0000', // 기본 주황색
                                            width: 80,
                                            height: 40,
                                            borderRadius: 20,
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            boxShadow:
                                                '0 4px 8px rgba(0,0,0,0.1)',
                                            transition:
                                                'background-color 0.3s, box-shadow 0.3s, color 0.3s',
                                        }}
                                        onMouseDown={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                                '#A50000'; // 클릭 시 색상
                                            e.currentTarget.style.color =
                                                '#ffffff'; // 클릭 시 글씨 색상
                                        }}
                                        onMouseUp={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                                '#DB0000'; // 기본 색상으로 복구
                                            e.currentTarget.style.color =
                                                '#ffffff'; // 기본 글씨 색상
                                        }}
                                    >
                                        <FaStop size={15} />
                                    </button>
                                </div>
                            </div>

                            <Box
                                style={{
                                    padding: '16px',
                                    flex: '1', // 남은 공간 채우기
                                }}
                            >
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
                                        {recipe.name}
                                    </h1>
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
                                        {/* 좋아요 버튼 */}
                                        <FaHeart
                                            color={liked ? 'red' : 'gray'}
                                        />
                                    </button>
                                </div>
                                <p
                                    style={{
                                        fontSize: '15px',
                                        color: '#5c5c5c',
                                    }}
                                >
                                    칼로리: {recipe.calories} kcal
                                </p>
                                <p
                                    style={{
                                        fontSize: '15px',
                                        color: '#5c5c5c',
                                    }}
                                >
                                    단백질: {recipe.protein} g
                                </p>
                                <p
                                    style={{
                                        fontSize: '15px',
                                        color: '#5c5c5c',
                                    }}
                                >
                                    지방: {recipe.fat} g
                                </p>
                                <p
                                    style={{
                                        fontSize: '15px',
                                        color: '#5c5c5c',
                                    }}
                                >
                                    나트륨: {recipe.sodium} mg
                                </p>

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
                                <p
                                    style={{
                                        fontSize: '15px',
                                        marginBottom: '8px',
                                        color: '#5c5c5c',
                                    }}
                                >
                                    {recipe.ingredients}
                                </p>
                            </Box>
                        </div>

                        <hr />

                        <Box
                            style={{
                                marginTop: '80px',
                                marginBottom: '100px',
                            }}
                        >
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
                            {recipe.manual.map((item: any, index: any) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: '18px',
                                    }}
                                >
                                    {item.image && (
                                        <Image
                                            src={item.image}
                                            alt={`메뉴얼 이미지 ${index + 1}`}
                                            width={200}
                                            height={200}
                                            style={{
                                                marginRight: '18px',
                                            }}
                                        />
                                    )}
                                    <p style={{ fontSize: '16px' }}>
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </Box>

                        <hr />
                    </div>
                ) : null}

                <div
                    style={{
                        maxWidth: '800px', // 가로 영역을 800px로 설정
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
                                e.currentTarget.style.backgroundColor =
                                    '#A50000'; // 클릭 시 색상
                                e.currentTarget.style.color = '#ffffff'; // 클릭 시 글씨 색상
                            }}
                            onMouseUp={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#DB0000'; // 기본 색상으로 복구
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
            </Box>
        </main>
    );
};

export default GalleryPost; // 컴포넌트를 기본으로 내보내기
