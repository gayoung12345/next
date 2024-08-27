'use client';
import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
const modules = {
    toolbar: [
        [{ header: '1' }, { header: '2' }, { font: [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],

        ['clean'],
    ],
};

const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
];

const TextEditor = ({
    content,
    setContent,
    placeholder,
}: {
    content: string;
    setContent: React.Dispatch<React.SetStateAction<string>>;
    placeholder?: string; // placeholder 속성 추가
}) => {
    const handleContentChange = (value: string) => {
        setContent(value);
    };

    return (
        <div style={{ position: 'relative', height: '300px' }}>
            {content === '' && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50px', // 위에서 약간 내려옴
                        left: '5px', // 왼쪽 상단으로 이동
                        color: '#aaa',
                        pointerEvents: 'none',
                        zIndex: 1,
                        padding: '0 10px',
                        boxSizing: 'border-box', // 패딩 포함하여 전체 크기 조정
                    }}
                >
                    {placeholder}
                </div>
            )}
            <ReactQuill
                style={{ height: '100%' }}
                value={content}
                onChange={handleContentChange}
                modules={modules}
                formats={formats}
            />
        </div>
    );
};

export default TextEditor;
