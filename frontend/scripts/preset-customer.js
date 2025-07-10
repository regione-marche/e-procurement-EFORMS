const path = require('path');

const CUSTOMERS_FOLDER = path.join('.', 'clienti');

const shell = require('shelljs'),
    chalk = require('chalk'),
    _ = require('lodash'),
    readline = require('readline'),
    CUSTOMERS = require(path.join('..', CUSTOMERS_FOLDER, 'customers')).CUSTOMERS,
    PROJECT_ENVIRONMENTS = require(path.join('..', CUSTOMERS_FOLDER, 'customers')).PROJECT_ENVIRONMENTS,
    SDK_MODULES = require(path.join('..', CUSTOMERS_FOLDER, 'customers')).SDK_MODULES,
    argv = require('yargs').argv,
    fs = require('fs');

const BASE_PROJECT_ASSETS_FOLDER = path.join('.', 'projects');
const PROJECTS = shell.ls(BASE_PROJECT_ASSETS_FOLDER);
const DELETE_FOLDERS = ['assets', 'styles', 'favicon.ico'];
const EXCLUDED_FOLDERS = ['environments'];
const ENV_BASE_FILE_NAME = 'env.js';

// args
if (argv == null || (_.isArray(argv) && _.isEmpty(argv))) {
    shell.echo(chalk.red(`No args provided!`));
    process.exit(1);
}

const argsProject = argv.project;
const defaultCustomer = 'default';
const argsCustomer = argv.customer;
const argsProjectType = argv.projectType;
const environmentType = argv.environmentType;

if (argsProject == null || argsProject == '') {
    shell.echo(chalk.red(`Non e' stato selezionato alcun progetto!`));
    process.exit(1);
} else if (!containsProject(argsProject)) {
    shell.echo(chalk.red(`E' stato selezionato un progetto sconosciuto!`));
    process.exit(1);
}

// apro il readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// scelgo il customer
start();

function start() {

    let currentProject = argsProject;
    let currentCustomer;
    let currentEnvironmentType;

    if (argsCustomer != null) {
        if (!containsCustomer(argsCustomer)) {
            shell.echo(chalk.red(`E' stato selezionato un cliente sconosciuto!`));
            closeReadline();
            process.exit(1);
        }
        currentCustomer = argsCustomer;
    }

    if (environmentType != null) {
        if (!containsEnvironmentType(currentProject, environmentType)) {
            shell.echo(chalk.red(`E' stato selezionato un ambiente non compatibile con il progetto scelto!`));
            closeReadline();
            process.exit(1);
        }
        currentEnvironmentType = environmentType;
    }

    // chain di domande
    Promise.resolve()
        .then(() => {
            return currentCustomer == null ? promptCustomerQuestion() : Promise.resolve({ currentCustomer, asked: false });
        })
        .then(({ answer, asked }) => {
            if (asked) {
                if (!answer) {
                    shell.echo(chalk.red(`Nessun cliente selezionato!`));
                    closeReadline();
                    process.exit(-1);
                }
                if (!_.has(CUSTOMERS, answer)) {
                    shell.echo(chalk.red(`E' stato selezionato un cliente sconosciuto!`));
                    closeReadline();
                    process.exit(-1);
                }
                currentCustomer = _.get(CUSTOMERS, answer).code;
            }
            return Promise.resolve();
        })
        .then(() => {
            return currentEnvironmentType == null ? promptEnvironmentTypeQuestion(currentProject) : Promise.resolve({ currentEnvironmentType, asked: false });
        })
        .then(({ answer, asked }) => {
            if (asked) {
                if (!answer) {
                    shell.echo(chalk.red(`Nessun ambiente selezionato!`));
                    closeReadline();
                    process.exit(-1);
                }
                if (!_.has(PROJECT_ENVIRONMENTS[currentProject], answer)) {
                    shell.echo(chalk.red(`E' stato selezionato un ambiente sconosciuto!`));
                    closeReadline();
                    process.exit(-1);
                }
                currentEnvironmentType = _.get(PROJECT_ENVIRONMENTS[currentProject], answer).code;
            }
            return Promise.resolve();
        })
        .then(() => {
            // eseguo la copia del customer
            copyCustomer(currentProject, defaultCustomer, currentCustomer, currentEnvironmentType);
            closeReadline();
        })
        .catch((error) => {
            console.error(error);
            process.exit(-1);
        });
}

