if (process.env.NODE_ENV !== "production") require("dotenv").config();
import * as admin from "firebase-admin";

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS!);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

import express, { NextFunction, Request, Response } from "express";
import bookRoutes from "./routes/book";
import CustomError from "./interfaces/custom_error";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/book", bookRoutes);

app.use(
    (error: CustomError, req: Request, res: Response, next: NextFunction) => {
        console.log(error.message);
        const status = error.statusCode || 500;
        const message = error.message;
        const data = error.data;
        res.status(status).json({ message: message, data: data });
    }
);

try {
    app.listen(port, (): void => {
        console.log(`Connected successfully on port ${port}`);
    });
} catch (error) {
    console.error(`Error occurred: ${error.message}`);
}
