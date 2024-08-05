## 简介

用于快速切换npm镜像地址



#### 一、安装全局插件

```shell
npm i ynyc-npm -g
```



#### 二、切换环境

```shell
npm-mgr use
# 默认自带环境
# taobao 淘宝镜像
# npm 官方
```



#### 三、查看环境

```shell
npm-mgr cur
# 当前环境名称: npm （如果添加过会显示）
# 当前环境地址: https://registry.npmjs.org
```



#### 四、添加环境

```shell
npm-mgr add
# 要求输入环境名称以及地址
# 请输入环境名称: npm
# 请输入环境地址: https://registry.npmjs.org
```



#### 五、删除环境

```shell
npm-mgr del
# 选择环境即可删除
```

