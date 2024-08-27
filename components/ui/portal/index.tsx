'use client';
import React from 'react';
import { Overlay } from '@gluestack-ui/overlay';
import { cssInterop } from 'nativewind';

// CSS 스타일을 Overlay 컴포넌트에 적용
cssInterop(Overlay, { className: 'style' });

// Portal 컴포넌트 정의
export const Portal = React.forwardRef<
    React.ElementRef<typeof Overlay>,
    React.ComponentProps<typeof Overlay>
>(({ ...props }, ref) => {
    return (
        <Overlay
            {...props}
            ref={ref}
        />
    );
});

// displayName 추가
Portal.displayName = 'Portal';
