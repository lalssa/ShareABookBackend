if (process.env.NODE_ENV !== "production") require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import { firestore } from "firebase-admin";
import { Book } from "../models/book";
import { db, UpdateData } from "../utils/firestore-helpers";
import "express-async-errors";
import CustomError from "../interfaces/custom_error";
import algoliasearch from "algoliasearch";
import { AppUser } from "../models/user";
import { UserBook } from "../models/user_book";
import { BookDocument } from "../models/book_document";
const booksRef: firestore.CollectionReference<UserBook> = db.books;
const usersRef: firestore.CollectionReference<AppUser> = db.users;
const client = algoliasearch(
    process.env.ALGOLIA_APP_ID!,
    process.env.ALGOLIA_ADMIN_KEY!
);
const index = client.initIndex("books");

export const getBookById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response> => {
    const { objectID } = req.params;
    try {
        const userBook: UserBook = (await booksRef.doc(objectID).get()).data()!;
        const bookDocument: BookDocument = { objectID, userBook };

        if (userBook) {
            return res.status(200).send({
                message: "Book fetched Successfully",
                bookDocument,
                uid: req.userId,
            });
        }

        const error = new CustomError("Books not found");
        error.statusCode = 500;
        throw error;
    } catch (err) {
        const error = new CustomError("Database Error");
        error.statusCode = 500;
        throw error;
    }
};

export const getBooks = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response> => {
    const { search } = req.query;
    const bookDocuments = await index.search<BookDocument>(
        search?.toString() ?? ""
    );

    if (bookDocuments) {
        return res.status(200).send({
            message: "Books fetched",
            bookDocuments: bookDocuments.hits,
            uid: req.userId,
        });
    }
    const error = new CustomError("No books found");
    error.statusCode = 500;
    throw error;
};

export const getPopularBooks = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response> => {
    const bookDocuments = await index.search("", { length: 2 });

    if (bookDocuments) {
        return res.status(200).send({
            message: "Popular Books fetched",
            bookDocuments: bookDocuments.hits,
            uid: req.userId,
        });
    }
    const error = new CustomError("No books found");
    error.statusCode = 500;
    throw error;
};

export const getUserBooks = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response> => {
    const bookDocuments = await index.search<BookDocument>(req.userId, {
        restrictSearchableAttributes: ["userBook.userId"],
    });

    if (bookDocuments) {
        return res.status(200).send({
            message: "User Books fetched",
            bookDocuments: bookDocuments.hits,
            uid: req.userId,
        });
    }
    const error = new CustomError("No books found");
    error.statusCode = 500;
    throw error;
};

export const addBook = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response> => {
    const userId = req.userId;
    const book: Book = req.body.book;
    const userBook: UserBook = {
        book,
        userId,
    };
    try {
        const bookResult = await booksRef.add(userBook);
        const objectID = bookResult.id;
        const bookDocument: BookDocument = {
            userBook,
            objectID,
        };
        const userBookResult = await usersRef.doc(req.userId).update({
            books: firestore.FieldValue.arrayUnion(
                bookDocument as BookDocument
            ),
        });

        index.saveObject(bookDocument);

        return res.status(200).send({
            message: "Book Added",
            bookDocument,
            uid: req.userId,
        });
    } catch (err) {
        const error = new CustomError("Book insertion error");
        error.statusCode = 500;
        error.data = err;
        throw error;
    }
};

export const updateBook = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response> => {
    const userId = req.userId;
    const { objectID } = req.params;
    const userBook: UserBook = req.body.bookDocument.userBook;
    const bookDocument: BookDocument = {
        userBook,
        objectID,
    };
    try {
        // Get old book
        const oldUserBook: UserBook = (
            await booksRef.doc(objectID).get()
        ).data()!;

        const oldBookDocument: BookDocument = {
            objectID,
            userBook: oldUserBook,
        };

        const bookResult = await booksRef
            .doc(bookDocument.objectID)
            .update(userBook);

        const userBookResult = await usersRef.doc(req.userId).update({
            books: firestore.FieldValue.arrayRemove(
                oldBookDocument as BookDocument
            ),
        });

        if (userBookResult) {
            await usersRef.doc(req.userId).update({
                books: firestore.FieldValue.arrayUnion(
                    bookDocument as BookDocument
                ),
            });
        }

        index.deleteObject(objectID);
        index.saveObject(bookDocument);

        return res.status(200).send({
            message: "Book Updated",
            bookDocument,
        });
    } catch (err) {
        const error = new CustomError("Book update error");
        error.statusCode = 500;
        error.data = err;
        throw error;
    }
};

export const deleteBook = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response> => {
    const { objectID } = req.params;
    // Get old book
    try {
        const oldUserBook: UserBook = (
            await booksRef.doc(objectID).get()
        ).data()!;

        const oldBookDocument: BookDocument = {
            objectID,
            userBook: oldUserBook,
        };
        const userBookResult = await usersRef.doc(req.userId).update({
            books: firestore.FieldValue.arrayRemove(
                oldBookDocument as BookDocument
            ),
        });
        index.deleteObject(objectID);

        return res.status(200).send({
            message: "Book Deleted",
            uid: req.userId,
        });
    } catch (err) {
        const error = new CustomError("Book deletion error");
        error.statusCode = 500;
        error.data = err;
        throw error;
    }
};
