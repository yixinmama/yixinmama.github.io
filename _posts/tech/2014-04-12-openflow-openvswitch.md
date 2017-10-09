---
layout: post
title: 【译】OpenvSwitch + OpenFlow:Let’s get start(翻译自国外某大牛)
description: 【译】OpenvSwitch + OpenFlow:Let’s get start(翻译自国外某大牛)
category: SDN
tags:  ovs
---

在Fedora完成OpenvSwitch+OpenFLow部署所需要的用户空间工具、必备的内核模块都应经包含在Fedora的发布版中了。我在弄清楚这些包的时候花了很多时间，现在，这里有介绍了如何使用这些组件的信息。
>注：下文中简称OpenvSwitch为OVS

## 1、简介：

自从2.4版本以来，OVS对于内核中网桥模块来说是可选择的。OVS比标准的网桥模块有非常大的改进。这些改进都会在OpenvSwitch.org这个网站中进行了详细的阐述。然而在这些增强的功能中，有一项便是：支持OpenFlow协议。
 
从概念上来讲，交换机功能可以分成两个部分：控制层和数据层。而控制层是交换机处理发现、路由、通路计算，与其他交换机通信等功能的核心。控制层创建一个转发流表，数据层根据这些流表以线路速度处理进入交换机的数据包。OpenFlow协议可以将将交换机的控制层分离到控制器中，并且用软件定义整个网络的行为（也被称为SDN）。
 
与这种（OpenFlow）设置相区别，现有的交换机使用专有的下层工具/协议来进行管理。OpenFlow成为一种可以开放的标准，它可以不为下层绑定专有的工具而统一的标准管理来自不同供应商的交换机。

## 2、安装：

在Fedora中，OVS的实现分为两个部分：OVS内核模块(数据层data pane)和用户空间工具(控制层control plane)。由于输入的数据包要尽快处理，OVS的数据层被推送到内核空间。
为了使用OVS进行网络的虚拟化时，OVS服务必须启动，并且命令行工具必须已经正确的配置，OVS是架在网桥上的。在Fedora中，虚拟交换机工作在两种模式下：独立主机和OpenFlow模式。
这篇文章首先会重点介绍如何在独立主机和OpenFlow两种模式下建立可以连接到OVS网桥的虚拟机。
在这之前，先安装一下OVS和tunctl包：
	
	#yum install openvswitch 
	
## 3、桥接：

### 3.1、独立主机模式

如题，在这种模式下虚拟交换机处理所有自身的交换/转发功能。为虚拟交换机搭建网桥：
	
	#service openvswitch start
	
使用标准tunctl命令行工具创建一个虚拟网卡设备：
	
	#tunctl -t tap0 -u root
	
使用如下的命令停止网络管路服务，关闭em0接口，清空em1接口(em1接口是虚拟机使用的接入物理网络的网卡)上所有的IP地址。
	
	#service NetworkManager stop
	#ip add flush em1
	#ifconfig down em1
	
运行如下命令创建一个虚拟交换机网桥，并命名为”ovs-switch”：
	
	#ovs-vsctl add-br ovs-switch ##(创建一个”ovs-switch”网桥)
	#ovs-vsctl add-port ovs-switch tap0 ##(为网桥添加虚拟网卡设备接口)
	#ovs-vsctk add-port ovs-switch em1 ##(为网桥添加em1接口)
	#ifconfig tap0 promisc up ##(在混杂模式下启动接口)
	#ifconfig em1 promisc up
	
这些命令创建了一个新的网桥并添加了一个虚拟网卡设备并为网桥添加了一个本地网络端口(em1)，在混杂模式下设置这些端口会建立虚拟机到物理网络之间的数据转发通路，反之亦然。设置OVS交换机DHCP接口的IP地址：
	
	#dhclient ovs-switch
	
现在，你可以使用如下命令启动你虚拟机：
	#/usr/bin/qemu-kvm -smp 2,cores=2 -net tap,ifname=tap0,script=no -net nic,model=rt18139,macaddr=52:54:00:45:67:30 -m 2048M ~/mutiqueue/fedora.img

虚拟管理台还不支持OVS，所以目前还没有用来启动虚拟机的OVS虚拟控制台。

### 3.2、OpenFlow模式

在OpenFlow模式下运行OVS，上文的很多命令还会被用到。所以将上面的命令全部拷贝到下面：
	
	#yum install openvswitch
	#service openvswitch start
	#ovs-vsctl add-br of-switch
	#ovs-vsctl add-port of-switch tap0
	#ovs-vsctl add-port of-switch em1
	#ifconfig tap0 promisc up
	#ifconfig em1 promisc up
	
