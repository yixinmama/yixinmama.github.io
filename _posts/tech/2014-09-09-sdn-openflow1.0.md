---
layout: post
title: OpenFlow1.0协议解析
description: OpenFlow1.0协议解析
category: SDN
tags:  OpenFlow1.0
---

学习OpenFlow1.3协议、做相关实验时所思所学记录，欢迎小伙伴们批评指正。:)

## OpenFlow V1.0

## 1 OpenFlow消息

## 1.1 消息分类

Of1.0中定义的消息分为3类：Controller-to-switch,asynchronous和symmertric。

*1、controller-to-switch控制器主动向交换机发出
a) Features：用来获取交换机的详细信息
b) Configuration：用来配置OpenFlow交换机
c) Modify-State：修改交换机的状态（修改流表）
d) Read-Stats：读取交换机状态
e) Send-Packet：发送数据包
f) Barrier：阻塞消息
*2、Asynchronous异步消息由交换机主动发出
a) Packet-in：告知控制器交换机收到新的未知数据包
b) Flow-Removed：用来告知控制器交换机流表被删除
c) Port-Status：告知控制器交换机端口状态更新
d) ERROR告知控制器交换机发生错误
*3、Symmetric对称消息，用来建立和维护控制器与交换机之间的连接
a) Hello：用来建立OpenFlow连接
b) Echo：确认交换机与控制器之间的连接状态
c) Vendor：厂商自定义消息
 
Of1.0消息格式：of协议数据包由OpenFlow Header和OpenFlow Message两部分组成：
OpenFlow Header结构：
![](/images/2014-09-09-sdn-openflow1.0/1.png) 
而OpenFlow Message结构与具体的消息类型有关，of中的消息类型：
![](/images/2014-09-09-sdn-openflow1.0/2.png)  
三种类型的消息中对称消息的内容是不会变化的，因为对称消息只含有openflow Header，不含openflow Message部分。其他只有openflow Header部分的消息还有：OFPT_ERROR、OFPT_VENDOR（厂商自定义消息）、OFPT_BARRIER_REQUEST等。

## 1.2 消息详解

* HELLO
* FEATURE
![](/images/2014-09-09-sdn-openflow1.0/3.png) 
* Datapath：唯一标识交换机的48为编码；
* N_buffers：交换机中每次缓存数据包的最大数量；
* N_tables：交换机支持的最大流表数；
* Capabilities：交换机的一些详细信息的bitmap
![](/images/2014-09-09-sdn-openflow1.0/4.png) 
* Action：交换机支持的action类型的bitmap 
* ofp_phy_port ports：交换机物理端口信息
 
## 2 匹配

数据包的匹配通过匹配域的十二个字段实现，十二个字段分别对应了OSI分层中的一层到四层，具体如下：
![](/images/2014-09-09-sdn-openflow1.0/5.png)  
* 一层：交换机入端口（ingress Port）
* 二层：源MAC地址（Ether source）、目的MAC地址（Ether dst）、以太网类型（EnterType）、以太网标签（VLAN id）、VLAN优先级（VLAN priority）
* 三层：源IP（IP src）、目的IP（IP dst）、IP协议字段（IP proto）、IP服务类型（IP ToS bits）
* 四层：TCP/UDP源端口号（TCP/UDP src port）、TCP/UDP目的端口号（TCP/UDP dst port）
 
Of1.0中数据包匹配特征描述：
![](/images/2014-09-09-sdn-openflow1.0/6.png) 
其中除了一一对应的12字段相关的描述，还多了三条：wildcards、pad1[1]和pad2[2]
Pad1[1]和pad2[2]是填充字节，补齐64位。而wildcards是32位，对应如下：
![](/images/2014-09-09-sdn-openflow1.0/-1.png) 
上表中，第22-31位保留；除了源、目的IP的掩码，其他掩码位为0则是需要精确匹配，为1怎是忽略匹配项。源、目的IP的掩码都是6位，表示的是32bit的IP可以忽略匹配的长度，如一个源IP的掩码字段值为8（即wildcard为001000）则表示源IP字段的低8位可以忽略，高24位需要进行精确匹配。
Openflow协议中规定的进行匹配的十二个字段中有9个是可以可以修改，3个字段不能修改，不能修改的字段分别是：nw_proto、in_port、dl_type。而针对其他9个可修改字段的具体操作在下一章中年详细描述。
VLAN_ID虽然后16为，但是在ofv1.0中用0xfffff来表示无vlan_id，所以真正用于标识VLAN_ID的数据只有12位。

