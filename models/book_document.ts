import { UserBook } from "./user_book";

export interface BookDocument {
    objectID: string;
    userBook: UserBook;
}
