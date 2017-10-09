---
layout: post
title: 【译】FloodLight官网开发者文档二
description: 【译】FloodLight官网开发者文档二
category: SDN
tags:  floodlight
---

# 用户文档

## 控制器

Floodlight不仅仅是一个支持OpenFLow协议的控制器（FloodlightCOntroller），也是一个基于Floodlight控制器的应用集。
当用户在OpenFLow网络上运行各种应用程序的时候，Floodlight控制器实现了对OpenFLow网络的监控和查询功能。图0.0显示了Floodlight不同模块之间的关系，这些应用程序构建成java模块，和Floodlight一起编译。同时这些应用程序都是基于REST API的。
当运行floodlight时，控制器和一组java应用模块（这些会在floodlight属性文件中载入）开始运行。REST API通过REST端口（默认8080）对所有的运行中的模块开放。


### Configuration HOWTO

#### 选择加载模块

Floodlight可以配置载入不同的模块以适应不停地应用。配置不同的载入模块之后必须重启生效。目前对于Floodlight模块的配置都是通过需在启动时加载的一个配置文件的修改实现的。
简单的说，用户可以通过以下步骤，找到或控制Floodlight当前的配置:

* 打开 src/main/resources/META-INF/services/net.floodlightcontroller.core.module.IFloodlightModule文件，就可以查看所有在floodlight.jar二进制编译中的模块编译。
* 打开src/main/resources/floodlightdefault.properties文件或者其他自定义属性文件，查看文件中选择加载/运行模块。这些文件时是配置某些启动时参数的地方，例如：REST  API服务和WEB UI端口（8080）、交换机连接OpenFlow端口（6633）、默认的超时值等。
* 如果在Eclipse或命令行（java -jar floodlight.jar）运行Floodlight，默认情况下加载默认属性文件。详细情况可以查看程序参数包括 -cf  some_properties_file文件。
* 如果在Floodlight-vm上运行的Floodlight，floodlight.jar是按照 /opt/floodlight/floodlight/configuration/floodlight.properties instead of floodlightdefault.properties文件，作为服务载入
* 果需要修改默认值，停止Floodlight，更新以上所说的属性文件并重启。
* 如果自定义新的模块更新上述的两个文件并重启生效。

虽然大多数的应用都是按照默认属性配置运行，但是下面的应用程序需要一组特定的模块，因此需要一个特定的配置文件（由于某些模块之间不兼容）来运行。

* OpenStack Quantum plugin：需要和src/main/resources/quantum.properties文件一起运行
* Forwarding和StaticFlowEntryPusher：这两个模块都是默认加载的，但有时你只需要加载其中的一个来实现应用程序的功能。例如，你想要一个完全自动配置的网络并且不会有转发反应，因此只需要StaticFlowEntryPusher模块而禁止Forwarding模块。

#### 控制日志级别
在控制台显示的调试信息有时是很有帮助的，但有时又会显得十分繁杂。Floodlight使用org.slf4j.Logger模块，将日志信息划分不同的等级。同时，日志等级是可控的。在默认情况下，Floodlight显示了所有的日志等级。为了控制日志等级，可以向JVM传递以下参数：
java -Dlogback.configurationFile=logback.xml -jar floodlight.jar
如果实在Eclipse下运行的Floodlight，点击运行->运行/调试配置->参数->VM参数，在这里添加 -Dlogback.configurationFile=logback.xml
Xml文件已经包含在Floodlight根目录中。

	<configuration scan="true">
	  <appender name="STDOUT">
		<encoder>
		  <pattern>%level [%logger:%thread] %msg%n</pattern>
		</encoder>
	  </appender>
	  <root level="INFO">
		<appender-ref ref="STDOUT" />
	  </root>
	  <logger name="org" level="WARN"/>
	  <logger name="LogService" level="WARN"/> <!-- Restlet access logging -->
	  <logger name="net.floodlightcontroller" level="INFO"/>
	  <logger name="net.floodlightcontroller.logging" level="WARN"/>
	</configuration>

