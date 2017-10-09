---
layout: post
title: 【译】FloodLight官网开发者文档四
description: 【译】FloodLight官网开发者文档四
category: SDN
tags:  floodlight
---

## 添加模块

### 创建一个监听模块

#### 在Eclipse中添加类

* 在floodlight中找出“src/main/java”。
* 在“src/main/java” 目录下选择“New/Class”.
* 在packet中输入 “net.floodlightcontroller.mactracker” 
* 在 name中输入“MACTracker” 
* 在“Interfaces”中, 单击“Add…”，“choose interface”增加“IOFMessageListener” and the “IFloodlightModule”, 单击“OK”.
* 单击“Finish”

产生的对应程序如下：

	package net.floodlightcontroller.mactracker;
	 
	import java.util.Collection;
	import java.util.Map;
	 
	import org.openflow.protocol.OFMessage;
	import org.openflow.protocol.OFType;
	 
	import net.floodlightcontroller.core.FloodlightContext;
	import net.floodlightcontroller.core.IOFMessageListener;
	import net.floodlightcontroller.core.IOFSwitch;
	import net.floodlightcontroller.core.module.FloodlightModuleContext;
	import net.floodlightcontroller.core.module.FloodlightModuleException;
	import net.floodlightcontroller.core.module.IFloodlightModule;
	import net.floodlightcontroller.core.module.IFloodlightService;
	 
	public class MACTracker implements IOFMessageListener, IFloodlightModule {
	 
		@Override
		public String getName() {
			// TODO Auto-generated method stub
			return null;
		}
	 
		@Override
		public boolean isCallbackOrderingPrereq(OFType type, String name) {
			// TODO Auto-generated method stub
			return false;
		}
	 
		@Override
		public boolean isCallbackOrderingPostreq(OFType type, String name) {
			// TODO Auto-generated method stub
			return false;
		}
	 
		@Override
		public Collection<Class<? extends IFloodlightService>> getModuleServices() {
			// TODO Auto-generated method stub
			return null;
		}
	 
		@Override
		public Map<Class<? extends IFloodlightService>, IFloodlightService> getServiceImpls() {
			// TODO Auto-generated method stub
			return null;
		}
	 
		@Override
		public Collection<Class<? extends IFloodlightService>> getModuleDependencies() {
			// TODO Auto-generated method stub
			return null;
		}
	 
		@Override
		public void init(FloodlightModuleContext context)
				throws FloodlightModuleException {
			// TODO Auto-generated method stub
	 
		}
	 
		@Override
		public void startUp(FloodlightModuleContext context) {
			// TODO Auto-generated method stub
		}
	 
		@Override
		public Command receive(IOFSwitch sw, OFMessage msg, FloodlightContext cntx) {
			// TODO Auto-generated method stub
			return null;
		}
	}
	
设置模块化关系并初始化
开始前需处理一系列代码依赖关系。Eclipse中可根据代码需要在编译过程中自动添加依赖包描述。没有相关工具，就需要手动添加代码如下：
	
	import net.floodlightcontroller.core.IFloodlightProviderService;
	import java.util.ArrayList;
	import java.util.concurrent.ConcurrentSkipListSet;
	import java.util.Set;
	import net.floodlightcontroller.packet.Ethernet;
	import org.openflow.util.HexString;
	import org.slf4j.Logger;
	import org.slf4j.LoggerFactory;
 
至此，代码基本框架完成，进而要实现必要功能使模块能正确被加载。首先，注册Java类中需要的成员变量。由于要监听openflow消息，所以要向FloodlightProvider 注册。同时需要一个集合变量macAddresses 来存放控制器发现的MAC地址。最终，需要一个记录变量logger来输出发现过程中的记录信息。

	protected IFloodlightProviderService floodlightProvider;
	protected Set macAddresses;
	protected static Logger logger;
 
