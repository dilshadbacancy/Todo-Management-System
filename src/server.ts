import app from './app';
import { config } from './config/config'
import { connectDatabase } from './config/database'
import { startDueReminderJob } from './jobs/dueReminder.job';


const startServer = async () => {
    try {

        await connectDatabase().then(() => {
            startDueReminderJob();
        });
        const PORT = config.server.port;

        app.listen(PORT, () => {
            console.log('=================================');
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📝 Environment: ${config.server.nodeEnv}`);
            console.log(`🔗 API: http://localhost:${PORT}/api/users`);
            console.log('=================================');
        })
    } catch (e: any) {
        console.error('❌ Failed to start server:', e);
        process.exit(1);
    }
}


// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});


startServer();