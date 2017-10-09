---
layout: post
category: SDN
title: 【译】FloodLight官网开发者文档三
description: 【译】FloodLight官网开发者文档三
tags:  floodlight
---

声明：  
本博客欢迎转发，但请保留原作者信息!  
新浪微博：[@杨帅Login](http://weibo.com/yangshuailogo)；   
博客地址：<http://sherkyoung.github.io/>  
内容系本人学习、研究和总结，如有雷同，实属荣幸！

# 开发者文档

## 控制器模块

### 简介：

控制器模块实现了大多数应用程序常用的一些功能，例如：

* 发现和揭露网络状态和事件
* 实现控制器和网络交换机的通讯
* 控制Floodlight模块以及资源共享，如存储、线程、测试
* 实现一个web UI以及调试服务器
 
FloodLight目前已经实现的控制器模块
FloodlightProvider
描述：
FloodlightProvider提供了两个主要部分的功能，它处理交换机之间的连接并且将OpenFlow的消息转化成其他模块可以监听的事件。第二个主要的功能，它决定某些特定的OpenFlow消息（即PacketIn，FlowRemoved，PortStatus等）被分派到该侦听消息的模块的顺序。然后模块可以决定允许该消息进入下一个监听对象或停止处理消息。
 
提供的服务：

* IFloodlightProviderService
 
服务依赖性：

* IStorageSourceService
* IPktinProcessingTimeService
* IRestApiService
* ICounterStoreService
* IThreadPoolService

Java实现位置:
net.floodlightcontroller.core.FloodlightProvider.
 
如何工作：
FloodlightProvider使用Netty库来处理到交换机的线程和连接，每个OpenFlow消息将通过一个Netty的线程进行处理，并执行与所有模块的消息相关联的所有逻辑。其他模块也可以注册类似交换机连接或断开和端口状态通知特定事件。FloodlightProvider将把这些线协议通知转换成基于Java的消息，以便其它模块可以处理。为了使模块注册为基于OpenFlow消息的，他们必须实现IOFMessageListener接口。
 
局限性：
None
 
配置：
该模块是默认启用的，要想加载此模块，不需要改变任何配置
 
配置选项：
![](/images/2014-05-31-floodlight-develop/14.png)

REST API :
![](/images/2014-05-31-floodlight-develop/15.png)
 
 
DeviceManagerImpl
描述:
DeviceManagerImpl追踪网络周围的设备，并为目标设备定义一个新的流。
 
提供的服务：
IDeviceService
 
服务依赖性：
IStorageSourceService
IRestApiService
ICounterStoreService
IThreadPoolService
IFlowReconcileService
IFloodlightProviderService
 
Java实现位置:
net.floodlightcontroller.devicemanager.internal.DeviceManagerImpl.
 
如何工作：
设备管理器通过PacketIn请求了解设备，通过PacketIn消息获取信息，根据实体如何建立进行分类。默认情况下，entity classifies使用了MAC地址和VLAN来识别设备。这两个属性定义一个独一无二的设备，设备管理器将了解其他属性，如IP地址。信息中一个重要的部分是设备的连接点，如果一个交换机接收到一个PacketIn消息，则交换机将会创建一个连接点， A device can have as many as one attachment point per OpenFlow island, where an island is defined as a strongly connected set of OpenFlow switches talking to the same Floodlight controller. 设备管理器也将根据时间清空连接点，IP地址，以及设备本身。最近看到的时间戳是用来保持清空过程的控制。
 
限制：
设备是不可变的，这意味着你不能持有设备的引用，这些引用必须通过IDeviceService APIs获取。
 
配置：
该模块是默认启用的，加载模块不需要改变任何配置。
 
配置参数：
None
 
REST API :
![](/images/2014-05-31-floodlight-develop/16.png)
 
 
通过curl调用简单的REST
获取所有设备:

	#curl -s http://localhost:8080/wm/device/
 
获取IP地址为1.1.1.1的设备:
	
	#curl -s http://localhost:8080/wm/device/?ipv4=1.1.1.1
 
LinkDiscoveryManager (Dev)
描述：
链接发现服务负责发现和维护OpenFlow网络中的网络链接的状态。
 
提供的服务：
ILinkDiscoveryService
 
服务依赖性：
IStorageSourceService
IThreadPoolService
IFloodlightProviderService
 
Java实现位置：
net.floodlightcontroller.linkdiscovery.internal.LinkDiscoveryManager.
 
如何工作：
链路发现服务使用LLDPs和广播包检测链路。LLDP的目的MAC为01:80：C2：00:00:0 e和BDDP目的MAC是FF：FF：FF：FF：FF：FF（广播地址），LLDP和BDDP的以太类型为 0x88cc 和 0x8999。为了使拓扑结构被正确的学习，还有两个假设：
A).任何交换机(包括OpenFlow交换机)将包括一个本地链路包(LLDP)
B).Honors layer 2 broadcasts
链路可以是直接的或广播的，如果一个LLDP从一个端口被送出并被另一个端口接受，则建立直接的链路，这意味着端口是直连的。如果一个BDDP从一个端口发出，被另一个端口接受，这意味着还有另外一个二层交换机没有这在两个端口之间的控制器的控制下。
 
限制：
None
 
配置：
该模块是默认启用的，加载模块不需要改变任何配置。
 
配置参数：
None
 
REST API
![](/images/2014-05-31-floodlight-develop/17.png)
 
 
通过curl调用简单的REST
获得所有设备：
	
	#curl -s http://localhost:8080/wm/topology/links/json
 
TopologyService
描述：
TopologyService为控制器维护拓扑信息，以及在网路中寻找路由。

