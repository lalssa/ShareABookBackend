import { Book } from "./book";

export interface AppUser {
    uid: string;
    fullName: string;
    email: string;
    phone: string;
    books?: Book[];
}
