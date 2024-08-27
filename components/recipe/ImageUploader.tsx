import { useState } from 'react';

const ImageUploader: React.FC = () => {
    const [images, setImages] = useState<string[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newImages: string[] = [];
            //for (const file of files) {
            for (var i = 0; i < files.length; i++) {
                if (files[i] && files[i].type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e: any) => {
                        if (e.target?.result) {
                            newImages.push(e.target.result as string);
                            setImages((prevImages) => [
                                ...prevImages,
                                e.target.result as string,
                            ]);
                        }
                    };
                    reader.readAsDataURL(files[i]);
                } else {
                    alert('Please select only image files.');
                }
            }
        }
    };

    return (
        <div className='p-4'>
            {/* Custom file input styling */}
            <label
                htmlFor='fileInput'
                className='block mb-4 cursor-pointer flex items-center justify-center'
                style={{ width: '200px', height: '200px' }}
            >
                <span className='flex items-center justify-center w-full h-full text-black bg-white border border-spacing-1 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:bg-slate-500 focus:ring-offset-2'>
                    Select Images
                </span>
                <input
                    id='fileInput'
                    type='file'
                    multiple
                    accept='image/*'
                    onChange={handleFileChange}
                    className='hidden' // Hide the default file input
                />
            </label>
            <div className='flex flex-wrap gap-4'>
                {images.map((src, index) => (
                    <img
                        key={index}
                        src={src}
                        alt={`Preview ${index}`}
                        className='w-52 h-52 object-cover border border-gray-300 rounded'
                    />
                ))}
            </div>
        </div>
    );
};

export default ImageUploader;
