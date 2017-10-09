---
layout: post
title: floodlight添加模块实验
description: floodlight添加模块实验
category: SDN
tags:  floodlight
---

元旦的时候发现floodlight居然更新了，吓坏我了。V0.9是12年10月更新的，然后在14年12月30日连续发布了V0.91和V1.0。OTZ……
根据`release note`来看，主要最大的更新在于添加了对于of1.3的支持。虽然我尚未验证（后续会验证）floodlight对of1.3的支持程度，但是release note中的这句话：`“ and work with OpenFlow 1.3 features such as groups and meters.”`。我猜测大概是能够识别组表和计量表，但是不作处理。OTZ……还有就是以往一些小bug的修复，最直观的就是页面的改进。拓扑结构、ip、流表等信息不再像以往一样显不显示得看脸，可以实时准确的显示出来。

下面是具体的添加模块的实验。

## 导入工程

从git上直接拉下来的代码是没法直接导入到eclipse中的，需要添加.project文件和,classpath文件：
`Project`文件：

	<?xml version="1.0" encoding="UTF-8"?>  
		<projectDescription>  
			<name>floodlight</name>  
			<comment></comment>  
			<projects>  
			</projects>  
			<buildSpec>  
				<buildCommand>  
					<name>org.python.pydev.PyDevBuilder</name>  
					<arguments>  
					</arguments>  
				</buildCommand>  
				<buildCommand>  
					<name>org.eclipse.jdt.core.javabuilder</name>  
					<arguments>  
					</arguments>  
				 </buildCommand>  
			</buildSpec>  
			<natures>  
				<nature>org.eclipse.jdt.core.javanature</nature>  
				<nature>org.python.pydev.pythonNature</nature>  
			</natures>  
	</projectDescription>  

`Classpath`文件：

<?xml version="1.0" encoding="UTF-8"?>  
	<classpath>  
		<classpathentry kind="src" output="target/bin" path="src/main/java"/>  
		<classpathentry kind="src" path="src/main/resources"/>  
		<classpathentry kind="src" output="target/bin-test" path="src/test/java"/>  
		<classpathentry kind="src" path="src/test/resources"/>  
		<classpathentry kind="src" output="target/bin" path="lib/gen-java"/>  
		<classpathentry exported="true" kind="lib" path="lib/args4j-2.0.16.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/cglib-nodep-2.2.2.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/concurrentlinkedhashmap-lru-1.2.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/derby-10.9.1.0.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/findbugs-annotations-2.0.1.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/findbugs-jsr305-2.0.1.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/guava-13.0.1.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/jackson-annotations-2.1.4.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/jackson-core-2.1.4.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/jackson-databind-2.1.4.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/jackson-dataformat-csv-2.1.4.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/jackson-dataformat-smile-2.1.4.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/jackson-dataformat-xml-2.1.4.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/jackson-dataformat-yaml-2.1.4.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/junit-4.8.2.jar" sourcepath="C:/Users/dell/.m2/repository/junit/junit/4.8.2/junit-4.8.2-sources.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/jython-2.5.2.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/libthrift-0.9.0.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/logback-classic-1.0.0.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/logback-core-1.0.0.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/netty-3.2.6.Final.jar" sourcepath="C:/Users/dell/.m2/repository/org/jboss/netty/netty/3.2.6.Final/netty-3.2.6.Final-sources.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/objenesis-1.2.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/org.easymock-3.1.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/org.restlet-2.2M3.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/org.restlet.ext.jackson-2.2M3.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/org.restlet.ext.simple-2.2M3.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/org.restlet.ext.slf4j-2.2M3.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/simple-5.1.1.jar"/>  
		<classpathentry exported="true" kind="lib" path="lib/slf4j-api-1.6.4.jar"/>  
		<classpathentry kind="lib" path="lib/asm-3.0.jar"/>  
		<classpathentry kind="lib" path="lib/asm-tree-3.0.jar"/>  
		<classpathentry kind="lib" path="lib/cobertura-1.9.4.1.jar"/>  
		<classpathentry kind="lib" path="lib/hamcrest-core-1.3.jar"/>  
		<classpathentry kind="lib" path="lib/hamcrest-integration-1.3.jar"/>  
		<classpathentry kind="lib" path="lib/hamcrest-library-1.3.jar"/>  
		<classpathentry kind="lib" path="lib/j3dutils.jar"/>  
		<classpathentry kind="lib" path="lib/jdeb-1.0.1.jar"/>  
		<classpathentry kind="lib" path="lib/log4j-1.2.9.jar"/>  
		<classpathentry kind="lib" path="lib/openflowj-0.9.0-SNAPSHOT-javadoc.jar"/>  
		<classpathentry kind="lib" path="lib/openflowj-0.9.0-SNAPSHOT-sources.jar"/>  
		<classpathentry kind="lib" path="lib/openflowj-0.9.0-SNAPSHOT.jar"/>  
		<classpathentry kind="lib" path="lib/packetstreamer-thrift.jar"/>  
		<classpathentry kind="lib" path="lib/oro/jakarta-oro-2.0.8.jar"/>  
		<classpathentry exported="true" kind="con" path="org.eclipse.jdt.launching.JRE_CONTAINER"/>  
		<classpathentry kind="output" path="target/bin"/>  
	</classpath>  

