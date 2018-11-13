#!/usr/bin/env node

const program = require('commander'); // 解析命令和参数，处理用户输入的命令
const download = require('download-git-repo');// 下载git仓库(下载模板)
const inquirer = require('inquirer'); // 命令行交互工具
const handlebars = require('handlebars'); // 模板引擎，将用户提交的信息动态填充到文件中。
const fs = require('fs');
const ora = require('ora'); // 可以用于显示下载中的动画效果
const chalk = require('chalk'); // 可以给终端的字体加上颜色。
const symbols = require('log-symbols'); // 以在终端上显示出 √ 或 × 等的图标

program.version('1.0.0', '-v, --version')  // 将 -v 和 –version 添加到命令中，可以通过这些选项打印出版本号。
      .command('init <name>')
      .action((name) => {
        if (!fs.existsSync(name)) { // 以同步的方法检测目录是否存在
          inquirer.prompt([
            {
              name: 'description',
              message: '请输入项目描述'
            },
            {
              name: 'author',
              message: '请输入作者名称'
            }
          ]).then((answers) => {
            const spinner = ora('正在下载模板...');
                  spinner.start();
            download('https://github.com:WStreet/md-scaffold-tpl-example#master', name, {clone: true}, (err) => { // {clone: true} 代表使用git clone下载
              if (err) {
                spinner.fail();
                console.log(symbols.error, chalk.red(err));
              }
              spinner.succeed();
              const meta = {
                name,
                description: answers.description,
                author: answers.author
              };
              const fileName = `${name}/package.json`; // 模板文件
              if (fs.existsSync(fileName)) {
                const content = fs.readFileSync(fileName).toString(); // 模板内容
                const result = handlebars.compile(content)(meta); // 编译模板，并匹配表达式
                fs.writeFileSync(fileName, result);
              }
              console.log(symbols.success, chalk.green('项目初始化完成'));
              console.log(`cd ${name}\n\nnpm install\n\nnpm start`)
            });
          })
        } else {
          // 提示已存在同名项目，避免覆盖原有项目
          console.log(symbols.success, chalk.green('此项目已存在'));
        }
      });

program.parse(process.argv);