编写模块加载代码。 通过完善getModuleDependencies() 告知加载器在floodlight启动时将自己加载。
	
	@Override
	public Collection<Class<? extends IFloodlightService>> getModuleDependencies() {
		Collection<Class<? extends IFloodlightService>> l =
			new ArrayList<Class<? extends IFloodlightService>>();
	l.add(IFloodlightProviderService.class);
		return l;
	}
	
创建Init方法，Init（）将在控制器启动初期被调到，其主要功能室加载依赖关系并初始化数据结构。
	
	@Override
	public void init(FloodlightModuleContext context) throws FloodlightModuleException {
		floodlightProvider = context.getServiceImpl(IFloodlightProviderService.class);
		macAddresses = new ConcurrentSkipListSet<Long>();
		logger = LoggerFactory.getLogger(MACTracker.class);
	}
 
处理Packet-In 消息
在实现基本监听功能时，packet-in消息需在startup方法中被记录和注册，同时确认新增模块需要依赖的其他模块已被正常初始化。

	@Override
	public void startUp(FloodlightModuleContext context) {
		floodlightProvider.addOFMessageListener(OFType.PACKET_IN, this);
	}
 
还需要为 OFMessage监听者提供一个ID，可通过调用getName()实现。 
	@Override
	public String getName() {
		return MACTracker.class.getSimpleName();
	}
 
至此，与packet-in消息相关的操作完成。另外还需注意，要返回 Command.CONTINUE 以保证这个消息能够继续被packet-in消息处理。

	@Override
	public net.floodlightcontroller.core.IListener.Command receive(IOFSwitch sw, OFMessage msg, FloodlightContext cntx) {
		Ethernet eth =
				IFloodlightProviderService.bcStore.get(cntx,
											IFloodlightProviderService.CONTEXT_PI_PAYLOAD);
 
		Long sourceMACHash = Ethernet.toLong(eth.getSourceMACAddress());
		if (!macAddresses.contains(sourceMACHash)) {
			macAddresses.add(sourceMACHash);
			logger.info("MAC Address: {} seen on switch: {}",
					HexString.toHexString(sourceMACHash),
					sw.getId());
		}
		return Command.CONTINUE;
	}
 
注册模块
 如果要在floodlight启动时加载新增模块，需向加载器告知新增模块的存在，在`src/main/resources/META-INF/services/net.floodlight.core.module.IFloodlightModule`文件上增加一个符合规则的模块名，即打开该文件并在最后加上如下代码。

	net.floodlightcontroller.mactracker.MACTracker
 
然后，修改floodlight的配置文件将 MACTracker相关信息添加在文件最后。Floodlight的缺省配置文件是`src/main/resources/floodlightdefault.properties`。其中，floodlight.module选项的各个模块用逗号隔开，相关信息如下：

	floodlight.modules = <leave the default list of modules in place>, net.floodlightcontroller.mactracker.MACTracker
 
最终，即可运行控制器并观察新增模块的功能
Mininet虚拟网络连接floodlight
如果在某主机的虚拟机中运行mininet，同时floodlight也运行在该主机上，必须确保主机IP地址和mininet对应，下例中都设置为网关（192.168.110.2）

	mininet@mininet:~$ sudo route -n
	Kernel IP routing table
	Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
	192.168.110.0   0.0.0.0         255.255.255.0   U     0      0        0 eth0
	0.0.0.0         192.168.110.2   0.0.0.0         UG    0      0        0 eth0
	 
	mininet@mininet:~$ sudo mn --mac --controller=remote --ip=192.168.110.2 --port=6633
	*** Loading ofdatapath
	*** Adding controller
	*** Creating network
	*** Adding hosts:
	h2 h3
	*** Adding switches:
	s1
	*** Adding edges:
	(s1, h2) (s1, h3)
	*** Configuring hosts
	h2 h3
	*** Starting controller
	*** Starting 1 switches
	s1
	*** Starting CLI:
	mininet>pingall
	
Pingall命令生成的debug信息都将从MACTracker发送到控制台

