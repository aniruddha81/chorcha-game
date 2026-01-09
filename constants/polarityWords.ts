/**
 * Word Polarity Game Data
 * Each word has a polarity (positive/negative), definition, and explanation
 */

export interface PolarityWord {
    word: string;
    polarity: "positive" | "negative";
    definition: string;
    explanation: string;
}

export const POLARITY_WORDS: PolarityWord[] = [
    // Positive Words
    {
        word: "Jubilant",
        polarity: "positive",
        definition: "Feeling or expressing great happiness and triumph.",
        explanation: "Jubilant describes an extremely joyful state, often after a success or victory."
    },
    {
        word: "Serene",
        polarity: "positive",
        definition: "Calm, peaceful, and untroubled.",
        explanation: "Serene conveys a sense of tranquility and inner peace."
    },
    {
        word: "Benevolent",
        polarity: "positive",
        definition: "Well-meaning and kindly.",
        explanation: "Benevolent describes someone who genuinely wishes to do good for others."
    },
    {
        word: "Radiant",
        polarity: "positive",
        definition: "Sending out light; shining or glowing brightly.",
        explanation: "Radiant suggests beauty, joy, or health that seems to shine from within."
    },
    {
        word: "Zealous",
        polarity: "positive",
        definition: "Having or showing great passion and enthusiasm.",
        explanation: "Zealous indicates strong devotion and eagerness toward a cause."
    },
    {
        word: "Resilient",
        polarity: "positive",
        definition: "Able to recover quickly from difficulties.",
        explanation: "Resilient describes the strength to bounce back from challenges."
    },
    {
        word: "Vibrant",
        polarity: "positive",
        definition: "Full of energy and life.",
        explanation: "Vibrant evokes liveliness, color, and enthusiasm."
    },
    {
        word: "Eloquent",
        polarity: "positive",
        definition: "Fluent and persuasive in speaking or writing.",
        explanation: "Eloquent suggests the ability to express ideas beautifully and convincingly."
    },
    {
        word: "Magnanimous",
        polarity: "positive",
        definition: "Generous or forgiving, especially toward a rival.",
        explanation: "Magnanimous describes noble and generous behavior."
    },
    {
        word: "Tenacious",
        polarity: "positive",
        definition: "Holding firmly to something; persistent.",
        explanation: "Tenacious indicates determination and refusal to give up."
    },
    {
        word: "Amiable",
        polarity: "positive",
        definition: "Having a friendly and pleasant manner.",
        explanation: "Amiable describes someone who is easy to like and get along with."
    },
    {
        word: "Exuberant",
        polarity: "positive",
        definition: "Full of energy, excitement, and cheerfulness.",
        explanation: "Exuberant conveys overflowing joy and enthusiasm."
    },
    {
        word: "Optimistic",
        polarity: "positive",
        definition: "Hopeful and confident about the future.",
        explanation: "Optimistic describes a positive outlook on life."
    },
    {
        word: "Compassionate",
        polarity: "positive",
        definition: "Feeling concern for the sufferings of others.",
        explanation: "Compassionate indicates empathy and a desire to help."
    },
    {
        word: "Harmonious",
        polarity: "positive",
        definition: "Forming a pleasing whole; free from conflict.",
        explanation: "Harmonious suggests balance, peace, and unity."
    },
    {
        word: "Grateful",
        polarity: "positive",
        definition: "Feeling or showing appreciation for something.",
        explanation: "Grateful describes thankfulness and recognition of kindness."
    },
    {
        word: "Diligent",
        polarity: "positive",
        definition: "Having or showing care in one's work or duties.",
        explanation: "Diligent indicates hard work and attention to detail."
    },
    {
        word: "Valiant",
        polarity: "positive",
        definition: "Showing courage or determination.",
        explanation: "Valiant describes bravery in the face of danger or difficulty."
    },
    {
        word: "Sincere",
        polarity: "positive",
        definition: "Free from pretense; genuine and honest.",
        explanation: "Sincere indicates authenticity and truthfulness."
    },
    {
        word: "Flourishing",
        polarity: "positive",
        definition: "Developing rapidly and successfully; thriving.",
        explanation: "Flourishing describes healthy growth and prosperity."
    },

    // Negative Words
    {
        word: "Malevolent",
        polarity: "negative",
        definition: "Having or showing a wish to do evil to others.",
        explanation: "Malevolent describes ill intentions and a desire to harm."
    },
    {
        word: "Ominous",
        polarity: "negative",
        definition: "Giving the impression that something bad will happen.",
        explanation: "Ominous suggests a threatening or foreboding quality."
    },
    {
        word: "Treacherous",
        polarity: "negative",
        definition: "Guilty of betrayal or deception.",
        explanation: "Treacherous describes someone or something dangerous and untrustworthy."
    },
    {
        word: "Contemptuous",
        polarity: "negative",
        definition: "Showing contempt; scornful.",
        explanation: "Contemptuous indicates strong disrespect and disdain."
    },
    {
        word: "Melancholy",
        polarity: "negative",
        definition: "A deep, persistent sadness.",
        explanation: "Melancholy describes a gloomy and thoughtful sadness."
    },
    {
        word: "Vindictive",
        polarity: "negative",
        definition: "Having a strong desire for revenge.",
        explanation: "Vindictive describes a spiteful and vengeful nature."
    },
    {
        word: "Deceitful",
        polarity: "negative",
        definition: "Guilty of or involving deceit; deceiving others.",
        explanation: "Deceitful indicates dishonesty and manipulation."
    },
    {
        word: "Hostile",
        polarity: "negative",
        definition: "Unfriendly and antagonistic.",
        explanation: "Hostile describes aggressive and unwelcoming behavior."
    },
    {
        word: "Somber",
        polarity: "negative",
        definition: "Dark or dull; gloomy.",
        explanation: "Somber conveys seriousness and a lack of joy."
    },
    {
        word: "Cynical",
        polarity: "negative",
        definition: "Distrustful of human sincerity or integrity.",
        explanation: "Cynical describes a pessimistic and skeptical attitude."
    },
    {
        word: "Arrogant",
        polarity: "negative",
        definition: "Having an exaggerated sense of one's importance.",
        explanation: "Arrogant indicates prideful and condescending behavior."
    },
    {
        word: "Resentful",
        polarity: "negative",
        definition: "Feeling bitter or indignant about unfair treatment.",
        explanation: "Resentful describes lingering anger and bitterness."
    },
    {
        word: "Apathetic",
        polarity: "negative",
        definition: "Showing no interest, enthusiasm, or concern.",
        explanation: "Apathetic indicates indifference and lack of emotion."
    },
    {
        word: "Envious",
        polarity: "negative",
        definition: "Feeling discontented longing for another's advantages.",
        explanation: "Envious describes jealousy and covetous feelings."
    },
    {
        word: "Gloomy",
        polarity: "negative",
        definition: "Dark or poorly lit; causing sadness.",
        explanation: "Gloomy conveys darkness and a depressing atmosphere."
    },
    {
        word: "Reckless",
        polarity: "negative",
        definition: "Acting without thinking of the consequences.",
        explanation: "Reckless describes careless and irresponsible behavior."
    },
    {
        word: "Stubborn",
        polarity: "negative",
        definition: "Refusing to change one's mind or position.",
        explanation: "Stubborn indicates inflexibility and obstinacy."
    },
    {
        word: "Irritable",
        polarity: "negative",
        definition: "Easily annoyed or provoked to anger.",
        explanation: "Irritable describes a tendency to become frustrated quickly."
    },
    {
        word: "Pessimistic",
        polarity: "negative",
        definition: "Tending to see the worst in things.",
        explanation: "Pessimistic describes a negative and hopeless outlook."
    },
    {
        word: "Spiteful",
        polarity: "negative",
        definition: "Showing a desire to hurt, annoy, or offend.",
        explanation: "Spiteful indicates malicious and mean-spirited behavior."
    },
];

// Colors for the game
export const POLARITY_COLORS = {
    background: "#F2F2F2",
    card: "#FFFFFF",
    text: "#1F2937",
    textMuted: "#6B7280",
    textLight: "#FFFFFF",

    // Green theme for positive
    positive: "#10B981",
    positiveDark: "#059669",
    positiveLight: "#D1FAE5",

    // Red theme for negative
    negative: "#EF4444",
    negativeDark: "#DC2626",
    negativeLight: "#FEE2E2",

    // Timer and UI
    timer: "#50C878",
    timerLow: "#EF4444",
    modal: "#1C1C1E",
    modalOverlay: "rgba(0, 0, 0, 0.7)",
};
