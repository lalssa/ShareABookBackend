import { Router } from "express";
import {
    addBook,
    deleteBook,
    getBookById,
    getBooks,
    getPopularBooks,
    getUserBooks,
    updateBook,
} from "../controllers/book";
import isAuth from "../middleware/is_auth";
import isRegisteredInDB from "../middleware/is_registered_in_db";

const router = Router();

// router.get("/:objectID", isAuth, getBookById);
router.get("/", getBooks);
router.get("/popular", getPopularBooks);
router.get("/user", isAuth, getUserBooks);
router.post("/", isAuth, addBook);
router.put("/:objectID", isAuth, updateBook);
router.delete("/:objectID", isAuth, deleteBook);

export default router;