在网络中提供的服务：
ITopologyService
IRoutingService
 
服务依赖性：
ILinkDiscoveryService
IThreadPoolService
IFloodlightProviderService
IRestApiService
 
Java位置：
net.floodlightcontroller.topology.TopologyManager.
 
如何工作：
拓扑服务基于从lLinkDiscoveryService学习到的链路信息进行计算拓扑，该TopologyService保持的一个重要概念是OpenFlow的“island”的想法。一个island被定义为一组同一floodlight实例下强连接d的OpenFlow交换机。isLand可以使用在同一个2层域中非OpenFlow的交换机进行互连，例如：
[OF switch 1] -- [OF switch 2] -- [traditional L2 switch] -- [OF switch 3]
两个island将由拓扑服务来形成，isLand1包含switch1和switch2，而island2只包含switch3。
当前的拓扑信息将被存储在称为拓扑实例的不可变的数据结构中，在拓扑结构中如果有任何变化,一个新的实例将被创建并且拓扑变化通知消息将被调用。如果其他模块想监听拓扑结构的变化，它们需要实现 ITopologyListener接口。
 
限制：
尽管你可以在一个OpenFlow isLand中有冗余链路，但不可以有从非OpenFlow交换机到OpenFlow island的冗余链路。
 
配置：
此模块被默认加载，不需要其它配置。
 
配置参数：
![](/images/2014-05-31-floodlight-develop/18.png)
 
简单应用：
获取所有设备：

	Curl -s http://localhost:8080/wm/topology/switchclust
 
RestApiServer
描述：
REST API服务器允许模块通过HTTP暴露REST API。
 
提供的服务：
IRestApiService
 
服务依赖性：
None
 
Java位置：
net.floodlightcontroller.restserver.RestApiServer.
 
如何工作：
REST API服务使用Restlets library。通过REST服务器作为一个依赖的其他模块通过添加一个实现RestletRoutable的类进行公开API。每个RestletRoutable包含附加一个Restlet资源的路由器（最常见的是ServerResource）。用户会附上自己的类扩展Restlet的资源，以处理特定URL的请求。里面的资源注释，如@ GET，@ PUT等，都是选择哪个方法将被用于HTTP请求。序列化通过包含在Restlet库中的Jackson library实现。Jackson可以通过两种方式进行序列化对象，第一，它会自动使用可用的getter对对象进行序列化这些字段，否则，自定义序列化可以创建和注释在类的顶部。
 
限制：
基本的路径不能重叠，并且是唯一的。
Restlets只能通过服务接口访问模块的数据。如果一个模块需要通过REST服务器来公开数据，则它必须通过公开接口来得到这个数据。
 
配置：
此模块被默认加载，不需要其它配置。
 
配置参数：
![](/images/2014-05-31-floodlight-develop/19.png)
 
ThreadPool
描述：
ThreadPool是一个floodlight模块被封装为一个Java的ScheduledExecutorService，它可用于使线程在特定的时间或周期性地运行。
 
提供的服务：
IThreadPoolService
 
服务依赖性：
None
 
文件位置：
net.floodlightcontroller.threadpool.ThreadPool.
 
限制：
None
 
配置：
此模块被默认加载，不需要其它配置。
 
配置参数：
None
 
REST API：
None

MemoryStorageSource
描述:
该MemoryStorageSource是在内存中的NoSQL风格的存储源。也支持更改通知数据库
 
提供服务：
IStorageSourceService
 
服务依赖性：
ICounterStoreService
IRestApiService
 
Java位置：
net.floodlightcontroller.storage.memory.MemoryStorageSource.
 
如何工作：
其它依赖于IStorageSourceService 接口的FloodLight模块可以create/delete/modify 内存资源中的数据，所有的数据是共享的，且没有强制执行。模块还可以注册在制定表和制定行的数据中进行修改，其它任何想实现这样功能的模块需要实现IStorageSourceListener 接口。
 
限制：
一旦数据存储在内存中，当FloodLight关闭时，所有的状态将会丢失。
没有隔离强制执行的数据，即使一个模块创建了一张表，另一个模块可以覆写那部分数据。
 
配置：
此模块被默认加载，不需要其它配置。
 
配置参数：
None
 
REST API：
None
 
Flow Cache
flowCache API 由于记住在网络中一系列不同类型的事件的需要而被定义，而事件的处理，以及如何处理往往构建于不同的Floodlight SDN应用程序。例如，处理交换机/链路故障事件流是大多数应用程序最典型的需要。
Floodlight定义了一个流缓存API和一组框架方法作为通用框架为应用程序开发人员实现适合他们的应用需求的解决方案。
我们正在努力的编写API，晚些时候会提交到floodlight的官方网站上，与此同时，API调用简洁的说明也可以在flow cache源中找到。
 
交换机/链路故障事件的例子:
对于流缓存目的的一个更高层次的解释，我们可以通过switch/link中断事件的生命周期来了解各种被调用的模块。
1.目前，当LinkDiscoveryManager检测到链路或端口出现故障，该事件由在TopologyManager中的一个“NewInstanceWorker”线程处理。请注意，在线程结束时，它调用informListeners，这是一个标记用于告知此事件于其它对处理此事件有兴趣的模块。
2.所以，你会从实现一个实现了ITologyListener接口和topologyChanged()方法的模块开始，并且通过调用TopologyManager.addListener将此模块添加到侦听器列表中。
3.在这个模块中你可以通过 Topology.getLastLinkUpdates()方法获取所有的之前发现的拓扑变化，并对事件进行排序去查看你感兴趣的事件。一个交换机出现故障导致相邻交换机链路断开，所以你应该寻找ILinkDiscoery.UpdateOperation.LINK_REMOVED事件（每个受影响的交换机有一个事件），找到的条目将告诉你所涉及的交换机端口。
4.接下来是要查询每一个受影响的交换机中所有的流表和受影响的端口进行匹配。该查询应该是一个OFStatisticsRequest消息，该消息将通过sw.sendStatsQuery()被送到交换机。
5.一旦查询被发送出去，稍后你会收到响应，为了能够接收到OF包的响应，你的模块必须实现IOFMessageListener接口以及OFType.STATS_REPLY消息。一旦你接收到响应，你会看到它所有的流表项。现在你可以决定是否想要创建删除流表修改消息来清理流表项。
 
