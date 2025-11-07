import { Router } from 'express';
import { todoController } from '../controller/todo.conttroller';
import { authMiddleware } from '../middleware/auth.middleware';
import { userController } from '../controller/user.controller';


const router = Router();

router.use(authMiddleware);

router.get('/get-all-todos', todoController.getAllTodos.bind(todoController));
router.post('/add-todo', todoController.addTodo.bind(todoController))
router.get('/get-todo-by-id/:id', todoController.getTodoById.bind(todoController));
router.put('/update-todo/:id', todoController.updateTodo.bind(todoController))
router.delete('/delete-todo/:id', todoController.deleteTodo.bind(todoController));
router.patch('/complete-todo/:id', todoController.completeTodo.bind(todoController));
router.delete('/delete-bulk-todos', todoController.deleteBulkTodos.bind(todoController));
router.get('/search-todo', todoController.searchTodo.bind(todoController))
router.put('/assign-todo', todoController.assignTodo.bind(todoController))
router.get('/get-assiged-todo', todoController.getAssignedTodo.bind(todoController));
router.get('/overdue-todo', todoController.getOverdueTodos.bind(userController));

export default router;