export interface MessageFileDTO {
    name: string;
    url: string;
}

export interface CreateMessageDTO {
    conversationId: number;
    role: string;
    content: string;
    files?: MessageFileDTO[];
    date: string;
}