这似乎已经解决了这个问题，但我们还没有用到过流缓存以及与其相关的服务接口呢。
流缓存的概念是为了使控制器记录所有有效流，并且当事件被一个控制器的其它模块观察或者实时查询交换机时，此流缓存记录会更新。这种方式整合了不同模块更新和检索流记录。
流高速缓冲存储器的数据结构是留给实现者来决定的，而查询和响应（反流高速缓冲存储器）格式显示在API中。每个查询也可以指定其处理程序。
Flow reconcile类是为了清理缓存以及交换机中的流表项，你可以由多个模块来处理不同的事件，每个模块将实现IFlowReconcileListene接口和reconcileFlows方法。这种方法既可以立即产生操作，你也可以通过OFMatchReconcile对象将决定传递给另一个模块。也有一些接口被定义为保持挂起的查询。
 
Packet Streamer
描述：
Packetstreamer是包流服务，可以选择性的在交换机和控制器之间流式传输OpenFlow包。它包含了两个功能性接口：
1).基于REST的接口来定义自己感兴趣的OpenFlow消息的特性，被称为过滤器
2)一个基于Thrift接口的流过滤的数据包
 
REST API
过滤器定义的一个Post请求："http://<controller>:8080/wm/core/packettrace/json".输入的数据是定义了我们感兴趣的OpenFlow消息特点的参数。FloodLight配备了一个基于Mac地址的过滤器，例如，下面是一个过滤器的格式：
 
	{'mac':<hostMac>, 'direction':<direction>, 'period':<period>, 'sessionId':<sessionid>}
 
![](/images/2014-05-31-floodlight-develop/20.png)

对REST API返回的sessionId，它可以被用来从流过滤服务器接收数据，数据是以Json格式返回的。
	
	{'sessionId':<sessionid>}
	
下面是创建一个1000秒流会话的Python例子以及一个用来终止会话的函数。
在开始之前，确定你已经启动了PacketStreamerServer

	url = 'http://%s:8080/wm/core/packettrace/json' % controller
	filter = {'mac':host, 'direction':'both', 'period':1000}
	post_data = json.dumps(filter)
	request = urllib2.Request(url, post_data, {'Content-Type':'application/json'})
	response_text = None
	 
	try:
		response = urllib2.urlopen(request)
		response_text = response.read()
	except Exception, e:
		# Floodlight may not be running, but we don't want that to be a fatal
		# error, so we just ignore the exception in that case.
		print "Exception:", e
		exit
	 
	if not response_text:
		print "Failed to start a packet trace session"
		sys.exit()
	 
	response_text = json.loads(response_text)
	 
	sessionId = None
	if "sessionId" in response_text:
		sessionId = response_text["sessionId"]
	 
	def terminateTrace(sid):
		global controller
	 
		filter = {SESSIONID:sid, 'period':-1}
		post_data = json.dumps(filter)
		url = 'http://%s:8080/wm/core/packettrace/json' % controller
		request = urllib2.Request(url, post_data, {'Content-Type':'application/json'})
		try:
			response = urllib2.urlopen(request)
			response_text = response.read()
		except Exception, e:
			# Floodlight may not be running, but we don't want that to be a fatal
			# error, so we just ignore the exception in that case.
			print "Exception:", e
 
基于过滤器的流服务：
包流服务是由一个基于Thrift流服务器代理。
该Thrift接口如下表所示，完整的Thrift接口见：src/main/thrift/packetstreamer.thrift

	service PacketStreamer {
	 
	   /**
		* Synchronous method to get packets for a given sessionid
		*/
	   list<binary> getPackets(1:string sessionid),
	 
	   /**
		* Synchronous method to publish a packet.
		* It ensure the order that the packets are pushed
		*/
	   i32 pushMessageSync(1:Message packet),
	 
	   /**
		* Asynchronous method to publish a packet.
		* Order is not guaranteed.
		*/
	   oneway void pushMessageAsync(1:Message packet)
	 
	   /**
		* Terminate a session
		*/
	   void terminateSession(1:string sessionid)
	}
 
floodlight创建脚本为Thrift服务创建java和python库，其它语言的支持可以很容易的通过向创建脚本中添加语言选项：setup.sh
 
REST  API描述了流回话的创建。一旦sessionId被创建，过滤接口getPackets(sessionId)，可以被用于给特定的部分接收OF包，terminateSession(sessionId)可以被用于终止实时会话。
 
下面是一个python的例子：

	try:
		# Make socket
		transport = TSocket.TSocket('localhost', 9090)
		# Buffering is critical. Raw sockets are very slow
		transport = TTransport.TFramedTransport(transport)
		# Wrap in a protocol
		protocol = TBinaryProtocol.TBinaryProtocol(transport)
		# Create a client to use the protocol encoder
		client = PacketStreamer.Client(protocol)
		# Connect!
		transport.open()
	 
		while 1:
			packets = client.getPackets(sessionId)
			for packet in packets:
				print "Packet: %s"% packet
				if "FilterTimeout" in packet:
					sys.exit()
	 
	except Thrift.TException, e:
		print '%s' % (e.message)
		terminateTrace(sessionId)
	 
