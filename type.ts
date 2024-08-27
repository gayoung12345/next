export interface recipeProps {
    id: string;
    name?: string;
    image?: string;
    ingredients?: string;
    manual?: [
        {
            image?: string;
            text?: string;
        },
    ];
    colories?: string;
    protein?: string;
    fat?: string;
    sodium?: string;
}

export interface postProps {
    id: string;
    author?: string;
    date?: string | undefined;
    title?: string;
    comments?: string;
    views?: number;
}
