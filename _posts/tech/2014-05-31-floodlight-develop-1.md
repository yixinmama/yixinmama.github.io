---
layout: post
title: 【译】FloodLight官网开发者文档一
description: 【译】FloodLight官网开发者文档一
category: SDN
tags:  floodlight
---

## 架构

Floodlight不仅仅是一个支持OpenFLow协议的控制器（FloodlightCOntroller），也是一个基于Floodlight控制器的应用集。
当用户在OpenFLow网络上运行各种应用程序的时候，Floodlight控制器实现了对OpenFLow网络的监控和查询功能。图0.0显示了Floodlight不同模块之间的关系，这些应用程序构建成java模块，和Floodlight一起编译。同时这些应用程序都是基于REST API的。

## 开始

### 安装指导

#### 概述

基于Java的Floodlight可以用标准jak工具或ant编译运行，当然也可以有选择性的在Eclipse上运行。

#### 准备工作

Linux：

* Ubuntu 10.04（Natty）及以上版本（运行Ant1.8.1及以下版本）:
* 安装JDK，Ant。（可在eclipse上安装）:

	$sudo apt-get install build-essential default ant python-dev eclipse
	
Mac

* Mac系统x10.6及以上版本（低版本未测试）
* Cxode4.1或Xcode4.0.2
* JDK:只需要在终端输入命令：‘javac’便可安装
* Eclipse（非必须 ）
 
#### 下载编译

从Github下载并比编译Floodlight

	$git clone git://github.com/floodlight/floodlight.git  
	$cd floodlight  
	$ant  

运行Floodlight 
如果java运行环境已经安装成功，就可以直接运行：

	$java -jar target/floodlight.jar
	 
Floodlight就会开始运行，并在控制台打印debug信息

#### Eclipse设置

通过Eclipse运行、开发、配置Floodlight：
	
	$ant eclipse
	
上述命令将创建多个文件：Floodlight.launch,Floodlight_junit.launch,classpath和.project。通过这些设置eclipse工程

* 打开eclipse创建一个新的工程
* 文件->导入->常规->现有项目到工程中->下一步
* 点击“选择根目录”，点击“浏览”。选择之前放置Floodlight的父路径
* 点击Floodlight
* 点击“完成”

现在就产生了一个Floodlight的Eclipse工程。由于我们是使用静态模块加载系统运行Floodlight，我们必须配置eclipse来正确的运行Floodlight。
创建Floodlight目标文件:

* 点击运行->运行配置
* 右击java 应用->新建
* “Name”使用“FloodlightLaunch”
* “Project”使用“Floodlight”
* “Main”使用“net.floodlightcontroller.core.Main”
* 点击“应用”
 
#### 创建一个虚拟网络

启动了Floodlight之后，就需要链接到一个OpenFlow的网络。Mininet是最好的网络虚拟工具之一。

* 下载Floodlight-vm机自启动并内嵌Mininet工具。
* 使用Vmware或者virtualbox打开Floodlight-vm，在启动之前，点击网络选项不要从导入虚拟机后的安装目录中运行脚本启动
* 登录（用户名是：floodlight没有密码）
* 既可以在使用Floodlight-vm开机自启动的Floodlight控制器也可以通过命令指定到远程的控制器，输入：
	
	$sudo mn --controller=remote,ip=<controller ip>,port=<controller port>
 
可以通过ssh远程登陆到floodlight-vm虚拟机运行wireshark，监听eth0端口并用“of”协议过滤器过滤。

	$ssh -X floodlight@<vm-ip>
	$sudo wireshark
 
#### 下一步

阅读完getstart文档之后，可以参阅floodlight开发文档，里面有很多实例和代码。
 
### 可兼容交换机

下面列出了可以和Floodlight控制器兼容的交换机

#### 虚拟交换机

* Open vSwitch（OVS）

#### 硬件交换机