客户端例子：
Floodlight当前的版本带有基于Mac地址的数据包流的例子。客户端的一些代码都列在了前面的章节。
一个完整的python客户端例子，即描述了REST API和Thrift客户端的使用情况，可以再floodlight的源代码net.floodlightcontroller.packetstreamer中找到。
请确保在客户端机器中已经安装了thrift并且为packetstreamer的gen-gy和thrift python的目录给于了正确的路径
 
 
 
### 应用模块

#### 拟网络过滤器（Quantum插件）

简述：
虚拟网络过滤器模块是基于虚拟化网络的数据链路层。它允许你在独立的数据链路层上创建多个逻辑链路。这个模块可用于OpenStack的部署或者单例。
 
服务提供：
· IVirtualNetworkService
 
服务依赖：
· IDeviceService
· IFloodlightProviderService
· IRestApiService
 
Java文件：
此模块实现在 net.floodlightcontroller.virtualnetwork.VirtualNetworkFilter。
 
如何工作：
在Floodlight启动时，没有虚拟网络创建，这时主机之间不能相互通信。一旦用户创建虚拟网络，则主机就能够被添加。在PacketIn消息转发实现前，模块将启动。一旦，一条PacketIn消息被接受，模块将查看源MAC 地址和目的MAC 地址。如果2个MAC地址是在同一个虚拟网络，模块将返回Command.CONTINUE消息，并且继续处理流。如果MAC地址不在同一虚拟网络则返回Command.STOP消息，并且丢弃包。
 
限制：
· 必须在同一个物理数据链路层中。
· 每个虚拟网络只能拥有一个网关（）（一个网关可被多个虚拟网络共享）。
· 多播和广播没有被隔离。
· 允许所有的DHCP路径。
 
配置：
模块不是默认启用的。它必须被加入配置文件，加入后，为了成功加载，重启Floodlight。这个模块叫做`VirtualNetworkFilter`。包含此模块的默认配置文件位置：`src/main/resources/quantum.properties`

	#The default configuration for openstack
	floodlight.modules = net.floodlightcontroller.storage.memory.MemoryStorageSource,\
	net.floodlightcontroller.staticflowentry.StaticFlowEntryPusher,\
	net.floodlightcontroller.forwarding.Forwarding,\
	net.floodlightcontroller.jython.JythonDebugInterface,\
	net.floodlightcontroller.counter.CounterStore,\
	net.floodlightcontroller.perfmon.PktInProcessingTime,\
	net.floodlightcontroller.ui.web.StaticWebRoutable,\
	net.floodlightcontroller.virtualnetwork.VirtualNetworkFilter
	net.floodlightcontroller.restserver.RestApiServer.port = 8080
	net.floodlightcontroller.core.FloodlightProvider.openflowport = 6633
	net.floodlightcontroller.jython.JythonDebugInterface.port = 6655
 
如果你正在使用Floodlight虚拟机，机子中已经有配置文件，简单的执行一下命令来启动它。

	floodlight@localhost:~$ touch /opt/floodlight/floodlight/feature/quantum
	floodlight@localhost:~$ sudo service floodlight stop
	floodlight@localhost:~$ sudo service floodlight start
 
REAT API
![](/images/2014-05-31-floodlight-develop/21.png)
 
实例：
创建一个名为“VirtualNetwork1”的虚拟网，ID设为“NetworkId1”，网关为“10.0.0.7”，租户是默认的（当前是忽略的）。
	
	curl -X PUT -d '{ "network": { "gateway": "10.0.0.7", "name": "virtualNetwork1" } }' http://localhost:8080/networkService/v1.1/tenants/default/networks/NetworkId1
	
向虚拟网络中添加一个MAC地址为“00:00:00:00:00:08”，端口为“port1”的主机。
	
	curl -X PUT -d '{"attachment": {"id": "NetworkId1", "mac": "00:00:00:00:00:08"}}' http://localhost:8080/networkService/v1.1/tenants/default/networks/NetworkId1/ports/port1/attachment

####转发
简介：
转发将在2个设备之见转发包。源设备和目的设备通过IDeviceService区分。
 
服务提供：
· 没有
 
服务依赖：
· IDeviceService
· IFloodlightProviderService
· IRestApiService
· IRoutingService
· ITopologyService
· ICounterStoreService
 
Java文件：
此模块实现在 net.floodlightcontroller.forwarding.Forwarding。
 
如何工作：
交换机需要考虑到，控制器可能需要工作在一个包含Openflow交换机和非Openflow交换机的网络中。模块将发现所有的 OF 岛。FlowMod 将被安装到最短路径上。如果一条 PacketIn被接收到一个OF岛，而该岛没有挂载点，则这个网包将被洪泛。 
 
限制：
不提供路由功能。
没有VLAN的加减包头。
 
配置：
该模块默认启动，在加载模块时，配置无需更改。
 
防火墙
简介：
防火墙已被作为一个模块实现，它通过ACL规则实现流量过滤。每个被首包触发的 PacketIn 消息将跟规则集进行匹配，按照最高权值匹配规则行为进
行处理。防火墙匹配的最高优先级决定流的操作。通配符在OFMatc中用作定义。
 
