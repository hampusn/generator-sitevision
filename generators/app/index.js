import Generator from 'yeoman-generator';
import { injectConf } from '../../lib/conf.js';
import { COMPONENT_STRUCTURE_TYPE_DIRECTORY, COMPONENT_STRUCTURE_TYPE_FLAT, PROJECT_TYPE_OTHER, PROJECT_TYPE_RESTAPP, PROJECT_TYPE_WEBAPP, PROJECT_TYPE_WEBSITE } from '../../lib/const.js';
import { fileContents, removeEmpty, parseJson } from '../../lib/utils.js';
import table from '@klny/text-table';

export default class extends Generator {
  constructor (args, opts) {
    super(args, opts);

    this.desc([
      'Available generators:',
      '* script - Generates files for a Sitevision script module.',
      '* comp   - Generates a React component for a Sitevision webapp.',
    ].join('\n'));

    this.config.save();
  }

  async initializing () {
    await injectConf(this);

    this.tsConfigExists = this.fs.exists(this.destinationPath('tsconfig.json'));
    const manifestContents = await fileContents(this.destinationPath('manifest.json'));
    if (manifestContents) {
      this.defaultType = parseJson(manifestContents).type;
    }
  }

  async prompting () {
    const stored = this.config.getAll();
    this.answers = await this.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Select the kind of project you are working on',
        choices: [
          { name: 'WebApp', value: PROJECT_TYPE_WEBAPP },
          { name: 'RESTApp', value: PROJECT_TYPE_RESTAPP },
          { name: 'Website (Sitevision files archive)', value: PROJECT_TYPE_WEBSITE },
          { name: 'Other', value: PROJECT_TYPE_OTHER },
        ],
        default: typeof stored.type === 'string' ? stored.type : (this.defaultType || PROJECT_TYPE_WEBSITE),
      },
      {
        type: 'confirm',
        name: 'useDefaultAuthor',
        message: 'Use default author (resolved from .yo-sitevision.json)?',
      },
      {
        type: 'input',
        name: 'author.name',
        message: 'Author name',
        when: ({ useDefaultAuthor }) => !useDefaultAuthor,
      },
      {
        type: 'input',
        name: 'author.email',
        message: 'Author email',
        when: ({ useDefaultAuthor }) => !useDefaultAuthor,
      },

      // Website specific questions
      {
        type: 'input',
        name: 'sm.cssPrefix',
        message: 'Prefix for css classes (e.g. "sv-")',
        when: ({ type }) => type === PROJECT_TYPE_WEBSITE,
        filter: (v) => String(v).trim(),
        default: stored.sm?.cssPrefix,
      },
      {
        type: 'input',
        name: 'sm.dir',
        message: 'Directory to place script modules in relative to project root (e.g. "files/modules")',
        when: ({ type }) => type === PROJECT_TYPE_WEBSITE,
        filter: (v) => String(v).trim(),
        default: stored.sm?.dir,
      },

      // WebApp specific questions
      {
        type: 'input',
        name: 'app.componentDir',
        message: 'Directory to place components in relative to app root (e.g. "src/components")',
        when: ({ type }) => type === PROJECT_TYPE_WEBAPP,
        filter: (v) => String(v).trim(),
        default: stored.app?.componentDir,
      },
      {
        type: 'list',
        name: 'app.componentStructure',
        message: 'Do you want a separate directory for each component or all components together?',
        choices: [
          { name: 'Directory (components/Component/Component.{js,css})', value: COMPONENT_STRUCTURE_TYPE_DIRECTORY },
          { name: 'Flat (components/Component.{js,css})', value: COMPONENT_STRUCTURE_TYPE_FLAT },
        ],
        when: ({ type }) => type === PROJECT_TYPE_WEBAPP,
        filter: (v) => String(v).trim(),
        default: stored.app?.componentStructure,
      },

      // App specific questions
      {
        type: 'confirm',
        name: 'app.useTs',
        message: 'Do you use TypeScript?',
        when: ({ type }) => type === PROJECT_TYPE_WEBAPP || type === PROJECT_TYPE_RESTAPP,
        default: typeof stored.app?.useTs === 'boolean' ? stored.app?.useTs : this.tsConfigExists,
      },
    ]);
  }

  configuring () {
    const answers = removeEmpty(this.answers);

    if (answers.useDefaultAuthor) {
      this.config.delete('author');
    }
    delete answers.useDefaultAuthor;

    // Delete empty groups
    const groups = [ 'sm', 'app' ];
    for (const g of groups) {
      if (!answers[g]) {
        this.config.delete(g);
      }
    }

    // Store config in .yo-rc.json
    this.config.set(answers);
  }

  end () {
    const configPath = this.destinationPath('.yo-rc.json');
    const configExists = this.fs.exists(configPath);

    this.log.ok('Sitevision project setup complete');

    if (configExists) {
      this.log.ok('Configuration stored');
    } else {
      this.log.error('Failed to store configuration')
    }

    const config = [...Object.entries(this.config.getAll())].map(([ key, value ]) => ({ key, value }));

    this.log(table(configPath, config));
  }
};