## 添加模块服务

简介
控制器由一个负责监听openflow socket并派发时间的核心模块，以及一些向核心模块注册用于处理响应事件的二级模块构成。当控制器启动时，可启用debug log，进而看的这些二级模块的注册过程，示例如下：
	
	17:29:23.231 [main] DEBUG n.f.core.internal.Controller - OFListeners for PACKET_IN: devicemanager,
	17:29:23.231 [main] DEBUG n.f.core.internal.Controller - OFListeners for PORT_STATUS: devicemanager,
	17:29:23.237 [main] DEBUG n.f.c.module.FloodlightModuleLoader - Starting net.floodlightcontroller.restserver.RestApiServer
	17:29:23.237 [main] DEBUG n.f.c.module.FloodlightModuleLoader - Starting net.floodlightcontroller.forwarding.Forwarding
	17:29:23.237 [main] DEBUG n.f.forwarding.Forwarding - Starting net.floodlightcontroller.forwarding.Forwarding
	17:29:23.237 [main] DEBUG n.f.core.internal.Controller - OFListeners for PACKET_IN: devicemanager,forwarding,
	17:29:23.237 [main] DEBUG n.f.c.module.FloodlightModuleLoader - Starting net.floodlightcontroller.storage.memory.MemoryStorageSource
	17:29:23.240 [main] DEBUG n.f.restserver.RestApiServer - Adding REST API routable net.floodlightcontroller.storage.web.StorageWebRoutable
	17:29:23.242 [main] DEBUG n.f.c.module.FloodlightModuleLoader - Starting net.floodlightcontroller.core.OFMessageFilterManager
	17:29:23.242 [main] DEBUG n.f.core.internal.Controller - OFListeners for PACKET_IN: devicemanager,forwarding,messageFilterManager,
	17:29:23.242 [main] DEBUG n.f.core.internal.Controller - OFListeners for PACKET_OUT: messageFilterManager,
	17:29:23.242 [main] DEBUG n.f.core.internal.Controller - OFListeners for FLOW_MOD: messageFilterManager,
	17:29:23.242 [main] DEBUG n.f.c.module.FloodlightModuleLoader - Starting net.floodlightcontroller.routing.dijkstra.RoutingImpl
	17:29:23.247 [main] DEBUG n.f.c.module.FloodlightModuleLoader - Starting net.floodlightcontroller.core.CoreModule
	17:29:23.248 [main] DEBUG n.f.core.internal.Controller - Doing controller internal setup
	17:29:23.251 [main] INFO  n.f.core.internal.Controller - Connected to storage source
	17:29:23.252 [main] DEBUG n.f.restserver.RestApiServer - Adding REST API routable net.floodlightcontroller.core.web.CoreWebRoutable
	17:29:23.252 [main] DEBUG n.f.c.module.FloodlightModuleLoader - Starting net.floodlightcontroller.topology.internal.TopologyImpl
	17:29:23.254 [main] DEBUG n.f.core.internal.Controller - OFListeners for PACKET_IN: topology,devicemanager,forwarding,messageFilterManager,
	17:29:23.254 [main] DEBUG n.f.core.internal.Controller - OFListeners for PORT_STATUS: devicemanager,topology,
	