防火墙策略：
防火墙被动运行。防火墙规则在他们被创建时（通过REST API）通过优先级排序。每个packet_in将从列表中的最高级开始匹配，直到列表结束。如果找到匹配，操作指令（允许或拒绝）储存到一个IRoutingDecision 对象中，并发送其余的pack_in处理管道。指令最后将到达转发模块或者其他数据包转发的模块(例如 LearningSwitch)。如果，指令允许操作，转发模块将推送一个常规的转发流表，否则，推送一个丢弃流表。不管哪种，被推送给交换机的流表都必须准确的反应出防火墙规则的匹配属性(包括通配符).
因此实现的防火墙,根据不同的优先级,允许拥有部分重叠的流空间。下面是个简单的例子，192.168.1.0/24 段内的子网的流量都是被拒绝的，除了入站HTTP(TCP端口80)流量.
![](/images/2014-05-31-floodlight-develop/22.png)
 
优先级数字越低，优先级别越高。
这里要特别处理通配符。如果流没有匹配最高级，而匹配了次高级，那么由转发模块发送给交换的流表将不会通配目的端口，
而是在流表中指定端口，所以80端口的包将不会被丢弃。
 
REST 接口
防火墙模块实现了REST接口，该接口实现了采用REST API服务的 RestletRoutable的接口。下面是REST方法的列表。
![](/images/2014-05-31-floodlight-develop/8.png)
 
实例：
假定控制器运行在本机。显示出防火墙是否被启动。

	curl http://localhost:8080/wm/firewall/module/status/json
 
启动防火墙。默认的，防火墙拒绝所有流，除非一个显式的ALLOW rule被创建。

	curl http://localhost:8080/wm/firewall/module/enable/json
 
添加一个ALLOW rules为所有的流，来能够通过交换机 00:00:00:00:00:00:00:01。

	curl -X POST -d '{"switchid": "00:00:00:00:00:00:00:01"}' http://localhost:8080/wm/firewall/rules/json
 
为ip为10.0.0.3和10.0.0.7的主机的所有的流添加一个ALLOW rules。Action 意味着ALLOW rules

	curl -X POST -d '{"src-ip": "10.0.0.3/32", "dst-ip": "10.0.0.7/32"}' http://localhost:8080/wm/firewall/rules/json
	curl -X POST -d '{"src-ip": "10.0.0.7/32", "dst-ip": "10.0.0.3/32"}' http://localhost:8080/wm/firewall/rules/json 
 
为mac地址为00:00:00:00:00:0a和00:00:00:00:00:0b的主机的所有流添加一个ALLOW rules。

	curl -X POST -d '{"src-mac": "00:00:00:00:00:0a", "dst-mac": "00:00:00:00:00:0b"}' http://localhost:8080/wm/firewall/rules/json
	curl -X POST -d '{"dst-mac": "00:00:00:00:00:0b", "dst-mac": "00:00:00:00:00:0a"}' http://localhost:8080/wm/firewall/rules/json
 
添加一个ALLOW rules使ip为10.0.0.3和10.0.0.7的主机能够ping通

	curl -X POST -d '{"src-ip": "10.0.0.3/32", "dst-ip": "10.0.0.7/32", "dl-type":"ARP" }' http://localhost:8080/wm/firewall/rules/json
	curl -X POST -d '{"src-ip": "10.0.0.7/32", "dst-ip": "10.0.0.3/32", "dl-type":"ARP" }' http://localhost:8080/wm/firewall/rules/json
 
	curl -X POST -d '{"src-ip": "10.0.0.3/32", "dst-ip": "10.0.0.7/32", "nw-proto":"ICMP" }' http://localhost:8080/wm/firewall/rules/json
	curl -X POST -d '{"src-ip": "10.0.0.7/32", "dst-ip": "10.0.0.3/32", "nw-proto":"ICMP" }' http://localhost:8080/wm/firewall/rules/json
 
添加一个ALLOW rules,ip为10.0.0.4和10.0.0.10主机之间能够UDP通信，同时阻塞5010、端口
	
	curl -X POST -d '{"src-ip": "10.0.0.4/32", "dst-ip": "10.0.0.10/32", "dl-type":"ARP" }' http://localhost:8080/wm/firewall/rules/json
	curl -X POST -d '{"src-ip": "10.0.0.10/32", "dst-ip": "10.0.0.4/32", "dl-type":"ARP" }' http://localhost:8080/wm/firewall/rules/json
 
	curl -X POST -d '{"src-ip": "10.0.0.4/32", "dst-ip": "10.0.0.10/32", "nw-proto":"UDP" }' http://localhost:8080/wm/firewall/rules/json
	curl -X POST -d '{"src-ip": "10.0.0.10/32", "dst-ip": "10.0.0.4/32", "nw-proto":"UDP" }' http://localhost:8080/wm/firewall/rules/json
 
	curl -X POST -d '{"src-ip": "10.0.0.4/32", "dst-ip": "10.0.0.10/32", "nw-proto":"UDP", "tp-src":"5010", "action":"DENY" }' http://localhost:8080/wm/firewall/rules/json
	curl -X POST -d '{"src-ip": "10.0.0.10/32", "dst-ip": "10.0.0.4/32", "nw-proto":"UDP", "tp-dst":"5010", "action":"DENY" }' http://localhost:8080/wm/firewall/rules/json
 
测试方法：
测试包括自动化单元，自动化单元通过EasyMock创建。”Firewalltest”类包括可由JUnit和Eclipse执行的测试案例。在大多数的测试案例中，packer_in事件是模拟的，由此产生的防火墙行为能够被验证，它们是基于被定义的规则集的。以下是各种测试案例。

* testNoRules
 
Description: 没有任何的rules，发送一个packet_in事件，.防火墙将会拒绝所有流。这是一个边界测试案例

