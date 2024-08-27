'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Next.js의 라우터 사용
import IngredientInput from '@/components/recipe/IngredientInput';
import RecipeStepInput from '@/components/recipe/RecipeStepInput';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ImageUpload from '@/components/recipe/imageUpload';

interface RecipeStep {
    description: string;
    image: string | null;
}

interface Ingredient {
    name: string;
    quantity: string;
    unit: string;
}

const RecipeWrite: React.FC = () => {
    const router = useRouter(); // 라우터 초기화
    const [isSubmitting, setIsSubmitting] = useState(false); // 제출 상태 추가
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryMethod, setCategoryMethod] = useState('');
    const [categoryIngredient, setCategoryIngredient] = useState('');
    const [servings, setServings] = useState('');
    const [time, setTime] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [images, setImages] = useState<{ [key: string]: File | null }>({});
    const [steps, setSteps] = useState<RecipeStep[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const storage = getStorage();
    const { user } = useAuth(); // 현재 로그인된 사용자의 정보를 가져옴

    const uploadImage = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const storageRef = ref(storage, `images/${file.name}`);
            uploadBytes(storageRef, file)
                .then(() => getDownloadURL(storageRef))
                .then((url) => resolve(url))
                .catch((error) => reject(error));
        });
    };

    const handleImageSelected = (id: string, file: File | null) => {
        if (file) {
            setImages((prev) => ({ ...prev, [id]: file }));
        } else {
            setImages((prev) => ({ ...prev, [id]: null }));
        }
    };

    const handleStepChange = (updatedSteps: RecipeStep[]) => {
        setSteps(updatedSteps);
    };

    const handleIngredientsChange = (updatedIngredients: Ingredient[]) => {
        setIngredients(updatedIngredients);
    };

    const handleSubmit = async () => {
        if (user) {
            setIsSubmitting(true); // 제출 시작
            // 이미지 업로드
            const uploadedImages: { [key: string]: string } = {};

            for (const [id, file] of Object.entries(images)) {
                if (file) {
                    try {
                        const url = await uploadImage(file);
                        uploadedImages[id] = url;
                    } catch (error) {
                        console.error(
                            `Error uploading image with id ${id}:`,
                            error
                        );
                    }
                }
            }

            // Firestore에 데이터 저장
            try {
                await addDoc(collection(db, 'userRecipe'), {
                    title,
                    description,
                    category: {
                        method: categoryMethod,
                        ingredient: categoryIngredient,
                    },
                    info: {
                        servings,
                        time,
                        difficulty,
                    },
                    images: uploadedImages, // 업로드된 이미지 URL
                    steps, // 단계별 설명과 이미지 URL
                    ingredients, // 재료 목록
                    createdAt: new Date(),
                    user: user?.email,
                });

                alert('레시피가 성공적으로 저장되었습니다!');
                router.push('/userRecipe'); // 성공 시 리다이렉트
            } catch (error) {
                console.error('Error saving recipe:', error);
            } finally {
                setIsSubmitting(false); // 제출 완료
            }
        } else {
            alert('로그인 해주세요.');
            router.push('/login');
        }
    };

    return (
        <main className='flex flex-col items-center'>
            <div className='w-full max-w-6xl p-4 border border-gray-300'>
                <div className='text-xl font-bold mb-4'>레시피 등록</div>
                <div className='flex flex-col space-y-4 px-8'>
                    <div>
                        <div className='font-semibold mb-2'>레시피 제목</div>
                        <input
                            type='text'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className='w-full bg-gray-200 p-2 mb-2'
                            placeholder='예) 소고기 미역국 끓이기'
                        />
                    </div>
                    <div>
                        <div className='font-semibold mb-2'>요리 소개</div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className='w-full bg-gray-200 p-2 mb-2'
                            placeholder='요리에 대한 설명을 적어주세요.'
                            rows={4}
                        ></textarea>
                    </div>

                    <div className='font-semibold mb-2'>카테고리</div>
                    <div className='flex space-x-2 mb-2'>
                        <select
                            value={categoryMethod}
                            onChange={(e) => setCategoryMethod(e.target.value)}
                            className='w-full bg-gray-200 p-2'
                        >
                            <option value=''>방법별</option>
                            <option>볶기</option>
                            <option>끓이기</option>
                            <option>굽기</option>
                        </select>
                    </div>
                    <div className='flex space-x-2 mb-2'>
                        <select
                            value={categoryIngredient}
                            onChange={(e) =>
                                setCategoryIngredient(e.target.value)
                            }
                            className='w-full bg-gray-200 p-2'
                        >
                            <option value=''>재료별</option>
                            <option>채소</option>
                            <option>고기</option>
                            <option>해산물</option>
                        </select>
                    </div>
                    <div className='font-semibold mb-2'>요리 정보</div>
                    <div className='flex space-x-2 mb-2'>
                        <select
                            value={servings}
                            onChange={(e) => setServings(e.target.value)}
                            className='w-full bg-gray-200 p-2'
                        >
                            <option value=''>인원</option>
                            <option>1인분</option>
                            <option>2인분</option>
                            <option>3인분</option>
                        </select>
                        <select
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className='w-full bg-gray-200 p-2'
                        >
                            <option value=''>시간</option>
                            <option>10분</option>
                            <option>20분</option>
                            <option>30분</option>
                        </select>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className='w-full bg-gray-200 p-2'
                        >
                            <option value=''>난이도</option>
                            <option>쉬움</option>
                            <option>보통</option>
                            <option>어려움</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className='w-full max-w-6xl p-4 border border-gray-300 mt-4'>
                <div className='font-semibold'>재료 정보</div>
                <div>
                    <IngredientInput
                        onIngredientsChange={handleIngredientsChange}
                    />
                </div>
            </div>

            <div className='w-full max-w-6xl p-4 border border-gray-300 mt-4'>
                <RecipeStepInput
                    onStepChange={handleStepChange}
                    uploadImage={uploadImage}
                />
            </div>

            <div className='w-full max-w-6xl p-4 border border-gray-300 mt-4'>
                <div>요리 완성사진</div>
                <div>
                    <ImageUpload
                        id='main-image'
                        onImageSelected={(id, file) => {
                            if (file) {
                                handleImageSelected(id, file);
                            }
                        }}
                    />
                </div>
            </div>

            <div className='w-full max-w-6xl p-4 border border-gray-300 mt-4'>
                <div>태그</div>
                <div>
                    <input
                        type='text'
                        className='w-full bg-gray-200 p-2 mb-2'
                        placeholder='예)감자, 감자샐러드, 맛있음'
                    />
                </div>
            </div>

            <div className='w-full max-w-6xl mt-8 flex justify-center items-center'>
                <button
                    className={`border border-gray-300 w-[300px] h-[100px] text-center ${
                        isSubmitting ? 'bg-gray-200 text-gray-500' : 'bg-white'
                    }`}
                    onClick={handleSubmit}
                    disabled={isSubmitting} // 제출 중이면 버튼 비활성화
                >
                    {isSubmitting ? '저장중...' : '저장'}
                </button>
            </div>
        </main>
    );
};

export default RecipeWrite;