在这个例子中，net,floodlightcontroller包含了所有的floodlight模块，并且具有日志记录级别的信息，因此调试信息并不会出现在控制台中。你可以在logxml文件中指定INFO，WARN和DEBUG的级别。

### 监听地址和端口配置

为了改变主机地址或监听特定服务的端口号，可以在属性配置文件中使用以下的配置参数：

	net.floodlightcontroller.restserver.RestApiServer.host
	net.floodlightcontroller.restserver.RestApiServer.port
	net.floodlightcontroller.core.internal.FloodlightProvider.openflowhost
	net.floodlightcontroller.core.internal.FloodlightProvider.openflowport
	net.floodlightcontroller.jython.JythonDebugInterface.host
	net.floodlightcontroller.jython.JythonDebugInterface.port

默认的属性配置文件（例如：`floodlightdefault.properties`）

### Floodlight REST API

#### 虚拟网络过滤器的REST API

![](/images/2014-05-31-floodlight-develop/01.png)

Curl使用样例
创建一个名字是“VirtualNetwork1”的虚拟网络，ID是“Networkid1”，网关是“10.0.0.7”，tenant是“默认”（目前是忽略的）：

	curl -X PUT -d '{ "network": { "gateway": "10.0.0.7", "name": "virtualNetwork1" } }' http://localhost:8080/networkService/v1.1/tenants/default/networks/NetworkId1

添加一个主机到VirtualNetwork1，MAC地址为“00:00:00:00:00:08”端口为“port1”

	curl -X PUT -d '{"attachment": {"id": "NetworkId1", "mac": "00:00:00:00:00:08"}}' http://localhost:8080/networkService/v1.1/tenants/default/networks/NetworkId1/ports/port1/attachment

#### StaticFlow Pusher API（新）

##### 什么是Static Flow Pusher？

Static Flow Pusher是Floodlight的一个模块，通过REST API形式向外曝露，这个接口允许用户手动向OpenFlow网络中插入流表。

##### 主动和被动流插入

OpenFlow支持两种流插入方式：主动式和被动式。当数据包到达OpenFlow交换机但未成功匹配流表时发生被动式流表插入。这个数据包将会被发送到控制器，控制器对数据包进行分析评估，添加相应的流表并允许交换机继续该数据包的转发。另外，也可以在数据包到达交换机之前，控制器可以主动地插入相应流表。
Floodlight支持这两种的流表插入方式。Static Flow Pusher对于主动插入流表的方式很有帮助。
注意，在默认情况下，Floodlight载入的转发模块是被动插入流表模式的。如果只使用静态流表，就必须将Forwarding模块从floodlight.properties文件中删除。

##### 使用方法

API总结
![](/images/2014-05-31-floodlight-develop/05.png)
添加一个静态流表
Static Flow Pusher是通过REST API方式接入，所以有很多访问方式。例如：要在switch1中插入一个流表，使得port1进入的数据包从port2转发出去。这一操作可以通过使用简单的curl命令实现。第二个命令将显示流表设置。

	curl -d '{"switch": "00:00:00:00:00:00:00:01", "name":"flow-mod-1", "priority":"32768", "ingress-port":"1","active":"true","actions":"output=2"}' http://<controller_ip>:8080/wm/staticflowentrypusher/json
	curl http://<controller_ip>:8080/wm/core/switch/1/flow/json;

删除静态流表
通过发送包含流表名称的HTTP  DELETE来删除静态流表

	curl -X DELETE -d '{"name":"flow-mod-1"}' http://<controller_ip>:8080/wm/staticflowentrypusher/json

流表项属性
![](/images/2014-05-31-floodlight-develop/06.png)

操作域的操作选项
![](/images/2014-05-31-floodlight-develop/07.png)

在主动插入方式中使用Static Flow Pusher
Static Flow Pusher可以通过编写简单的python代码脚本来控制。例如，在运行floodlight之后配置mininet虚拟机。默认的拓扑结构式一个交换机（s1）和两个连接到交换机的主机（h2，h3）。

	$sudo mn --controller=remote  --ip=<controller ip> --port=6633

