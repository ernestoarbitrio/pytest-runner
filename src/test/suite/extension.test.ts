import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import * as Ext from '../../extension';

const fixturesLocation = '/../../../src/test/fixtures/';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('run command', async () => {
        Ext.runCommand('echo "ciao"');
    });

    test('get pytest default config', () => {
        const config = Ext.getPytestCfg('');

        assert.deepStrictEqual(config, [['test_'], ['Test']]);
    });

    test('get pytest config from both empty cfg files', () => {
        const cfgFiles = fixturesLocation + 'cfg/both-empty';
        const path_ = path.join(__dirname + cfgFiles);

        const config = Ext.getPytestCfg(path_);

        assert.deepStrictEqual(config, [['test_'], ['Test']]);
    });

    test('get pytest config from setup cfg file', () => {
        const cfgFiles = fixturesLocation + 'cfg/empty-pyproject';
        const path_ = path.join(__dirname + cfgFiles);

        const config = Ext.getPytestCfg(path_);

        assert.deepStrictEqual(config, [
            ['test_', 'it_', 'they_', 'but_', 'and_it_'],
            ['Test', 'Describe'],
        ]);
    });

    test('get pytest config from pyproject toml file', () => {
        const cfgFiles = fixturesLocation + 'cfg/empty-setup';
        const path_ = path.join(__dirname + cfgFiles);

        const config = Ext.getPytestCfg(path_);

        assert.deepStrictEqual(config, [
            ['test_', 'it_', 'and_', 'but_', 'they_'],
            ['Test', 'Describe'],
        ]);
    });

    test('get pytest config from pyproject toml file even if setup is not empty', () => {
        const cfgFiles = fixturesLocation + 'cfg/no-empty';
        const path_ = path.join(__dirname + cfgFiles);

        const config = Ext.getPytestCfg(path_);

        assert.deepStrictEqual(config, [
            ['test_', 'it_', 'and_', 'but_', 'they_'],
            ['Test', 'Describe'],
        ]);
    });

    test('relative path', () => {
        const rootPath = '/a/b/c/file.py';
        const wsFolder = '/a/b';

        const relativePath = Ext.getRelativePath(rootPath, wsFolder);

        assert.strictEqual(relativePath, 'c/file.py');
    });

    test('relative path does not replace anything', () => {
        const rootPath = '/v/b/test.py';
        const wsFolder = '/a/b';

        const relativePath = Ext.getRelativePath(rootPath, wsFolder);

        assert.strictEqual(relativePath, 'v/b/test.py');
    });

    [
        {
            checkCfg: true,
            cfg: [['test_'], ['Test']],
            line: 0,
            expected: 'TestExample',
        },
        {
            checkCfg: true,
            cfg: [['test_'], ['Describe']],
            line: 7,
            expected: 'DescribeExample',
        },
        {
            checkCfg: false,
            cfg: [['test_'], ['Test']],
            line: 7,
            expected: 'DescribeExample',
        },
        { checkCfg: true, cfg: [['test_'], ['Test']], line: 7, expected: undefined },
    ].forEach((data) => {
        test('authority name is the class name on the active line', async () => {
            const uri = vscode.Uri.file(
                path.join(__dirname + fixturesLocation + 'test_example.py')
            );
            const document = await vscode.workspace.openTextDocument(uri);
            const selection = new vscode.Selection(data.line, 0, data.line, 0);

            const authName = Ext.getTestAuthorityName(
                data.checkCfg,
                data.cfg,
                selection,
                document
            );

            assert.strictEqual(authName, data.expected);
        });
    });

    [
        { checkCfg: true, cfg: [['test_'], ['Test']], line: 1, expected: 'test_me' },
        {
            checkCfg: true,
            cfg: [['test_', 'it_'], ['Describe']],
            line: 8,
            expected: 'it_has_some',
        },
        {
            checkCfg: false,
            cfg: [['test_'], ['Describe']],
            line: 8,
            expected: 'it_has_some',
        },
        {
            checkCfg: true,
            cfg: [['test_', 'but_'], ['Describe']],
            line: 4,
            expected: 'but_me',
        },
        { checkCfg: true, cfg: [['test_'], ['Test']], line: 7, expected: undefined },
        { checkCfg: true, cfg: [['test_'], ['Test']], line: 2, expected: undefined },
        { checkCfg: true, cfg: [['it_'], ['Test']], line: 1, expected: undefined },
    ].forEach((data) => {
        test('authority name is the function name on the active line', async () => {
            const uri = vscode.Uri.file(
                path.join(__dirname + fixturesLocation + 'test_example.py')
            );
            const document = await vscode.workspace.openTextDocument(uri);
            const selection = new vscode.Selection(data.line, 0, data.line, 0);

            const authName = Ext.getTestAuthorityName(
                data.checkCfg,
                data.cfg,
                selection,
                document
            );

            assert.strictEqual(authName, data.expected);
        });
    });

    [
        {
            checkCfg: true,
            cfg: [['test_'], ['Test']],
            selection: { line: 1, anchorChar: 8, activeChar: 15 },
            expected: 'test_me',
        },
        {
            checkCfg: true,
            cfg: [['test_'], ['Test']],
            selection: { line: 0, anchorChar: 6, activeChar: 17 },
            expected: 'TestExample',
        },
        {
            checkCfg: true,
            cfg: [['test_'], ['Test']],
            selection: { line: 0, anchorChar: 6, activeChar: 14 },
            expected: 'TestExam',
        },
        {
            checkCfg: true,
            cfg: [['test_'], ['Describe']],
            selection: { line: 0, anchorChar: 6, activeChar: 17 },
            expected: undefined,
        },
        {
            checkCfg: true,
            cfg: [['test_'], ['Test']],
            selection: { line: 2, anchorChar: 6, activeChar: 14 },
            expected: undefined,
        },
    ].forEach((data) => {
        test('authority name is the text selection', async () => {
            const uri = vscode.Uri.file(
                path.join(__dirname + fixturesLocation + 'test_example.py')
            );
            const document = await vscode.workspace.openTextDocument(uri);
            const selection = new vscode.Selection(
                data.selection.line,
                data.selection.anchorChar,
                data.selection.line,
                data.selection.activeChar
            );

            const authName = Ext.getTestAuthorityName(
                data.checkCfg,
                data.cfg,
                selection,
                document
            );

            assert.strictEqual(authName, data.expected);
        });
    });
});