针对不同事件，对应不同类型的openflow消息生成，这些动作大部分与packetin有关，packet-in是交换机没流表项能与数据包想匹配时，由交换机发给控制器的openflow消息，控制器进而出来数据包，用一组flowmod消息在交换机上部署流表项，下文示例增加一个新packet-in监听器用于存放packet-in消息，进而允许rest API获得这些消息。
创建类
在Eclipse中添加类
1 在floodlight项目中找到"src/main/java" 文件
2 在 "src/main/java"文件下选择 "New/Class."
3 在packet中输入"net.floodlightcontroller.pktinhistory" 
4 在name中输入 "PktInHistory"。
5 在"Interfaces"中选择choose "Add..."，单击“choose interface”增加"IFloodlightListener"和"IFloodlightModule"，然后单击“OK”
6 最后单击“finish”。
得到如下程序：

	package net.floodlightcontroller.pktinhistory;
	 
	import java.util.Collection;
	import java.util.Map;
	 
	import org.openflow.protocol.OFMessage;
	import org.openflow.protocol.OFType;
	 
	import net.floodlightcontroller.core.FloodlightContext;
	import net.floodlightcontroller.core.IOFMessageListener;
	import net.floodlightcontroller.core.IOFSwitch;
	import net.floodlightcontroller.core.module.FloodlightModuleContext;
	import net.floodlightcontroller.core.module.FloodlightModuleException;
	import net.floodlightcontroller.core.module.IFloodlightModule;
	import net.floodlightcontroller.core.module.IFloodlightService;
	 
	public class PktInHistory implements IFloodlightModule, IOFMessageListener {
	 
		@Override
		public String getName() {
			// TODO Auto-generated method stub
			return null;
		}
	 
		@Override
		public boolean isCallbackOrderingPrereq(OFType type, String name) {
			// TODO Auto-generated method stub
			return false;
		}
	 
		@Override
		public boolean isCallbackOrderingPostreq(OFType type, String name) {
			// TODO Auto-generated method stub
			return false;
		}
	 
		@Override
		public net.floodlightcontroller.core.IListener.Command receive(
				IOFSwitch sw, OFMessage msg, FloodlightContext cntx) {
			// TODO Auto-generated method stub
			return null;
		}
	 
		@Override
		public Collection<Class<? extends IFloodlightService>> getModuleServices() {
			// TODO Auto-generated method stub
			return null;
		}
	 
		@Override
		public Map<Class<? extends IFloodlightService>, IFloodlightService> getServiceImpls() {
			// TODO Auto-generated method stub
			return null;
		}
	 
		@Override
		public Collection<Class<? extends IFloodlightService>> getModuleDependencies() {
			// TODO Auto-generated method stub
			return null;
		}
	 
		@Override
		public void init(FloodlightModuleContext context)
				throws FloodlightModuleException {
			// TODO Auto-generated method stub
		}
		@Override
		public void startUp(FloodlightModuleContext context) {
			// TODO Auto-generated method stub
		}
	}
	 
设置模块依赖关系
模块需要监听openflow消息，因此需要向FloodlightProviderprotected 注册，需要增加依赖关系，创建成员变量如下：

	IFloodlightProviderService floodlightProvider;
 
然后将新增模块与模块加载相关联，通过完善getModuleDependencies() 告知模块加载器在floodlight启动时自己加载。

	@Override
	public Collection<Class<? extends IFloodlightService>> getModuleDependencies() {
		Collection<Class<? extends IFloodlightService>> l = new ArrayList<Class<? extends IFloodlightService>>();
		l.add(IFloodlightProviderService.class);
		return l;
	}
 
初始化内部变量

	@Override
	public void init(FloodlightModuleContext context) throws FloodlightModuleException {
		floodlightProvider = context.getServiceImpl(IFloodlightProviderService.class);
	}
 
处理OpenFlow 消息
本部分实现对of packet_in消息的处理，利用一个buffer来存储近期收到的of消息，以备查询。 
在startup()中注册监听器，告诉provider我们希望处理OF的PacketIn消息。 

	@Override
	public void startUp(FloodlightModuleContext context) {
		floodlightProvider.addOFMessageListener(OFType.PACKET_IN, this);
	}
 
为OFMessage监听器提供id信息，需调用getName（）。 

	@Override
	public String getName() {
		return "PktInHistory";
	}
 
对CallbackOrderingPrereq() 和 isCallbackOrderingPostreq()的调用，只需让它们返回false，packetin消息处理链的执行顺序并不重要。
作为类内部变量，创建circular buffer（import相关包），存储packet in消息。 

	protected ConcurrentCircularBuffer<SwitchMessagePair> buffer;
 
