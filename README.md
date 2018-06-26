## 文件依赖检索，可以检索文件夹所有文件的依赖情况, 可以使用该工具检查项目模块的依赖和被依赖情况。

## 使用

1. 安装依赖

```
npm i -g depsserch
```

2. 在项目中运行
 
```
coan ds

文件依赖检索

选项：
  --version        显示版本号                                       [布尔]
  -h, --help       显示帮助信息                                     [布尔]
  --path, -p       扫描路径                                         [字符串] [必需]
  --aliaspath, -a  alias配置文件路径                                [字符串]
  --show, -s       信息显示类型, a: 显示所有；o: 是显示没有被依赖的文件 [字符串]
  --input, -i      入口文件
```

3. 参数解释

```
-p: 要扫描的文件夹路径
-a: alias配置文件路径(webpack.config.js路径)
-s: 信息显示类型
-i: 入口文件
```

当添加入口文件参数，会分析那些文件可以删除， 否则只分析文件依赖情况

4. 示例

```
baoxiangdongdeMacBook-Pro:depsSerch baoxiangdong$ coan ds -p . -a ./webpack.dev.js -s o -i ./test/
--------------------- 开始扫描 ---------------------
DIR: /Users/baoxiangdong/Documents/github/depsSerch
DIR: /Users/baoxiangdong/Documents/github/depsSerch/bin
FILE: /Users/baoxiangdong/Documents/github/depsSerch/bin/coan.js
FILE: /Users/baoxiangdong/Documents/github/depsSerch/bin/config.js
DIR: /Users/baoxiangdong/Documents/github/depsSerch/lib
FILE: /Users/baoxiangdong/Documents/github/depsSerch/lib/ds.js
FILE: /Users/baoxiangdong/Documents/github/depsSerch/lib/parse.js
DIR: /Users/baoxiangdong/Documents/github/depsSerch/test
FILE: /Users/baoxiangdong/Documents/github/depsSerch/test/A.js
FILE: /Users/baoxiangdong/Documents/github/depsSerch/test/B.js
FILE: /Users/baoxiangdong/Documents/github/depsSerch/test/C.js
FILE: /Users/baoxiangdong/Documents/github/depsSerch/test/D.js
DIR: /Users/baoxiangdong/Documents/github/depsSerch/test/css
FILE: /Users/baoxiangdong/Documents/github/depsSerch/test/css/test.scss
DIR: /Users/baoxiangdong/Documents/github/depsSerch/test/imgs
FILE: /Users/baoxiangdong/Documents/github/depsSerch/test/imgs/demo.jpg
FILE: /Users/baoxiangdong/Documents/github/depsSerch/test/index.js
DIR: /Users/baoxiangdong/Documents/github/depsSerch/utils
FILE: /Users/baoxiangdong/Documents/github/depsSerch/utils/file.js
FILE: /Users/baoxiangdong/Documents/github/depsSerch/webpack.dev.js
--------------------- 扫描结束 ---------------------
--------------------- 依赖情况 ---------------------
没有被依赖的文件: 
  /Users/baoxiangdong/Documents/github/depsSerch/bin/coan
  /Users/baoxiangdong/Documents/github/depsSerch/test/A
  /Users/baoxiangdong/Documents/github/depsSerch/test/C
  /Users/baoxiangdong/Documents/github/depsSerch/test/css/test
  /Users/baoxiangdong/Documents/github/depsSerch/test/imgs/demo
  /Users/baoxiangdong/Documents/github/depsSerch/test/index
  /Users/baoxiangdong/Documents/github/depsSerch/webpack.dev
可删除的文件
  /Users/baoxiangdong/Documents/github/depsSerch/bin/coan
  /Users/baoxiangdong/Documents/github/depsSerch/bin/config
  /Users/baoxiangdong/Documents/github/depsSerch/lib/ds
  /Users/baoxiangdong/Documents/github/depsSerch/utils/file
  /Users/baoxiangdong/Documents/github/depsSerch/lib/parse
  /Users/baoxiangdong/Documents/github/depsSerch/webpack.dev
```

![./test/imgs/demo.jpg](./test/imgs/demo.jpg)
