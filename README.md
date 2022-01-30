![logo](https://raw.githubusercontent.com/ernestoarbitrio/pytest-runner/main/images/pytest-runner-logo-small.png)

![ci](https://github.com/ernestoarbitrio/pytest-runner/workflows/CI/badge.svg?branch=main) ![vs](https://vsmarketplacebadge.apphb.com/version-short/pamaron.pytest-runner.svg) ![vs-d](https://vsmarketplacebadge.apphb.com/installs/pamaron.pytest-runner.svg) ![dow](https://vsmarketplacebadge.apphb.com/downloads/pamaron.pytest-runner.svg) ![rating](https://vsmarketplacebadge.apphb.com/rating-star/pamaron.pytest-runner.svg)

This `vscode` extension allows you to run test (*in a very quick way*) in your 🐍 `python` codebase using [`pytest`](https://docs.pytest.org).
It can be configured to run test using a `local` and a `docker` 🐳  based interpreter (see Extension Settings).

**NOTE: this is an early stage project 🐣. Please open an issue or, even better, a PR if you find it interesting and you
wanna improve `pytest-runner`.**

## Motivation
In my current job the test ecosystem lives in a complex architecture of docker containers. The 95% of tests need to be
ran through the remote python interpreter within the docker container. Moreover the articulated tree of the source code
required every time a long node_ids e.g. `test_mod.py::test_func` notation. 
Given that I decided to start my own extension in order to run the test using any pytest exectutable, local or docker based,
directly from the document your working on. I was inspired by https://vimawesome.com/plugin/pytest-vim and then I decided
to write this plugin to facilitate and speed up the test invocation on any python codebase I work on 😊.

Look at the usage section for more details.

## Features 😎

- Run tests using `local or venv` pytest command
- Run tests using pytest through a `docker container`
- Automatic inspection of pytest configurantion in `setup.cfg` or `pyproject.toml`

The test execution checks the configuration file of your project, for example for a `toml` file like this:
```toml
[tool.pytest.ini_options]
python_classes = ["Test", "Describe"]
python_functions = ["test_", "it_", "and_", "but_", "they_"]
python_files = ["test_*.py",]
testpaths = ["tests",]
```
If your test function doesn't start with any of the names above, pytest-runner won't start and it shows you an
error ❌ message.

![error](https://raw.githubusercontent.com/ernestoarbitrio/pytest-runner/main/images/err.png)

## Requirements 🕹

The only requirement is `pytest`. NOTE: this extension, so far, has been tested with `MacOsx` and `Linux`.

## Extension Settings ⚙️

This extension contributes the following settings:

* `pytest_runner.pytest_exec`: the local `pytest` command exectuable. If not set it fallbacks to your active virtual environment set within the `vscode` python extesions or, if not set, to `pytest` in `usr/bin`
* `pytest_runner.pytest_exec_docker`: the docker command to run `pytest` in your container (e.g. `docker-compose run --rm testrun-container pytest`)

These options can be set in each `settings.json` within `.vscode` in the project root directory or in the `settings.json` of `VSCode` (**not recommended**).

## Usage 📚

There are 2 commands available:
- `Run Test`
- `Run Test Docker`
You can run them using the `VSCode` command palette (`⇧⌘P` or `ctr⇧P`).
![cmd-palette](https://raw.githubusercontent.com/ernestoarbitrio/pytest-runner/main/images/cmd-palette-example.gif)

To run a test you have 2 options:
 1. Position your cursor on the line where the test `function` or a `class` is defined and run the desired command.
 2. Select the test name or portion of it and run the desired command.
 ![run-test-demo](https://raw.githubusercontent.com/ernestoarbitrio/pytest-runner/main/images/run-test-demo.gif)

 ### Keybindings and shortcuts ⌨️

 To increase the speed I would suggest a new entry in the keybindigs in order to map the 2 commands to a keyboard
 key combination:
  1. Open `keybinding.json` -> command palette (`⇧⌘P` or `ctr⇧P`) `Open Keyboard Shortcut`
  2. Add your key combination:
  ```json
      {
        "key": "ctrl+alt+1",
        "command": "pytest-runner.run-test"
      }
  ```
Now, as well as the command palette, the tests can be exectued using your custom shortcut. In the example above
the test will run with the `ctrl+alt+1` key combination.


## Known Issues 🧐

**Only** when `pytest_runner.pytest_exec` is set to `pytest` without specifying the complete path of the exectuable, the first time the `Run Test` will fail due to async problem between terminal `venv` activation and the send command time.

The second run should work properly.

---

### Do you like pytest-runner?

<a href="https://www.buymeacoffee.com/ernestoarb5" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

---

## Release Notes 📋

### 0.0.1

- First `pytest-runner` release.

### 0.0.2

- Fix typo in error messages.
