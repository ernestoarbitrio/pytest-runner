import * as vscode from 'vscode';
import * as toml from 'toml';
import * as fs from 'fs';
import { Utility } from './utility';
import { Constants } from './constants';

// Static class that creates and holds a reference to a terminal and can run commands in it.
class Term {
    static termName: string = 'pytest-runner';
    static term?: vscode.Terminal;

    static _term() {
        if (!Term.term) {
            Term.term = vscode.window.createTerminal(Term.termName);
            Term.term.show(true);
            // if user closes the terminal, delete our reference:
            vscode.window.onDidCloseTerminal((event) => {
                if (event.name === Term.termName) {
                    Term.term = undefined;
                }
            });
        }
        return Term.term;
    }

    static run(command: string) {
        Term._term().sendText(command, true);
    }

    static dispose() {
        if (Term._term()) {
            Term._term().dispose();
        }
    }
}

export function getPytestCfg(projectDir: string) {
    function _setupCfgConf(setupCfg: string) {
        const config = fs.readFileSync(setupCfg, 'utf-8');
        const classMatch = config.match(/(?<=python_classes).*/gm);
        const functionMatch = config.match(/(?<=python_functions).*/gm);
        const pyClasses =
            classMatch !== null
                ? classMatch[0].replace('=', '').trim().split(' ')
                : Constants.testClasses;
        const pyFunctions =
            functionMatch !== null
                ? functionMatch[0].replace('=', '').trim().split(' ')
                : Constants.testFunctions;
        return [pyFunctions, pyClasses];
    }

    const pyprojectToml = `${projectDir}/pyproject.toml`;
    const setupCfg = `${projectDir}/setup.cfg`;
    if (fs.existsSync(pyprojectToml)) {
        const config = toml.parse(fs.readFileSync(pyprojectToml, 'utf-8'));
        if (!config.tool) {
            return _setupCfgConf(setupCfg);
        }
        const pyFunctions: Array<string> =
            config.tool.pytest.ini_options.python_functions || Constants.testFunctions;
        const pyClasses: Array<string> =
            config.tool.pytest.ini_options.python_classes || Constants.testClasses;
        return [pyFunctions, pyClasses];
    } else if (fs.existsSync(setupCfg)) {
        return _setupCfgConf(setupCfg);
    } else {
        return [Constants.testFunctions, Constants.testClasses];
    }
}

export function runCommand(cmd: string) {
    if (!cmd) {
        vscode.window.showErrorMessage(`pytest-runner: command not found.`);
        return;
    }
    Term.run(cmd);
}

export function getRelativePath(rootpath: string, wsFolder: string) {
    return rootpath.replace(wsFolder, '').substring(1);
}

export function getTestAuthorityName(
    pytestCfg: string[][],
    sel: vscode.Selection,
    document: vscode.TextDocument
) {
    let [functionsNames, classesNames] = pytestCfg;
    // first authority is the seleceted text
    if (!sel!.isEmpty) {
        const selection = document.getText(sel);
        return functionsNames.some((w) => selection.startsWith(w)) ||
            classesNames.some((w) => selection.startsWith(w))
            ? selection
            : undefined;
    }
    const lineNumber = sel.active.line;
    const line: string | undefined = document.lineAt(lineNumber).text || undefined;
    if (!line) {
        return;
    }
    // second authority is the function name
    const functionMatch: RegExpMatchArray | null = line.match(/def(.*?)\(/);
    if (functionMatch !== null) {
        const function_ = functionMatch[1].trim();
        return functionsNames.some((w) => function_.startsWith(w))
            ? function_
            : undefined;
    }
    // third authority is the class name
    const classMatch: RegExpMatchArray | null = line.match(/class(.*?)[\(|\:]/);
    if (classMatch !== null) {
        const class_ = classMatch[1].trim();
        return classesNames.some((w) => class_.startsWith(w)) ? class_ : undefined;
    }
    return;
}

async function runTest(pytestCfgKey: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
    }
    const res = editor!.document.uri;
    const projectFolder = vscode.workspace.getWorkspaceFolder(res)!.uri.fsPath;
    const filepath = getRelativePath(res.path, projectFolder);

    const conf = vscode.workspace.getConfiguration();
    const pytestExec =
        conf.get(pytestCfgKey) || (await Utility.getDefaultPytestCmd(editor.document));
    if (!pytestExec) {
        vscode.window.showErrorMessage(
            'pytest command not found! Check your virtualenv in the VSCode python ' +
                'extension or add a custom pytest command in the extension settings.'
        );
        return;
    }
    const pytestConf = getPytestCfg(projectFolder);

    const selection = getTestAuthorityName(
        pytestConf,
        editor.selection,
        editor.document
    );
    if (!selection) {
        if (editor.selection.isEmpty) {
            vscode.window.showErrorMessage(
                'No valid test function of class has been found on the current line'
            );
            return;
        } else {
            const editorSelection = editor.document.getText(editor.selection);
            vscode.window.showErrorMessage(
                `No valid test selection: ${editorSelection}`
            );
            return;
        }
    }
    let command = `${pytestExec} -v ${filepath} -k ${selection}`;
    runCommand(command);
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('pytest-runner.run-test', () => {
        runTest('pytest_runner.pytest_exec');
    });
    let disposable2 = vscode.commands.registerCommand(
        'pytest-runner.run-test-docker',
        () => {
            runTest('pytest_runner.pytest_exec_docker');
        }
    );
    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable2);
}

// this method is called when your extension is deactivated
export function deactivate() {}
