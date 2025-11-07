import cron from 'node-cron';
import { todoController } from '../controller/todo.conttroller';
import { userController } from '../controller/user.controller';


export const startDueReminderJob = () => {
    console.log("Overdue TODO remider Job started!!!!");

    cron.schedule("*/20 * * * * *",
        async () => {
            console.log("⏳ Running daily overdue check at 5:55 PM...");

            const todos = await todoController.getOverDueTask();

            console.log(`Todos ::: ${todos.length}`);

            for (const todo of todos) {
                await userController.sendReminder(todo.user.toString(), todo.title)
                console.log(`✅ Reminder sent for Todo: ${todo._id}`);
            }


        })

}

