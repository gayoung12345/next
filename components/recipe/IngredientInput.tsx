import React, { useState } from 'react';

interface Ingredient {
    name: string;
    quantity: string;
    unit: string;
}

interface IngredientInputProps {
    onIngredientsChange: (ingredients: Ingredient[]) => void;
}

const IngredientInput: React.FC<IngredientInputProps> = ({
    onIngredientsChange,
}) => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([
        { name: '', quantity: '', unit: '' },
    ]);

    const handleInputChange = (
        index: number,
        field: keyof Ingredient,
        value: string
    ) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setIngredients(newIngredients);
        onIngredientsChange(newIngredients); // 부모 컴포넌트에 재료 정보 전달
    };

    const handleAddField = () => {
        setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
    };

    const handleRemoveField = (index: number) => {
        if (ingredients.length > 1) {
            const newIngredients = ingredients.filter((_, i) => i !== index);
            setIngredients(newIngredients);
            onIngredientsChange(newIngredients); // 부모 컴포넌트에 재료 정보 전달
        }
    };

    return (
        <div className='p-4 flex justify-center items-center flex-col'>
            <div className='space-y-4'>
                {ingredients.map((ingredient, index) => (
                    <div
                        key={index}
                        className='flex items-center space-x-2'
                    >
                        <input
                            type='text'
                            value={ingredient.name}
                            onChange={(e) =>
                                handleInputChange(index, 'name', e.target.value)
                            }
                            placeholder='재료명'
                            className='border border-gray-300 rounded p-2'
                        />
                        <input
                            type='number'
                            value={ingredient.quantity}
                            onChange={(e) =>
                                handleInputChange(
                                    index,
                                    'quantity',
                                    e.target.value
                                )
                            }
                            placeholder='수량'
                            className='border border-gray-300 rounded p-2 w-24'
                        />
                        <input
                            type='text'
                            value={ingredient.unit}
                            onChange={(e) =>
                                handleInputChange(index, 'unit', e.target.value)
                            }
                            placeholder='단위(g)'
                            className='border border-gray-300 rounded p-2 w-24'
                        />
                        {ingredients.length > 1 && (
                            <button
                                onClick={() => handleRemoveField(index)}
                                className='text-red-500 hover:underline'
                            >
                                &times;
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <button
                onClick={handleAddField}
                className='mt-4 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            >
                +
            </button>
        </div>
    );
};

export default IngredientInput;