function promptCustomerQuestion() {
    const question =
        `\nSeleziona il cliente da utilizzare?
${formatChoices(CUSTOMERS)}`;

    return new Promise((resolve, reject) => {
        rl.question(question, (answer) => {
            resolve({ answer, asked: true });
        });
    });
}

function promptEnvironmentTypeQuestion(currentProject) {
    const question =
        `\nSeleziona l'ambiente da utilizzare?
${formatChoices(PROJECT_ENVIRONMENTS[currentProject])}`;

    return new Promise((resolve, reject) => {
        rl.question(question, (answer) => {
            resolve({ answer, asked: true });
        });
    });
}

function copyCustomer(currentProject, defaultCustomer, currentCustomer, currentEnvironmentType) {

    // delete folders
    shell.ls(BASE_PROJECT_ASSETS_FOLDER).forEach(function (project) {
        if (project === currentProject) {
            const DELETE_PROJECT_FOLDER = path.join(BASE_PROJECT_ASSETS_FOLDER, currentProject, 'src', '/');
            shell.echo(chalk.red(`Deleting assets folders in ${DELETE_PROJECT_FOLDER}`));
            _.each(DELETE_FOLDERS, (folder) => {
                shell.rm('-Rf', path.join(DELETE_PROJECT_FOLDER, folder));
            });
        }
    });

    // copy sdk
    if (SDK_MODULES != null && SDK_MODULES.length > 0) {
        SDK_MODULES.forEach((oneModule) => {
            shell.echo(chalk.blue(`COPYING --> ${oneModule}`));
            // cartella assets presente nel modulo sdk
            const ASSETS_FOLDER = path.join(BASE_PROJECT_ASSETS_FOLDER, oneModule, 'src', 'lib', oneModule, 'assets', 'cms');

            // cartella assets di destinazione
            const PROJECT_ASSETS_FOLDER = path.join(BASE_PROJECT_ASSETS_FOLDER, currentProject, 'src', 'assets', 'cms');

            // creo la cartella di destinazione se non e' presente
            if (!fs.existsSync(PROJECT_ASSETS_FOLDER)) {
                fs.mkdirSync(PROJECT_ASSETS_FOLDER, { recursive: true });
            }

            if (shell.test('-e', ASSETS_FOLDER)) {
                shell.ls(ASSETS_FOLDER).forEach((singleAssetFolder) => {
                    const FOLDER_TO_COPY = path.join(ASSETS_FOLDER, singleAssetFolder);
                    shell.echo(chalk.yellow(`Copying content from ${FOLDER_TO_COPY} to ${PROJECT_ASSETS_FOLDER}`));
                    shell.cp('-R', FOLDER_TO_COPY, PROJECT_ASSETS_FOLDER);
                    shell.echo(chalk.green(`Copy success!`));
                });
            }
        });
    }

    // copy default
    shell.echo(chalk.blue(`COPYING --> ${defaultCustomer}`));
    shell.ls(CUSTOMERS_FOLDER).forEach(function (customer) {
        if (customer === defaultCustomer) {
            const PROJECTS_FOLDER = path.join(CUSTOMERS_FOLDER, customer);
            shell.ls(PROJECTS_FOLDER).forEach(function (project) {
                if (project === currentProject) {
                    const ASSETS_FOLDER = path.join(PROJECTS_FOLDER, project, '/');
                    const PROJECT_ASSETS_FOLDER = path.join(BASE_PROJECT_ASSETS_FOLDER, project, 'src', '/');

                    shell.ls(ASSETS_FOLDER).forEach(function (singleAssetFolder) {
                        if (EXCLUDED_FOLDERS.indexOf(singleAssetFolder) == -1) {
                            const FOLDER_TO_COPY = path.join(ASSETS_FOLDER, singleAssetFolder);
                            shell.echo(chalk.yellow(`Copying content from ${FOLDER_TO_COPY} to ${PROJECT_ASSETS_FOLDER}`));
                            shell.cp('-R', FOLDER_TO_COPY, PROJECT_ASSETS_FOLDER);
                            shell.echo(chalk.green(`Copy success!`));
                        }
                    });
                }
            });
        }
    });

    // copy customer
    if (currentCustomer != null && currentCustomer != defaultCustomer) {
        shell.echo(chalk.blue(`COPYING --> ${currentCustomer}`));
        // ciclo i customer
        shell.ls(CUSTOMERS_FOLDER).forEach(function (customer) {
            if (customer === currentCustomer) {
                const PROJECTS_FOLDER = path.join(CUSTOMERS_FOLDER, customer);
                // ciclo i progetti
                shell.ls(PROJECTS_FOLDER).forEach(function (project) {
                    if (project === currentProject) {
                        const ASSETS_FOLDER = path.join(PROJECTS_FOLDER, project, '/');
                        const PROJECT_ASSETS_FOLDER = path.join(BASE_PROJECT_ASSETS_FOLDER, project, 'src', '/');

                        shell.ls(ASSETS_FOLDER).forEach(function (singleAssetFolder) {
                            if (EXCLUDED_FOLDERS.indexOf(singleAssetFolder) == -1) {
                                const FOLDER_TO_COPY = path.join(ASSETS_FOLDER, singleAssetFolder);
                                shell.echo(chalk.yellow(`Copying content from ${FOLDER_TO_COPY} to ${PROJECT_ASSETS_FOLDER}`));
                                shell.cp('-R', FOLDER_TO_COPY, PROJECT_ASSETS_FOLDER);
                                shell.echo(chalk.green(`Copy success!`));
                            }
                        });
                    }
                });
            }
        });
    }

    elaborateI18n(currentProject, defaultCustomer, currentCustomer);

    elaborateEnvironment(currentProject, defaultCustomer, currentCustomer, currentEnvironmentType);
}