## 3 数据处理

Action头中包含动作类型（action type）和长度（len）字段。所有的操作定义中都会包含type和len字段。
Of1.0中对动作类型（action Type）的说明：
![](/images/2014-09-09-sdn-openflow1.0/7.png) 
上图中的OFPAT_OUTPUT、OFPAT_ENQUEUE为转发操作（action）；其他除了OFPAT_VENDOR以外都是转发操作。OFPAT_VENDOR为厂商自定义操作。
具体的action结构的定义都是type+len+value字段的结构:
![](/images/2014-09-09-sdn-openflow1.0/8.png) 
Of1.0协议中定义的action类型总共有13个，包括对9个可修改匹配字段的10种操作、对数据转发的2种操作和1个厂商自定的操作类型。
 
## 转发（Forward）

数据的转发操作有两种对应的操作类型：OUTPUT和ENQUEUE； 
OPPAT_OUTPUT类型的OUTPUT操作结构如下：
![](/images/2014-09-09-sdn-openflow1.0/9.png) 
包含了四个字段：类型（type）、长度（len）、输出端口（port）、最大长度（max_length）。
其中的max_length字段自由在交换机向控制器发送数据时才有意义，其他时候无意义。该字段定义了交换机发给控制器的数据的最大长度。控制器只需要从这截取的最大长度的数据中救能获得足够的信息。
而端口（port）字段指定转发动作的输出端口。这里的端口可以是交换机实际的物理端口，也可以是虚拟端口，如：

* ALL：将数据包从除了入端口以外的全部端口进行转发
* CONTROLLER：将数据包发给控制器
* LOCAL：将数据包发给交换机本地端口
* TABLE：将数据按照流表匹配条目处理
* IN_PORT：将数据包包从入端口转发出去
* NORMAL：按照普通的二层交换机流程处理
* FLOOD：将数据包从最小生成树使能端口进行转发（不含入端口）交换机也可以通过数据包的VLAN ID选择哪些端口泛洪。 

以上7中虚拟端口中，TABLE只有在很少的极特殊情况下才会使用。ALL与FLOOD都是一个泛洪操作，区别在于FLOOD需要确认交换机的端口是否支持FLOOD泛洪，ALL则不需要。
>疑问：LOCAL虚拟端口和交换机实际物理端口的区别？
 
OPPAT_EQUEUE类型的ENQUEUE操作的结构如下：
![](/images/2014-09-09-sdn-openflow1.0/10.png)  
这里的port需要和物理交换机实际端口对应；自然queue_id也需要和物理交换机实际端口的配置对应。这里可以通过配置不同的队列（如果物理交换机支持的话），来实现简单的带宽控制。
 
## 修改包头（Modify field）

Of1.0中定义了12个匹配字段，支持其中的9个匹配字段的修改动作：源MAC地址（Ether source）、目的MAC地址（Ether dst）、以太网标签（VLAN id）、VLAN优先级（VLAN priority）、源IP（IP src）、目的IP（IP dst）、IP服务类型（IP ToS bits）、TCP/UDP源端口号（TCP/UDP src port）、TCP/UDP目的端口号（TCP/UDP dst port）。
Of1.0中定义的修改包头域的action有：

* 2层：SET_VLAN_VID 修改VLAN标签
* 2层：SET_VLAN_PCP 修改VLAN优先级
* 2层：STRIP_VLAN 弹出VLAN标签
* 2层：SET_DL_SRC 修改源MAC地址
* 2层：SET_DL_DST 修改目的MAC地址
* 3层：SET_NW_SRC 修改源IP地址
* 3层：SET_NW_DST 修改目的IP地址
* 3层：SET_NW_TOS 修改IP服务类型字段
* 4层：SET_TP_SRC 修改源端口号
* 4层：SET_TP_DST 修改目的端口号
 
## 4 建立连接

