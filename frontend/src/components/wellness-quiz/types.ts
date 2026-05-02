export interface TreeNode {
    id: string;
    questionKey: string;
    options: {
        id: string;
        textKey: string;
        next?: string;
    }[];
}

export interface Answer {
    question: string;
    answer: string;
    nodeId: string;
}
