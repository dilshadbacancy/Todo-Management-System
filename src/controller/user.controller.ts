import { Request, Response } from "express";
import { User } from "../model/user.model";
import { AuthRequest } from "../middleware/auth.middleware";
import admin from "../config/firebase";


export class UserController {

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const user = await User.find().select("-password");
            if (!user) {
                res.status(200).json({
                    success: true,
                    message: "Users fetched successfully",
                    data: []
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
            const { name, email, password, age, userType } = req.body;

            const isUserExist = await User.findOne({ email });

            if (isUserExist) {
                res.status(400).json({
                    success: false,
                    message: "User already exists",
                });
                return;
            }

            const user = await User.create({ name, email, password, age, userType });

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
        try {
            const user = await User.deleteMany({})
            res.status(200).json({
                success: true,
                message: `${user} has been deleted`,
            })
        } catch (e: any) {
            res.status(400).json({
                success: false,
                message: e.message
            })
        }
    }



    async changePassword(req: AuthRequest, res: Response): Promise<void> {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user._id;

        if (!currentPassword) {
            res.status(200).json({
                success: false,
                message: "Current password is required"
            })
            return;
        }
        if (!newPassword) {
            res.status(200).json({
                success: false,
                message: "New password is reequired"
            })
            return;
        }

        if (!confirmPassword) {
            res.status(200).json({
                success: false,
                message: "Confirm password is required"
            })
            return;
        }

        if (newPassword !== confirmPassword) {
            res.status(200).json({
                success: false,
                message: "Passowrd doesnot match"
            })
            return;
        }

        if (currentPassword === newPassword) {
            res.status(200).json({
                success: false,
                message: "New password must be different from current password "
            })

            return;
        }

        if (newPassword.length < 6) {
            res.status(200).json({
                success: false,
                message: "Passowrd must be of 6 charachter long"
            })
            return;
        }

        const user = await User.findById(userId).select('+password');

        if (!user) {
            res.status(200).json({
                success: false,
                message: "User does not found in our records"
            })
            return;
        }

        const isValidPassword = await user.comparePassword(currentPassword)

        if (!isValidPassword) {
            res.status(200).json({
                success: false,
                message: "Current password is not valid."
            })
            return;
        }

        user.password = newPassword;
        user.save();
        res.status(200).json({
            success: true,
            message: "Password reset successfully"
        })


    }

    async saveFcm(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { fcmToken } = req.body;
            const userId = req.user._id;
            if (!fcmToken) {
                res.status(200).json({
                    succss: false,
                    message: "FCM token is required"
                })
                return;
            }

            const user = await User.findById(userId).select('-password');
            if (!user) {
                res.status(200).json({
                    success: false,
                    message: "User does not found in our records"
                })
                return;
            }

            user.fcmToken = fcmToken;
            user.save();
            res.status(200).json({
                success: true,
                message: "FCM token saved successfully",
                data: user
            })


        } catch (e: any) {
            res.status(201).json({
                success: false,
                message: e.message,
            })
        }

    }

    async logout(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;

            const user = await User.findById(userId).select('-password');

            if (!user) {
                res.status(200).json({
                    success: false,
                    message: "User doesnot found in our records"
                })
                return;
            }

            user.fcmToken = undefined;
            user.save();
            res.status(200).json({
                success: true,
                message: "User logged out successfully.",
                data: user
            })


        } catch (e: any) {
            res.status(201).json({
                success: false,
                message: e.message
            })
        }

    }


    async sendReminder(userId: String, title: String): Promise<void> {
        try {
            const user = await User.findById(userId);

            if (!user?.fcmToken) {
                console.log("No Fcm token for the user");
                return;
            }

            const message = {
                notification: {
                    title: "Task Overdue",
                    body: `Your task ${title} is overdue, please complete it`,

                },
                token: user.fcmToken,
            }
            await admin.messaging().send(message);
        } catch (e: any) {
            console.log(`Error sending the message::: ${e.message}`);

        }
    }


}



export const userController = new UserController()