* testRuleInsertionIntoStorage
 
 Description: 添加一个rules，通过检查存储来验证. 这是一个简单positive 测试案例.
* testRuleDeletion
 
 Description: 删除一个rules，通过检查存储来验证. Again, 这是一个简单positive 测试案例.

* testFirewallDisabled

 Description: 在防火墙没有启动时，插入一个rules，并发送一个packet_in事件. 防火墙将会拒绝所有的流.这是一个简单的 negative 的测试案例.

* testSimpleAllowRule

 Description:添加一个简单的rules，使两个2不同的ip之间能够tcp通信，并且发送一个packet_in事件。在验证防火墙行为之后，能够发送另一个应该被丢弃的包 。This test case covers normal rules (non-boundary case – i.e. no malformed packets or broadcasts)这个测试案例包含一个简单的rules（无边界案例——例如 一个完好的包或者广播）

* testOverlappingRules

 Description:添加overlapping rules (拒绝所有的TCP流 除非目的端口是80). 这个测试案例包含复杂情况下的多个规则(multiple allow-deny overlapping rules).

* testARP

 Description:测试一个ARP广播请求包和单播ARP回应。没有允许ARP回应的防火墙rules，所以只有广播请求包能够通过.

* testIPBroadcast

 Description: 够在防火墙没有任何rules情况下，发送一个ip广播（L3）packt_in事件。这是一个包含IP广播的positive测试案例（L3+L2广播）.

* testMalformedIPBroadcast

 Description:在没有任何rules情况下,发送一个坏的IP广播packet_in事件. 防火墙将会拒绝这个流, 因为这个包一个L2广播L3单播. 这是一个边界案例.

* testLayer2Rule

 Description:一个规则允许指定的MAC通信，另一个规则拒绝所有的TCP通信. 防火墙将接受这个流. 这是一个negative测试案例，这里规则包含L2. 
 
问题和局限:
1.防火墙 模块DELETE REST API功能的调用没有删除交换机上的流表。Rules将会被从控制器存储中删除，当交换机上的流表处理时间超过标准。这意味着在一段时间后，删除规则是有效的。流可以持续存在,只要它在交换机中持续通信.
2.最初的，TCP/UDP端口范围是通过防火墙rules来支持的。但是，作为OpenFlow流匹配机制不允许指定端口范围,此功能没有实现。

#### Port Down Reconciliation 

简介:
PortDownReconciliation模块的实现是为了在端口关闭的时候处理网络中的流。在PORT_DOWN链路发现更新消息之后，这个模块将会找出并且删除直接指向这个端口的流。所有无效的流都被删除之后，floodlight应该重新评估链路，流量也要采用新的拓扑。如果没有这个模块，流量会持续的进入到这个坏掉的端口，因为流的过期时间还没有到。
工作原理:
想象一下我们有一个拓扑，包含了交换机s1，s1连接了一个主机h1,和两个交换机s2、s3，现在流量从s2、s3进入到s1，目标地址是h1，但是到h1的链路关闭了，s1将会给controller发送一个PORT_DOWN通知。
在收到PORT_DOWN链路更新之后，该模块就会找到那个关闭的端口，然后向s1查询所有目的端口是链路发现更新描述的端口的流，它会分析这些流，并且为进入端口和把流路由到已关闭端口的OFMatch创建索引。
索引可能看起来像这样:
![](/images/2014-05-31-floodlight-develop/23.png)
跟随s1的索引，该模块向拓扑服务询问网络中所有交换机的连接，以此追溯链路。找出所有的交换机，这些交换机包含了目标交换机对应s1，目标端口对应索引中描述的无效进入端口，如果找到这样的匹配，那么这个交换机就会被添加到相邻交换机索引中，此时指向源端口的连接和无效的OFMatch。
相邻交换机索引:
![](/images/2014-05-31-floodlight-develop/24.png)
 
 现在s1就不需要这些信息了，所有目标端口是故障端口的流都将会从s1中删除，然后该模块遍历和s1相邻交换机的索引，并在上边执行相同的操作，这个过程会逐跳的递归进行，直到网络中没有无效的流。
问题和局限:
1.如果在一个源地址和目的地址的路由中有重叠的交换机，那些重叠的交换机将会因不同的流被统计多次，这就花费了额外的时间，但是对于维护网络中流的完整性，这也是必要的。
2.这个模块依赖于转发模块实现。

### 模块加载系统