在初始化过程中初始化该变量。 

	@Override
	public void init(FloodlightModuleContext context) throws FloodlightModuleException {
		floodlightProvider = context.getServiceImpl(IFloodlightProviderService.class);
		buffer = new ConcurrentCircularBuffer<SwitchMessagePair>(SwitchMessagePair.class, 100);
	}
 
最后实现模块接收到packetin消息时的处理动作。

	@Override
	public Command receive(IOFSwitch sw, OFMessage msg, FloodlightContext cntx) {
		switch(msg.getType()) {
			 case PACKET_IN:
				 buffer.add(new SwitchMessagePair(sw, msg));
				 break;
			default:
				break;
		 }
		 return Command.CONTINUE;
	}
 
每次packetin发生，其相应消息都会增加相关的交换机消息。该方法返回 Command.CONTINUE 以告知 IFloodlightProvider能将packetin发给下一模块，若返回Command.STOP，则指消息就停在该模块不继续被处理。
 
添加rest API 
在实现了一个完整的模块之后，我们可以实现一个rest api，来获取该模块的相关信息。需要完成两件事情：利用创建的模块导出一个服务，并把该服务绑到REST API模块。 
具体说来，注册一个新的Restlet，包括 
1. 在net.floodlightcontroller.controller.internal.Controller中注册一个restlet。 
2. 实现一个*WebRoutable类。该类实现了RestletRoutable，并提供了getRestlet()和basePath()函数。 
3. 实现一个*Resource类，该类扩展了ServerResource()，并实现了@Get或@Put函数。 
 
下面具体来看该如何实现。 
创建并绑定接口IPktInHistoryService 
首先在pktinhistory包中创建一个从IFloodlightService扩展出来的接口IPktInHistoryService（IPktInHistoryService.java），该服务拥有一个方法getBuffer()，来读取circular buffer中的信息。 

	package net.floodlightcontroller.pktinhistory; 
	import net.floodlightcontroller.core.module.IFloodlightService; 
	import net.floodlightcontroller.core.types.SwitchMessagePair; 
	public interface IPktinHistoryService extends IFloodlightService { 
		public ConcurrentCircularBuffer<SwitchMessagePair> getBuffer(); 
	} 
	 
