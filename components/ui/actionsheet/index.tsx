'use client';
import React, { useMemo } from 'react';
import { H4 } from '@expo/html-elements';
import { Svg } from 'react-native-svg';
import { createActionsheet } from '@gluestack-ui/actionsheet';
import {
    Pressable,
    View,
    Text,
    ScrollView,
    VirtualizedList,
    FlatList,
    SectionList,
    Platform,
    PressableProps,
} from 'react-native';

import { tva } from '@gluestack-ui/nativewind-utils/tva';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import { withStates } from '@gluestack-ui/nativewind-utils/withStates';
import { cssInterop } from 'nativewind';
import {
    Motion,
    AnimatePresence,
    createMotionAnimatedComponent,
} from '@legendapp/motion';

type IPrimitiveIcon = {
    height?: number | string;
    width?: number | string;
    fill?: string;
    color?: string;
    size?: number | string;
    stroke?: string;
    as?: React.ElementType;
    className?: string;
};
const PrimitiveIcon = React.forwardRef<
    React.ElementRef<typeof Svg>,
    IPrimitiveIcon & React.ComponentPropsWithoutRef<typeof Svg>
>(
    (
        {
            height,
            width,
            fill,
            color,
            size,
            stroke = 'currentColor',
            as: AsComp,
            ...props
        },
        ref
    ) => {
        const sizeProps = useMemo(() => {
            if (size) return { size };
            if (height && width) return { height, width };
            if (height) return { height };
            if (width) return { width };
            return {};
        }, [size, height, width]);

        const colorProps =
            stroke === 'currentColor' && color !== undefined ? color : stroke;

        if (AsComp) {
            return (
                <AsComp
                    ref={ref}
                    fill={fill}
                    {...props}
                    {...sizeProps}
                    stroke={colorProps}
                />
            );
        }
        return (
            <Svg
                ref={ref}
                height={height}
                width={width}
                fill={fill}
                stroke={colorProps}
                {...props}
            />
        );
    }
);
PrimitiveIcon.displayName = 'PrimitiveIcon';

const ItemWrapper = React.forwardRef<
    React.ElementRef<typeof Pressable>,
    PressableProps
>(({ ...props }, ref) => {
    return (
        <Pressable
            {...props}
            ref={ref}
        />
    );
});
ItemWrapper.displayName = 'ItemWrapper';

const AnimatedPressable = createMotionAnimatedComponent(Pressable);

export const UIActionsheet = createActionsheet({
    Root: View,
    Content: Motion.View,
    Item: Platform.OS === 'web' ? ItemWrapper : withStates(ItemWrapper),
    ItemText: Text,
    DragIndicator: View,
    IndicatorWrapper: View,
    Backdrop: AnimatedPressable,
    ScrollView: ScrollView,
    VirtualizedList: VirtualizedList,
    FlatList: FlatList,
    SectionList: SectionList,
    SectionHeaderText: H4,
    Icon: PrimitiveIcon,
    AnimatePresence: AnimatePresence,
});

cssInterop(UIActionsheet, { className: 'style' });
cssInterop(UIActionsheet.Content, { className: 'style' });
cssInterop(ItemWrapper, { className: 'style' });
cssInterop(UIActionsheet.ItemText, { className: 'style' });
cssInterop(UIActionsheet.DragIndicator, { className: 'style' });
cssInterop(UIActionsheet.DragIndicatorWrapper, { className: 'style' });
cssInterop(UIActionsheet.Backdrop, { className: 'style' });
cssInterop(UIActionsheet.ScrollView, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
    indicatorClassName: 'indicatorStyle',
});
cssInterop(UIActionsheet.VirtualizedList, {
    className: 'style',
    ListFooterComponentClassName: 'ListFooterComponentStyle',
    ListHeaderComponentClassName: 'ListHeaderComponentStyle',
    contentContainerClassName: 'contentContainerStyle',
    indicatorClassName: 'indicatorStyle',
});
cssInterop(UIActionsheet.FlatList, {
    className: 'style',
    ListFooterComponentClassName: 'ListFooterComponentStyle',
    ListHeaderComponentClassName: 'ListHeaderComponentStyle',
    columnWrapperClassName: 'columnWrapperStyle',
    contentContainerClassName: 'contentContainerStyle',
    indicatorClassName: 'indicatorStyle',
});
cssInterop(UIActionsheet.SectionList, { className: 'style' });
cssInterop(UIActionsheet.SectionHeaderText, { className: 'style' });
cssInterop(UIActionsheet.Icon, {
    className: {
        target: 'style',
        nativeStyleToProp: {
            height: true,
            width: true,
            // @ts-ignore
            fill: true,
            color: true,
            stroke: true,
        },
    },
});

const actionsheetStyle = tva({ base: 'w-full h-full web:pointer-events-none' });

const actionsheetContentStyle = tva({
    base: 'items-center rounded-tl-3xl rounded-tr-3xl p-5 pt-2 bg-background-0 web:pointer-events-auto web:select-none shadow-hard-5 border border-b-0 border-outline-100',
});

const actionsheetItemStyle = tva({
    base: 'w-full flex-row items-center p-3 rounded-sm data-[disabled=true]:opacity-40 data-[disabled=true]:web:pointer-events-auto data-[disabled=true]:web:cursor-not-allowed hover:bg-background-50 active:bg-background-100 data-[focus=true]:bg-background-100 web:data-[focus-visible=true]:bg-background-100 web:data-[focus-visible=true]:outline-indicator-primary gap-2',
});

