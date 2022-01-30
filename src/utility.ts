import * as vscode from 'vscode';
import { Constants } from './constants';
import * as fs from 'fs';

export class Utility {
    public static async getPythonPath(
        document: vscode.TextDocument
    ): Promise<string | undefined> {
        try {
            const extension = vscode.extensions.getExtension('ms-python.python');
            if (!extension) {
                return Constants.python;
            }
            const usingNewInterpreterStorage =
                extension.packageJSON?.featureFlags?.usingNewInterpreterStorage;
            if (usingNewInterpreterStorage) {
                if (!extension.isActive) {
                    await extension.activate();
                }
                const execCommand = extension.exports.settings.getExecutionDetails
                    ? extension.exports.settings.getExecutionDetails(document?.uri)
                          .execCommand
                    : extension.exports.settings.getExecutionCommand(document?.uri);
                return execCommand ? execCommand.join(' ') : Constants.python;
            } else {
                return this.getConfiguration('python', document).get<string>(
                    'pythonPath'
                );
            }
        } catch (error) {
            return Constants.python;
        }
    }

    public static getConfiguration(
        section?: string,
        document?: vscode.TextDocument
    ): vscode.WorkspaceConfiguration {
        if (document) {
            return vscode.workspace.getConfiguration(section, document.uri);
        } else {
            return vscode.workspace.getConfiguration(section);
        }
    }

    public static async getDefaultPytestCmd(document: vscode.TextDocument) {
        const pythonPath = await this.getPythonPath(document);
        if (pythonPath) {
            let pytestPath = `${pythonPath.split('/').slice(0, -1).join('/')}/${
                Constants.pytest
            }`;
            return this._checkPytest(pytestPath);
        } else {
            let pytestPath = Constants.pytest;
            return this._checkPytest(pytestPath);
        }
    }

    private static _checkPytest(path: string) {
        if (fs.existsSync(path)) {
            return path;
        } else {
            return;
        }
    }
}
