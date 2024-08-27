'use client';

import React from 'react';

const extractTextFromChildren = (children: React.ReactNode): string => {
    if (typeof children === 'string') {
        return children;
    }

    if (Array.isArray(children)) {
        return children.map(extractTextFromChildren).join(' ');
    }

    if (React.isValidElement(children) && children.props.children) {
        return extractTextFromChildren(children.props.children);
    }

    return '';
};

const TextToSpeechDiv: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const handleDivClick = () => {
        const text = extractTextFromChildren(children); // 텍스트만 추출

        if (text) {
            const utterance = new SpeechSynthesisUtterance(text);

            // TTS 설정 (선택 사항)
            utterance.lang = 'ko-KR'; // 한국어 설정 (언어 코드에 따라 변경 가능)
            utterance.pitch = 1; // 음성의 피치 (0.1 ~ 2)
            utterance.rate = 1; // 음성의 속도 (0.1 ~ 10)

            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div
            onClick={handleDivClick}
            style={{
                cursor: 'pointer',
                userSelect: 'none',
            }}
        >
            {children}
        </div>
    );
};

export default TextToSpeechDiv;
