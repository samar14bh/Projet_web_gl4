export interface DocumentDto {
    id: number;
    name: string;
    file: string;
    date: Date;
    type: string;
    size: number;
    createdAt: Date;
    user?: {
        id: number;
        firstName: string;
        lastName: string;
    };
}