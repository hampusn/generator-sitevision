import Generator from 'yeoman-generator';
import decamelize from 'decamelize';
import camelCase from 'camelcase';
import { injectConf } from '../../lib/conf.js';
import { setupDestinationRoot } from '../../lib/utils.js';

// Script module generator
export default class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.desc('Generate files for a script module in your project. A velocity template and a script file will be created with an optional stylesheet and a client script.');

    setupDestinationRoot(this);

    this.argument('name', {
      description: 'The name of the script module. Will be lower-cased and hyphenated for the file names.'
    });

    this.option('styles', {
      description: 'Generate a stylesheet (css).',
      alias: 's',
      type: Boolean,
      default: false,
    });

    this.option('js', {
      description: 'Generate a client script (js).',
      alias: 'j',
      type: Boolean,
      default: false,
    });

    this.option('vars', {
      description: 'A comma separated list of scriptVariables to store in settings constant.',
      alias: 'v',
      type: String,
      default: 'meta',
    });
  }

  async initializing () {
    await injectConf(this, {
      sm: {
        cssPrefix: '',
        dir: '',
      },
    });
  }

  writing () {
    const { name, vars } = this.options;
    const { author, sm } = this.conf;
    const camelName = camelCase(name);
    const hyphendName = decamelize(camelName, { separator: '-' });
    const context = {
      name,
      camelName,
      hyphendName,
      cssClass: `${sm.cssPrefix}${hyphendName}`,
      author,
    };

    const dirParts = [
      sm.dir,
      hyphendName,
    ];

    this.fs.copyTpl(this.templatePath('server.js.ejs'), this.destinationPath(...dirParts, `${hyphendName}.js`), {
      ...context,
      vars: vars !== 'false' ? vars.split(',').map(v => camelCase(v || '')).filter(v => !!v) : false,
    });

    this.fs.copyTpl(this.templatePath('template.vm.ejs'), this.destinationPath(...dirParts, `${hyphendName}.vm`), context);

    if (this.options.styles) {
      this.fs.copyTpl(this.templatePath('styles.css.ejs'), this.destinationPath(...dirParts, `${hyphendName}.css`), context);
    }

    if (this.options.js) {
      this.fs.copyTpl(this.templatePath('client.js.ejs'), this.destinationPath(...dirParts, `${hyphendName}-client.js`), context);
    }
  }
}