const actionsheetItemTextStyle = tva({
    base: 'text-typography-700 font-normal font-body',
    variants: {
        isTruncated: {
            true: '',
        },
        bold: {
            true: 'font-bold',
        },
        underline: {
            true: 'underline',
        },
        strikeThrough: {
            true: 'line-through',
        },
        size: {
            '2xs': 'text-2xs',
            xs: 'text-xs',
            sm: 'text-sm',
            md: 'text-md',
            lg: 'text-lg',
            xl: 'text-xl',
            '2xl': 'text-2xl',
            '3xl': 'text-3xl',
            '4xl': 'text-4xl',
            '5xl': 'text-5xl',
            '6xl': 'text-6xl',
        },
    },
});

const actionsheetDragIndicatorStyle = tva({
    base: 'w-16 h-1 bg-background-400 rounded-full',
});

const actionsheetDragIndicatorWrapperStyle = tva({
    base: 'w-full py-1 items-center',
});

const actionsheetBackdropStyle = tva({
    base: 'absolute left-0 top-0 right-0 bottom-0 bg-background-dark web:cursor-default web:pointer-events-auto',
});

const actionsheetScrollViewStyle = tva({
    base: 'w-full h-auto',
});

const actionsheetVirtualizedListStyle = tva({
    base: 'w-full h-auto',
});

const actionsheetFlatListStyle = tva({
    base: 'w-full h-auto',
});

const actionsheetSectionListStyle = tva({
    base: 'w-full h-auto',
});

const actionsheetSectionHeaderTextStyle = tva({
    base: 'leading-5 font-bold font-heading my-0 text-typography-500 p-3 uppercase',
    variants: {
        isTruncated: {
            true: '',
        },
        bold: {
            true: 'font-bold',
        },
        underline: {
            true: 'underline',
        },
        strikeThrough: {
            true: 'line-through',
        },
        size: {
            '5xl': 'text-5xl',
            '4xl': 'text-4xl',
            '3xl': 'text-3xl',
            '2xl': 'text-2xl',
            xl: 'text-xl',
            lg: 'text-lg',
            md: 'text-md',
            sm: 'text-sm',
            xs: 'text-xs',
        },

        sub: {
            true: 'text-xs',
        },
        italic: {
            true: 'italic',
        },
        highlight: {
            true: 'bg-yellow500',
        },
    },
    defaultVariants: {
        size: 'xs',
    },
});

const actionsheetIconStyle = tva({
    base: 'text-background-500 fill-none',
    variants: {
        size: {
            '2xs': 'h-3 w-3',
            xs: 'h-3.5 w-3.5',
            sm: 'h-4 w-4',
            md: 'w-[18px] h-[18px]',
            lg: 'h-5 w-5',
            xl: 'h-6 w-6',
        },
    },
});

type IActionsheetProps = VariantProps<typeof actionsheetStyle> &
    React.ComponentPropsWithoutRef<typeof UIActionsheet>;

type IActionsheetContentProps = VariantProps<typeof actionsheetContentStyle> &
    React.ComponentPropsWithoutRef<typeof UIActionsheet.Content>;

type IActionsheetItemProps = VariantProps<typeof actionsheetItemStyle> &
    React.ComponentPropsWithoutRef<typeof UIActionsheet.Item>;

type IActionsheetItemTextProps = VariantProps<typeof actionsheetItemTextStyle> &
    React.ComponentPropsWithoutRef<typeof UIActionsheet.ItemText>;

type IActionsheetDragIndicatorProps = VariantProps<
    typeof actionsheetDragIndicatorStyle
> &
    React.ComponentPropsWithoutRef<typeof UIActionsheet.DragIndicator>;

type IActionsheetDragIndicatorWrapperProps = VariantProps<
    typeof actionsheetDragIndicatorWrapperStyle
> &
    React.ComponentPropsWithoutRef<typeof UIActionsheet>;

type IActionsheetBackdropProps = VariantProps<typeof actionsheetBackdropStyle> &
    React.ComponentPropsWithoutRef<typeof UIActionsheet.Backdrop>;

type IActionsheetScrollViewProps = VariantProps<
    typeof actionsheetScrollViewStyle
> &
    React.ComponentPropsWithoutRef<typeof UIActionsheet.ScrollView>;

type IActionsheetVirtualizedListProps = VariantProps<
    typeof actionsheetVirtualizedListStyle
> &
    React.ComponentPropsWithoutRef<typeof UIActionsheet.VirtualizedList>;

type IActionsheetFlatListProps = VariantProps<typeof actionsheetFlatListStyle> &
    React.ComponentPropsWithoutRef<typeof UIActionsheet.FlatList>;

type IActionsheetSectionListProps = VariantProps<
    typeof actionsheetSectionListStyle
> &
    React.ComponentPropsWithoutRef<typeof UIActionsheet.SectionList>;

type IActionsheetSectionHeaderTextProps = VariantProps<
    typeof actionsheetSectionHeaderTextStyle
> &
    React.ComponentPropsWithoutRef<typeof UIActionsheet.SectionHeaderText>;

type IActionsheetIconProps = VariantProps<typeof actionsheetIconStyle> &
    React.ComponentPropsWithoutRef<typeof UIActionsheet.Icon>;

export type {
    IActionsheetProps,
    IActionsheetContentProps,
    IActionsheetItemProps,
    IActionsheetItemTextProps,
    IActionsheetDragIndicatorProps,
    IActionsheetDragIndicatorWrapperProps,
    IActionsheetBackdropProps,
    IActionsheetScrollViewProps,
    IActionsheetVirtualizedListProps,
    IActionsheetFlatListProps,
    IActionsheetSectionListProps,
    IActionsheetSectionHeaderTextProps,
    IActionsheetIconProps,
};