以下代码是插入从h2发送到h3和h3发送到h2的流表

	import httplib
	import json

	class StaticFlowPusher(object):

		def __init__(self, server):
			self.server = server

		def get(self, data):
			ret = self.rest_call({}, 'GET')
			return json.loads(ret[2])

		def set(self, data):
			ret = self.rest_call(data, 'POST')
			return ret[0] == 200

		def remove(self, objtype, data):
			ret = self.rest_call(data, 'DELETE')
			return ret[0] == 200

		def rest_call(self, data, action):
			path = '/wm/staticflowentrypusher/json'
			headers = {
				'Content-type': 'application/json',
				'Accept': 'application/json',
				}
			body = json.dumps(data)
			conn = httplib.HTTPConnection(self.server, 8080)
			conn.request(action, path, body, headers)
			response = conn.getresponse()
			ret = (response.status, response.reason, response.read())
			print ret
			conn.close()
			return ret

	pusher = StaticFlowPusher('<insert_controller_ip')

	flow1 = {
		'switch':"00:00:00:00:00:00:00:01",
		"name":"flow-mod-1",
		"cookie":"0",
		"priority":"32768",
		"ingress-port":"1",
		"active":"true",
		"actions":"output=flood"
		}

	flow2 = {
		'switch':"00:00:00:00:00:00:00:01",
		"name":"flow-mod-2",
		"cookie":"0",
		"priority":"32768",
		"ingress-port":"2",
		"active":"true",
		"actions":"output=flood"
		}

	pusher.set(flow1)
	pusher.set(flow2)

为了测试这个例子，可以再mininet虚拟机上运行pingall
>注意：必须禁用交换机的学习功能和其他路由代码以确保交换机按照静态流表工作）

	Mininet> h2 ping h3

#### Firewall REST API

##### Firewall REST接口

防火墙模块提供REST接口服务，该接口实现了采用REST API服务形式的RestletRoutable接口。以下是REST方法的列表：
![](/images/2014-05-31-floodlight-develop/08.png)

Curl使用样例
假设控制器在本机上运行，显示防火墙运行还是禁用

	curl http://localhost:8080/wm/firewall/module/status/json

启用防火墙。默认情况下防火墙禁用所有的流量除非创建新的明确允许的规则

	curl http://localhost:8080/wm/firewall/module/enable/json

添加了允许所有流通过交换机00:00:00:00:00:00:00:01的规则

	curl -X POST -d '{"switchid": "00:00:00:00:00:00:00:01"}' http://localhost:8080/wm/firewall/rules/json

添加允许所有IP为10.0.0.3的主机到IP为10.0.0.5的主机的流的规则。不指定动作就是允许的规则

	curl -X POST -d '{"src-ip": "10.0.0.3/32", "dst-ip": "10.0.0.7/32"}' http://localhost:8080/wm/firewall/rules/json
	curl -X POST -d '{"src-ip": "10.0.0.7/32", "dst-ip": "10.0.0.3/32"}' http://localhost:8080/wm/firewall/rules/json

添加允许所有MAC地址为00:00:00:00:00:00:00:0b的主机到MAC地址为00:00:00:00:00:00:00:0c的主机的流的规则

	curl -X POST -d '{"src-mac": "00:00:00:00:00:0a", "dst-mac": "00:00:00:00:00:0a"}' http://localhost:8080/wm/firewall/rules/json
	curl -X POST -d '{"src-mac": "00:00:00:00:00:0b", "dst-mac": "00:00:00:00:00:0b"}' http://localhost:8080/wm/firewall/rules/json

添加允许IP为10.0.0.3的主机到IP为10.0.0.5的主机ping测试的规则。

	curl -X POST -d '{"src-ip": "10.0.0.3/32", "dst-ip": "10.0.0.7/32", "dl-type":"ARP" }'   http://localhost:8080/wm/firewall/rules/json
	curl -X POST -d '{"src-ip": "10.0.0.7/32", "dst-ip": "10.0.0.3/32", "dl-type":"ARP" }' http://localhost:8080/wm/firewall/rules/json

	curl -X POST -d '{"src-ip": "10.0.0.3/32", "dst-ip": "10.0.0.7/32", "nw-proto":"ICMP" }' http://localhost:8080/wm/firewall/rules/json
	curl -X POST -d '{"dst-ip": "10.0.0.7/32", "dst-ip": "10.0.0.3/32", "nw-proto":"ICMP" }' http://localhost:8080/wm/firewall/rules/json