1、say hello
当交换机连接到控制器的时候，交换机与控制器会互相发送Hello包，而hello消息中只包含OpenFlow Header，OpenFlow Header中的Version字段为发送方支持的最高版本的OpenFlow协议版本。如果两者协议版本兼容，则建立openflow连接，否则发送ERROR消息，断开连接。
2、features消息 
连接建立之后，控制器向交换机发送一个features Request消息查询交换机的特性，features request消息也只包含OpenFlow Header，交换机接受到该消息之后会返回一个features replay消息，这个消息就包含OpenFlow Header和Features Replay Message了。
3、echo消息
在连接建立之后交换机和控制器之间会定时互相发送echo消息以确定连接的有效性，如果在规定时间被未收到echo包，则会认为控制器与交换机之间的连接断开。
4、配置交换机属性
Of交换机中需要控制器配置的属性有两个flags和miss_send_len。Flags用来指示交换机如何处理IP分片数据包；miss_send_len用来只是当一个交换机无法处理数据，将数据上报给控制器时发送的最大字节数。与转发action中的output中定义的max_len字段一致。
5、Packet-in事件
Packet-in事件在以下两种情况下会被触发：
1.当交换机收到一个数据包后，并未与流表中匹配成功，那么交换机就会将数据封装在Packer-in消息中，发送给控制器处理。此时数据包会被缓存在交换机中等待处理。
*问题：这里是否要根据max_len截取数据包的最大长度？
2.交换机流表所指示的action列表中包含转发给控制器的动作（Output=Controller），此时数据不会被缓存在控制器中。
![](/images/2014-09-09-sdn-openflow1.0/11.png)   
其中：

* buffer_id是packet-in消息所携带的数据包在交换机中的缓存ID
* Total_len为data段的长度
* In_port数据包进入交换机的入端口号
* Reason为packet-in事件的产生原因
 
同时，从reason的消息格式也可以看出触发packet-in的两种情况：
![](/images/2014-09-09-sdn-openflow1.0/12.png)  
6、控制器配置流表（Flow-Mod消息）
Flow-Mod消息用开添加、删除、修改openflow交换机的消息；Flow-Mod消息共有5种类型：ADD、DEKETE、DELETE-STRICT、MODIFY、MODIFY_STRICT。
ADD类型消息用来添加一条新的流表项（flow entry）
DELETE类型消息用来删除所有符合一定条件的流表项
DELETE‐STRICT类型消息用来删除某一条指定的流表项
MODIFY类型消息用来修改所有符合一定条件的流表项
MODIFY‐STRICT类型息用来修改某一条指定的流表项
>注意，Flow-Mod消息对应修改的是流表中的流表项（flow entry）而不是整个流表（flow table）。Of1.0协议中并不支持多级流表操作。
![](/images/2014-09-09-sdn-openflow1.0/13.png)  
上图中：

* Match为流表的match域，也就是上文所说的匹配过程中的of_match。
* Cookie为控制器定义流表项标识符
* Command是flow-mod的类型，可以是ADD、DELETE、DELETE-STRICT、MODIFY、MODIFY-STRCT；
* Ldle_timeout是流表项的空闲超时时间；
* Hard_timeout是流表项的最大生存时间；
* Priority为流表项的优先级，交换优先匹配高优先级的流表项；
* Buffer_id为交换机中的缓冲区ID，flow-mod消息可以指定一个缓冲区的ID，该缓冲区的数据包会按照此flow-mod消息的action列处理。
* Out_port为删除流表的flow_mod消息提供的额外的匹配参数。
* Flags为flow-mod命令的一些标志位，可以用来指示流表删除后是否发送flow-removed消息，添加流表时是否检查流表重复项，添加的流表项是否为应急流表项。
![](/images/2014-09-09-sdn-openflow1.0/14.png)   
* 当OFPFF_SEND_FLOW_REM 被设置的时候，表项超时删除会触发一条表项删除的信息。
* 当 OFPFF_CHECK_OVERLAP 被设置的时候，交换机必须检查同优先级的表项之间是否有匹配范围的冲突。
* 当 OFPFF_EMERG_被设置的时候，交换机将表项当作紧急表项，只有当与控制器连接断的时候才启用。
* Actions为action的列表。
 
