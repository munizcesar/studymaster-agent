const { execSync } = require('child_process');

const D1_DB = "studymaster-editais";

// Ensures environment variables for D1 execution
function getEnv() {
    return { ...process.env, WRANGLER_SEND_METRICS: "false", CI: "true" };
}

/**
 * Runs a query on remote D1 and returns JSON output.
 * Throws an explicit error if the query fails.
 */
function runSQLJSON(query) {
    try {
        const cmd = `npx wrangler d1 execute ${D1_DB} --remote --json --command="${query.replace(/\n/g, ' ')}"`;
        const res = execSync(cmd, { env: getEnv() }).toString();
        return JSON.parse(res);
    } catch(e) {
        throw new Error(`D1 SQLJSON Error executing query: [${query.substring(0, 100)}...] - Details: ${e.message}`);
    }
}

/**
 * Runs a query on remote D1 without expecting JSON output (e.g. INSERT, UPDATE).
 * Throws an explicit error if the query fails.
 */
function runSQL(query) {
    try {
        const cmd = `npx wrangler d1 execute ${D1_DB} --remote --command="${query.replace(/\n/g, ' ')}"`;
        execSync(cmd, { env: getEnv() });
    } catch(e) {
        throw new Error(`D1 SQL Error executing query: [${query.substring(0, 100)}...] - Details: ${e.message}`);
    }
}

/**
 * Runs a query on remote D1 using a file containing SQL statements.
 * Throws an explicit error if the execution fails.
 */
function runSQLFile(filePath) {
    let retries = 3;
    while(retries > 0) {
        try {
            const cmd = `npx wrangler d1 execute ${D1_DB} --remote --file ${filePath}`;
            execSync(cmd, { env: getEnv() });
            return;
        } catch(e) {
            retries--;
            if (retries === 0) {
                throw new Error(`D1 SQL Error executing file: [${filePath}] - Details: ${e.message}`);
            }
            execSync('timeout /t 2 /nobreak > NUL'); // wait 2 seconds on windows
        }
    }
}

module.exports = {
    runSQL,
    runSQLJSON,
    runSQLFile
};