* Arista 7050
* Brocade MLXe
* Brocade CER
* Brocade CES
* Dell S4810
* Dell Z9000
* Extreme Summit x440, x460, x670
* HP 3500, 3500yl, 5400zl, 6200yl, 6600, and 8200zl (the old-style L3 hardware match platform)
* HP V2 line cards in the 5400zl and 8200zl (the newer L2 hardware match platform)
* Huawei openflow-capable router platforms
* IBM 8264
* Juniper (MX, EX)
* NEC IP8800
* NEC PF5240
* NEC PF5820
* NetGear 7328SO
* NetGear 7352SO
* Pronto (3290, 3295, 3780) - runs the shipping pica8 software
 
### 可支持的拓扑结构

Floodlight现在在支持梁中锋不同的包转发应用，这两种应用具有不同的行为，并且向下图的拓扑结构一样运行：

* 在转发方面：在网络中的任意两个终端设备之间进行端到端的数据转发

内含OpenFLow网络孤岛（OpenFlow island）：到同一OpenFlow网络孤岛中的任意一设备A发送数据包到设备B，转发模块会计算出A到B之间的最短路径。
内含非OpenFlow网络孤岛（non-OpenFlow island）的OpenFLow网络孤岛：每一个OpenFlow网络孤岛都可能有一个连接到非OpenFlow孤岛的链接。另外，如图3所示，OpenFlow和非OpenFlow网络孤岛之间不能构成环网
![](/images/2014-05-31-floodlight-develop/01.png)
图1：Floodlight接入OpenFlow网络的例网拓扑
![](/images/2014-05-31-floodlight-develop/02.png) 
图2：Floodlight未接入OpenFlow网络的例网拓扑，OpenFlow网络孤岛1有两个到非OpenFlow网络孤岛的链接
![](/images/2014-05-31-floodlight-develop/03.png)
图3：Floodlight未接入OpenFlow网络的例网拓扑，OpenFlow孤岛和非OpenFlow孤岛形成了一个环网，甚至每一个OpenFlow孤岛都有唯一一个连接到非OpenFlow孤岛的链接
 
* 当转发路径中超过指定的时间间隔（默认5秒），通过转发超时安装路径。
* 自我学习的交换机：一个简单的二层自我学习交换机：

①　在任何数量的OpenFlow网络孤岛中使用，甚至在非OpenFlow的2层网络孤岛中。
②　不能在环路网路中的网络孤岛中工作，也不能在孤岛形成的环网中工作
③　数据转发效率远高于其他方法
l 另外，Floodlight也提供一个Static Flow Entry Pusher应用和一个Circuit Pusher应用，允许用户主动安装转发路径（proactively install forwarding paths）的行为
①　Static Flow Entry Pusher允许修改交换机流表项，从而创造由用户根据交换机端口明确选择的转发路径
②　CircuitPusher是基于Static Flow Entry Pusher，Device Manager，Routing services的RestAPI，在单个OpenFlow孤岛中建立一个最短路径流
 
>术语“孤岛”和“集群”是可以互换使用的。一个OpenFlow孤岛/集群就是OpenFlow交换机连接到其中任何设备的集合。类似的，非OpenFlow的孤岛/集群就是任何连接到非OpenFlow交换机的设备。


## 发布版

### 发行说明

#### Floodlight v0.9发行说明

发布日期：2012年10月

#### 概述

Floodlighr v0.9包含了控制器新的RestAPI，新的应用，漏洞修复，新框架测试等

#### 更新

REST APIs
显示如何进行外部连接，通过BDDP发现多跳链路而不是LLDP
 
由于处理错误的API并不在发布包中，但是可以通过纯净版的Floodlight下载页面或者在github上的Floodlight-master下载获得。
· /wm/topology/external-links/json
显示在LLDP数据包中发现的直连（DIRECT）和隧道链接（TUNNEL）
· /wm/topology/links/json
给OpenStack/quantum插件的虚拟网络过滤器添加新的API，以显示所有的创建的虚拟网络名，Guid，网关和主机
· /quantum/v1.0/tenants/<tenant>/networks
应用
* Circuit Pusher，一个基于Python的REST应用接口，使用RESTAPI来设置两台IP主机的流。包括新的REST APIs
Fi
