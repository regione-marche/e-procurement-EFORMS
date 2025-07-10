const CUSTOMERS = {
    1: {
        code: 'default',
        description: 'Installazione standard'
    },
    2: {
        code: 'deploy',
        description: 'Installazione per deploy'
    }
};

const PROJECT_ENVIRONMENTS = {
    'app-eforms-notice-editor': {
        1: {
            code: 'development',
            description: 'Development'
        },
        2: {
            code: 'production',
            description: 'Production'
        }
    }
};

const PROJECT_STYLES = {
    'app-eforms-notice-editor': [
        // {
        //     src: ['cms', 'app', 'app-eforms-notice-editor.scss'],
        //     dest: ['cms', 'app', 'app-eforms-notice-editor.css']
        // },
        // {
        //     src: ['cms', 'layouts', 'base-layout.scss'],
        //     dest: ['cms', 'layouts', 'base-layout.css']
        // }
        {
            src: ['app.scss'],
            dest: ['app.css']
        }
    ]
};

module.exports = {
    CUSTOMERS: Object.freeze(CUSTOMERS),
    PROJECT_ENVIRONMENTS: Object.freeze(PROJECT_ENVIRONMENTS),
    PROJECT_STYLES: Object.freeze(PROJECT_STYLES)
};