const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'awsalvin',
  authorAddress: 'awsalvin@amazon.com',
  cdkVersion: '2.60.0',
  defaultReleaseBranch: 'main',
  name: 'projen-awsvpc-constuct',
  repositoryUrl: 'https://github.com/vaughngit/projen-awsvpc-constuct.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */

  docgen: true,
  //NPMJS Package
  releaseToNpm: false,
  packageName: 'vt-vpc-construct',

  gitpod: true,
});

project.gitignore.addPatterns('cdk.out');
project.npmignore.addPatterns('cdk.out', 'examples', 'gitpod_scripts');


project.gitpod.addCustomTask({
  init: 'yarn install && yarn run build',
  command: 'yarn run watch',
});


project.gitpod.addCustomTask({
  name: 'ConfigAlias',
  command: 'echo \'alias pj="npx projen"\' >> ~/.bashrc && echo \'alias cdk="npx cdk"\' >> ~/.bashrc',
});

project.gitpod.addCustomTask({
  name: 'Initialize & Configure AWS',
  command: 'bash $GITPOD_REPO_ROOT/gitpod_scripts/gitpod_configure_aws.sh',
});

project.gitpod.addCustomTask({
  name: 'Install DOTNET 6.0',
  command: 'bash $GITPOD_REPO_ROOT/gitpod_scripts/gitpod_configure_dotnet.sh',
});

project.gitpod.addVscodeExtensions(
  'ms-azuretools.vscode-docker',
  'AmazonWebServices.aws-toolkit-vscode',
);

project.compileTask.exec('npm install --prefix assets/lambda-layers/aws-sdk-3-layer/nodejs ');

project.synth();