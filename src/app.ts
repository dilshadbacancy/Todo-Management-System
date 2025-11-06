import express, { Application, Request, Response } from 'express';

import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import userRouter from './routes/user.routes';
import todoRouter from './routes/todo.route'
import { timeStamp } from 'console';


const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/// Use Routes
app.use('/api/users/', userRouter);
app.use('/api/todos/',todoRouter);

/// To check health of the server
app.get('/health', (req: Request, res: Response) => {
res.status(200).json({
    success:true,
    message:"Server is healthy",
    timestamp:new Date().toISOString()
});
})

/// To test the server...
app.get('/',(req:Request, res: Response)=>{
    res.status(200).json({
        success:true,
        message:"Welcome to user management system",
        endpoints:{
            health:'/health',
            users:'/api/users',
            login:'/api/users/login'
        }
    })
})

/// Handle 400 Error Globally
app.use((req:Request,res:Response)=>{
    res.status(400).json({
        success:false,
        message:"Route not found"
    })
})


export default app;