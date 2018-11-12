#!/usr/bin/env node

const program = require('commander');
const download = require('download-git-repo');
const inquirer = require('inquirer');
const handlebars = require('handlebars');
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');

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
            download('https://github.com:WStreet/md-scaffold-tpl-example#master', name, {clone: true}, (err) => {
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
            });
          })
        } else {
          // 提示已存在同名项目，避免覆盖原有项目
          console.log(symbols.success, chalk.green('此项目已存在'));
        }
      });

program.parse(process.argv);
