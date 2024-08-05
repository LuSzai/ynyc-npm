#!/usr/bin/env node
import { exec, execSync } from "child_process";
import "colors";
import fs from "fs";
import inquirer from "inquirer";
import * as process from "process";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

// inquirer 使用 findLastIndex，兼容低版本node环境不支持
if (!Array.prototype.findLastIndex) {
  Array.prototype.findLastIndex = function(callback, thisArg) {
    for (let i = this.length - 1; i >= 0; i--) {
      if (callback.call(thisArg, this[i], i, this)) {
        return i;
      }
    }
    return -1;
  };
}

// 获取命令行参数
const args = process.argv.slice(2);

// 示例:处理多个参数
const command = args[0];

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envFilePath = path.join(__dirname, ".env.json");

/**
 * @typedef {{name:string,addr:string}[]} EnvType
 */

/**
 * 读取环境JSON
 * @return {EnvType}
 */
function readEnvJson() {
  try {
    if (fs.existsSync(envFilePath)) {
      const data = fs.readFileSync(envFilePath, "utf8");
      return JSON.parse(data);
    } else {
      const envDefault = [];
      saveEnvJson(envDefault);
      return envDefault;
    }
  } catch (err) {
    console.error("ReadEnvJson error:".red, err);
  }
}

/**
 * 保存环境JSON
 * @param {EnvType} env
 */
function saveEnvJson(env) {
  fs.writeFileSync(envFilePath, JSON.stringify(env));
}

switch (command) {
  case "add":
    addEnv();
    break;
  case "del":
    deleteEnv();
    break;
  case "use":
    useEnv();
    break;
  case "cur":
    currentEnv();
    break;
  default:
    console.log(`Unknown command: ${command}`);
    break;
}

/**
 * 查看当前环境
 */
function currentEnv() {
  const env = readEnvJson();
  const curEnv = execSync("npm get registry", {
    encoding: "utf8",
  })
    .trim()
    .replace(/\/$/, "");
  const ce = env.find(({ addr }) => addr === curEnv);
  if (ce) {
    console.log("当前环境名称:".blue, String(ce.name).green);
    console.log("当前环境地址:".blue, String(ce.addr).green);
  } else {
    console.log("当前环境地址:".blue, curEnv.green);
  }
}

/**
 * 使用环境
 */
function useEnv() {
  const env = readEnvJson();
  if (!env.length) return console.log("无更多环境！".gray);

  const curEnv = execSync("npm get registry", {
    encoding: "utf8",
  })
    .trim()
    .replace(/\/$/, "");

  inquirer
    .prompt([
      {
        type: "list",
        name: "env",
        message: "请选择要使用的环境:".blue,
        choices: env.map(({ name, addr: value }) => ({
          name,
          value,
        })),
        default: curEnv,
      },
    ])
    .then((r) => {
      exec("npm set registry " + r.env, (r) => {
        if (!r) return console.log("切换环境成功！".green);
        console.log("执行错误:".red);
        console.log(String(r).red);
      });
    })
    .catch((e) => {
      // console.log(e);
    });
}

/**
 * 删除环境
 */
function deleteEnv() {
  const env = readEnvJson();
  if (!env.length) return console.log("无更多环境！".gray);
  inquirer
    .prompt([
      {
        type: "list",
        name: "env",
        message: "请选择要删除的环境:".red,
        choices: env.map(({ name }) => name),
      },
    ])
    .then((r) => {
      const delAfterEnv = env.filter(({ name }) => name != r.env);
      saveEnvJson(delAfterEnv);
      console.log("删除成功！".green);
    })
    .catch((e) => {
      // console.log(e);
    });
}

/**
 * 添加环境
 */
function addEnv() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "请输入环境名称:".blue,
      },
      {
        type: "input",
        name: "addr",
        message: "请输入环境地址:".blue,
      },
    ])
    .then((r) => {
      const name = r.name.trim();
      const addr = r.addr.trim().replace(/\/$/, "");
      if (!name) return console.log("请正确输入环境名称".red);
      if (!/https?:\/\/\w+/.test(addr))
        return console.log("请正确输入环境地址".red);
      const env = readEnvJson();
      if (env.some((v) => v.name === r.name))
        return console.log("已存在环境！".red);

      env.push({ name, addr });

      fs.writeFileSync(envFilePath, JSON.stringify(env));
      console.log("环境添加成功！".green);
    })
    .catch((e) => {
      // console.log(e);
    });
}
