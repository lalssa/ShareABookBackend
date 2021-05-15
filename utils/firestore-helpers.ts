// import firstore (obviously)
import { firestore } from "firebase-admin";
// Make the helper types for updates:
type PathImpl<T, K extends keyof T> = K extends string
    ? T[K] extends Record<string, any>
        ? T[K] extends ArrayLike<any>
            ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof any[]>>}`
            : K | `${K}.${PathImpl<T[K], keyof T[K]>}`
        : K
    : never;
type Path<T> = PathImpl<T, keyof T> | keyof T;
type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
        ? Rest extends Path<T[K]>
            ? PathValue<T[K], Rest>
            : never
        : never
    : P extends keyof T
    ? T[P]
    : never;
export type UpdateData<T extends object> = Partial<
    {
        [TKey in Path<T>]: PathValue<T, TKey>;
    }
>;

// Import or define your types
import { Book } from "../models/book";
import { AppUser } from "../models/user";
import { UserBook } from "../models/user_book";

const converter = <T>() => ({
    toFirestore: (data: Partial<T>) => data,
    fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
        snap.data() as T,
});
const dataPoint = <T>(collectionPath: string) =>
    firestore().collection(collectionPath).withConverter(converter<T>());
const db = {
    users: dataPoint<AppUser>("users"),
    books: dataPoint<UserBook>("books"),
    // users: dataPoint<YourType>('users')
};
export { db };
