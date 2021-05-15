import { NextFunction, Request, Response } from "express";
import { auth } from "firebase-admin";
import { db } from "../utils/firestore-helpers";
import { AppUser } from "../models/user";

const isRegisteredInDB = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.userId;
    const docSnapshot = await db.users.doc(userId).get();
    if (docSnapshot == null || !docSnapshot.exists) {
        const { displayName, uid, email, phoneNumber } = await auth().getUser(
            userId
        );
        const appUser: AppUser = {
            fullName: displayName ?? "New User Name",
            email: email ?? "New User Email",
            phone: phoneNumber ?? "New User Phone Number",
            uid: uid,
            books: [],
        };
        await db.users.doc(userId).create(appUser);
    }
    next();
};

export default isRegisteredInDB;
