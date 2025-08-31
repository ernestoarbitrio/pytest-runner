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
        Term._term().show();
        // clear text in current terminal
        vscode.commands.executeCommand('workbench.action.terminal.clear');
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
        if (!config.tool || !config.tool.pytest) {
            return [Constants.testFunctions, Constants.testClasses];
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

export async function getTestAuthorityName(
    checkConfig: boolean,
    pytestCfg: string[][],
    sel: vscode.Selection,
    document: vscode.TextDocument
) {
    let [functionsNames, classesNames] = pytestCfg;
    // first authority is the seleceted text
    if (!sel!.isEmpty) {
        const selection = document.getText(sel);
        if (checkConfig === true) {
            return functionsNames.some((w) => selection.startsWith(w)) ||
                classesNames.some((w) => selection.startsWith(w))
                ? selection
                : undefined;
        } else {
            return selection;
        }
    }
    const docSymbols = (await vscode.commands.executeCommand(
        'vscode.executeDocumentSymbolProvider',
        document.uri
    )) as vscode.DocumentSymbol[];
    const findSymbolAtPosition = (
        symbols: vscode.DocumentSymbol[],
        position: vscode.Position
    ): vscode.DocumentSymbol[] => {
        for (const symbol of symbols) {
            if (symbol.range.contains(position)) {
                const childPath = findSymbolAtPosition(symbol.children, position);
                return [symbol, ...childPath];
            }
        }
        return [];
    };
    const currentSymbol = findSymbolAtPosition(docSymbols, sel.active);
    if (currentSymbol.length > 1) {
        return [currentSymbol[0].name, currentSymbol[1].name];
    } else if (currentSymbol.length === 1) {
        return [currentSymbol[0].name];
    } else {
        return undefined;
    }
}

async function runSingleTest(pytestCfgKey: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
    }
    const res = editor!.document.uri;
    const projectFolder = vscode.workspace.getWorkspaceFolder(res)!.uri.fsPath;
    const filepath = getRelativePath(res.path, projectFolder);

    const conf = vscode.workspace.getConfiguration();
    const checkConfig: boolean = conf.get('pytest_runner.check_config') || false;
    const pytestExec =
        conf.get(`pytest_runner.${pytestCfgKey}`) ||
        (await Utility.getDefaultPytestCmd(editor.document));
    if (!pytestExec) {
        vscode.window.showErrorMessage(Constants.pytestExeError);
        return;
    }
    const pytestOptions = conf.get(`pytest_runner.pytest_options`) || '';
    const pytestConf = getPytestCfg(projectFolder);

    const selection = await getTestAuthorityName(
        checkConfig,
        pytestConf,
        editor.selection,
        editor.document
    );
    if (!selection) {
        if (editor.selection.isEmpty) {
            vscode.window.showErrorMessage(
                'No valid test function or class has been found on the current line.'
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
    let command: string;
    if (Array.isArray(selection)) {
        // Join all selection items with '::' after the filepath
        const selectionPath = selection.join('::');
        command = `${pytestExec} ${pytestOptions} ${filepath}::${selectionPath}`;
    } else {
        // selection is a string: use -k option
        command = `${pytestExec} ${pytestOptions} ${filepath} -k ${selection}`;
    }
    runCommand(command);
}

async function runModuleTest(pytestCfgKey: string) {
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
        conf.get(`pytest_runner.${pytestCfgKey}`) ||
        (await Utility.getDefaultPytestCmd(editor.document));
    if (!pytestExec) {
        vscode.window.showErrorMessage(Constants.pytestExeError);
        return;
    }
    let command = `${pytestExec} ${filepath}`;
    runCommand(command);
}

let runTestItem: vscode.StatusBarItem;
let runDockerTestItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    // single test runner disposables
    let testLocalDisposable = vscode.commands.registerCommand(
        'pytest-runner.run-test',
        () => {
            runSingleTest('pytest_exec');
        }
    );
    let testDockerDisposable = vscode.commands.registerCommand(
        'pytest-runner.run-test-docker',
        () => {
            runSingleTest('pytest_exec_docker');
        }
    );
    // test module runner disposables
    let testMoudleLocalDisposable = vscode.commands.registerCommand(
        'pytest-runner.run-module-test',
        () => {
            runModuleTest('pytest_exec');
        }
    );
    let testModuleDockerDisposable = vscode.commands.registerCommand(
        'pytest-runner.run-module-test-docker',
        () => {
            runModuleTest('pytest_exec_docker');
        }
    );

    // status bar items
    runTestItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        650
    );
    runTestItem.command = 'pytest-runner.run-test';
    runTestItem.tooltip = 'Pytest Runner (local)';
    runTestItem.text = `💻  $(testing-run-icon)`;

    runDockerTestItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        649
    );
    runDockerTestItem.command = 'pytest-runner.run-test-docker';
    runDockerTestItem.tooltip = 'Pytest Runner (docker)';
    runDockerTestItem.text = `🐳  $(testing-run-icon)`;

    context.subscriptions.push(runTestItem);
    context.subscriptions.push(runDockerTestItem);

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(updateStatusBarItems)
    );
    updateStatusBarItems();

    context.subscriptions.push(testLocalDisposable);
    context.subscriptions.push(testDockerDisposable);
    context.subscriptions.push(testMoudleLocalDisposable);
    context.subscriptions.push(testModuleDockerDisposable);
}

function updateStatusBarItems(): void {
    const currentFile = vscode.window.activeTextEditor!.document.uri.path;
    const conf = vscode.workspace.getConfiguration();
    const dockerConf = conf.get('pytest_runner.pytest_exec_docker');
    if (!dockerConf) {
        runDockerTestItem.hide();
    }
    if (
        !currentFile ||
        currentFile.slice(-2) !== 'py' ||
        !currentFile.includes('/tests/')
    ) {
        runTestItem.hide();
        runDockerTestItem.hide();
    } else {
        if (dockerConf) {
            runDockerTestItem.show();
        }
        runTestItem.show();
    }
}

// this method is called when your extension is deactivated
export function deactivate() {}
