const path = require('path'),
    shell = require('shelljs'),
    chalk = require('chalk'),
    _ = require('lodash'),
    argv = require('yargs').argv,
    fs = require('fs');

const ROOT_FOLDER = '.';
const BASE_PROJECT_FOLDER = path.join(ROOT_FOLDER, 'projects');
const PROJECTS = shell.ls(BASE_PROJECT_FOLDER);
const BASE_DIST_FOLDER = path.join(ROOT_FOLDER, 'dist');
const UNWANTED_FILES = [
    '.gitkeep'
];

// args
if (argv == null || (_.isArray(argv) && _.isEmpty(argv))) {
    shell.echo(chalk.red(`No args provided!`));
    process.exit(1);
}

const currentProject = argv.project;
const PROJECT_DIST_FOLDER = path.join(BASE_DIST_FOLDER, currentProject);
const PROJECT_DIST_ASSETS_FOLDER = path.join(PROJECT_DIST_FOLDER, 'assets');
const PROJECT_FOLDER = path.join(BASE_PROJECT_FOLDER, currentProject);

if (currentProject != null) {
    if (!containsProject(currentProject)) {
        shell.echo(chalk.red(`E' stato selezionato un progetto sconosciuto!`));
        process.exit(1);
    }
    compileAssets(currentProject);
} else {
    shell.echo(chalk.red(`Nessun progetto selezionato!`));
    process.exit(1);
}

function compileAssets(curPrj) {
    manageDistFolder(curPrj);

    // leggo angular.json
    const projectContent = readAngularJson(curPrj);

    // manage assets
    shell.echo(chalk.yellow(`Copia assets in corso`));
    const assets = _.get(projectContent, 'architect.build.options.assets');
    _.each(assets, (one) => {
        const srcPath = path.join(ROOT_FOLDER, one);
        shell.cp('-rf', srcPath, PROJECT_DIST_FOLDER);
    });
    shell.echo(chalk.green(`Copia assets avvenuta con successo`));

    // manage styles
    // const styles = _.get(projectContent, 'architect.build.options.styles');
    // _.each(styles, (one) => {
    //     if (_.isObject(one) && one.inject === false) {
    //         // compilo il singolo foglio di stile e lo copio nella dist
    //         const srcPath = path.join(ROOT_FOLDER, one.input);
    //         const destPath = path.join(PROJECT_DIST_FOLDER, one.bundleName) + '.css';
    //         compileSass(curPrj,
    //             {
    //                 src: srcPath,
    //                 dest: destPath,
    //                 style: 'compressed'
    //             }
    //         );
    //     }
    // });

    // rimozione file non desiderati (es. .gitkeep)
    shell.ls('-RA', PROJECT_DIST_ASSETS_FOLDER).forEach((one) => {
        if (UNWANTED_FILES.indexOf(one) != -1) {
            shell.rm(path.join(PROJECT_DIST_ASSETS_FOLDER, one));
        }
    });
}

function containsProject(curPrj) {
    let found = false;
    const elem = PROJECTS.find((one) => {
        return one === curPrj;
    });
    found = (elem != null);
    return found;
}

function manageDistFolder(curPrj) {

    // controllo se esiste la cartella dist
    let elem = shell.ls(ROOT_FOLDER).find((one) => {
        return one === 'dist';
    });

    // se non esiste la creo
    if (elem == null) {
        shell.mkdir(BASE_DIST_FOLDER);
    }

    // controllo se esiste la cartella dist/<project>
    elem = shell.ls(BASE_DIST_FOLDER).find((one) => {
        return one === curPrj;
    });

    // se non esiste la creo
    if (elem == null) {
        shell.mkdir(PROJECT_DIST_FOLDER);
    }

    // controllo se esiste la cartella dist/<project>/assets
    elem = shell.ls(PROJECT_DIST_FOLDER).find((one) => {
        return one === 'assets';
    });

    // se esiste la cancello
    if (elem != null) {
        shell.rm('-rf', PROJECT_DIST_ASSETS_FOLDER);
    }

    // e la ricreo nuova
    shell.mkdir(PROJECT_DIST_ASSETS_FOLDER);
}

function readAngularJson(curPrj) {
    const filePath = path.join(ROOT_FOLDER, 'angular.json');
    const file = fs.readFileSync(filePath);
    if (file == null) {
        shell.echo(chalk.red(`angular.json non trovato!`));
        process.exit(1);
    }
    const fileContent = JSON.parse(file);
    const projectContent = _.get(fileContent.projects, curPrj);
    return projectContent;
}

// function compileSass(curPrj, options = {}) {
//     // setta le impostazioni di default
//     options = Object.assign({
//         style: 'expanded',
//         precision: 8
//     }, options);

//     shell.echo(chalk.yellow('Compilazione di ' + options.src));

//     // compila e renderizza il risultato
//     var result = sass.renderSync({
//         file: options.src,
//         outputStyle: options.style,
//         precision: options.precision
//     });

//     // scrive il risultato nel file
//     mkdirp(path.dirname(options.dest)).then(function (made) {
//         // scrivo un file temporaneo
//         const tempFile = `${options.dest}.temp`;
//         fs.writeFileSync(tempFile, result.css);

//         // lo leggo e lo processo con precss, postcss e autoprefixer
//         fs.readFile(tempFile, (err, css) => {
//             postcss([
//                 precss,
//                 autoprefixer({
//                     overrideBrowserslist: getBrowserList(curPrj)
//                 })]
//             )
//                 .process(css, { from: tempFile, to: options.dest })
//                 .then(result => {
//                     fs.writeFileSync(options.dest, result.css, () => true)
//                     // elimino il file temporaneo
//                     shell.rm(tempFile);
//                     // mostra un messaggio di success
//                     shell.echo(chalk.green(options.dest + ' compilato.'));
//                     if (result.map) {
//                         fs.writeFileSync(`${options.dest}.map`, result.map)
//                     }
//                 });
//         });
//     }).catch((err) => {
//         shell.echo(chalk.red('Si sono verificati errori durante la compilazione del foglio di stile', options.src));
//     });
// };

// function getBrowserList() {

//     let supports = [];
//     // verifico se e' presente il file del browserlist
//     const file = fs.readFileSync(path.join(PROJECT_FOLDER, 'browserslist'));
//     if (file == null) {
//         // se non e' presente ritorno una cosa standard
//         return [
//             '> 0.5%',
//             'last 2 versions',
//             'Firefox ESR',
//             'not dead',
//             'IE 9-11'
//         ];
//     }
//     // altrimenti lo leggo
//     const lines = file.toString().split(/\r?\n/);

//     // filtro tutte le linee di commento "#", le linee vuote e aggiungo le rimanenti alle regole dei browser supportati di autoprefixer
//     _.each(lines, (line) => {
//         if (line != null && !line.startsWith('#') && line.trim() != '') {
//             supports.push(line);
//         }
//     });

//     return supports;
// }