现在回到原先创建的PktInHistory.java。相应类定义修订如下，让它具体实现IpktInHistoryService接口， 

	public class PktInHistory implements IFloodlightModule, IPktinHistoryService, IOFMessageListener { 
 
并实现服务的getBuffer()方法。

	@Override 
	public ConcurrentCircularBuffer<SwitchMessagePair> getBuffer() { 
		return buffer; 
	} 
 
通过修改PktInHistory模块中getModuleServices()和getServiceImpls()方法通知模块系统，我们提供了IPktInHistoryService。 

	@Override 
	public Collection<Class<? extends IFloodlightService>> getModuleServices() { 
		Collection<Class<? extends IFloodlightService>> l = new ArrayList<Class<? extends IFloodlightService>>(); 
		l.add(IPktinHistoryService.class); 
		return l; 
	} 
	@Override 
	public Map<Class<? extends IFloodlightService>, IFloodlightService> getServiceImpls() { 
		Map<Class<? extends IFloodlightService>, IFloodlightService> m = new HashMap<Class<? extends IFloodlightService>, IFloodlightService>(); 
		m.put(IPktinHistoryService.class, this); 
		return m; 
	} 
 
getServiceImpls()会告诉模块系统，本类（PktInHistory）是提供服务的类。 
添加变量引用REST API服务 
之后，需要添加REST API服务的引用（需要import相关包）。 
protected IRestApiService restApi; 
并添加IRestApiService作为依赖，这需要修改init()和getModuleDependencies()。 

	@Override 
	public Collection<Class<? extends IFloodlightService>> getModuleDependencies() { 
		Collection<Class<? extends IFloodlightService>> l = new ArrayList<Class<? extends IFloodlightService>>(); 
		l.add(IFloodlightProviderService.class); 
		l.add(IRestApiService.class); 
		return l; 
	} 
	@Override 
	public void init(FloodlightModuleContext context) throws FloodlightModuleException { 
		floodlightProvider = context.getServiceImpl(IFloodlightProviderService.class); 
		restApi = context.getServiceImpl(IRestApiService.class); 
		buffer = new ConcurrentCircularBuffer<SwitchMessagePair>(SwitchMessagePair.class, 100); 
	} 
 
创建REST API相关的类PktInHistoryResource和PktInHistoryWebRoutable 
现在创建用在REST API中的类，包括两部分，创建处理url call的类和注册到REST API的类。 
首先创建处理REST API请求的类PktInHistoryResource（PktInHistoryResource.java）。当请求到达时，该类将返回circular buffer中的内容。 

	package net.floodlightcontroller.pktinhistory; 
	 
	import java.util.ArrayList; 
	import java.util.List; 
	import net.floodlightcontroller.core.types.SwitchMessagePair; 
	import org.restlet.resource.Get; 
	import org.restlet.resource.ServerResource; 
	 
	public class PktInHistoryResource extends ServerResource { 
		@Get("json") 
		public List<SwitchMessagePair> retrieve() { 
			IPktinHistoryService pihr = (IPktinHistoryService)getContext().getAttributes().get(IPktinHistoryService.class.getCanonicalName()); 
			List<SwitchMessagePair> l = new ArrayList<SwitchMessagePair>(); 
			l.addAll(java.util.Arrays.asList(pihr.getBuffer().snapshot())); 
			return l; 
		} 
	} 
 
现在创建PktInHistoryWebRoutable类（PktInHistoryWebRoutable.java），负责告诉REST API我们注册了API并将它的URL绑定到指定的资源上。 

	package net.floodlightcontroller.pktinhistory; 
	import org.restlet.Context; 
	import org.restlet.Restlet; 
	import org.restlet.routing.Router; 
	import net.floodlightcontroller.restserver.RestletRoutable; 
	public class PktInHistoryWebRoutable implements RestletRoutable { 
		@Override 
		public Restlet getRestlet(Context context) { 
			Router router = new Router(context); 
			router.attach("/history/json", PktInHistoryResource.class); 
			return router; 
		} 
		@Override 
		public String basePath() { 
			return "/wm/pktinhistory"; 
		} 
	} 
 
 
 
并将Restlet PktInHistoryWebRoutable注册到REST API服务，这通过修改PktInHistory类中的startUp()方法来完成。 
	
	@Override 
	public void startUp(FloodlightModuleContext context) { 
		floodlightProvider.addOFMessageListener(OFType.PACKET_IN, this); 
		restApi.addRestletRoutable(new PktInHistoryWebRoutable()); 
	} 
 
自定义序列化类 
数据会被Jackson序列化为REST格式。如果需要指定部分序列化，需要自己实现序列化类OFSwitchImplJSONSerializer（OFSwitchImplJSONSerializer.java，位于net.floodlightcontroller.web.serialzers包中），并添加到net.floodlightcontroller.web.serialzers包。 
	package net.floodlightcontroller.core.web.serializers; 
	 
	import java.io.IOException; 
	import net.floodlightcontroller.core.internal.OFSwitchImpl; 
	import org.codehaus.jackson.JsonGenerator; 
	import org.codehaus.jackson.JsonProcessingException; 
	import org.codehaus.jackson.map.JsonSerializer; 
	import org.codehaus.jackson.map.SerializerProvider; 
	import org.openflow.util.HexString; 
	 
	public class OFSwitchImplJSONSerializer extends JsonSerializer<OFSwitchImpl> { 
		/** 
		* Handles serialization for OFSwitchImpl 
		*/ 
		@Override 
		public void serialize(OFSwitchImpl switchImpl, JsonGenerator jGen, 
		SerializerProvider arg2) throws IOException, 
		JsonProcessingException { 
			jGen.writeStartObject(); 
			jGen.writeStringField("dpid", HexString.toHexString(switchImpl.getId())); 
			jGen.writeEndObject(); 
		} 
		/** 
		* Tells SimpleModule that we are the serializer for OFSwitchImpl 
		*/ 
		@Override 
		public Class<OFSwitchImpl> handledType() { 
			return OFSwitchImpl.class; 
		} 
	} 
 
 
现在需要告诉Jackson使用我们的序列器。打开OFSwitchImpl.java >（位于net.floodlightcontroller.core.internal包），修改如下（需要import 我们创建的OFSwitchImplJSONSerializer包） 

	@JsonSerialize(using=OFSwitchImplJSONSerializer.class) 
	public class OFSwitchImpl implements IOFSwitch { 

至此，新建模块基本完成，还需告诉loader我们的模块存在，添加模块名字到`src/main/resources/META-INF/services/net.floodlight.core.module.IfloodlightModule`。 
	
	net.floodlightcontroller.pktinhistory.PktInHistory 
	
然后告知模块需要被加载。修改模块配置文件`src/main/resources/floodlightdefault.properties`中的`floodlight.modules`变量。 

	floodlight.modules = net.floodlightcontroller.staticflowentry.StaticFlowEntryPusher,\ 
	net.floodlightcontroller.forwarding.Forwarding,\ 
	net.floodlightcontroller.pktinhistory.PktInHistory 
  
启动mininet。 

	mn --controller=remote --ip=[Your IP Address] --mac --topo=tree,2 
	*** Adding controller 
	*** Creating network 
	*** Adding hosts: 
	h1 h2 h3 h4 
	*** Adding switches: 
	s5 s6 s7 
	*** Adding links: 
	(h1, s6) (h2, s6) (h3, s7) (h4, s7) (s5, s6) (s5, s7) 
	*** Configuring hosts 
	h1 h2 h3 h4 
	*** Starting controller 
	*** Starting 3 switches 
	s5 s6 s7 
	*** Starting CLI: 
	启动后，运行 
	mininet> pingall 
	*** Ping: testing ping reachability 
	h1 -> h2 h3 h4 
	h2 -> h1 h3 h4 
	h3 -> h1 h2 h4 
	h4 -> h1 h2 h3 
	*** Results: 0% dropped (0/12 lost) 
 
利用REST URL拿到结果 

	$ curl -s http://localhost:8080/wm/pktinhistory/history/json | python -mjson.tool
	
	
	[
		{
			"message": {
				"bufferId": 256,
				"inPort": 2,
				"length": 96,
				"lengthU": 96,
				"packetData": "MzP/Uk+PLoqIUk+Pht1gAAAAABg6/wAAAAAAAAAAAAAAAAAAAAD/AgAAAAAAAAAAAAH/Uk+PhwAo2gAAAAD+gAAAAAAAACyKiP/+Uk+P",
				"reason": "NO_MATCH",
				"totalLength": 78,
				"type": "PACKET_IN",
				"version": 1,
				"xid": 0
			},
			"switch": {
				"dpid": "00:00:00:00:00:00:00:06"
			}
		},
		{
			"message": {
				"bufferId": 260,
				"inPort": 1,
				"length": 96,
				"lengthU": 96,
				"packetData": "MzP/Uk+PLoqIUk+Pht1gAAAAABg6/wAAAAAAAAAAAAAAAAAAAAD/AgAAAAAAAAAAAAH/Uk+PhwAo2gAAAAD+gAAAAAAAACyKiP/+Uk+P",
				"reason": "NO_MATCH",
				"totalLength": 78,
				"type": "PACKET_IN",
				"version": 1,
				"xid": 0
			},
			"switch": {
				"dpid": "00:00:00:00:00:00:00:05"
			}
		},
	etc....etc....