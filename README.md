# PyTest Runner for VsCode

![logo](https://github.com/user-attachments/assets/38c10cef-c8b8-4c61-9712-3eb6bc77aa89)

![ci](https://github.com/ernestoarbitrio/pytest-runner/workflows/CI/badge.svg)

The Pytest Runner Visual Studio Code extension makes running Python tests effortless using [`pytest`](https://docs.pytest.org). Whether you're using a `local environment` or a `Docker container`, this tool has you covered. It’s designed for developers who need a quick, streamlined way to execute tests directly from their codebase.

> NOTE: Pytest Runner is in its early stages 🐣. Contributions are welcome! Found an issue? Open one. Want to enhance it? Submit a PR 😃.

## Why Pytest Runner? 🌟

Modern testing environments can be complex. For instance, in my job, most tests run in a Docker-based architecture, requiring remote interpreters and long pytest identifiers like `test_mod.py::test_func`. This process was tedious and slow, so I created Pytest Runner to eliminate friction and make testing as intuitive as possible.

Inspired by tools like <https://vimawesome.com/plugin/pytest-vim>, this extension brings speed and ease to testing Python codebases, no matter the setup.

Look at the usage section for more details.

## Features 🔥

- Run single tests or test modules using `local or venv` pytest command
- Run single tests or test modules using pytest through a `docker container`
- Optional configuration inspection via `setup.cfg` or `pyproject.toml` files.

### Configuration file check

If `pytest_runner.check_config` is enabled, before the test execution, `pytest-runner` checks the configuration file of your project, for example for a `toml` file like this:

```toml
[tool.pytest.ini_options]
python_classes = ["Test", "Describe"]
python_functions = ["test_", "it_", "and_", "but_", "they_"]
python_files = ["test_*.py",]
testpaths = ["tests",]
```

or a `setup.cfg`:

```cfg
[tool:pytest]
python_classes = Test Describe
python_files = test_*.py
python_functions = test_ it_ they_ but_ and_it_
testpaths =
    tests
```

If your test function doesn't start with any of the names above, pytest-runner won't start and it shows you an
error ❌ message.

![error](https://raw.githubusercontent.com/ernestoarbitrio/pytest-runner/main/images/err.png)

## Requirements 📦

- **Pytest** is the only requirement.
- Currently tested on **macOS** and **Linux**.

## Extension Settings ⚙️

This extension offers several customizable settings:

- `pytest_runner.pytest_exec`: Specifies the local `pytest` executable. Defaults to your active virtual environment or `/usr/bin/pytest`.
- `pytest_runner.pytest_exec_docker`: Command to run pytest in a Docker container (e.g., `docker-compose run --rm test-container pytest`).
- `pytest_runner.check_config`: Enables/disables configuration checks (default: false).
- `pytest_runner.pytest_options`: Additional pytest options (e.g., -sv, -x).

These options can be set in each `settings.json` within `.vscode` in the project root directory or in the `settings.json` of `VSCode` (**not recommended**).

## Usage 📖

Available Commands:

- `Run Test`: Run a single test locally.
- `Run Test Docker`: Run a single test in Docker.
- `Run Test Module`: Run all tests in the current file locally.
- `Run Test Module Docker`: Run all tests in the current file via Docker.

You can run them using the `VSCode` command palette (`⇧⌘P` or `ctr⇧P`)

![cmd-palette](https://raw.githubusercontent.com/ernestoarbitrio/pytest-runner/main/images/cmd-palette-example.gif)

or through the 2 custom buttons on the status bar.

![cmd-palette](https://raw.githubusercontent.com/ernestoarbitrio/pytest-runner/main/images/custom-buttons.png)

### Running Tests

To **run a single test** you have 2 options:

 1. Simply place your cursor anywhere inside the target test function or class. The extension automatically detects the context and executes the corresponding test without requiring precise cursor placement on the definition line.
 2. Select the test name or portion of it and run the desired command.

 > According to the command the test will be executed in the local environment `Run Test` or in the docker container `Run Test Docker`

 ![run-test-demo](https://raw.githubusercontent.com/ernestoarbitrio/pytest-runner/main/images/run-test-demo.gif)

If you wanna run all the tests in your current python module you can just use `Run Test Module` or `Run Test Module Docker` independently of the cursor location.

>💡 **Pro Tip**: Create keyboard shortcuts for frequently used commands to boost productivity.

### Keybindings and shortcuts ⌨️

Define custom shortcuts for faster testing:

The 4 commands in the section above are actually an alias for these:

- `pytest-runner.run-test`
- `pytest-runner.run-test-docker`
- `pytest-runner.run-module-test`
- `pytest-runner.run-module-test-docker`

To increase the speed I would suggest new entries in the keybindigs in order to map the 2 commands to a keyboard key combination:

  1. Open `keybinding.json` -> command palette (`⇧⌘P` or `ctr⇧P`) `Open Keyboard Shortcut`
  2. Add your key combination:

  ```json
      {
        "key": "ctrl+alt+1",
        "command": "pytest-runner.run-test"
      },
      ...
      {
        "key": "ctrl+alt+2",
        "command": "pytest-runner.run-module-test"
      }
  ```

Now you can execute single tests with Ctrl+Alt+1 and module tests with Ctrl+Alt+2 (or your chosen keys).

## Known Issues 🧐

**Only** when `pytest_runner.pytest_exec` is set to `pytest` without specifying the complete path of the exectuable, the first time the `Run Test` will fail due to async problem between terminal `venv` activation and the send command time.

The second run should work properly.

---

### Do you like pytest-runner?

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://www.buymeacoffee.com/ernestoarb5)

---

## Release Notes 📋

## 0.0.13

- Bug fix parsing pyproject.toml, "=", [ \t] or [A-Za-z0-9_\-] but "." found

## 0.0.12

- Bug fix when no setup.cfg is present or no pytest options set in pyptoject.toml

### 0.0.11

- Change test invocation using the :: notation e.g. `test_mod.py::test_func` to the more modern `-k` option, e.g. `pytest -k test_func`. *Note: the `-k` option is used only when there's a text selection, otherwise the extension will continue to use the `::` notation for test invocation.*

### 0.0.10

- Show status bar icons (💻 and/or 🐳) only if the file is a test file.

### 0.0.9

- Error message improvement.

### 0.0.8

- Improved test detection: the extension now automatically identifies the test function or class context based on the cursor's position anywhere within the function or class body.

### 0.0.7

- Add support for pytest options in the `settings.json`.

### 0.0.6

- Bug fix on terminal auto focus.
- Autoclear terminal befor running a test.

### 0.0.5

- Custom buttons on the status bar.

### 0.0.4

- 2 new commands for running test modules `run-module-test` and `run-module-test-docker`.

### 0.0.3

- Add check toml or cfg configuration configurable and optional.

### 0.0.2

- Fix typo in error messages.

### 0.0.1

- First `pytest-runner` release.
