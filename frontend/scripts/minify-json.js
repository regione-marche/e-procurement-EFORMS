const shell = require('shelljs'),
    chalk = require('chalk'),
    path = require('path'),
    _ = require('lodash'),
    fs = require('fs'),
    argv = require('yargs').argv;

const DIST_FOLDER = path.join('.', 'dist');
const DIST_FOLDER_FUNC = shell.ls(DIST_FOLDER);

// args
if (argv == null || (_.isArray(argv) && _.isEmpty(argv))) {
    shell.echo(chalk.red(`No args provided!`));
    process.exit(1);
}
const currentProject = argv.project;

if (currentProject == null || currentProject == '') {
    shell.echo(chalk.red(`Non e' stato selezionato alcun progetto!`));
    process.exit(1);
} else if (!containsProject(currentProject)) {
    shell.echo(chalk.red(`E' stato selezionato un progetto sconosciuto!`));
    process.exit(1);
}

// ciclo tutte le cartelle compilate
shell.ls(DIST_FOLDER).forEach(function (project) {
    if (project === currentProject) {
        let CMS_FOLDER = path.join(DIST_FOLDER, project, 'assets', 'cms');
        shell.echo(chalk.blue(`Scanning project --> ${project}`));
        // ciclo tutte le cartelle dentro assets/cms
        shell.ls(CMS_FOLDER).forEach(function (cmsDir) {
            if (cmsDir === 'app' || cmsDir === 'layouts' || cmsDir === 'pages') {
                // ciclo i file
                let FINAL_DIR = path.join(CMS_FOLDER, cmsDir);
                shell.ls(FINAL_DIR).forEach(function (file) {
                    // se il file finisce per .json allora lo leggo e lo minifizzo
                    if (file.endsWith('.json')) {
                        let pathFile = path.join(FINAL_DIR, file);
                        shell.echo(chalk.yellow(`Compressing file --> ${file}`));
                        let data = fs.readFileSync(pathFile, { encoding: 'utf8' });
                        let jsonObject = JSON.parse(data);
                        let minifiedJson = JSON.stringify(jsonObject, null, 0);
                        fs.writeFileSync(pathFile, minifiedJson, { encoding: 'utf8' });
                        shell.echo(chalk.green(`Compression success!`));
                    }
                });
            }
        });
    }
});

function containsProject(curPrj) {
    let found = false;
    const elem = DIST_FOLDER_FUNC.find((one) => {
        return one === curPrj;
    });
    found = (elem != null);
    return found;
}