---
layout: post
title: 基于ubuntu12.04的Floodlight+mininet搭建OpenFlow测试平台
description: 基于ubuntu12.04的Floodlight+mininet搭建OpenFlow测试平台
category: SDN
tags:  [floodlight,mininet]
---

## 安装虚拟机

### 1、安装VmwareWorkstation

附赠可用注册码5C4A7-6Q20J-6ZD58-K2C72-0AKPE
![](/images/2014-04-12-floodlight-mininet/01.png)
 
### 2、安装虚拟机可能出现的问题：

见另外一片博文: http://sherkyoung.github.io/blog/2014/04/12/linux-ubuntu/
 
## 安装floodlight及mininet

### 1、安装floodlight

Ctrl+Alt+T打开控制台输入：

	$sudo apt-get update
	$sudo apt-get install build-essential default-jdk ant python-dev
	$git clone git://github.com/floodlight/floodlight.git
	$cd floodlight
	$ant
	$cd target
	$java -jar floodlight.jar #运行Floodlight
	
打开浏览器输入：localhost:8080/ui/index.html进入如下界面则说明安装成功：
![](/images/2014-04-12-floodlight-mininet/02.png)
 
### 2、安装mininet

新建一个终端控制台，输入：

	$sudo apt-get install mininet
	
>注：如果之前安装过openvswitch将会报错，这是只需要输入以下命令删除ovs残存文件即可：

	$sudo rm /usr/local/bin/ovs*
	
解决完错误之后再输入安装mininet的命令此时不再报错，但是使用mininet创建命令的时会在报错，提示6633端口已被占用。这是因为mininet安装完毕之后会自行启动，输入以下命令关闭服务：
	
	$sudo service openvswitch-controller stop
	
Mininet同时也是开机自启动，关闭自启动：

	$sudo update-rc.d openvswitch-controller disable
	
这是在用mininet的创建命令就没有任何问题了：

	$sudo mn --controller=remote,ip=172.168.1.2,port=6633
	
>此处的IP地址运行floodlight控制器的机器的IP地址，请根据自己的情况自行修改

![](/images/2014-04-12-floodlight-mininet/03.png)

需要注意的是使用命令行安装的mininet的版本比较老，貌似只有1.4+，而通过源码安装则可以安装到最新版本（2.2+）。
源码编译安装：

	$git clone git://github.com/mininet/mininet#下载源码
	$git checkout -b 2.2.0 2.2.0#选择2.2版本
	$./util/install.sh#编译安装
	
这里自带的脚本会帮你处理好一切的，安心好了。不过建议看一下mininet的INSTALL文件，看一下对系统有什么要求。（我比较懒，我没看>p<）。
同样需要注意命令安装的情况，关闭自启动。

## 安装wireshark

新建终端控制台，输入：
	
	$sudo apt-get install wireshark
	
这样全部的准备工作已经做完了
 
## 联机调试抓包
在进行抓包之前将之前运行的floodlight和mininet全部关闭
1、运行floodlight

	$java -jar floodlight/target/floodlight.jar
	
2、运行wireshark
	
	$sudo wireshark (一定要用root权限打开，否则无法检测网卡端口)
	
点击监测的端口，如果在同一台机器上测试，就选择lo环回端口，如果mininet链接练成控制器则监测eth0端口。
在开始对网卡端口监测之后在启动mininet，确保能抓到Hello（OFP）包
 
3、启动mininet
	
	$sudo mn --controller=remote,ip=202.119.167.224
	
这时你就能从wireshark中看到各种OFP的数据包了！
![](/images/2014-04-12-floodlight-mininet/04.png)
 
That’s all!