import { Request, Response, NextFunction } from "express";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import onFinished from "on-finished";
import { v4 as uuid } from "uuid";

const filePath = () => {
    const date = new Date().toISOString().split("T")[0];
    return path.join(__dirname, `../logs/app-${date}.log`);
};

const sanitize = (obj: any) => {
    const clone = JSON.parse(JSON.stringify(obj || {}));
    ["password", "token", "otp"].forEach((k) => {
        if (clone[k]) clone[k] = "***HIDDEN***";
    });
    return clone;
};

// ✅ Pretty JSON
const pretty = (d: any) => JSON.stringify(d, null, 2);

// ✅ Make two-column formatted view
const formatTwoColumns = (left: string, right: string, width = 60) => {
    const leftLines = left.split("\n");
    const rightLines = right.split("\n");

    const maxLines = Math.max(leftLines.length, rightLines.length);

    let output = "";

    for (let i = 0; i < maxLines; i++) {
        const leftLine = leftLines[i] || "";
        const rightLine = rightLines[i] || "";

        const paddedLeft = leftLine.padEnd(width, " ");

        output += `${paddedLeft} || ${rightLine}\n`;
    }

    return output;
};

export const logger = (req: Request, res: Response, next: NextFunction) => {
    const requestId = uuid();
    const start = Date.now();

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
        (res.locals as any).body = body;
        return originalJson(body);
    };

    onFinished(res, () => {
        const status = res.statusCode;
        const duration = `${Date.now() - start}ms`;
        const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);

        const bodyPretty = pretty(sanitize(req.body));
        const responsePretty = pretty(sanitize((res.locals as any).body));

        const header = `
====================================================================================================
TIMESTAMP             | REQUEST ID                           | METHOD | STATUS | TIME  | URL
----------------------------------------------------------------------------------------------------`;

        const row = `${timestamp.padEnd(21)} | ${requestId.padEnd(
            36
        )} | ${req.method.padEnd(6)} | ${status
            .toString()
            .padEnd(6)} | ${duration.padEnd(5)} | ${req.originalUrl}`;

        // ✅ Two-column JSON (formatted)
        const tableJSON = formatTwoColumns(
            `Body:\n${bodyPretty}`,
            `Response:\n${responsePretty}`
        );

        const footer = `====================================================================================================\n`;

        // ✅ Write to log file
        fs.ensureFileSync(filePath());
        fs.appendFileSync(
            filePath(),
            `${header}\n${row}\n${tableJSON}${footer}`,
            "utf8"
        );

        // ✅ Print to console
        console.log(chalk.blue(header));
        console.log(chalk.green(row));
        console.log(chalk.yellow(tableJSON));
        console.log(chalk.blue(footer));
    });

    next();
};
