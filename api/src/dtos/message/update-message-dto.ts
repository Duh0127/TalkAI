import { MessageFileDTO } from "./create-message-dto";

export interface UpdateMessageDTO {
    role?: string;
    content?: string;
    files?: MessageFileDTO[];
    date?: string;
}
