import { Request, Response } from "express";
import { User } from "../model/user.model";
import jwt from 'jsonwebtoken';
import { config } from "../config/config";


export class UserController {

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const user = await User.find().select("-password");
            if(!user){
                res.status(200).json({
                    success:true,
                    message:"Users fetched successfully",
                    data:[]
                })
                return;
            }
            res.status(200).json({
                success: true,
                message: "Users fetched successfully",
                data: user,
            });
        } catch (e: any) {
            res.status(400).json({
                success: false,
                message: "Failed to fetch users",
                error: e.message,
            });
            return;
        }
    }

    async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;

            const user = await User.findById(id).select("-password");

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "User fetched successfully",
                data: user,
            });
        } catch (e: any) {
            res.status(400).json({
                success: false,
                message: "Failed to fetch user",
                error: e.message,
            });
            return;
        }
    }




    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const { name, email, password, age } = req.body;

            const isUserExist = await User.findOne({ email });

            if (isUserExist) {
                res.status(400).json({
                    success: false,
                    message: "User already exists",
                });
                return;
            }

            const user = await User.create({ name, email, password, age });

            const token = user.generateAccessToken();
            const { password: _password, ...safeUser } = user.toObject();
            res.status(201).json({
                success: true,
                message: "User created successfully",
                data: { user: safeUser, token: token },
            });
        } catch (e: any) {
            res.status(400).json({
                success: false,
                message: "Failed to create user",
                error: e.message,
            });
        }
    }


    async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const { name, email, age } = req.body;

            const id = req.params.id;
            const user = await User.findByIdAndUpdate(id, { email, name, age }, {
                new: true,
                runValidators: true,
            }).select('-password');

            if (!user) {
                res.status(400).json({
                    success: false,
                    message: "User Not found",
                    data: user
                })
                return;
            }

            res.status(200).json({
                success: true,
                messagge: "User Updated Succesfully",
                data: user,
            })

        } catch (e: any) {
            res.status(400).json({
                success: false,
                message: "Failed to update User",
                error: e.e.message
            })
        }
    }


    async deleteUser(req: Request, res: Response): Promise<void> {
        try {

            const id = req.params.id;

            const user = await User.findByIdAndDelete(id).select('-password')


            if (!user) {
                res.status(400).json({
                    success: false,
                    message: "User not found",
                    data: user
                })
                return;
            }

            res.status(200).json({
                success: true,
                message: "User deleted successfully",
                data: user
            })
        } catch (e: any) {
            res.status(400).json({
                success: false,
                message: "Failed to delete user",
                error: e.message
            })
        }
    }

    async loginUser(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email) {
                res.status(400).json({
                    success: false,
                    message: "Please provide email"
                })
                return;
            }
            if (!password) {
                res.status(400).json({
                    success: false,
                    message: "Please provide password"
                })
                return;
            }
            if (password.length < 6) {
                res.status(400).json({
                    success: false,
                    message: "Password must be of atleast 6 char"
                })
                return;
            }


            const user = await User.findOne({ email }).select('+password');


            if (!user) {
                res.status(400).json({
                    success: false,
                    message: "Invalid user credentials"
                })
                return;
            }
            const isPasswordValid = await user.comparePassword(password);


            if (!isPasswordValid) {
                res.status(201).json({
                    success: false,
                    message: "Invalid Password"
                })
                return;
            }

            const { password: _password, ...safeUser } = user.toObject();


            const token = user.generateAccessToken();

            res.status(200).json({
                success: true,
                message: "Login Successfull",
                data: {
                    user: safeUser,
                    token: token
                }
            })
        } catch (e: any) {
            res.status(400).json({
                success: false,
                message: "Failed to Login"
            })
        }
    }


    async deleteAllUser(req: Request, res: Response): Promise<void> {
        try{
            const user = await User.deleteMany({})
        res.status(200).json({
            success: true,
            message: `${user} has been deleted`,
        })
        }catch(e:any){
            res.status(400).json({
                success:false,
                message:e.message
            })
        }
    }
}

export const userController = new UserController()