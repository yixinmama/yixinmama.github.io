---
layout: post
title: mininet+FlowVisor+OpenDayLight环境搭建及实验一
description: mininet+FlowVisor+OpenDayLight环境搭建及实验一
category: SDN
tags:  [OpenDayLight,FlowVisor,mininet]
---

随着软件定义网络概念的提出，NFV也得到了极大的关注，围绕SDN/NFV的课题研究也是层数不穷。本实验基于mininet+ODL+flowvisor实现网络的虚妄隔离。

## 1 mininet+FlowVisor+ODL

将mininet、FlowVisor和ODL组网进行实验

## 1.1 mininet

Mininet作为一个轻量级软定义网络研发和测试平台，其主要特性包括：

* 灵活性。可通过软件的方式简单、迅速地创建一个用户自定义的网络拓扑，缩短开发测试周期，支持系统级的还原测试，且提供Python API，简单易用；
* 可移植性。Mininet支持OpenFlow、OVS等软件定义网络部件，在Mininet上运行的代码可以轻松移植到支持OpenFlow的硬件设备上；
* 可扩展性。在一台电脑上模拟的网络规模可以轻松扩展到成百上千个节点；
* 真实性。模拟真实网络环境，运行实际的网络协议栈，实时管理和配置网络，可以运行真实的程序，在Linux上运行的程序基本上都可以在Mininet上运行，如Wireshark；
* 共享性。实现的原型系统可共享，任何人都可以在自己的笔记本上运行和开发自己的系统。

## 1.1.1安装

mininet的安装有三种方法一种是下载mininet虚拟机镜像文件安装一个虚拟机，一种是下载源代码进行编译安装，最后一种是通过命令行安装。这里选用第三种安装方式：输入如下命令进行安装：

	$sudo apt-get install mininet
 
如果之前安装过openvswitch将会报错，这是只需要输入以下命令删除ovs残存文件即可：

	$sudo rm /usr/local/bin/ovs*
	
解决完错误之后再输入安装mininet的命令便不再报错，但是使用mn创建命令的时会在报错，提示6633端口已被占用。这是因为mininet安装完毕之后会自行启动，输入以下命令关闭服务：
	
	$sudo service openvswitch-controller stop
	
Miniet同时也是开机自启动，关闭自启动：
	
	$sudo update-rc.d openvswitch-controller disable
	
这是在用mininet的创建命令就没有任何问题了：
	
	$sudo mn --controller,ip=172.168.1.2,port=6633
	
>此处的IP地址运行floodlight控制器的机器的IP地址，请根据自己的情况自行修改

## 1.1.2 mininet启动

mininet必须用root身份启动：

	$sudo mn
	
这样使用默认方式创建虚拟网络，默认情况下创建一个交换机（s1），两个主机（h1，h2）。当mininet指定或不指定远程控制器的时候，h1和h2之间都是可以ping通的，如图：
![](/images/2014-08-06-mininet-flowvisor-odl/1.png) 

## 1.1.3 Mininet连接到远程控制器：

输入如下命令启动控制器

	$sudo mn --controller=remote,ip=192.168.119.130,port=6633
	
注意此处的IP为已经启动的odl控制器所在主机的ip地址，端口号是控制器默认的web端口。
下图为mininet连接到远程控制器时，浏览器登录http:\\localhost:8080\显示的网络拓扑结构：
![](/images/2014-08-06-mininet-flowvisor-odl/2.png) 
 
## 1.1.4 Mininet命令：

(1) 设置拓扑
`--topo`:用于指定OpenFlow的网络拓扑。Mininet已经为大多数应用实现了五种类型的OpenFlow网络拓扑，分别为：tree、single、reversed、linear和minimal。默认情况下，创建的是minimal拓扑。
设置自定义拓扑
`--custom`：在上述已有拓扑的基础上，Mininet支持自定义拓扑，使用一个简单的Python API即可，例如导入自定义的mytopo：

	$sudo mn --custom ~/mininet/custom/topo-2sw-2host.py –topo mytopo --test pingall 
	
(2)设置交换机
`--switch`：可以有三类openflow交换机，分别是：kernel内核状态、user用户状态以及ovsk Open vSwith状态。当然kerner和ovsk的性能和吞吐量会高一些，通过运行命令：

	$sudo mn –switch ovsk –test iperf
	
