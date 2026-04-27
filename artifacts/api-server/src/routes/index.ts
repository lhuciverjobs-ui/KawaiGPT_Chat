import { Router, type IRouter } from "express";
import healthRouter from "./health";
import modelsRouter from "./models";
import chatRouter from "./chat";
import imageRouter from "./image";

const router: IRouter = Router();

router.use(healthRouter);
router.use(modelsRouter);
router.use(chatRouter);
router.use(imageRouter);

export default router;
