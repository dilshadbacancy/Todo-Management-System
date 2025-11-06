import { Router } from "express";

import { userController } from '../controller/user.controller'
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();


/// User Routess----


router.post('/login', userController.loginUser.bind(userController));

router.post('/create-user/', userController.createUser.bind(userController))


router.use(authMiddleware);
router.get('/get-all-users/', userController.getAllUsers.bind(userController))
router.get('/get-user-by-id/:id', userController.getUserById.bind(userController))
router.delete('/delete-user/:id', userController.deleteUser.bind(userController));
router.put('/update-user/:id', userController.updateUser.bind(userController))

router.delete('/delete-all',userController.deleteAllUser.bind(userController));


export default router;  