import { database } from "firebase-admin";

export default class CustomError extends Error {
    data: Object;
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.data = {};
        this.statusCode = 500;
    }
}
