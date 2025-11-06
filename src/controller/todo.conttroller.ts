import { Request, Response } from "express";
import { Todo } from "../model/todo.model";
import { AuthRequest } from '../middleware/auth.middleware';


export class TodoController {


    async getAllTodos(req: AuthRequest, res: Response): Promise<void> {
        try {
            const {
                completed,
                priority,
                dueDateFrom,
                dueDateTo,
                dueDate,
                overdue,
                sort,
                page,
                limit
            } = req.query;

            console.log(`UserId:::: ${req.user._id}`);

            // Build filter
            const filter: any = { user: req.user._id };

            // Filter by completion status
            if (completed !== undefined) {
                filter.completed = completed === 'true';
            }

            // Filter by priority (can be comma-separated: ?priority=high,medium)
            if (priority) {
                const priorities = (priority as string).split(',');
                filter.priority = { $in: priorities };
            }

            // Filter by specific due date
            if (dueDate) {
                const date = new Date(dueDate as string);
                const nextDay = new Date(date);
                nextDay.setDate(nextDay.getDate() + 1);

                filter.dueDate = {
                    $gte: date,
                    $lt: nextDay
                };
            }

            // Filter by due date range
            if (dueDateFrom || dueDateTo) {
                filter.dueDate = {};

                if (dueDateFrom) {
                    filter.dueDate.$gte = new Date(dueDateFrom as string);
                }

                if (dueDateTo) {
                    filter.dueDate.$lte = new Date(dueDateTo as string);
                }
            }

            // Filter overdue todos
            if (overdue === 'true') {
                filter.dueDate = { $lt: new Date() };
                filter.completed = false;
            }

            // Search in title and description
            // if (search) {
            //     filter.$or = [
            //         { title: { $regex: search, $options: 'i' } },
            //         { description: { $regex: search, $options: 'i' } }
            //     ];
            // }

            // Build sort
            let sortOption: any = { createdAt: -1 }; // Default: newest first

            if (sort === 'dueDate') {
                sortOption = { dueDate: 1, createdAt: -1 };
            } else if (sort === 'dueDateDesc') {
                sortOption = { dueDate: -1, createdAt: -1 };
            } else if (sort === 'priority') {
                // Custom priority order: high > medium > low
                sortOption = { priority: 1, createdAt: -1 };
            } else if (sort === 'title') {
                sortOption = { title: 1 };
            } else if (sort === 'titleDesc') {
                sortOption = { title: -1 };
            } else if (sort === 'oldest') {
                sortOption = { createdAt: 1 };
            }

            // Pagination
            const pageNum = parseInt(page as string) || 1;
            const limitNum = parseInt(limit as string) || 100;
            const skip = (pageNum - 1) * limitNum;

            // Execute query with pagination
            const todos = await Todo.find(filter)
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum);

            // Get total count for pagination
            const totalCount = await Todo.countDocuments(filter);

            res.status(200).json({
                success: true,
                count: todos.length,
                total: totalCount,
                page: pageNum,
                totalPages: Math.ceil(totalCount / limitNum),
                data: todos,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch todos',
                error: error.message,
            });
        }
    }


    async addTodo(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { title, description, priority, dueDate } = req.body;

            if (!title) {
                res.status(201).json({
                    success: false,
                    message: "Title is required"
                })
                return;
            }

            if (!description) {
                res.status(201).json({
                    success: false,
                    message: "Description is required"
                })
                return;
            }

            const todo = await Todo.create({
                title,
                description,
                priority, dueDate,
                user: req.user._id
            })
            res.status(201).json({
                success: false,
                message: "Todo Created successfull",
                data: todo
            })

        } catch (e: any) {
            res.status(201).json({
                success: false,
                message: e.message
            })
            return;
        }
    }


    async getTodoById(req: AuthRequest, res: Response): Promise<void> {
        try {

            const id = req.params.id;

            const todo = await Todo.findById(id);

            if (!todo) {
                res.status(200).json({
                    success: true,
                    message: "No Todo found in out records",
                    data: []
                })
                return;
            }


            res.status(201).json({
                success: true,
                message: "Todo Fetched Successfully",
                data: todo
            })


        } catch (e: any) {
            res.status(201).json({
                success: false,
                message: e.message
            })
        }

    }


    async updateTodo(req: AuthRequest, res: Response): Promise<void> {

        try {
            const { title, description, priority, dueDate } = req.body;
            const id = req.params.id;

            if (!title) {
                res.status(201).json({
                    success: false,
                    message: "Title Cannot be empty"
                })
                return;
            }
            if (!description) {
                res.status(201).json({
                    success: false,
                    message: "Description cannot be empty"
                })
                return;
            }

            const todo = await Todo.findByIdAndUpdate({
                _id: id,
                user: req.user._id
            },
                {
                    title,
                    description,
                    priority,
                    dueDate
                },
                {
                    new: true,
                    runValidators: true
                });

            if (!todo) {
                res.status(201).json({
                    success: true,
                    message: "No todo found in our records to update",
                    data: todo,
                })
                return;
            }

            res.status(200).json({
                success: true,
                message: "Todo updated successfully",
                data: todo
            })
        } catch (e: any) {
            res.status(401).json({
                success: false,
                message: e.message
            })
        }
    }

    async deleteTodo(req: AuthRequest, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const userId = req.user._id;

            const todo = await Todo.findByIdAndDelete({ _id: id, user: userId });
            if (!todo) {
                res.status(201).json({
                    success: true,
                    message: "Todo not found in records."

                })
                return;
            }
            res.status(201).json({
                success: true,
                message: "Todo Deleted Successfully",
                data: todo,
            })
        } catch (e: any) {
            res.status(201).json({
                success: false,
                message: e.message
            }).end();
        }
    }

    async completeTodo(req: AuthRequest, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const todo = await Todo.findOne({
                _id: id,
                // user: req.user._id
            })

            console.log(`id::${id}-----${req.user._id}`);


            if (!todo) {
                res.status(200).json({
                    success: false,
                    message: "No todo found in our records.",
                    data: todo,
                })
                return;
            }

            todo.completed = !todo.completed;
            todo.save();
            res.status(200).json({
                success: true,
                message: "Todo mark as completed",
                data: todo
            })
        } catch (e: any) {
            res.status(201).json({
                success: false,
                message: e.message
            })
            return;
        }

    }

    async deleteBulkTodos(req: AuthRequest, res: Response): Promise<void> {
        const { ids } = req.body;
        const userId = req.user._id;

        if (!ids || !Array.isArray(ids) || ids.length == 0) {
            res.status(201).json({
                success: false,
                message: "Please provide us todo ids."
            })
            return;
        }

        const todos = await Todo.deleteMany({
            _id: { $in: ids },
            user: userId,
        })

        if (todos.deletedCount === 0) {
            res.status(200).json({
                success: true,
                message: "No todo found with the given Ids."
            })
        }

        if (!todos) {
            res.status(200).json({
                success: true,
                message: "Todos not found of the given ids in our records."
            })
            return;
        }

        res.status(200).json({
            success: true,
            message: "Todos deleted for the given ids",
            data: todos
        })

    }


    async searchTodo(req: AuthRequest, res: Response): Promise<void> {

        try {
            const userId = req.user._id;
            const search = req.query.search;


            const filter: any = {
                $or: [
                    { user: userId },
                    { assignedTo: userId }
                ]
            };

            if (search) {
                filter.$and = [
                    {
                        $or: [
                            { title: { $regex: search, $options: 'i' } },
                            { description: { $regex: search, $options: 'i' } }
                        ]
                    }
                ];
            }

            const todos = await Todo.find(filter)
                .sort({ createdAt: -1 });

            if (!todos) {
                res.status(200).json({
                    success: true,
                    message: "No todo found!!"
                })
                return;
            }
            res.status(200).json({
                success: true,
                message: "Todo fetched",
                data: todos
            })

        } catch (e: any) {
            res.status(201).json({
                success: false,
                message: e.message,
            })
        }


    }


    async assignTodo(req: AuthRequest, res: Response): Promise<void> {
        const { id, assignedToUser } = req.body;
        const loggedInUserID = req.user._id;

        if (!id) {
            res.status(200).json({
                success: false,
                message: "Task id is required"
            })
            return;
        }

        if (!assignedToUser) {
            res.status(200).json({
                succsess: true,
                message: "Assigned to Id is required"
            })
            return;
        }

        const todo = await Todo.findOne({
            _id: id,
            user: loggedInUserID
        })
        if (!todo) {
            res.status(200).json({
                success: true,
                message: "Task is not found in our records"
            })
            return;
        }
        todo.assignedTo = assignedToUser;
        todo.assignedBy = loggedInUserID;
        todo.assignedAt = new Date()

        todo.save();

        res.status(200).json({
            success: true,
            message: "Task Assigned successfully",
            data: todo,
        })
    }

    async getAssignedTodo(req: AuthRequest, res: Response): Promise<void> {
        try {

            const userId = req.user._id;

            const todos = await Todo.find({ assignedTo: userId })
                .populate("assignedBy", "name email")
                .populate("assignedTo", "name email",)


            if (!todos) {
                res.status(200).json({
                    success: false,
                    message: "No assigned task found"
                })
                return;
            }
            res.status(200).json({
                success: true,
                message: "Assigned task fetched",
                data: todos
            })

        } catch (e: any) {
            res.status(200).json({
                success: false,
                message: e.message,
            })
        }
    }

}
export const todoController = new TodoController()