可以进行iperf的测试结果得知。
(3)设置控制器
`--controller`：通过参数设置的控制器可以是Mininet默认的控制器、NOX或者虚拟机之外的远端控制器，如Floodlight、POX以及NOX等控制器都可以使用，指定远端控制器的方法如下：

	$sudo mn --controller=remote,ip=[controller IP],port=[controllerlistening port]
	
(4) 设置MAC地址
`--mac`：通过设置MAC地址的作用是增强设备MAC地址的易读性，即将交换机和主机的MAC地址设置为一个较小的、唯一的、易读的ID，以便在后续工作中减少对设备识别的难度。
(5)设置主机类型
`--host`：主机类型只要有两种类型，分别是默认的Host类型以及CPULimitedHost类型，其中CPULimitedHost类型用于将CPU的部分资源分配给虚拟主机使用。
(6)设置链路属性
`--link`：链路属性可以是默认Link及TCLink。将链路类型指定为tc后，可以进一步指定具体参数。具体参数如下命令显示：

	--link tc,bw=<>,delay=<>,loss=<>,max_que_size=<>
	
`bw`表示链路带宽,使用 Mb/s为单位表示；时延`delay`以字符串形式表示，如'5ms'、 '100us'、'1s'；loss表示数据丢包率的百分比，用0到100之间的一个百分数表示；max_queue_size表示最大排队长度，使用数据包的数量表示。
创建Mininet拓扑成功后，一般可用`nodes`、`dump`、`net`等基本命令查看详细信息。

<table align="center">
	<tr>
		<td>常用CLI</td><td>功能</td>
	</tr>
	<tr>
		<td>dump</td><td>打印节点信息</td>
	</tr>
	<tr>
		<td>gterm</td><td>给定节点上开启gnome‐terminal</td>
	</tr>
	<tr>
		<td>xterm</td><td>给定节点上开启xterm</td>
	</tr>
	<tr>
		<td>intfs</td><td>列出所有的网络接口</td>
	</tr>
	<tr>
		<td>iperf</td><td>两个节点之间进行简单的iperf TCP测试</td>
	</tr>
	<tr>
		<td>iperfudp</td><td>两个节点之间用指定带宽udp进行测试</td>
	</tr>
	<tr>
		<td>net</td><td>显示网络连接情况</td>
	</tr>
	<tr>
		<td>noecho</td><td>运行交互式窗口，关闭回应（echoing）</td>
	</tr>
	<tr>
		<td>pingpair</td><td>在前两个主机之间互ping测试</td>
	</tr>
	<tr>
		<td>source</td><td>从外部文件中读入命令</td>
	</tr>
		<td>dpctl</td><td>在所有交换机上用dptcl 执行相关命令，本地为tcp 127.0.0.1:6634</td>
	</tr>
		<td>link</td><td>禁用或启用两个节点之间的链路</td>
	</tr>
		<td>nodes</td><td>列出所有的节点信息</td>
	</tr>
		<td>pingall</td><td>所有host节点之间互ping</td>
	</tr>
		<td>py</td><td>执行python表达式</td>
	</tr>
		<td>sh</td><td>运行外部shell命令</td>
	</tr>
		<td>quit/exit</td><td>退出</td>
	</tr>
</table>
(6)其他注意：mininet远程连接FlowVisor之后如果需要断开连接，直接在mininet>命令行输入quit或exit即可。但有时会出现即便退出mininet但是仍然显示有ovs连接到FlowVisor，这时只需要输入以下命令删除一下mn的缓存配置信息即可：

	$sudo mn -c

## 1.2 OpenDayLight

这里的ODL（OpenDayLight）指的是ODL中的Controller这一源码包。不包含其他的如openflowjava等。

## 1.2.1 ODL安装、启动

(1)获取ODL代码

	$git clone https://git.opendaylight.org/gerrit/p/controller.git 
	
(2)编译Controller：
	
	$cd controller/opendaylight/distribution/opendaylight
	$mvn clean install
	
(3)执行controller：
	
	$cd controller/opendaylight/distribution/opendaylight/target/distributions.oepndaylight-OSGIpackage/opendaylight
	$./run.sh
	
