const sass = require('sass'),
	postcss = require('postcss'),
	cssnano = require('cssnano'),
	autoprefixer = require('autoprefixer'),
	_ = require('lodash'),
	path = require('path'),
	fs = require('fs'),
	argv = require('yargs').argv,
	shell = require('shelljs'),
	chalk = require('chalk');

const ROOT_FOLDER = process.cwd();
const CUSTOMERS_FOLDER = path.join('.', 'clienti');
const CUSTOMERS = require(path.join(
	ROOT_FOLDER,
	CUSTOMERS_FOLDER,
	'customers'
)).CUSTOMERS;
const BASE_PROJECT_FOLDER = path.join(ROOT_FOLDER, 'projects');
const TEMP_DESTINATION_FOLDER = '_temp';
const TEMP_DESTINATION_PATH = path.join(ROOT_FOLDER, TEMP_DESTINATION_FOLDER);
const ALL_CUSTOMERS_DEST_FOLDER = path.join(ROOT_FOLDER, 'dist_assets');

// Styles da compilare
const PROJECT_STYLE_SRC = 'app.scss';
const PROJECT_STYLE_DEST = 'app.css';
const UNWANTED_FILES = ['.gitkeep'];

// args
if (argv == null || (_.isArray(argv) && _.isEmpty(argv))) {
	shell.echo(chalk.red(`No args provided!`));
	process.exit(1);
}

const currentProject = argv.project;
const compileAllCustomers = !!argv.compileAllCustomers;
const currentCustomer = argv.customer;

if (currentProject == null || currentProject == '') {
	shell.echo(chalk.red(`Non e' stato selezionato alcun progetto!`));
	process.exit(1);
}

if (
	!compileAllCustomers &&
	(currentCustomer == null || currentCustomer == '')
) {
	shell.echo(chalk.red(`Non e' stato selezionato alcun cliente!`));
	process.exit(1);
}

if (
	currentCustomer != null &&
	currentCustomer != '' &&
	!containsCustomer(currentCustomer)
) {
	shell.echo(chalk.red(`Il cliente selezionato non e' valido!`));
	process.exit(1);
}

// Destinazione finale
const PROJECT_STYLES_FOLDER = path.join(
	BASE_PROJECT_FOLDER,
	currentProject,
	'src',
	'styles'
);

start();

function start() {
	// cancello la cartella temporanea
	shell.rm('-rf', TEMP_DESTINATION_PATH);
	// la ricreo
	shell.mkdir('-p', TEMP_DESTINATION_PATH);

	if (compileAllCustomers) {
		// cancello la cartella di destinazione degli stili
		shell.rm('-rf', PROJECT_STYLES_FOLDER);
		// la ricreo
		shell.mkdir('-p', PROJECT_STYLES_FOLDER);

		// Ciclo i clienti e per ognuno copio i files nella cartella temporanea
		// Compilo gli stili e li copio nella destinazione
		const customersKeys = _.sortBy(_.keys(CUSTOMERS), function (obj) {
			return parseInt(obj, 10);
		});

		Promise.resolve()
			.then(() => {
				console.time(`all themes`);
			})
			.then(() => {
				return Promise.all(
					_.map(customersKeys, (key) => {
						const customerCode = CUSTOMERS[key].code;
						return THEME(customerCode);
					})
				);
			})
			.then(() => {
				// cancello la cartella temporanea
				shell.rm('-rf', TEMP_DESTINATION_PATH);
				console.timeEnd(`all themes`);
				process.exit(0);
			})
			.catch((err) => {
				console.error(err);
				process.exit(1);
			});
	} else {
		// Compilazione singolo cliente

		// cancello la cartella di destinazione degli stili del singolo cliente
		shell.rm('-rf', PROJECT_STYLES_FOLDER);

		Promise.resolve()
			.then(() => {
				console.time(`customer theme`);
			})
			.then(() => {
				return THEME(currentCustomer, true);
			})
			.then(() => {
				// cancello la cartella temporanea
				shell.rm('-rf', TEMP_DESTINATION_PATH);
				console.timeEnd(`customer theme`);
				process.exit(0);
			})
			.catch((err) => {
				console.error(err);
				process.exit(1);
			});
	}
}