function elaborateI18n(currentProject, defaultCustomer, currentCustomer) {

    // aggiorno i file di lingua
    const DEFAULT_LANG_FOLDER = path.join(CUSTOMERS_FOLDER, defaultCustomer, currentProject, 'assets', 'i18n');
    const CUSTOMER_LANG_FOLDER = path.join(CUSTOMERS_FOLDER, currentCustomer, currentProject, 'assets', 'i18n');
    let PROJECT_TYPE_LANG_FOLDER;

    let langs = {};

    // check sdk
    if (SDK_MODULES != null && SDK_MODULES.length > 0) {
        SDK_MODULES.forEach((oneModule) => {
            shell.echo(chalk.blue(`COPYING --> ${oneModule}`));
            // cartella i18n presente nel modulo sdk
            const SDK_LANG_FOLDER = path.join(BASE_PROJECT_ASSETS_FOLDER, oneModule, 'src', 'lib', oneModule, 'assets', 'i18n');
            if (shell.test('-e', SDK_LANG_FOLDER)) {
                shell.ls(SDK_LANG_FOLDER).forEach((sdkLang) => {
                    const SDK_LANG_FILE = path.join(SDK_LANG_FOLDER, sdkLang);
                    shell.echo(chalk.yellow(`Found sdk ${SDK_LANG_FILE}`));
                    let sdkLangFile = JSON.parse(fs.readFileSync(SDK_LANG_FILE));
                    let newSdkLang = sdkLang.replace('-example', '').trim();
                    langs = addLang(langs, newSdkLang, sdkLangFile);
                });
            }
        });
    }

    // check default
    if (shell.test('-e', DEFAULT_LANG_FOLDER)) {
        shell.echo(chalk.blue(`Elaborate default language`));
        shell.ls(DEFAULT_LANG_FOLDER).forEach(function (defaultLang) {
            const DEFAULT_LANG_FILE = path.join(DEFAULT_LANG_FOLDER, defaultLang);
            shell.echo(chalk.yellow(`Found default ${DEFAULT_LANG_FILE}`));
            let defaultLangFile = JSON.parse(fs.readFileSync(DEFAULT_LANG_FILE));
            langs = addLang(langs, defaultLang, defaultLangFile);
        });
    }

    // check customer
    if (currentCustomer != defaultCustomer) {
        if (shell.test('-e', CUSTOMER_LANG_FOLDER)) {
            shell.echo(chalk.blue(`Elaborate customer language`));
            shell.ls(CUSTOMER_LANG_FOLDER).forEach(function (customerLang) {
                const CUSTOMER_LANG_FILE = path.join(CUSTOMER_LANG_FOLDER, customerLang);
                shell.echo(chalk.yellow(`Found customer ${CUSTOMER_LANG_FILE}`));
                let customerLangFile = JSON.parse(fs.readFileSync(CUSTOMER_LANG_FILE));
                langs = addLang(langs, customerLang, customerLangFile);
            });
        }
    }

    shell.echo(chalk.blue(`Elaborate merged languages`));

    _.each(langs, (value, lang) => {
        let PROJECT_LANG_FILE = path.join(BASE_PROJECT_ASSETS_FOLDER, currentProject, 'src', 'assets', 'i18n', lang);
        shell.echo(chalk.yellow(`Writing merged asset ${lang} from to ${PROJECT_LANG_FILE}`));
        fs.writeFileSync(PROJECT_LANG_FILE, JSON.stringify(value, null, 4), { flag: 'w' });
    });

    shell.echo(chalk.green(`Write success!`));
}