简介:
Floodlight使用自己的模块系统来决定哪些模块会运行，这个系统的设计目标是：
1.通过修改配置文件决定哪些模块会被加载
2.实现一个模块不需要修改他所依赖的模块
3.创建一个定义良好的平台和API以扩展Floodlight
4.对代码进行强制的模块化
主要部件：
模块系统包含几个主要的部件：模块加载器、模块、服务、配置文件和一个在jar文件中包含了了可用模块列表的文件。
模块：
模块被定以为一个实现了IFloodlightModule接口的类。IFloodlightModule接口的定义如批注所示。

	/**
	 * Defines an interface for loadable Floodlight modules.
	 *
	 * At a high level, these functions are called in the following order:
	 * <ol>
	 * <li> getServices() : what services does this module provide
	 * <li> getDependencies() : list the dependencies
	 * <li> init() : internal initializations (don't touch other modules)
	 * <li> startUp() : external initializations (<em>do</em> touch other modules)
	 * </ol>
	 *
	 * @author alexreimers
	 */
	public interface IFloodlightModule {
	 
		/**
		 * Return the list of interfaces that this module implements.
		 * All interfaces must inherit IFloodlightService
		 * @return
		 */
	 
		public Collection<Class<? extends IFloodlightService>> getModuleServices();
	 
		/**
		 * Instantiate (as needed) and return objects that implement each
		 * of the services exported by this module.  The map returned maps
		 * the implemented service to the object.  The object could be the
		 * same object or different objects for different exported services.
		 * @return The map from service interface class to service implementation
		 */
		public Map<Class<? extends IFloodlightService>,
				   IFloodlightService> getServiceImpls();
	 
		/**
		 * Get a list of Modules that this module depends on.  The module system
		 * will ensure that each these dependencies is resolved before the
		 * subsequent calls to init().
		 * @return The Collection of IFloodlightServices that this module depnds
		 *         on.
		 */
	 
		public Collection<Class<? extends IFloodlightService>> getModuleDependencies();
	 
		/**
		 * This is a hook for each module to do its <em>internal</em> initialization,
		 * e.g., call setService(context.getService("Service"))
		 *
		 * All module dependencies are resolved when this is called, but not every module
		 * is initialized.
		 *
		 * @param context
		 * @throws FloodlightModuleException
		 */
	 
		void init(FloodlightModuleContext context) throws FloodlightModuleException;
	 
		/**
		 * This is a hook for each module to do its <em>external</em> initializations,
		 * e.g., register for callbacks or query for state in other modules
		 *
		 * It is expected that this function will not block and that modules that want
		 * non-event driven CPU will spawn their own threads.
		 *
		 * @param context
		 */
	 
		void startUp(FloodlightModuleContext context);
	}
	 
服务:
一个模块可能包含一个或多个服务，服务被定义为一个继承IFloodlightService接口的接口。

	/**
	 * This is the base interface for any IFloodlightModule package that provides
	 * a service.
	 * @author alexreimers
	 *
	 */
	public abstract interface IFloodlightService {
		// This space is intentionally left blank....don't touch it
	}
 
现在这是一个空接口，在我们的加载系统中它是用来强制保证类型安全的。
 
配置文件:
配置文件明确的规定了哪些模块可以加载，它的格式是标准的java属性，使用键值对，在模块列表中键是`floodlight.modules`，值是以逗号分隔的模块列表，可以在一行，或者使用 \ 断行，下边是Floodlight默认的配置文件：
	
	floodlight.modules = net.floodlightcontroller.staticflowentry.StaticFlowEntryPusher,\
	net.floodlightcontroller.forwarding.Forwarding,\
	net.floodlightcontroller.jython.JythonDebugInterface
 
有许多没有写在这个列表里的模块也被加载了，这是因为模块系统自动加载了依赖，如果一个模块没有提供任何服务，那么就必须在这里明确的定义。
 
模块文件:
我们使用java的ServiceLoader找到类路径中的模块，这就要求我们列出文件中所有的类，这个文件的格式是在每一行都有一个完整的类名，这个文件在src/main/resource/MEAT-INFO/service/net.floodlightcontroller.module.IFloodModule。你使用的每个jar文件（如果使用多个jar文件就接着看 ）都要有它自己的META-INFO/services/net.floodlightcontroller.module.IFloodlightModule文件，列出实现了IFloodlightModule接口的类。下边是一个示例文件：
	
	net.floodlightcontroller.core.CoreModule
	net.floodlightcontroller.storage.memory.MemoryStorageSource
	net.floodlightcontroller.devicemanager.internal.DeviceManagerImpl
	net.floodlightcontroller.topology.internal.TopologyImpl
	net.floodlightcontroller.routing.dijkstra.RoutingImpl
	net.floodlightcontroller.forwarding.Forwarding
	net.floodlightcontroller.core.OFMessageFilterManager
	net.floodlightcontroller.staticflowentry.StaticFlowEntryPusher
	net.floodlightcontroller.perfmon.PktInProcessingTime
	net.floodlightcontroller.restserver.RestApiServer
	net.floodlightcontroller.learningswitch.LearningSwitch
	net.floodlightcontroller.hub.Hub
	net.floodlightcontroller.jython.JythonDebugInterface
 
启动序列：
1.模块发现
所有在类路径中的模块（实现IFloodlightModule的类）都会被找到，并且建立三个映射（map）
服务映射：建立服务和提供该服务的模块之间的映射
模块服务映射：建立模块和他提供的所有服务之间的映射
模块名称映射：建立模块类和模块类名之间的映射
2.找出需要加载的最小集合
使用深度优先遍历算法找出需要加载模块的最小集合，所有在配置文件中定义的模块都会添加到队列中，每个模块出对后都会被添加到模块启动列表中，如果一个模块的依赖还没有添加到模块启动列表中，将会在该模块上调用getModuleDependenceies方法。在这里有两种情况可能引起FloodlightModuleException异常，第一种情况找不到在配置文件中定义的模块或者模块的依赖，第二种情况是两个模块提供了相同的服务，却没有指明使用哪个。
3.初始化模块
集合中的模块会迭代的加载，并且在上边调用init方法，现在模块会做两件事情
1.在FloodlightModuleContext上调用getServiceImpl方法把它的依赖写到一起。
2.对自己内部的数据结构执行初始化。
init方法调用的顺序是不确定的。
4.启动模块：
在每个模块上调用init方法后，就会调用startUp方法，在这个方法中模块将会调用它所依赖的模块，例如：使用IStorageSourceService模块在数据库中建立一个表、或者用IFloodlightProviderService的executor服务建立一个线程。
通过命令行使用控制器:
只使用floodlight.jar：如果你只是想使用默认配置运行floodlight，最简单的方法就是运行这个命令
    
	$java -jar floodlight.jar
	
