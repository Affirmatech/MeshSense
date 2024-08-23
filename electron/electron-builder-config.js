var pjson = require('./package.json')
let channel = pjson.version.match(/-(?<channel>\w*).*/)?.groups?.channel
let channelString = channel ? `-${channel}` : ''

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: 'com.affirmatech.meshsense',
  productName: 'MeshSense',
  // generateUpdatesFilesForAllChannels: true,
  directories: {
    buildResources: 'build'
  },
  files: [
    '!**/.vscode/*',
    '!src/*',
    '!electron.vite.config.{js,ts,mjs,cjs}',
    '!{.eslintignore,.eslintrc.js,.prettierignore,.prettierrc.yaml,dev-app-update.yml,CHANGELOG.md,README.md}',
    '!{.env,.env.*,.npmrc,pnpm-lock.yaml}',
    '!{tsconfig.json,tsconfig.node.json,tsconfig.web.json}'
  ],
  asarUnpack: ['resources/**'],
  win: {
    artifactName: '${name}' + channelString + '-${arch}.${ext}',
    executableName: 'MeshSense',
    signingHashAlgorithms: ['sha256'],
    publisherName: ['Affirmatech Inc.', 'Affirmatech Incorporated'],
    signAndEditExecutable: true,
    verifyUpdateCodeSignature: true,
    certificateSubjectName: 'Affirmatech Incorporated'
  },
  nsis: {
    artifactName: '${name}' + channelString + '-${arch}.${ext}',
    shortcutName: '${productName}',
    uninstallDisplayName: '${productName}',
    createDesktopShortcut: true
  },
  mac: {
    artifactName: '${name}' + channelString + '-${arch}.${ext}',
    notarize: {
      teamId: `${process.env.APPLE_TEAM_ID}`
    },
    entitlementsInherit: 'build/entitlements.mac.plist',
    extendInfo: [
      {
        NSDocumentsFolderUsageDescription: "Application requests access to the user's Documents folder."
      }
    ]
  },
  dmg: {
    artifactName: '${name}' + channelString + '-${arch}.${ext}'
  },
  linux: {
    target: ['AppImage'],
    maintainer: 'electronjs.org',
    category: 'Utility'
  },
  appImage: {
    artifactName: '${name}' + channelString + '-${arch}.${ext}'
  },
  npmRebuild: false,
  publish: {
    provider: 'generic',
    url: 'https://affirmatech.com/download/meshsense'
  }
}
module.exports = config