添加允许IP为难10.0.0.4到IP为10.0.0.10主机的UDP转发（如iperf）规则，并禁止5010端口。

	curl -X POST -d '{"src-ip": "10.0.0.4/32", "dst-ip": "10.0.0.10/32", "dl-type":"ARP" }' http://localhost:8080/wm/firewall/rules/json
	curl -X POST -d '{"dst-ip": "10.0.0.10/32", "dst-ip": "10.0.0.4/32", "dl-type":"ARP" }' http://localhost:8080/wm/firewall/rules/json

	curl -X POST -d '{"src-ip": "10.0.0.4/32", "dst-ip": "10.0.0.10/32", "nw-proto":"UDP" }' http://localhost:8080/wm/firewall/rules/json
	curl -X POST -d '{"src-ip": "10.0.0.10/32", "dst-ip": "10.0.0.4/32", "nw-proto":"UDP" }' http://localhost:8080/wm/firewall/rules/json

	curl -X POST -d '{"src-ip": "10.0.0.4/32", "dst-ip": "10.0.0.10/32", "nw-proto":"UDP", "tp-src":"5010", "action":"DENY" }' http://localhost:8080/wm/firewall/rules/json
	curl -X POST -d '{"src-ip": "10.0.0.10/32", "dst-ip": "10.0.0.4/32", "nw-proto":"UDP", "tp-src":"5010", "actio

#### 应用

##### REST应用

###### Circuit Pusher

Circuit Pusher采用floodlight REST API在所有交换机上创建基于IP地址与指定的优先级两个设备之间路由的一个双向电路即永久性的流表项。

>注意

1. Circuit Pusher 现在只能创建两个IP主机之间的，虽然只是简单的扩展以创建基于CIDR格式的IP前缀（例如：192.168.0.0/16）电路，但是支持Static Flow Pusher。
2. 在向Circuit Pusher发送restAPIRequest之前,控制器必须已经检测到终端设备的存在（即终端设备已经在网络中发送过数据，最简单的办法就是用网络中任意两台主机ping一下），只有这样控制器才知道这些网络终端设备的接入点从而计算他们的路由。
3.当前支持的命令格式语法为：

* circuitpusher.py --controller={IP}:{rest port} --type ip --src {IP} --dst {IP} --add --name {circuit-name}
在目前IP链路允许的情况之下在目的和源设备之间新建一个链路。ARP自动支持。
目前，由工作目录中的一个文本文件circuits.json提供一个简单的链路记录存储。
这个文件没有设置任何保护，并且在控制器重启时也不会重置。这个文件需要正确的操作。
用户也应该确保当floodlight控制器重启时删除该文件。

* circuitpusher.py --controller={IP}:{rest port} --delete --name {circuit-name}

通过之前创建链路时定义的链接名删除已创建的链路（即3circuits.json文件中的一条记录）

##### 应用模块

###### Firewall
简介
Firewall应用已经作为floodlight模块实现，防火墙模块在OpenFlow网络之中强制执行ACL规则（接入控制列表）以确保在网络中的交换机使用的是在packet-in监控行为之下的流。
ACL规则就是一组交换机入口permit，allow或者deny数据流的条件。
每个数据流的第一个数据包与交换机已存在的防火墙规则匹配从而决定是否允许通过交换机。
防火墙规则会按照已分配的优先级排序并且匹配OFMatch（OpenFlow 标准1.0）中定义的Packet-in数据包包头域
匹配防火墙规则的高优先权决定了对流执行什么操作（允许/拒绝）。
在OPMatch定义中可以使用通配符。