使用多个jar文件：也可以使用多个jar文件运行openflow，如果你想用另外的包分发，这将会非常有用 ，只是命令有些不同。

	$java -cp floodlight.jar:/path/to/other.jar net.floodlightcontroller.core.Main
	
-cp参数告诉java使用类路径中的那些jar文件，main方法坐在的类由net.floodlightconntroller.core.Main指定。如果你添加的jar文件包含了实现IFloodlightModule接口的类，你就要确保创建了MAIN-INF/services/net.floodlightcontroller.core.module.IFloodlightModule。
 
指定其它的配置文件：
使用这两种方法 你可以指定一个其它的配置文件，这需要用到-cf选项。
	
	$java -cp floodlight.jar:/path/to/other.jar net.floodlightcontroller.core.Main -cf path/to/config/file.properties

	-cf参数必须放到所有选项的后边，这就让参数传递到了java程序而不是java虚拟机。使用哪个配置文件的顺序是：
使用-cf选项指定的配置文件`config/floodlight.properties`文件（如果存在的话）
在jar文件中的`floodlightdefault.properties`文件 >（在src/main/resources中）。
 
 
每个模块的配置选项:
 Properties文件能够指定每个模块的配置选项。格式是<规范的模块名>.<配置选项名>=<内容>。
我们使用规范的模块名，这样任何的模块都可以创建配置选项来实现自身.
例如,如果我们想指定REST API 端口,就向 property文件中加入。

	net.floodlightcontroller.restserver.RestApiServer.port = 8080
	
我们来分析一下RestApiServer的init方法.
	
	// read our config options
	Map<String, String> configOptions = context.getConfigParams(this);
	String port = configOptions.get("port");
	if (port != null) {
			restPort = Integer.parseInt(port);
	}
	
>注意null检查是必须的.如果配置选项没有提供，. FloodlightModuleLoader 模块将不会将其添加到文本中。

通过命令行,选项可以指定为Java属性. 这些可以重写Floodlight配置文件中任何指定的东西.
java -Dnet.floodlightcontroller.restserver.RestApiServer.port=8080 -jar floodlight.jar
 
有两点要注意,第一 ,Java属性在运行floodlight.jar之前First应被指定.之后,所有的被作为可执行的命令行文本传递给Java. The second is that there are no spaces with the -D option.
注意事项

* 为了处理循环依赖关系,init()方法和startup()方法的调用顺序是不确定的,因此,你不能假设任何的init()和startUp方法的调用。.
* 你的配置文件不能调用FLoodlight，properties文件，这是jar包中的默认配置文件。.
* 每个模块必须有一个0参数(最好是空的)构造函数.做什么应该在构造函数中实现,而不是调用init()。.
* 模块之间可能没有服务重叠,但是存在功能重叠,例如, LearningSwitch 模块Forwarding都有转发包的方法 Since they do not provide a common service w do not detect and overlap.
 
#### Javadoc entry

综述:
Overview 页面提供了所有的包的摘要,也包含了包集合的说明
包
每个包都有一个列出它的接口和类的页面,并都对每个类和接口有个简介.这个页面可能包含的:

* Interfaces (italic)
* Classes
* Enums
* Exceptions
* Errors
* Annotation Types

Class/Interface类和接口
每个类,接口以及嵌套类和嵌套接口有自己的单独的页面.这些页面有三个部分,包括a class/interface description, summary tables, and detailed member descriptions:

* Class inheritance diagram
* Direct Subclasses
* All Known Subinterfaces
* All Known Implementing Classes
* Class/interface declaration
* Class/interface description 
* Nested Class Summary
* Field Summary
* Constructor Summary
* Method Summary 
* Field Detail
* Constructor Detail
* Method Detail

每个摘要通过第一段来详细描述的内容.摘要条目按照字母顺序排列,而详细描述以出现在源代码的顺序. 这个保存由程序员建立的逻辑组.
Annotation Type注释种类
每种注释有自己的页面,并有一下几个部分:

* Annotation Type declaration
* Annotation Type description
* Required Element Summary
* Optional Element Summary
* Element Detail

Enum枚举
每个枚举有自己单独的页面,并有以下部分

* Enum declaration
* Enum description
* Enum Constant Summary
* Enum Constant Detail

Use
每个文件包,类和接口有自己的Use页面。这个页面描述，包，类，构造器和字段用的了哪些包和类。
Tree (Class Hierarchy)树（类的层次结构）
这儿有所有包的层次结构,也有每个包的层次结构.每个页面就是类和接口的列表.注意接口不是从 java.lang.Object继承的
当查看概览页面,点击“树”显示所有包的层次结构.
当浏览一个特定的包,类或接口页面,点击“树”显示,包的层次结构.
不赞成使用的API
Deprecated API 页面列出了所有不赞同使用的API,之所以,不赞同使用,是为了优化,或者一个代替的API已经给出。
Index索引
索引是一个字母列表，其中包含了所有类、接口、构造函数、方法和字段。
Prev/Next上/下页
These links take you to the next or previous class, interface, package, or related page.这些链接指向下一页，其中包括相关的类,接口,包,或相关页面。
Frames/No Frames
These links show and hide the HTML frames. All pages are available with or without frames.
序列化格式
每个序列化类或者外部类都有一个描述它的字段和方法。这是 re-implementors兴趣的，而不是使用API的开发者。虽然没有链接在导航栏中,你可以得到这个信息,通过定位任何序列化的类并单击“Serialized Form”。
固定字段值
固定字段值页面列出了静态的final字段和他们的值
This help file applies to API documentation generated using the standard doclet