const { Done, Error } = require('./logging');
const { exec } = require('child_process');

const updateLibraries = async () => {
    try {
        const updatedLibraries = await new Promise((resolve, reject) => {
            exec('npx ncu -u', (err, stdout) => {
                if (err) {
                    return reject(err);
                }
                resolve(stdout.trim());
            });
        });

        Done(`Successfully updated libraries`);

        if (updatedLibraries.includes("All dependencies match the latest package versions :)")) {
            return "-# All libraries are up to date";
        } else {
            return `\`\`\`\n${updatedLibraries}\n\`\`\``;
        }
    } catch (error) {
        Error(`Failed to update libraries: ${error.stack}`);
        throw error;
    }
};

module.exports = { updateLibraries };
