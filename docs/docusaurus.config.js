/** @type {import('@docusaurus/types').DocusaurusConfig} */

const commonExludePaths = [
  '**/node_modules/**',
  '**/dist/**',
  '**/tests/**'
];

module.exports = {
  title: 'atlas',
  tagline:
    'An end-to-end solution for hosting humans and AI in a virtual space, built on top of react, three.js and express/feathers.',
  url: 'https://atlasfoundation.github.io',
  baseUrl: '/atlas-docs/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon:
    'https://github.com/atlasfoundation/atlas/raw/dev/atlas%20black.png',
  organizationName: 'AtlasFoundation', // Usually your GitHub org/user name.
  projectName: 'atlas-docs', // Usually your repo name.
  plugins: [
    // [
    //   'docusaurus-plugin-typedoc',
    //   {
    //     id: 'client',
    //     entryPoints: ['../packages/client/src/main.tsx'],
    //     entryPointStrategy: 'expand',
    //     tsconfig: '../packages/client/tsconfig.json',
    //     exclude: [
    //       ...commonExludePaths,
    //       '../packages/client/vite.config.js',
    //       '../packages/client/jest.config.js',
    //       '../packages/client/public/**',
    //       '../packages/client/lib/**',
    //       '../packages/client/scripts/**'
    //     ],
    //     out: 'generated/client',
    //     readme: 'none',
    //   },
    // ],
    // [
    //   'docusaurus-plugin-typedoc',
    //   {
    //     id: 'client-core',
    //     entryPoints: ['../packages/client-core'],
    //     entryPointStrategy: 'expand',
    //     tsconfig: '../packages/client-core/tsconfig.json',
    //     exclude: [
    //       ...commonExludePaths,
    //       '../packages/client-core/build.js',
    //       '../packages/client-core/rollup.config.js',
    //       '../packages/client-core/jest.config.js',
    //       '../packages/client-core/scripts/**',
    //     ],
    //     out: 'generated/client-core',
    //     readme: 'none',
    //   },
    // ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'server',
        entryPoints: ['../packages/server'],
        entryPointStrategy: 'expand',
        tsconfig: '../packages/server/tsconfig.json',
        exclude: [
          ...commonExludePaths,
          '../packages/server/public/**',
          '../packages/server/scripts/**',
          '../packages/server/tests old/**',
        ],
        out: 'generated/server',
        readme: 'none',
      },
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'server-core',
        entryPoints: ['../packages/server-core/src/'],
        entryPointStrategy: 'expand',
        tsconfig: '../packages/server-core/tsconfig.json',
        exclude: [ 
          ...commonExludePaths,
          '../packages/server-core/scripts/**',
          '../packages/server-core/.mocharc.js',
          '../packages/server-core/rollup.config.js',
          '../packages/server-core/vite.build.js'
        ],
        out: 'generated/server-core',
        readme: 'none',
      },
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'common',
        entryPoints: ['../packages/common'],
        entryPointStrategy: 'expand',
        tsconfig: '../packages/common/tsconfig.json',
        exclude: [
          ...commonExludePaths,
          '../packages/common/scripts/**',
          '../packages/common/rollup.config.js',
          '../packages/common/vite.build.js'
        ],
        out: 'generated/common',
        readme: 'none',
      }, 
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'engine',
        entryPoints: ['../packages/engine/src/'],
        entryPointStrategy: 'expand',
        tsconfig: '../packages/engine/tsconfig.json',
        exclude: [
          ...commonExludePaths,
          '../packages/engine/scripts/**',
          '../packages/engine/.mocharc.js',
          '../packages/engine/rollup.config.js',
          '../packages/engine/vite.build.js',
          '../packages/engine/src/physics/physx/physx.release.cjs.js',
          '../packages/engine/src/physics/physx/physx.release.esm.js',
        ],
        out: 'generated/engine',
        readme: 'none',
      },
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'gameserver',
        entryPoints: ['../packages/gameserver/src/'],
        entryPointStrategy: 'expand',
        tsconfig: '../packages/gameserver/tsconfig.json',
        exclude: [
          ...commonExludePaths,
          '../packages/gameserver/.mocharc.js',
          '../packages/gameserver/vite.build.js'
        ],
        out: 'generated/gameserver',
        readme: 'none',
      },
    ],
  ],
  themeConfig: {
    navbar: {
      title: 'Atlas',
      logo: {
        alt: 'Logo',
        src: 'https://github.com/AtlasFoundation/Atlas/raw/dev/atlas%20black.png',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/atlasfoundation',
            },
            {
              label: 'Github',
              href: 'https://github.com/AtlasFoundation/Atlas',
            }
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} AtlasFoundation.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/AtlasFoundation/Atlas/packages/docs/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
}
