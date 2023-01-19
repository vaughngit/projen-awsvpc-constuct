const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'VaughnTech',
  authorAddress: 'alvin.vaughn@outlook.com',
  license: 'Apache-2.0',
  cdkVersion: '2.60.0',
  defaultReleaseBranch: 'main',
  name: 'projen-awsvpc-constuct',
  description: 'Deploys VPC with tags and small EC2 NATGateways to reduce and track cost of development environments', /* The description is just a string that helps people understand the purpose of the package. */
  repositoryUrl: 'https://github.com/vaughngit/projen-awsvpc-constuct.git',
  // deps: [],    /* Runtime dependencies of this module. */
  devDeps: [
    'esbuild',
  ], /* Build dependencies for this module. */
  bundledDeps: [
    '@aws-sdk/client-ec2',
    'aws-sdk',
    '@aws-sdk/client-iam',
    // 'moment',
  ],
  //majorVersion: 1,
  autoApproveUpgrades: true,
  // dependabot: true,
  autoApproveOptions: {
    allowedUsernames: ['github-bot', 'vaughngit', 'github-actions'],
  },
  docgen: true,
  //NPMJS Package
  releaseToNpm: false,
  packageName: 'vt-vpc-construct', /* The "name" in package.json. */
  // publishToNuget: {
  //   dotNetNamespace: 'VaughnTech.CDK',
  //   packageId: 'VaughnTech.CDK.secures3bucket',
  // },
  // publishToPypi: {
  //   distName: 'vaughntech.cdk-secure-bucket',
  //   module: 'vaughntech_cdk_secure_bucket',
  // },
  gitpod: true,
});

project.gitignore.addPatterns('cdk.out');
project.npmignore.addPatterns('cdk.out', 'examples', 'gitpod_scripts', 'misc', 'test');


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
project.compileTask.exec('esbuild assets/customResourceLambda/index.ts --bundle --platform=node --target=node16 --external:aws-sdk --external:@aws-sdk/client-ec2 --external:@aws-sdk/client-iam --outfile=lib/assets/customResourceLambda/index.js');

project.synth();