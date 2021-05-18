import { Router } from "express";
import { stripePay } from "../controllers/payment";
import isAuth from "../middleware/is_auth";

const router = Router();

router.get("/", isAuth, stripePay);

export default router;
