---
layout: post
title: 虚拟机安装Ubuntu教程
description: 虚拟机安装Ubuntu教程
category: linux
tags:  ubuntu
---

## 一、下载wmware10.0软件

vmware下载地址http://pan.baidu.com/s/1eQIcJqM

## 二、安装vmware

Windows安装软件一如既往的下一步到死，有几点最好注意一下：

1、选择自定义安装而不是典型安装
2、选择安装路径
![](/images/2014-04-12-linux-ubuntu/01.png)

3、选择安装虚拟机的配置文件（这里指的不是wmware而是ubuntu之类安装在vmware上的虚拟机）
 ![](/images/2014-04-12-linux-ubuntu/02.png)
 
4、输入注册码完成安装
可用注册码5C4A7-6Q20J-6ZD58-K2C72-0AKPE
![](/images/2014-04-12-linux-ubuntu/03.png)
 
## 三、下载Ubuntu 镜像文件

我这边给的是Ubuntu12.04LTS桌面版的镜像文件下载地址： http://pan.baidu.com/s/1kTJU2f9
 
## 四、安装Ubuntu

1、点击创建新的虚拟机
2、自定义安装
3、选择ISO文件，点击浏览选到你放Ubuntu的镜像文件的地方
![](/images/2014-04-12-linux-ubuntu/04.png)

4、输入用户名、密码，修改主机名

>强烈建议全部设成短一点的，不然你会后悔的
 
## 五、开始安装Ubuntu

下面重点讲一下在安装时可能报的错误

1、以前安装过vmware，但是版本太老需要更新：
千万千万不要将原来的安装文件目录一删了之，这不是正确的卸载。如果你这么做了的话，恭喜你重装系统吧。或者找到所有之前安装时写入的注册表，将之一一删除。所以千万要用卸载软件或者点击自带的卸载程序！

2、虚拟技术支持错误：
这个错误比较常见，出现在刚开始安装的时候：
 ![](/images/2014-04-12-linux-ubuntu/05.png)
 
这个错误本身没什么大不了，就是需要重启系统比较麻烦。重启系统，在开机的时候按F12（也有可能是DEL或者F2键，一般开机时在左下角会有提醒按那个键进入BIOS或者SET UP）进入BIOS系统。一般在BIOS的Advance选项中，有一个inter vt-x选项，选择Enable就行。然后按F10回车就行。重启之后打开虚拟机继续安装ubuntu就行。

3、无法打开虚拟机
这个错误在安装之前和安装完毕之后都有可能发生，解决办法很简答，关闭vmware并以管理员身份运行vmware就行。
当然，也有可能是你建虚拟机的时候给分配的内存超过了系统本身的内存，当然一般不会有这种情况的发生就是了。
 
基本上除了这些就不怎么会有其他的错误了，安装也就基本完成了!
 
That’s all!