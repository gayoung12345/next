export interface recipeProps {
    id: string;
    name: string;
    image: string | null;
    ingredients: string | null;
    manual?: {
        image: string;
        text: string;
    }[];
    calories: string | null;
    protein: string | null;
    fat: string | null;
    sodium: string | null;
}

export interface commentProps {
    author?: string;
    title?: string;
}

export interface postProps extends commentProps {
    id: string;
    views?: number;
    postId?: string;
    recipeId?: string;
    userEmail?: string;
    userId?: string;
    text?: string;
    date?: string;
}

export interface UtteranceProps {
    lang: string;
    pitch: number;
    rate: number;
    text: string;
    voice: SpeechSynthesisVoice | null;
    volume: number;
    onboundary:
        | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any)
        | null;
    onend:
        | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any)
        | null;
    onerror:
        | ((
              this: SpeechSynthesisUtterance,
              ev: SpeechSynthesisErrorEvent
          ) => any)
        | null;
    onmark:
        | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any)
        | null;
    onpause:
        | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any)
        | null;
    onresume:
        | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any)
        | null;
    onstart:
        | ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any)
        | null;
    addEventListener: any;
    removeEventListener: any;
    dispatchEvent: any;
}
