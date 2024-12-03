export class Constants {
    public static readonly python = 'python';
    public static readonly pytest = 'pytest';
    public static readonly pytestExeError =
        'pytest not found! Be sure you have pytest installed in your virtualenv' +
        'or add a custom pytest command in the extension settings.';
    public static readonly testFunctions: Array<string> = ['test_'];
    public static readonly testClasses: Array<string> = ['Test'];
}
