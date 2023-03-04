import Generator from 'yeoman-generator';
import camelCase from 'camelcase';
import { injectConf } from '../../lib/conf.js';
import { setupDestinationRoot } from '../../lib/utils.js';
import { COMPONENT_STRUCTURE_TYPE_DIRECTORY } from '../../lib/const.js';

// Component generator
export default class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.desc('Generate a react component inside your project.');

    setupDestinationRoot(this);

    this.argument('name', {
      description: 'The name of the component. Will be converted to PascalCase for the file names.'
    });

    this.option('styles', {
      description: 'Generate a stylesheet (scss).',
      alias: 's',
      type: Boolean,
      default: false,
    });
  }

  async initializing () {
    await injectConf(this, {
      app: {
        componentDir: 'src/components',
        componentStructure: COMPONENT_STRUCTURE_TYPE_DIRECTORY,
      },
    });
  }

  writing () {
    const { name, styles } = this.options;
    const { author, app } = this.conf;
    const componentName = camelCase(name, { pascalCase: true });
    const context = {
      name,
      componentName,
      author,
      styles,
    };

    const useSubDir = app.componentStructure === COMPONENT_STRUCTURE_TYPE_DIRECTORY;

    const dirParts = [
      app.componentDir,
      useSubDir ? componentName : '',
    ];

    this.fs.copyTpl(this.templatePath('component.js.ejs'), this.destinationPath(...dirParts, `${componentName}.js`), context);

    if (this.options.styles) {
      this.fs.copyTpl(this.templatePath('component.scss.ejs'), this.destinationPath(...dirParts, `${componentName}.scss`), context);
    }

    if (useSubDir) {
      this.fs.copyTpl(this.templatePath('index.js.ejs'), this.destinationPath(...dirParts, 'index.js'), context);
    }
  }
}
