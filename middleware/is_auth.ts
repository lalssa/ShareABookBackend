import { NextFunction, Request, Response } from "express";
import { auth } from "firebase-admin";
import CustomError from "../interfaces/custom_error";
import "express-async-errors";
import { AppUser } from "../models/user";

const isAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        const error = new CustomError("Not authenticated.");
        error.statusCode = 401;
        throw error;
    }
    const token = authHeader.split(" ")[1];
    let decodedToken: auth.DecodedIdToken;
    try {
        decodedToken = await auth().verifyIdToken(token);
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        const error = new CustomError("Not authenticated.");
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.uid;
    console.log("User authenticated: ", req.userId);
    next();
};

export default isAuth;