然后就可以作为普通的项目导入即可。

## 实验过程：

这里的实验做的是对packet-in包的数量进行统计并打印到控制台，功能单一，但能体现出添加新模块的整个流程。

1.添加新服务接口
首先需要定义新加模块服务的接口：

package net.floodlightcontroller.statics;  
  
import net.floodlightcontroller.core.module.IFloodlightService;  
	/**  
	 * The service registry  
	 * @author yangshuai  
	 */  
	  
	public interface IPktinHistoryService extends IFloodlightService {  
		/*  
		 * 用于统计结果  
		 */  
		public long getPackINCount();  
	}  
	
2.添加PktinHistory模块：因为这里添加的新模块的功能比较单一，只是统计floodlight运行后packet-in包的总数量，并且是持续累计计数的，所以只需在该接口中定义一个用于计算的方法就可以了。
定义`PktinHistory`模块：

	package net.floodlightcontroller.statics;  
	  
	import java.util.ArrayList;  
	import java.util.Collection;  
	import java.util.HashMap;  
	import java.util.Map;  
	import java.util.concurrent.atomic.AtomicLong;  
	  
	import org.projectfloodlight.openflow.protocol.OFMessage;  
	import org.projectfloodlight.openflow.protocol.OFType;  
	import org.slf4j.Logger;  
	import org.slf4j.LoggerFactory;  
	  
	import net.floodlightcontroller.core.FloodlightContext;  
	import net.floodlightcontroller.core.IFloodlightProviderService;  
	import net.floodlightcontroller.core.IOFMessageListener;  
	import net.floodlightcontroller.core.IOFSwitch;  
	import net.floodlightcontroller.core.module.FloodlightModuleContext;  
	import net.floodlightcontroller.core.module.FloodlightModuleException;  
	import net.floodlightcontroller.core.module.IFloodlightModule;  
	import net.floodlightcontroller.core.module.IFloodlightService;  
	import net.floodlightcontroller.restserver.IRestApiService;  
	  
	/*  
	 *   
	 *@author yangshuai  
	 */   
	  
	public class PktinHistory implements   
		IOFMessageListener,IFloodlightModule,IPktinHistoryService{  
	  
		protected static Logger log = LoggerFactory.getLogger(PktinHistory.class);  
		protected IFloodlightProviderService FloodlightProvider ;  
		protected IRestApiService restApi ;  
		private AtomicLong PACKET_IN_COUNT = new AtomicLong() ;  
		  
		@Override  
		public String getName() {  
			return "PktinHistory" ;  
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
		public long getPackINCount() {  
			return PACKET_IN_COUNT.get();  
		}  
	  
		@Override  
		public Collection<Class<? extends IFloodlightService>> getModuleServices() {  
			Collection<Class<? extends IFloodlightService>> l =   
					new ArrayList<Class<? extends IFloodlightService>>();  
			l.add(IPktinHistoryService.class);  
			return l;  
		}  
	  
		@Override  
		public Map<Class<? extends IFloodlightService>, IFloodlightService> getServiceImpls() {  
			Map<Class<? extends IFloodlightService>,IFloodlightService> m =   
					new  HashMap<Class<? extends IFloodlightService>,IFloodlightService>();  
			m.put(IPktinHistoryService.class,this);  
			return m;  
		}  
	  
		@Override  
		public Collection<Class<? extends IFloodlightService>> getModuleDependencies() {  
			Collection<Class<? extends IFloodlightService>> l =   
					new ArrayList<Class<? extends IFloodlightService>>() ;  
			l.add(IFloodlightProviderService.class);  
			l.add(IRestApiService.class);  
			return l ;  
		}  
	  
		@Override  
		public void init(FloodlightModuleContext context)  
				throws FloodlightModuleException {  
			FloodlightProvider = context.getServiceImpl(IFloodlightProviderService.class);  
			restApi = context.getServiceImpl(IRestApiService.class) ;  
		}  
	  
		@Override  
		public void startUp(FloodlightModuleContext context)  
				throws FloodlightModuleException {  
			FloodlightProvider.addOFMessageListener(OFType.PACKET_IN,this) ;  
		}  
	  
		@Override  
		public net.floodlightcontroller.core.IListener.Command receive(  
				IOFSwitch sw, OFMessage msg, FloodlightContext cntx) {  
			long count = PACKET_IN_COUNT.incrementAndGet() ;  
			log.info("The total count of packet-in Messages are" + count);  
			return Command.CONTINUE ;  
		}  
	}  
	
在floodlight中所有的模块都必须实现`IFloodlightModule`接口，而这里新添加的模块需要监听数据包，所以也需要实现`IOFMessageListener`接口。`IOFMessageListener`接口用于监听`Packet-in`消息，并记录消息递增数量，IPktinHistoryService接口是业务查询接口，提供Packet-in数据分组统计结果查询服务，IFloodLightModule接口标识该类是一个floodlight模块，继承该接口的类会在floodlight启动过程中以模块形式加载。该类文件可以随意添加到任何包中，为了方便管理和演示，这里将所有添加该模块所新建的文件全都放在了新建包net.floodlightcontroller.statics中。这个路劲在后面修改配置文件中仍然会使用到。

3.rest资源定义
在完成模块的定义之后，需要对rest服务资源进行定义，这里将类名定义为：`PktInHistoryResource`，继承抽象类`ServerResource`（S`erverResource`是Java轻量级REST框架Restlet的抽象类），并实现业务逻辑。该步主要功能是将Packet-in统计接口包装为REST资源便于后续资源绑定。

	package net.floodlightcontroller.statics;  
	  
	import java.util.HashMap;  
	import org.restlet.resource.Get;  
	import org.restlet.resource.ServerResource;  
	  
	/*  
	 *   
	 *@author yangshuai  
	 */   
	  
	public class PktInHistoryResource extends ServerResource{  
		@Get("json")  
		  
		public HashMap<String, String> retrieve(){  
			IPktinHistoryService pihr = (IPktinHistoryService) getContext()  
					.getAttributes().get(IPktinHistoryService.class.getCanonicalName());  
			long count = pihr.getPackINCount();  
			HashMap<String, String> resp = new HashMap<String, String>() ;  
			resp.put("Total", Long.toString(count)) ;  
			return resp;  
		}  
	} 

4.绑定url与rest资源
接着定义`PktInHistoryWebRoutable`类，将上步定义的`PktInHistoryResource`资源与访问路径绑定。该类中定义的路径包括外部获取该REST资源的基本路径和相对路径。

	package net.floodlightcontroller.statics;  
	  
	import net.floodlightcontroller.restserver.RestletRoutable;  
	  
	import org.restlet.Context;  
	import org.restlet.Restlet;  
	import org.restlet.routing.Router;  
	  
	/*  
	 *   
	 *@author yangshuai  
	 */   
	  
	public class PktInHistoryWebRoutable implements RestletRoutable{  
	  
		public Restlet getRestlet(Context context){  
			Router router =new Router(context) ;  
			router.attach("/pktinhistory/json", PktInHistoryResource.class) ;  
			return router ;  
		}  
		  
		public String basePath(){  
			return "/vm/statics" ;  
		}  
	}  	

5.资源发布 
资源绑定相应路径后需要在REST服务中发布，因此还需要在`PktinHistory`的s`tartUp`方法中注册`PktInHistoryWebRoutable`，表明有新的资源加入REST服务。

	@Override  
    public void init(FloodlightModuleContext context)  
            throws FloodlightModuleException {  
        FloodlightProvider = context.getServiceImpl(IFloodlightProviderService.class);  
        restApi = context.getServiceImpl(IRestApiService.class) ;  
    }  
	
6.定义完上述源码后还需要在配置文件中指定新增模块名，该配置文件为`resources/META-INF/services/net.FloodLight.core.module.IFloodLightModule`，这里就是添加`net.FloodLightcontroller.statics.PktinHistory`模块配置信息。该配置文件是FloodLight模块加载系统中加载模块类的依据，用于告知控制器要加载那些模块。 
![](/images/2015-01-23-floodlight-module/1.png) 
7.除上述配置外，还需要在`resources/floodlightdefault.properties`中的`floodlight.modules`配置参数后追加新增模块名（`net.FloodLight.controller.statics.PktinHistory` 注：这里就要根据添加的`PktinHistory `类的具体路径进行修改），表明该配置启动时必须加载。
![](/images/2015-01-23-floodlight-module/2.png) 

## 实验成果截图：

![](/images/2015-01-23-floodlight-module/3.png) 

## 问题：
在floodlight的显示界面上的监听端口为6633，在1.0以前的版本中，mininet连接到floodlight远程控制器时指定的端口号也是6633。但是在floodlight1.0版本的测试时，是使用6653端口连接上的。