const THEME = async (customerCode, singleCustomer = false) => {
	shell.echo(chalk.blue(`Copying customer ${customerCode}`));

	// Cartella temporanea di destinazione del singolo cliente
	const tempClientDestinationPath = path.join(
		TEMP_DESTINATION_PATH,
		customerCode
	);
	// File sorgente
	const tempClientStyleSrc = path.join(
		tempClientDestinationPath,
		PROJECT_STYLE_SRC
	);
	// File di destinazione
	const tempClientStyleDest = path.join(
		tempClientDestinationPath,
		PROJECT_STYLE_DEST
	);

	// Creo la cartella temporanea di destinazione
	shell.mkdir('-p', tempClientDestinationPath);

	console.time(`theme --> ${tempClientStyleSrc}`);

	// Copio il cliente
	copyCustomer(
		currentProject,
		CUSTOMERS_FOLDER,
		customerCode,
		tempClientDestinationPath
	);

	// Compilo l'css
	const convert = sass.compile(tempClientStyleSrc, {
		loadPaths: [
			// Includo node_modules per i parziali di bootstrap italia
			'node_modules',
			// Includo la cartella temporanea per i parziali dell'applicativo di business
			tempClientDestinationPath
		]
	});

	// Compilo l'css
	const result = await postcss([autoprefixer])
		.use(cssnano())
		.process(convert.css, { map: false, from: null });

	// Scrivo il file di destinazione
	await fs.promises.writeFile(tempClientStyleDest, result.css);

	console.timeEnd(`theme --> ${tempClientStyleSrc}`);

	// Copio il file compilato nella cartella di destinazione del progetto
	copyCompiled(
		tempClientStyleDest,
		PROJECT_STYLES_FOLDER,
		customerCode,
		PROJECT_STYLE_DEST,
		singleCustomer,
		ALL_CUSTOMERS_DEST_FOLDER
	);
};

function copyCustomer(
	currentProject,
	customersFolder,
	customerCode,
	tempClientDestinationPath
) {
	let customerStylesFolder;

	if (customerCode !== 'default') {
		// Copio default se ho selezionato un cliente diverso da default in modo da avere i file originali
		// piu' quelli personalizzati
		customerStylesFolder = path.join(
			customersFolder,
			'default',
			currentProject,
			'styles'
		);
		shell.ls(customerStylesFolder).forEach(function (s) {
			const FOLDER_TO_COPY = path.join(customerStylesFolder, s);
			shell.cp('-R', FOLDER_TO_COPY, tempClientDestinationPath);
		});
	}
	// Copio il cliente
	customerStylesFolder = path.join(
		customersFolder,
		customerCode,
		currentProject,
		'styles'
	);
	shell.echo(
		chalk.yellow(
			`Copying content from ${customerStylesFolder} to ${tempClientDestinationPath}`
		)
	);
	shell.ls(customerStylesFolder).forEach(function (s) {
		const FOLDER_TO_COPY = path.join(customerStylesFolder, s);
		shell.cp('-R', FOLDER_TO_COPY, tempClientDestinationPath);
	});
	shell.echo(chalk.green(`Copy success!`));
}

/**
 *
 * @param {*} tempClientStyleDest Cartella sorgente dei file compilati
 * @param {*} projectsStylesFolder Cartella di destinazione dei file compilati
 * @param {*} customerCode Codice customer
 * @param {*} destFileName Nome file di destnazione
 * @param {*} singleCustomer Booleano per gestire un singolo customer
 * @param {null} [allCustomersDestination=null] Cartella di destinazione dei file compilati se compilo tutti i customers
 */
function copyCompiled(
	tempClientStyleDest,
	projectsStylesFolder,
	customerCode,
	destFileName,
	singleCustomer,
	allCustomersDestination = null
) {
	// Cartella di destinazione per il cliente selezionato
	let projectClientStyleDestFolder;
	if (singleCustomer) {
		projectClientStyleDestFolder = projectsStylesFolder;
	} else {
		projectClientStyleDestFolder = path.join(
			allCustomersDestination,
			customerCode,
			'styles'
		);
	}
	// La creo
	shell.mkdir('-p', projectClientStyleDestFolder);
	// File di destinazione
	const projectClientStyleDestFile = path.join(
		projectClientStyleDestFolder,
		destFileName
	);
	// Copio il file compilato
	shell.cp('-R', tempClientStyleDest, projectClientStyleDestFile);
}

function containsCustomer(curCustomer) {
	let found = _.find(CUSTOMERS, (one) => {
		return one.code === curCustomer;
	});
	return found != null;
}
