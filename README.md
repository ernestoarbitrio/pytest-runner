![logo](https://raw.githubusercontent.com/ernestoarbitrio/pytest-runner/main/images/pytest-runner-logo-small.png)

![ci](https://github.com/ernestoarbitrio/pytest-runner/workflows/CI/badge.svg?branch=main) ![vs](https://vsmarketplacebadge.apphb.com/version-short/pamaron.pytest-runner.svg) ![vs-d](https://vsmarketplacebadge.apphb.com/installs/pamaron.pytest-runner.svg) ![dow](https://vsmarketplacebadge.apphb.com/downloads/pamaron.pytest-runner.svg) ![rating](https://vsmarketplacebadge.apphb.com/rating-star/pamaron.pytest-runner.svg)

This `vscode` extension allows you to run test (*in a very quick way*) in your 🐍 `python` codebase using [`pytest`](https://docs.pytest.org).
It can be configured to run test using a `local` and a `docker` 🐳  based interpreter (see Extension Settings).

> NOTE: this is an early stage project 🐣. Please open an issue or, even better, a PR if you find it interesting and you
wanna improve `pytest-runner`.

## Motivation
In my current job the test ecosystem lives in a complex architecture of docker containers. The 95% of tests need to be
ran through the remote python interpreter within the docker container. Moreover the articulated tree of the source code
required every time a long node_ids e.g. `test_mod.py::test_func` notation. 
Given that I decided to start my own extension in order to run the test using any pytest exectutable, local or docker based,
directly from the document your working on. I was inspired by https://vimawesome.com/plugin/pytest-vim and then I decided
to write this plugin to facilitate and speed up the test invocation on any python codebase I work on 😊.

Look at the usage section for more details.

## Features 😎

- Run single tests or test modules using `local or venv` pytest command
- Run single tests or test modules using pytest through a `docker container`
- Optional inspection of pytest configurantion in `setup.cfg` or `pyproject.toml`

If `pytest_runner.check_config` is `true`, before the test execution, `pytest-runner` checks the configuration file of your project, for example for a `toml` file like this:
```toml
[tool.pytest.ini_options]
python_classes = ["Test", "Describe"]
python_functions = ["test_", "it_", "and_", "but_", "they_"]
python_files = ["test_*.py",]
testpaths = ["tests",]
```

or a `setup.cfg`:
```
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

## Requirements 🕹

The only requirement is `pytest`. NOTE: this extension, so far, has been tested with `MacOsx` and `Linux`.

## Extension Settings ⚙️

This extension contributes the following settings:

* `pytest_runner.pytest_exec`: the local `pytest` command exectuable. If not set it fallbacks to your active virtual environment set within the `vscode` python extesions or, if not set, to `pytest` in `usr/bin`
* `pytest_runner.pytest_exec_docker`: the docker command to run `pytest` in your container (e.g. `docker-compose run --rm testrun-container pytest`)
* `pytest_runner.check_config`: default `false`. Check pytest conf section within `pyproject.toml` or `setup.cfg` if they're present in the project root.
* `pytest_runner.pytest_options`: default ` `. Pytest options e.g. `-sv`, `-x`, that are used during the invocation. 

These options can be set in each `settings.json` within `.vscode` in the project root directory or in the `settings.json` of `VSCode` (**not recommended**).

## Usage 📚

There are 4 commands available:
- `Run Test`
- `Run Test Docker`
- `Run Test Module`
- `Run Test Module Docker`

You can run them using the `VSCode` command palette (`⇧⌘P` or `ctr⇧P`)

![cmd-palette](https://raw.githubusercontent.com/ernestoarbitrio/pytest-runner/main/images/cmd-palette-example.gif)

or through the 2 custom buttons on the status bar.

![cmd-palette](https://raw.githubusercontent.com/ernestoarbitrio/pytest-runner/main/images/custom-buttons.png)

To **run a single test** you have 2 options:
 1. Position your cursor on the line where the test `function` or a `class` is defined and run the desired command.
 2. Select the test name or portion of it and run the desired command.

 > According to the command the test will be executed in the local environment `Run Test` or in the docker container `Run Test Docker`

 ![run-test-demo](https://raw.githubusercontent.com/ernestoarbitrio/pytest-runner/main/images/run-test-demo.gif)

If you wanna run all the tests in your current python module you can just use `Run Test Module` or `Run Test Module Docker` independently of the cursor location.

>💡 This way of usage (through the command palette) could be not really productive. I would suggest to create a keyboard shortuct for every command you are going to use.

 ### Keybindings and shortcuts ⌨️

The 4 commands in the section above are actually an alias for these:

- `pytest-runner.run-test`
- `pytest-runner.run-test-docker`
- `pytest-runner.run-module-test`
- `pytest-runner.run-module-test-docker`

To increase the speed I would suggest new entries in the keybindigs in order to map the 2 commands to a keyboard
 key combination:
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
Now, as well as the command palette, the tests can be exectued using your custom shortcut. In the example above
a single test will run with the `ctrl+alt+1` key combination and the whole module can be tested using the `ctrl+alt+2`.


## Known Issues 🧐

**Only** when `pytest_runner.pytest_exec` is set to `pytest` without specifying the complete path of the exectuable, the first time the `Run Test` will fail due to async problem between terminal `venv` activation and the send command time.

The second run should work properly.

---

### Do you like pytest-runner?

<a href="https://www.buymeacoffee.com/ernestoarb5" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

---

## Release Notes 📋

### 0.0.7
- Add support for pytest options in the `settings.json`

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

