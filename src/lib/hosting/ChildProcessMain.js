const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

const optionDefinitions = [{
    name: 'verbose',
    alias: 'v',
    type: Boolean
  },
  {
    name: 'src',
    type: String,
    multiple: true,
    defaultOption: true
  },
  {
    name: 'timeout',
    alias: 't',
    type: Number
  }
]
const options = commandLineArgs(optionDefinitions)
if (options.help) {
  const usage = commandLineUsage([{
      header: 'Typical Example',
      content: 'A simple example demonstrating typical usage.'
    },
    {
      header: 'Options',
      optionList: optionDefinitions
    },
    {
      content: 'Project home: {underline https://github.com/me/example}'
    }
  ])
  console.log(usage)
} else {
  console.log(options)
}

console.info("child processs...");