当packet-in消息发送的控制器后，控制器可以做出多种响应，其中就有flow-mod消息作为响应：交换机接收到数据包->交换机中没有该数据包的匹配流表项->交换机将数据包封装到packet-in消息中发往控制器并将该数据包缓存在本地->控制器接收到packet-in消息->发送flow-mod消息并将flow-mod中的buffer_id改为packetin中的buffer_id->控制器已向交换机写入一条与该数据包相关的流表项，并指定该数据包按照流表项做的action列表进行处理。
 
7、Packet-out
除了flow-mod消息可以作为packet-in消息的响应，packet-out也可以作为packet-in消息的响应。在网络中还存在多种数据包，有些类型的数据包出现的数量非常少（如：ARP，ICMP），对于这种出现频率较低的数据包，并没有必要都向交换机添加一条流表项来匹配处理。此时，控制器可以使用packet-out消息，告诉交换机某一个数据包该如何处理。
Packet-out的消息格式：
![](/images/2014-09-09-sdn-openflow1.0/15.png)  
上图中：

* buffer_id为交换机中缓存数据的buffer_id（同flow-mod）；特别注意的是当buffer_id为”-1”的时候，指定的缓冲区为packet-out消息的data段。
* In_port为packet-out消息提供额外的匹配信息，当packet-out的buffer_id= -1，并且action流表中指定了output=TABLE的动作，in_port将作为data段数据包的额外匹配信息进行流表查询。
* action_len指定了action列表的长度，用来区分actions和data段Data为一个缓冲区，可以存储一个以太网帧。
 
Packet-out消息的应用场景：

* 指定某一个数据包的处理方法
* 让交换机产生一个数据包并按照action流表处理。

典型应用：链路发现
控制器向一个交换机发送packet-out消息，buffer_id= -1，data段为某种特殊数据包，actions为从交换机的某个端口进行转发，如果发出这个数据包的端口另一端也连接一个openflow交换机，对端的交换机会产生一个packet-in消息将这个特殊的数据包包上交给控制器，从而控制器他侧到一条链路的存在（控制器实现链路发现，就是依靠packet-out消息）。
 
8、当控制器断电或者交换机与控制器之间的连接断开，则交换机会寻找备用控制器，当无法找到备用控制器时便会进入紧急模式（交换机初始化时也是在这个模式下），在紧急模式下，交换机默认将所有接受到的数据包丢弃。

## 5 配置交换机

控制器也可以通过of协议来配置和修改of交换机。
1、配置端口
除了上面提到的配置交换机的两个属性：ofp_switch_config和ofp_config_flags，控制器还能通过发送消息修改of交换机的一些其他行为。
控制器使用OFPFF_PORT_MOD消息来修改交换机物理端口的行为
![](/images/2014-09-09-sdn-openflow1.0/16.png)  

2、配置队列
其实，队列的配置不在of 协议考虑内。可以通过命令行或者其他协议来配置。控制器可以利用下面的结构来查询某个端口已经配置好的队列信息。
![](/images/2014-09-09-sdn-openflow1.0/17.png)  
交换机回复一个ofp_queue_get_config_reply 命令，其中包括配置好队列的一个列表：
![](/images/2014-09-09-sdn-openflow1.0/18.png)  
6 其他
1、厂商自定义
Openflow协议中规定了一些字段有厂商自己进行定义，这些字段是针对于of交换机而言。vendor 域为32 位长，如果首字节为0，则其他3 个字节定义为IEEE OUI。如果交换机无法理解一条生产商消息，它需要发送OFPT_ERROR 消息带有OFPBRC_BAD_VENDOR 错误代码和OFPET_BAD_REQUEST 错误代码。就of1.0协议而言，厂商可自定义的字段有两个，一个是action type，一个是对称消息。这些字段不为用户所用，不做讨论。
2、流表和流表项
流表（flow table）就是流表项的集合（flow entry），流表由一条或多条流表项按照优先级由高到低排列组成。一条流表项由包头域（of1.1及以后版本称之为匹配域）、计数器（保存与流表项相关的统计信息）、actions（一系列的action）组成.

>该文档尚未完全完善，后续还有进一步的增添和修改！