防火墙策略
防火墙工作在被动模式中。
防火墙规则在创建时按照优先级排序（通过REST API）。
每个进入交换机的packet-in数据包都会从列表中的最高优先级开始比较，直到匹配成功或者将列表中的全部比较完毕。
如果匹配成功，规则中的操作（允许/拒绝）将会被存储在IPoutingDecision对象中，然后传递到其他packet-in数据包处理管道之中。
这一结果将会最终到达Forwarding或者其他被选择的包转发应用（如LearingSwitch）中。
如果结果是允许，Forwarding模块将会发送一个常规的转发流表项；如果结果是拒绝，Forwarding将会丢弃流表项。
在这两种情况之下，被发送到交换机的流表项都必须完全映射匹配防火墙规则的匹配属性（包括通配符）。
防火墙实现允许规则会产生部分的重叠留空间，这通过判断优先级决定。在下面的简单的例子中，所有送达192.168.1.0/24子网的流除了进入的HTTP（TCP端口80）都被禁止。

>数字越小优先级越高

需要特别注意的是在有通配符的情况。如果一个流表不与第一个流表（最高优先级）但和第二个流表（较低优先级）匹配成功，这个流表将通过Forwawrding转发到交换机，但这个流表不会通配目的端口；然而，在这个流中的特定端口会被指定到流表项中从而使得通过80端口的数据包将不会被交换机丢弃也不会像控制器发送packet-in数据包。


REST API
防火墙模块通过REST接口实现，采用REST API服务形式的RestletRoutable接口。

>（REST方法见P14-P15防火墙REST方法列表）

Curl使用样例

>（详情请见P15防火墙curl样例）

问题和限制
防火墙模块的DELETE REST API的调用并不会删除交换机上的流表项。规则只会删除控制器中的存储而交换机内的流表项则会按照标准超时行为自动丢弃。这意味着删除规则之后的一定时间之内，被删除的规则仍然有效。
在最初的提案中，TCP/UDP的所有端口都在防火墙规则支持范围内。然而，由于OpenFlow的流匹配机制不允许指定端口范围，这个功能并没有实现。


负载均衡
一个简单的ping，tcp，udp流的负载均衡。这个模块是通过REST API访问的，类似于OpenStatck Quantum LBbaas（Load-baloance-as-a-Service）v1.0版API方案。详情见http://wiki.openstack.org/Quantum/LBaaS。由于该提案尚未完善，所有兼容新并未得到明确的证明。
代码并不完整但支持基本的为icmp,tcp,udp服务创建和使用负载均衡

局限性：
客户端不会再使用之后清除静态流表记录，长时间之后会造成交换机流表用尽；
基于连接的服务器轮叫策略，而不是基于流量；
状态检测功能尚未实现。

欢迎从Floodlight社区获得帮助来改善运行情况

尝试以下基本特征：
1、下载2012/12/12发布的floodlihgt-master
确认 net.floodlightcontroller.loadbalancer.LoadBanancer在floodlight.defaultpeoperties中
启动floodlight
启动mininet，创建至少8台主机的网络。如：
$sudo mn --controller=rmote --ip=<controller_ip> --mac --topo=tree,3
在mininet中执行pingall命令
在任意linux终端中设置负载均衡vips,pools和members。使用以下脚本：

	#!/bin/sh
	curl -X POST -d '{"id":"1","name":"vip1","protocol":"icmp","address":"10.0.0.100","port":"8"}' http://localhost:8080/quantum/v1.0/vips/
	curl -X POST -d '{"id":"1","name":"pool1","protocol":"icmp","vip_id":"1"}' http://localhost:8080/quantum/v1.0/pools/
	curl -X POST -d '{"id":"1","address":"10.0.0.3","port":"8","pool_id":"1"}' http://localhost:8080/quantum/v1.0/members/
	curl -X POST -d '{"id":"2","address":"10.0.0.4","port":"8","pool_id":"1"}' http://localhost:8080/quantum/v1.0/members/

	curl -X POST -d '{"id":"2","name":"vip2","protocol":"tcp","address":"10.0.0.200","port":"100"}' http://localhost:8080/quantum/v1.0/vips/
	curl -X POST -d '{"id":"2","name":"pool2","protocol":"tcp","vip_id":"2"}' http://localhost:8080/quantum/v1.0/pools/
	curl -X POST -d '{"id":"3","address":"10.0.0.5","port":"100","pool_id":"2"}' http://localhost:8080/quantum/v1.0/members/
	curl -X POST -d '{"id":"4","address":"10.0.0.6","port":"100","pool_id":"2"}' http://localhost:8080/quantum/v1.0/members/

	curl -X POST -d '{"id":"3","name":"vip3","protocol":"udp","address":"10.0.0.150","port":"200"}' http://localhost:8080/quantum/v1.0/vips/
	curl -X POST -d '{"id":"3","name":"pool3","protocol":"udp","vip_id":"3"}' http://localhost:8080/quantum/v1.0/pools/
	curl -X POST -d '{"id":"5","address":"10.0.0.7","port":"200","pool_id":"3"}' http://localhost:8080/quantum/v1.0/members/
	curl -X POST -d '{"id":"6","address":"10.0.0.8","port":"200","pool_id":"3"}' http://localhost:8080/quantum/v1.0/members/

