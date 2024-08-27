'use client';
import Image from 'next/image';
import React, { useState } from 'react';

interface ImageUploadProps {
    id: string;
    onImageSelected: (id: string, file: File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ id, onImageSelected }) => {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;

        if (file) {
            const isValidImage = file.type.startsWith('image/');
            if (isValidImage) {
                setImage(file);

                // 이미지 미리보기
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                    onImageSelected(id, file); // 실제 파일 객체를 전달
                };
                reader.readAsDataURL(file);

                setError(null);
            } else {
                setError('이미지 파일만 업로드할 수 있습니다.');
                setImage(null);
                setPreview(null);
            }
        }
    };

    return (
        <div>
            <label
                htmlFor={`file-input-${id}`}
                style={{
                    display: 'block',
                    width: '200px',
                    height: '200px',
                    border: '1px solid #ccc',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {preview ? (
                    <Image
                        src={preview}
                        alt='Preview'
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            top: '0',
                            left: '0',
                        }}
                        width={400}
                        height={400}
                    />
                ) : (
                    <span
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: '#999',
                        }}
                    >
                        이미지를 업로드하세요
                    </span>
                )}
                <input
                    id={`file-input-${id}`}
                    type='file'
                    accept='image/*'
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                />
            </label>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default ImageUpload;
