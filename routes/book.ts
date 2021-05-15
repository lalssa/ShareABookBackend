import { Router } from "express";
import {
    addBook,
    deleteBook,
    getBookById,
    getBooks,
    updateBook,
} from "../controllers/book";
import isAuth from "../middleware/is_auth";

const router = Router();

router.get("/:objectID", isAuth, getBookById);
router.get("/", isAuth, getBooks);
router.post("/", isAuth, addBook);
router.put("/:objectID", isAuth, updateBook);
router.delete("/:objectID", isAuth, deleteBook);

export default router;
