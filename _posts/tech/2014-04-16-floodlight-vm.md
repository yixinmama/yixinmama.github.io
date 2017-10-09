---
layout: post
title: 使用Floodlight-vm（官网提供）搭建OpenFlow测试平台
description: 使用Floodlight-vm（官网提供）搭建OpenFlow测试平台
category: SDN
tags:  floodlight-vm
---

## 前言

Floodlight官网上有floodlght-vm虚拟机镜像文件下载，今天就来介绍一下如何用floodlight官网下载的虚拟机文件搭建OpenFlow测试平台
首先得对与这个floodlight-vm有个正确的认识：

1、这是一个虚拟机文件，可以在虚拟机中直接打开
2、内嵌wireshark、mininet、floodlight
3、其中floodlight是开机自启动（floodlight-vm虚拟机一开机floodlight便启动）
4、需自行安装图形界面否则无法启动wireshark
 
floodlight-vm下载链接：
http://floodlight-download.projectfloodlight.org/files/floodlight-vm-0.90.zip
下载解压之后可看到
![](/images/2014-04-16-floodlight-vm/01.png)
 
知道了以上信息之后就可以愉快的安装floodlight-vm了
Start！

##  一、安装虚拟机

首先不管是你在什么操作系统上，装个虚拟机软件先。建议windows上面装vmware，linux上面装virtualbox。
以win7上的vmware10.0为例：
![](/images/2014-04-16-floodlight-vm/02.png)

选择到.vmx文件，打开之后就会自动创建好一个“floodlightcontroller”虚拟机了。启动之！
 
在linux上的图形化界面中也是如此操作的。
 