>注：在OpenFlow模式下网桥设置指向这边的虚拟交换机
(原文：NOTE:the bridge setup in OpenFlow mode will be referred to as of-switch here on）

## 4、POX Controller

在此之前，OpenFlow控制器必须已经正确运行，在网桥启动时转发任何数据都必须和控制器通信。无论是硬件还是软件，控制器的选择都相当的多。本文中采用的是POX控制器（Software）。下载POX的源代码：https://github.com/noxrepo/pox。你也可以通过命令获得：
	
	#git clone https://github.com/noxrepo/pox
	
下载之后控制器就能这样运行：
	
	#./pox.py forward.12_learning
	
上面的命令让POX监听所有的网络接口。如果POX已经监听了某个特定的接口或端口，你可以这样启动POX：
	
	#./pox.py OpenFlow.of_01 --address=192.168.2.197 --port=6666 forwarding.12_learning
 
OVS不支持混杂OpenFlow模式，混杂OpenFlow模式就是一部分数据通过OVS内置的交换逻辑处理，另一部分由OpenFlow控制器处理。(The openvswitch has a failure mode of operation though)。如果交换机与控制器断开连接，OVS可以回转并使用自身内置的逻辑进行转发。这种回转机制能通过以下命令实现：
	
	#ovs-vsctl set-fail-mode ovs-switch standlone
	
上述的命令可以使得网桥在某些时间断开连接后回到独立主机模式
	
	#ovs-vsxtl set-fail-mode ovs-switch secure
	
在设置回转模式为安全状态后，如果连接OF控制器失败，交换机不会转发任何数据包。

### 4.1、远程控制器

考虑到OF控制器可能运行在远程的主机上，并且虚拟交换机的网桥以安全模式运行的情况。如果在OF交换机上执行dpclient命令，交换机是不知道怎样通过DHCP通路转发数据的，因为它没有远程控制器的IP地址。所以，你既需要将设置OF交换机的接口设置为回转模式到独立主机模式或者分配一个静态的IP并且设置静态的路由那么，网桥将能够接入远程控制器。一旦网桥年建立了到远程控制器的连接，这些通路信息将会被OF控制器中的网桥（基于插件安装）转发。
 
既然网桥和OF控制器已经正在运行，那么可以通过以下命令将控制器信息分配到网桥。
	
	#ovs-vsctl set-controller of-switch tcp:0.0.0.0:6633
	
>注：输入以上全部命令之后，网桥通过本的主机的6633端口，连接到一个OF控制器上。

5、相关命令
既然网桥和控制器已经配置完毕，你现在可以启动虚拟机（如上面的qemu命令所示）了，并且得到控制器指定的通路。无论何时，当一个新的数据包进来，但网桥中被没有相应的处理方法的信息，网桥将会发送该数据包的包头（包含了2层、3层甚至一些4层的信息）到控制器。控制器回发OF命令作为响应，告诉网桥该如何转发类似的数据包。这些因此而被分配到网桥的流可以通过一下命令罗列出来：
	
	#ovs-ofctl dump-flows of-switch
	
下面是一个类似的控制器响应的例子。一个流表项最初包含一组域=值表项和行动表项(原文：A flow entry primarily contains a set of filed=value entries and action entry)。域=值(value)表项的被用来认证进入的数据包，操作表项则告诉网桥匹配什么通路和执行那些操作。

	cocookie=0x0, duration=14.604s, table=0, n_packets=61, n_bytes=7418, idle_timeout=10,  hard_timeout=30,tcp, vlan_tci=0x0000, dl_src=78:2b:cb:4b:db:c5, dl_dst=00:21:9b:8e:36:62,  nw_src=192.168.7.189, nw_dst=192.168.1.150, nw_tos=0, tp_src=22, tp_dst=60221 actions=output:1
	
上面的流信息不言而喻。如果通路来自源物理地址(src mac address)：78:2b:4b:db:c5，目的物理地址(desrination mac address)：00:21:9b:8e:36:62，通路(traffic)是TCP通路，源IP=192.168.7.189，目的IP=192.168.1.150，TCP源端口为22，TCP目的端口60221 转发包端口1(actions:1)。
在网桥上的端口配置可以用以下命令查看：

	#ovs-ofctl show ovs 
 
 
	OFPT_FEATURES_REPLY (xid=0x1): ver:0x1,
	dpid:0000782bcb4bdbc5
	n_tables:255, n_buffers:256
	features: capabilities:0xc7, actions:0xfff
	 1(em1): addr:78:2b:cb:4b:db:c5
		 config:     0
		 state:      0
		 current:    1GB-FD COPPER AUTO_NEG
		 advertised:
	10MB-HD 10MB-FD 100MB-HD 100MB-FD 1GB-HD 1GB-FD COPPER AUTO_NEG AUTO_PAUSE
		
	supported:  10MB-HD 10MB-FD
	100MB-HD 100MB-FD 1GB-HD 1GB-FD COPPER AUTO_NEG
	 2(tap0): addr:a6:30:4d:0f:40:49
		 config:     0
		 state:      LINK_DOWN
		 current:    10MB-FD COPPER
	 LOCAL(ovs): addr:78:2b:cb:4b:db:c5
		 config:     0
		 state:      0
	OFPT_GET_CONFIG_REPLY (xid=0x3): frags=normal
	miss_send_len=0
	
根据以上提及的流，通路(traffic)被转发到主机em1接口的端口1。
 
如果必要的话，某些用户流可以手动分配到网桥，下面就是一些例子：
	
	#ovs-ofctl add-flow of-switch
 
 
	"in_port=LOCAL,table=0,idle_timeout=60,ip,hard_timeout=60,vlan_tci=0x0000, dl_src=78:2b:cb:4b:db:c5,dl_dst=00:09:8a:02:80:c0, nw_proto=1,nw_dst=192.168.1.100, n w_src=192.168.7.189,actions=drop"
 
以上规则使网桥丢弃所有192.168.7.189到192.168.1.100的ICMP通路(nw_prpto=1)
 
正如上面所展示的add-flow的例子，value idle_timeout和hard_timeout是定义所有的流的。这些值告诉网桥这些规则会被网桥使用多长时间。相关流在超过定义的时间不活动的话idle_timeout就会导致这些流被删除。而hard_timeout则会在超过定义时间后不管在此期间流是否活跃，都将相关的流删除。如果要在网桥中配置了静态的规则，则需要把hard_timeout和idle_time的值都设置为0.
 
以上包含了我到目前位置的所有研究。希望这篇文章将会帮助到更多的用户开启研究openFlow技术的旅途！
 
>申明：

以上的文章仅仅是为了信息的即时传递,内容来自翻译相关技术文档和术语,这些内容可能包含排版上或技术上的错误。