>这样每次启动controller需要cd目录十分麻烦。可以自己写一个启动脚本来管理ODL控制器的运行：

	$cd controller
	$vim odlStart.sh

输入以下内容：

	#！/bin/bash
	./opendaylight/distribution/opendaylight/target/distribution.opendaylight-osgipackage/opendaylight/run.sh
	
文件创建完毕之后需要修改权限将其改为可执行文件：

	$sudo chmod a+x odlStart.sh
	
这样每次只要执行odlStart.sh文件即可运行ODL Controller了。
启动ODL Controller之后可以从网页登录http:\\localhost:8080进行验证：
![](/images/2014-08-06-mininet-flowvisor-odl/3.png) 

## 1.3 联机实验

FlowVisor作为透明的中间层，对于mininet来说FlowVisor就是控制器，而对于ODL控制器来说FlowVisor就是OVS。

## 1.3.1 mininet连接FlowVisor

(1)修改FlowVisor配置文件
FlowVisor的配置文件是/etc/flowvisor/config.json图中标出的两个修改后的值，一个是监听端口6666，原默认值为6633；一个是web端口8888，源默认端口是8081。这样修改是为了防止以后与控制器端口混淆。
![](/images/2014-08-06-mininet-flowvisor-odl/4.png) 
(2)启动FlowVisor
	可以采用以下命令启动FlowVisor：
	
	$cd flowvisor
	$nohup flowvisor /etc/flowvisor/config.json > /etc/null &
	
以上的命令可以让FlowVisor后台启动并且不再控制台输出任何信息
(3)启动mininet：
	输入以下命令：

	$sudo mn --controller=remote,ip=192.168.119.129,port=6666
	
![](/images/2014-08-06-mininet-flowvisor-odl/5.png)
	
>注：这里的端口是监听端口，而不是web端口（8888），web端口在FlowVisor查看信息时会经常使用到。
这时新开一个控制台输入如下命令，查看datapaths信息，可以看到mininet虚拟的交换机已经连接到FlowVisor上：

	$fvctl -p 8888 list-datapaths
	
注意这里的端口号是web端口号
![](/images/2014-08-06-mininet-flowvisor-odl/5.png) 
再输入以下命令查看6666监听端口情况：

	$netstat -an | grep 6666
	
![](/images/2014-08-06-mininet-flowvisor-odl/6.png) 
这时在返回mininet中使用ping命令，用h1 ping h2，就会发现两者已经无法ping通而且无法使用mininet的link命令建立h1与h2之间的链路：
![](/images/2014-08-06-mininet-flowvisor-odl/7.png) 

## 1.4 FlowVisor连接控制器

这里为了更提高实验的可靠性，我运行了两个控制器：floodlight和opendaylight。
(1)创建切片
使用FlowVisor创建切片，这里两个ip分别对应两个不同主机的控制器，192.168.119.130对应的是ODL控制器，192.168.5.79对应的是Floodlight控制器。
Opendaylight和floodlight默认的端口都是6633，这里并未做修改
![](/images/2014-08-06-mininet-flowvisor-odl/8.png) 
(2)查看slice信息
![](/images/2014-08-06-mininet-flowvisor-odl/9.png) 
(3)创建flowspace
![](/images/2014-08-06-mininet-flowvisor-odl/10.png) 
(3)验证连接
在opendaylight控制器所在主机打开控制台输入以下命令：

	$netstat -an | grep 6633
	
![](/images/2014-08-06-mininet-flowvisor-odl/11.png)  
在floodlight控制器所在的主机打开控制台输入以下命令：

	$netstat -an 
	
![](/images/2014-08-06-mininet-flowvisor-odl/12.png) 
(4)登录控制器页面
此时登录控制器页面查看连接设备信息只能看到交换机信息，需要在mininet中执行pingall命令，才能显示主机信息：
![](/images/2014-08-06-mininet-flowvisor-odl/13.png) 
然后分别打开控制器页面查看信息：
Opendaylight：
![](/images/2014-08-06-mininet-flowvisor-odl/14.png) 
Floodlight：
![](/images/2014-08-06-mininet-flowvisor-odl/15.png) 
![](/images/2014-08-06-mininet-flowvisor-odl/16.png) 

>问题：floodlight中无法正常显示主机信息