如果你不行用图形界面直接打开的方式也可以采用命令行的方式。如图1中所示有一个.sh文件。cd到floodlight-vm目录中，然后修改.sh文件的属性：
$sudo chmod a+x floodlightcontroller-vbox.sh //添加操作权限
$sudo ./*.sh //*是通配符，你也可以老实的输入.sh文件全名
运行完这个sh文件之后，就会自动添加一个虚拟机了，前提是你已经安装了虚拟机软件。（写文档时用的不是linux系统不方便截图，见谅！）
运行虚拟机之后也是和windows下一样。
 
## 二、配置部署

首先，登录进系统。用户名为floodlight，默认无密码。
查看虚拟机IP：
$ifconfig
打开浏览器输入以下网址：
http://202.119.167.202:8080/index.html 

>(其中IP地址更成上一步骤中查看到的IP地址)

![](/images/2014-04-16-floodlight-vm/03.png)
 
当然了，又是这个画面……其实floodlight-vm在开机时就已经启动了floodlight，甚至在还没有登录进系统的时候就已经可以登录这个网站了。
 
好的，下面要开始正经的配置了：
 
1、sources.list文件
此时如果你在虚拟机的命令行输入：

	$sudo apt-get update 
	
之类需要联网进行操作的命令的话就会出现以下错误：
![](/images/2014-04-16-floodlight-vm/04.png)
 
这是因为floodlight-vm自带的sources.list文件内的网址无法链接。
所以得修改该sources.list文件:
	
	$sudo vi /etc/apt/sources.list
	
以为在虚拟机中的命令行界面是不支持复制粘贴的，要更新源文件内的内容还是比较吃力的（如果手打的话）下面推荐一个我自己常用的方法：在windows上安装xshell等终端工具，远程ssh登录到floodlightcontroller虚拟机上面。因为在xshell等工具中是支持复制粘贴等操作的（通过鼠标右键）
 
安装完xshell之后建立一个新的链接：
![](/images/2014-04-16-floodlight-vm/05.png)
 
主机（H）指的是你的虚拟机的IP地址。
确定之后会让你选择接受密钥，然后输入用户名和密码（floodlight，无密码）
然后就登录到floodlight-vm虚拟机中了。
这时在输入：

	$sudo vi /etc/apt/sources.list
	
按一下“i”键进入插入模式，右键粘贴源文件内容即可。
 
 
下面是`sources.list`文件内容：
 
教育网推荐：
sources.list文件

	deb http://ubuntu.cn99.com/ubuntu/ precise main restricted universe multiverse 
	deb http://ubuntu.cn99.com/ubuntu/ precise-updates main restricted universe multiverse 
	deb http://ubuntu.cn99.com/ubuntu/ precise-security main restricted universe multiverse 
	deb http://ubuntu.cn99.com/ubuntu/ precise-backports main restricted universe multiverse 
	deb http://ubuntu.cn99.com/ubuntu-cn/ precise main restricted universe multiverse


**电子科技大学 

	deb http://ubuntu.uestc.edu.cn/ubuntu/ precise main restricted universe multiverse 
	deb http://ubuntu.uestc.edu.cn/ubuntu/ precise-backports main restricted universe multiverse 
	deb http://ubuntu.uestc.edu.cn/ubuntu/ precise-proposed main restricted universe multiverse 
	deb http://ubuntu.uestc.edu.cn/ubuntu/ precise-security main restricted universe multiverse 
	deb http://ubuntu.uestc.edu.cn/ubuntu/ precise-updates main restricted universe multiverse 
	deb-src http://ubuntu.uestc.edu.cn/ubuntu/ precise main restricted universe multiverse 
	deb-src http://ubuntu.uestc.edu.cn/ubuntu/ precise-backports main restricted universe multiverse 
	deb-src http://ubuntu.uestc.edu.cn/ubuntu/ precise-proposed main restricted universe multiverse 
	deb-src http://ubuntu.uestc.edu.cn/ubuntu/ precise-security main restricted universe multiverse 
	deb-src http://ubuntu.uestc.edu.cn/ubuntu/ precise-updates main restricted universe multiverse

**中国科技大学 

	deb http://debian.ustc.edu.cn/ubuntu/ precise main restricted universe multiverse 
	deb http://debian.ustc.edu.cn/ubuntu/ precise-backports restricted universe multiverse 
	deb http://debian.ustc.edu.cn/ubuntu/ precise-proposed main restricted universe multiverse 
	deb http://debian.ustc.edu.cn/ubuntu/ precise-security main restricted universe multiverse 
	deb http://debian.ustc.edu.cn/ubuntu/ precise-updates main restricted universe multiverse 
	deb-src http://debian.ustc.edu.cn/ubuntu/ precise main restricted universe multiverse 
	deb-src http://debian.ustc.edu.cn/ubuntu/ precise-backports main restricted universe multiverse 
	deb-src http://debian.ustc.edu.cn/ubuntu/ precise-proposed main restricted universe multiverse 
	deb-src http://debian.ustc.edu.cn/ubuntu/ precise-security main restricted universe multiverse 
	deb-src http://debian.ustc.edu.cn/ubuntu/ precise-updates main restricted universe multiverse

**北京理工大学 

	deb http://mirror.bjtu.edu.cn/ubuntu/ precise main multiverse restricted universe 
	deb http://mirror.bjtu.edu.cn/ubuntu/ precise-backports main multiverse restricted universe 
	deb http://mirror.bjtu.edu.cn/ubuntu/ precise-proposed main multiverse restricted universe 
	deb http://mirror.bjtu.edu.cn/ubuntu/ precise-security main multiverse restricted universe 
	deb http://mirror.bjtu.edu.cn/ubuntu/ precise-updates main multiverse restricted universe 
	deb-src http://mirror.bjtu.edu.cn/ubuntu/ precise main multiverse restricted universe 
	deb-src http://mirror.bjtu.edu.cn/ubuntu/ precise-backports main multiverse restricted universe 
	deb-src http://mirror.bjtu.edu.cn/ubuntu/ precise-proposed main multiverse restricted universe 
	deb-src http://mirror.bjtu.edu.cn/ubuntu/ precise-security main multiverse restricted universe 
	deb-src http://mirror.bjtu.edu.cn/ubuntu/ precise-updates main multiverse restricted universe

**兰州大学 

	deb ftp://mirror.lzu.edu.cn/ubuntu/ precise main multiverse restricted universe 
	deb ftp://mirror.lzu.edu.cn/ubuntu/ precise-backports main multiverse restricted universe 
	deb ftp://mirror.lzu.edu.cn/ubuntu/ precise-proposed main multiverse restricted universe 
	deb ftp://mirror.lzu.edu.cn/ubuntu/ precise-security main multiverse restricted universe 
	deb ftp://mirror.lzu.edu.cn/ubuntu/ precise-updates main multiverse restricted universe 
	deb ftp://mirror.lzu.edu.cn/ubuntu-cn/ precise main multiverse restricted universe

**上海交通大学 
	
	deb http://ftp.sjtu.edu.cn/ubuntu/ precise main multiverse restricted universe 
	deb http://ftp.sjtu.edu.cn/ubuntu/ precise-backports main multiverse restricted universe 
	deb http://ftp.sjtu.edu.cn/ubuntu/ precise-proposed main multiverse restricted universe 
	deb http://ftp.sjtu.edu.cn/ubuntu/ precise-security main multiverse restricted universe 
	deb http://ftp.sjtu.edu.cn/ubuntu/ precise-updates main multiverse restricted universe 
	deb http://ftp.sjtu.edu.cn/ubuntu-cn/ precise main multiverse restricted universe 
	deb-src http://ftp.sjtu.edu.cn/ubuntu/ precise main multiverse restricted universe 
	deb-src http://ftp.sjtu.edu.cn/ubuntu/ precise-backports main multiverse restricted universe 
	deb-src http://ftp.sjtu.edu.cn/ubuntu/ precise-proposed main multiverse restricted universe 
	deb-src http://ftp.sjtu.edu.cn/ubuntu/ precise-security main multiverse restricted universe 
	deb-src http://ftp.sjtu.edu.cn/ubuntu/ precise-updates main multiverse restricted universe
		
 
非教育网推荐：
`Sources.list`文件
**台湾源

	deb http://tw.archive.ubuntu.com/ubuntu/ precise main universe restricted multiverse 
	deb-src http://tw.archive.ubuntu.com/ubuntu/ precise main universe restricted multiverse 
	deb http://tw.archive.ubuntu.com/ubuntu/ precise-security universe main multiverse restricted 
	deb-src http://tw.archive.ubuntu.com/ubuntu/ precise-security universe main multiverse restricted 
	deb http://tw.archive.ubuntu.com/ubuntu/ precise-updates universe main multiverse restricted 
	deb-src http://tw.archive.ubuntu.com/ubuntu/ precise-updates universe main multiverse restricted

**网易 Ubuntu 源（速度很快） 

	deb http://mirrors.163.com/ubuntu/ precise main universe restricted multiverse 
	deb-src http://mirrors.163.com/ubuntu/ precise main universe restricted multiverse 
	deb http://mirrors.163.com/ubuntu/ precise-security universe main multiverse restricted 
	deb-src http://mirrors.163.com/ubuntu/ precise-security universe main multiverse restricted 
	deb http://mirrors.163.com/ubuntu/ precise-updates universe main multiverse restricted 
	deb http://mirrors.163.com/ubuntu/ precise-proposed universe main multiverse restricted 
	deb-src http://mirrors.163.com/ubuntu/ precise-proposed universe main multiverse restricted 
	deb http://mirrors.163.com/ubuntu/ precise-backports universe main multiverse restricted 
	deb-src http://mirrors.163.com/ubuntu/ precise-backports universe main multiverse restricted 
	deb-src http://mirrors.163.com/ubuntu/ precise-updates universe main multiverse restricted

**骨头源，骨头源是bones7456架设的一个Ubuntu源 ，提供ubuntu,deepin 

	deb http://ubuntu.srt.cn/ubuntu/ precise main universe restricted multiverse 
	deb-src http://ubuntu.srt.cn/ubuntu/ precise main universe restricted multiverse 
	deb http://ubuntu.srt.cn/ubuntu/ precise-security universe main multiverse restricted 
	deb-src http://ubuntu.srt.cn/ubuntu/ precise-security universe main multiverse restricted 
	deb http://ubuntu.srt.cn/ubuntu/ precise-updates universe main multiverse restricted 
	deb http://ubuntu.srt.cn/ubuntu/ precise-proposed universe main multiverse restricted 
	deb-src http://ubuntu.srt.cn/ubuntu/ precise-proposed universe main multiverse restricted 
	deb http://ubuntu.srt.cn/ubuntu/ precise-backports universe main multiverse restricted 
	deb-src http://ubuntu.srt.cn/ubuntu/ precise-backports universe main multiverse restricted 
	deb-src http://ubuntu.srt.cn/ubuntu/ precise-updates universe main multiverse restricted

**mirror.lupaworld.com的源，速度很快 
	
	deb http://mirror.lupaworld.com/ubuntu/archive/ precise main restricted universe multiverse 
	deb http://mirror.lupaworld.com/ubuntu/archive/ precise-security main restricted universe multiverse 
	deb http://mirror.lupaworld.com/ubuntu/archive/ precise-updates main restricted universe multiverse 
	deb http://mirror.lupaworld.com/ubuntu/archive/ precise-backports main restricted universe multiverse 
	deb http://mirror.lupaworld.com/ubuntu/ubuntu-cn/ precise main restricted universe multiverse
 
修改完源文件（sources.list）之后就可以正常的更新和安装软件了。

	$sudo apt-get update
 
 
2、安装图形界面
这个根据个人喜好进行安装不同的图形界面，我个人安装的ubuntu的桌面，比较大安装起来也比较繁琐，而且最重要的是、、、显示效果也不尽人意……所以不建议安装这个图形界面。
安装图形界面什么的没什么好说的了，以后有时间在补上吧。
 
## 三、联合调试

全部准备妥当之后当然是进行抓包测试啦！
这里参看我的另外一篇博文：
http://sherkyoung.github.io/blog/2014/04/12/floodlight-mininet/
 
文章最后有介绍如何进行抓包
 
That’s all!