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
  --version        显示版本号                                             [布尔]
  -h, --help       显示帮助信息                                           [布尔]
  --path, -p       扫描路径                                      [字符串] [必需]
  --aliaspath, -a  alias配置文件路径                                    [字符串]
  --show, -s       信息显示类型, a: 显示所有；o: 是显示没有被依赖的文件 [字符串]
```

3. 参数解释

```
-p: 要扫描的文件夹路径
-a: alias配置文件路径(webpack.config.js路径)
-s: 信息显示类型
```

4. 示例

```
coan ds -p . -a ./webpack.config.js -s 
```