function elaborateEnvironment(currentProject, defaultCustomer, currentCustomer, currentEnvironmentType) {

    shell.echo(chalk.blue(`Elaborating environment!`));

    // aggiorno i file di environment
    let CUSTOMER_ENV_FOLDER = path.join(CUSTOMERS_FOLDER, defaultCustomer, currentProject, 'environments');
    if (currentCustomer !== defaultCustomer) {
        CUSTOMER_ENV_FOLDER = path.join(CUSTOMERS_FOLDER, currentCustomer, currentProject, 'environments');
    }

    if (CUSTOMER_ENV_FOLDER != null && shell.test('-e', CUSTOMER_ENV_FOLDER) === true) {
        shell.echo(chalk.yellow(`Found environment folder: ${CUSTOMER_ENV_FOLDER}`));
        shell.ls(CUSTOMER_ENV_FOLDER).forEach(function (fileEnv) {
            const fileEnvWithoutExtension = path.parse(fileEnv).name.replace('env.', '');
            if (fileEnvWithoutExtension == currentEnvironmentType) {
                shell.echo(chalk.yellow(`Found environment file: ${fileEnv}`));
                const SOURCE_ENV_FILE_PATH = path.join(CUSTOMER_ENV_FOLDER, fileEnv);
                let readFileEnv = fs.readFileSync(SOURCE_ENV_FILE_PATH);
                const DESTINATION_ENV_FILE = path.join(BASE_PROJECT_ASSETS_FOLDER, currentProject, 'src', 'assets', ENV_BASE_FILE_NAME);
                fs.writeFileSync(DESTINATION_ENV_FILE, readFileEnv, { flag: 'w' });
                shell.echo(chalk.green(`Write success!`));
            }
        });
    }

}

function formatChoices(originalChoices) {
    let choices = '';
    _.each(_.sortBy(_.keys(originalChoices), (key) => parseInt(key, 10)), (key) => {
        let choice = _.get(originalChoices, key);
        choices += `${key}) ${choice.description}\n`;
    });
    return choices;
}

function containsCustomer(curCus) {
    let found = false;
    _.each(CUSTOMERS, (value, key) => {
        if (value != null) {
            found = (value.code === curCus);
            if (found === true) {
                return false;
            }
        }
    });
    return found;
}

function containsProject(curPrj) {
    let found = false;
    const elem = PROJECTS.find((one) => {
        return one === curPrj;
    });
    found = (elem != null);
    return found;
}

function containsEnvironmentType(currentProject, environmentType) {
    let found = false;
    _.each(PROJECT_ENVIRONMENTS, (envMap, key) => {
        if (key == currentProject && envMap != null) {
            _.each(envMap, (singleEnv, progressivo) => {
                found = singleEnv != null && singleEnv.code == environmentType;
                if (found == true) {
                    return false;
                }
            });
            if (found == true) {
                return false;
            }
        }
    })
    return found;
}

function closeReadline() {
    try {
        rl.close()
    } catch (er) {

    }
}

function addLang(langs, langToAdd, langToAddContent) {
    let existingLangFile = langs[langToAdd];
    if (existingLangFile != null) {
        // merge
        let mergedLang = _.merge(existingLangFile, langToAddContent);
        langs[langToAdd] = mergedLang;
    } else {
        langs[langToAdd] = langToAddContent;
    }
    return langs;
}