7、在mininet中，执行’h1 ping -c1 10.0.0.100’,然后执行’h2 ping -c1 10.0.0.100’。这两次的ping都会成功的轮换调用两台不同的真实主机执行。


###### OpenStack

安装Floodlight和OpenStack
概述
以下介绍的是在ubuntu虚拟机上使用BigSwitch开发的decstack脚本安装（last build）和OpenStack（Grizzy）。

条件

* Ubuntu12.04.1服务器版即以上
* 至少2GB RAM（扩展应用需要更多）
* 至少30GB存储空间

安装floodlight
需要运行一个flooflight控制器来支持OpenStack Neutron网络。Floodlight控制器可以运行在一个特定的floodlight虚拟机中（floodlight官网上下载floodlight-vm虚拟机镜像文件）.或者你可以下载floodlight.zip源代码压缩文件解压后进行编译运行。只需要在你的ubuntu虚拟机中进行以下几步简单的操作：
确保你有正常的网络连接

	$ sudo apt-get update
	$ sudo apt-get install zip default-jdk ant
	$ wget --no-check-certificate https://github.com/floodlight/floodlight/archive/master.zip
	$ unzip master.zip
	$ cd floodlight-master; ant
	$ java -jar target/floodlight.jar -cf src/main/resources/neutron.properties

你可以通过以下步骤确保你的VirtualNetworkFilter成功激活：

	$ curl 127.0.0.1:8080/networkService/v1.1


	{"status":"ok"}

通过RestProxy Neutron Plugin使用Devstatck安装OpenStatic
一旦Floodlight控制器运行之后，我们就准备使用安装脚本安装OpenStack。下面的步骤1在虚拟机上配置OVS监听Floodlight，步骤2在虚拟机上安装OpenStatic和BigSwitch REST procy插件。
OpenStack Grizzly版

	$ wget https://github.com/openstack-dev/devstack/archive/stable/grizzly.zip
	$ unzip grizzly.zip
	$ cd devstack-stable-grizzly

OpenStack Folsom版

	$ wget https://github.com/bigswitch/devstack/archive/floodlight/folsom.zip
	$ unzip folsom.zip
	$ cd devstack-floodlight-folsom

使用编辑器创建一个`localrc`文件并且填在下面。记住，用你选择的密码替换下面的<passward>并更新'BS_FL_CONTROLLERS_PORT=<floodlight IP address>:8080'。如果在同一台虚拟机上启动的floodlight，可以使用127.0.0.1替换控制器的IP地址；否则使用远程控制器所在主机的正确IP地址。

	disable_service n-net
	enable_service q-svc
	enable_service q-dhcp
	enable_service neutron
	enable_service bigswitch_floodlight
	Q_PLUGIN=bigswitch_floodlight
	Q_USE_NAMESPACE=False
	NOVA_USE_NEUTRON_API=v2
	SCHEDULER=nova.scheduler.simple.SimpleScheduler
	MYSQL_PASSWORD=<password>
	RABBIT_PASSWORD=<password>
	ADMIN_PASSWORD=<password>
	SERVICE_PASSWORD=<password>
	SERVICE_TOKEN=tokentoken
	DEST=/opt/stack
	SCREEN_LOGDIR=$DEST/logs/screen
	SYSLOG=True
	#IP:Port for the BSN controller
	#if more than one, separate with commas
	BS_FL_CONTROLLERS_PORT=<ip_address:port>
	BS_FL_CONTROLLER_TIMEOUT=10

