import * as glob from 'glob';
import * as path from 'path';
import * as Mocha from 'mocha';

export function runTests(testsRoot: string, mocha: Mocha): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            const files = await glob.glob('**/**.test.js', { cwd: testsRoot });

            // Add files to the test suite
            files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

            // Run the Mocha test
            mocha.run((failures) => {
                if (failures > 0) {
                    reject(new Error(`${failures} tests failed.`));
                } else {
                    resolve();
                }
            });
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}