然后：

	$ ./stack.sh

>需要注意的是安装OpenStack时间比较长并且不能中断。任何中断和网络连接失败都会导致错误并无法恢复。建议你在安装之前使用VirtualBox的“快照功能”进行保存。这样就可以很方便的保存后中断安装也不会影响到以后继续安装。

安装完成
如果安装成功完成就会显示：

	Horizon is now available at http://10.10.2.15/
	Keystone is serving at http://10.10.2.15:5000/v2.0/
	Examples on using novaclient command line is in exercise.sh
	The default users are: admin and demo
	The password: nova
	This is your host ip: 10.10.2.15
	stack.sh completed in 102 seconds.

验证OpenStack和Floodlight安装
下面显示的是一个会话的安装devstack后的快照：

	~/quantum-restproxy$ source openrc demo demo
	~/quantum-restproxy$ quantum net-list
	~/quantum-restproxy$ quantum net-create net1

创建一个新的网络：
![](/images/2014-05-31-floodlight-develop/10.png)

	~/quantum-restproxy$ quantum subnet-create 9c1cca24-3b7c-456d-afdd-55bc178b1c83 10.2.2.0/24

创建一个新的子网：
![](/images/2014-05-31-floodlight-develop/11.png)

	~/devstack$ IMG_ID=`nova image-list | grep cirros | grep -v kernel | grep -v ram | awk -F "|" '{print $2}'`
	~/devstack$ nova boot --image $IMG_ID --flavor 1 --nic net-id=9c1cca24-3b7c-456d-afdd-55bc178b1c83 vm1

![](/images/2014-05-31-floodlight-develop/12.png)

	~/devstack$ nova list
![](/images/2014-05-31-floodlight-develop/13.png)

	~/quantum-restproxy$ ping 10.2.2.3

	PING 10.2.2.3 (10.2.2.3) 56(84) bytes of data.
	64 bytes from 10.2.2.3: icmp_req=1 ttl=64 time=15.9 ms
	64 bytes from 10.2.2.3: icmp_req=2 ttl=64 time=0.684 ms
	64 bytes from 10.2.2.3: icmp_req=3 ttl=64 time=0.433 ms
	^C

	~/quantum-restproxy$ ssh cirros@10.2.2.3
	The authenticity of host '10.2.2.3 (10.2.2.3)' can't be established.
	RSA key fingerprint is cf:b0:bb:0f:a6:00:0c:87:00:fd:c5:ac:1d:41:03:77.
	Are you sure you want to continue connecting (yes/no)? yes
	Warning: Permanently added '10.2.2.3' (RSA) to the list of known hosts.
	cirros@10.2.2.3's password:
	$ ifconfig
	eth0 Link encap:Ethernet HWaddr FA:16:3E:51:2F:27
	inet addr:10.2.2.3 Bcast:10.2.2.255 Mask:255.255.255.0
	inet6 addr: fe80::f816:3eff:fe51:2f27/64 Scope:Link
	UP BROADCAST RUNNING MULTICAST MTU:1500 Metric:1
	RX packets:353 errors:0 dropped:95 overruns:0 frame:0
	TX packets:236 errors:0 dropped:0 overruns:0 carrier:0
	collisions:0 txqueuelen:1000
	RX bytes:34830 (34.0 KiB) TX bytes:28414 (27.7 KiB)
	Interrupt:11

另一个例子（基于Essex版本，一些命令格式发生改变）

创建网络、租户、虚拟机
下载我们拥有了一个正在工作的OpenStack服务器，我们可以在其上启动多个虚拟机并通过Quantum API关联到不同的虚拟网络
odd_even_essex.sh创建两个网络每个网络中有两个虚拟机。如果节点创建成功，将会有许多表格被打印，但是确保节点的WAIT PATIENTALY完成了了引导过程。四个虚拟机嵌套在一个虚拟机中，执行都会变得缓慢。
