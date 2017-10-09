---
layout: post
title: OpenFlow1.3协议解析
description: OpenFlow1.3协议解析
category: SDN
tags:  OpenFlow1.3
---

学习OpenFlow1.3协议、做相关实验时所思所学记录，欢迎小伙伴们批评指正。:)

## 1 消息

## 1.1 消息定义

Of1.3中定义的消息同样也是分为3类：Controller-to-switch,asynchronous和symmertric。
1.controller-to-switch
Of1.3协议中定义的controller-to-switch消息类型与of1.0协议略有区别，增加了Role-Request类型和Asynchronous-Configuration类型，同时将send-packet类型修改为Packet-Out类型。

* Role_Request：控制器使用该类型的消息来设置可查询of通道的？Role（猜测是用来设置多控制器下主备关系），这在交换机连接到多控制器的情况下使用；
* Asynchronous-Configuration：控制器使该类型的消息添加额外的异步消息过滤，则交换机连接到多控制器的情况下使用；
* Packet-Out：控制器使用带类型的消息让数据包从交换机的指定端口转发出去，或者转发由Packet-In消息发送到控制器的数据，Packet-Out消息必须包含完整的数据或者该数据存在与交换机中的Buffer_ID。如果该类型的消息中的action-list为空，则将对应的数据包丢弃。

Of1.3中对hello、switch_feature消息的定义也与of1.0中稍有不同。

* Hello：在hello消息中增加了elemention字段，其中的bitmap中记录了设置支持的所有版本的信息：
![](/images/2015-10-27-sdn-openflow1.3/1.png) 
* Switch_feature：去掉了原先的action、ofp_phy_ports[0]字段，增加了auxiliary_id和reserved字段，其中auxiliary_id用于标识辅助连接，reserved是保留字段。

![](/images/2015-10-27-sdn-openflow1.3/2.png) 
![](/images/2015-10-27-sdn-openflow1.3/3.png) 

2.Asynchronous
Of1.3中对Asynchronous消息类型的定义与of1.0完全相同，详情参见OpenFlow V1.0 第一节。
3.Symmetric 
Of1.3中对Symmetric消息类型与of1.0略有不同，of1.3中将给厂商预留的Vendor类型消息换成了Symmetric类型。*Symmetric：为交换机提供额外的附加信息功能这个消息类是为未来版本预留。
1.3 消息详解
Packet-in消息
该消息在of1.3中的结构定义如下图，而与of1.0不同的是packet-in消息中原有的in_port字段被取消掉了，同时增加了match、table_id字段，消息长度从原来（of1.0）的20字节扩充到了32字节：
![](/images/2015-10-27-sdn-openflow1.3/4.png) 

* Buffer_id：指向交换机中不透明的数据的唯一标识；
* Total_len：消息的总长度；
* Reason：触发packet-in消息的原因，of1.3中定义了三种：NO_MATCH、ACTION和INVALID_TTL分别对应未匹配成功、动作指定（OUT_PUT动作中制定端口为CONTROLLER）和非法TTL值
![](/images/2015-10-27-sdn-openflow1.3/5.png)  
* Table_id：组表项ID，因为of1.3中增加了组动作、组表、组表项，这里的table_id指的是唯一标识组表项的id编号；

## 1.2 消息处理

## 2.匹配

Of1.3中的匹配域也就是of1.0中所说的包头域+入端口信息+[元数据]（由前级流表决定是否匹配元数据）。？元数据（metadata）在of1.3中的定义是在流表之间传递信息的可屏蔽的注册值。Of1.3中定义的match结构如下图：
![](/images/2015-10-27-sdn-openflow1.3/6.png)  

* Type：制定匹配类型，of1.3中定义了两种匹配类型：STANDERD和OXM，而STANDERD目前是弃用状态；
![](/images/2015-10-27-sdn-openflow1.3/7.png)  
* Length：of_match的长度；
* Oxm_fields：制定匹配类型的详细配置，该字段为4字节共32bit位，对应代表的意义如下图：
![](/images/2015-10-27-sdn-openflow1.3/7.png)  
![](/images/2015-10-27-sdn-openflow1.3/8.png)
 
## 2.1 流表

一个of交换机中一般有两个流水线（pipeline）of协议操作和普通以太网操作。一个能正常工作的of交换机中至少有一条流表，此时流水线也是最简单的。一条流水线可以包含一到多个流表，每个流表中有包含一到多条流表项；每条流表项中包含五个域（field）：匹配域，优先级，计数器，指令，超时定时器和cookie。
![](/images/2015-10-27-sdn-openflow1.3/9.png) 

* Match fields：匹配域，内含匹配字段，也就是of1.0中所说的包头域+入端口信息+[元数据]（由前级流表决定是否匹配元数据）；
* Priority：优先级，指定该流表项的优先级；
* Counters：计数器，存储与流表项相关的一些数据；
* Instructions：指令，并不是of1.0中的action，有转向其他流表操作；
* Timeout：最大时间计数或流有效时间 ；
* Cookie：由控制器选择的不透明数据值，控制器用来过滤流表统计数据、流表修改和流表删除；但不能在处理数据包时使用。

Of1.3中增加了（与of1.0相比）多级流表的概念，也就是说一条数据进行了匹配之后不一定像of1.0中一样直接执行动作（action）也有可能转到其他流表进一步的执行匹配，并不一定直接对数据执行动作（action）。
![](/images/2015-10-27-sdn-openflow1.3/10.png) 
数据包在of交换机中进行多级流表匹配的流程图
![](/images/2015-10-27-sdn-openflow1.3/11.png)  
数据包在某个具体的流表中进行匹配的流程图
在上两图所示情况中，Openflow交换机中的流表（多流表场景）会从0开始按序号排列（应该按照优先级从高到低排列，尚不确定），交换机总是从第一个流表开始按序号执行数据包的匹配。数据包首先会被流表0的流表项开始匹配，后续的流表允许使用前级流表的匹配结果进行进一步的匹配。
当一条数据在某个流表中时，数据包会依次与该流表中的流表项进行匹配，当匹配成功之后会出现两种可能：一种是直接执行流表项中的动作（action），另外一种是转到另外一个流表中（使用GOTO指令）进行匹配。当流表项的操作不是直接执行动作而是指向另一个流表时，流表项指向的流表的需要必须比该流表项所在的流表的序号大。也就是说，在流水线中，数据只能向后传递，不能回头。显然，交换机中序号最大（最后一个）的流表中不可能执行GOTO指令的。需要注意的是流表项指定转向的另一个流表并不一定就是与本身所在流表序号相邻的流表，可以是序号相隔很远的其他下级流表。
当一条数据在某个流表中并未与流表项匹配成功，这就是一个table-miss。根据流表的配置来决定如何处理出现table-miss的数据包（以下简称table-miss数据包）。流表中的table-miss流表项指定如何处理未匹配成功的数据包。对失配数据包的处理可以是：丢弃、传到另外一个流表或者通过packet-in消息传给控制器。
每个流表都必须支持table-miss流表项（必须支持但不必须有该流表项）来处理table-miss数据包。Table-miss流表项指定了如何处理table-miss数据包，如：发送给控制器、丢弃、传到下级流表等。Table-miss流表项中定义了匹配域和优先级，它的掩码设置为通配（任何字段都能直接匹配成功）并且优先级为最低（0）。Table-miss流表的特征（feature）与其他流表项有一定的差异，但它和其他流表项也有很多相似点：流表中table-miss流表项是默认不存在的；控制器可以随时添加或删除该流表项；也会超时过期。如果table-miss流表项的指令为通过packet-in消息转发到控制器，那么packet-in消息中的reason字段必须确定为table-miss。
![](/images/2015-10-27-sdn-openflow1.3/12.png) 

## 2.2 流表匹配

一条流表项必须明确定义其匹配域和优先权，在流表中这两个域确定一个唯一的流表项。
![](/images/2015-10-27-sdn-openflow1.3/13.png) 
数据通过交换机的详细流程
如上图所示，当交换机收到一个数据包的时候，交换机就会从第一个（编号为0）流表开始和流表项进行匹配，如果匹配成功，则更新计数器并执行流表项中的指令。流表项中的指令会产三种不同的操作：更新动作集（action set）、修改包头域/更新匹配字段、更新元数据。如果该流表项还有GOTO指令指向了某一其他流表，则执行完本次指令的数据包以及动作集、元数据等信息转到下级流表中进一步匹配，若未指向另一流表则执行动作集，此时流水线处理结束。如果在第一个流表中并未匹配成功，则查找该流表中是否添加了miss-table流表项，如果存在miss-table流表项，则执行miss-table流表项中的指令，如：丢弃、传到另外一个流表或者通过packet-in消息传给控制器。如果在流表中并未匹配成功且该流表中不存在miss-table流表项，那么交换机将会丢弃该数据。
当数据与流表项进行匹配的时候，匹配域包括数据包的包头字段+入端口+元数据信息。这里需要注意的是元数据必须在前级流表中指定，也就是说第一个流表中是不会对元数据进行匹配的。而前级流表的action中有修改数据包包头的操作会影响后级流表对数据的匹配。
？如果有多个需要匹配流表项的优先级相同，那么选择哪一个流表项进行匹配是没有明确定义的，这种情况只有在没有设置flow-mod消息的OFPFF_CHECK_OVERLAP位字段并且添加了多个重叠（overlap）流表项才会出现。

## 2.3 流表项删除

流表项的删除既可以通过交换机的超时删除，也可以通过控制器发送删除请求实现。交换机的流超时机制通过在流表项中设置idle_time（空闲超时）和hard_timeout（硬超时）。Idle_time如果设置为非零值，那么当该流表在idle_time中设置的时间内没有数据包与之匹配，则该流表项超时被交换机删除；hard_time如果设置为非0值，那么当该条流表交换机中的时间超过hard_time中设置的值，则该流表超时被交换机删除。
控制器也能主动向交换机发送流表修改消息（flow-mod消息），通过设置flow-mod消息中的command字段为OFPFC_DELETE_STRICT或OFPFC_DELETE来删除流表项。
![](/images/2015-10-27-sdn-openflow1.3/14.png) 
这里有一点需要注意的就是当流表项被删除时（不管是如何删除的），交换机都会检查该流表项的OFPFF_SEND_FLOW_REM字段的设置，如果标志被设置，则当流表项被删除时，交换机会向控制器发送一个流移除的消息，这些设置与of1.0中一致。
![](/images/2015-10-27-sdn-openflow1.3/15.png) 

## 2.4 组表

组表也是流表的一种，有一到多个流表项组成，流表项通过指向不同的组来为of协议提供额外的转发方式（如：select和all）。组表项结构如下：
![](/images/2015-10-27-sdn-openflow1.3/16.png) 

* Group identifier：组编号，一个32位的无符号数，唯一标志该组表项；
* Group type：组类型，指定组类型：all、required、[select]和[fast failover]；
* Counters：计数器，当使用该组表项时更新；
* Action buckets：动作桶，包含一系列有序排列的动作以及执行该动作的相关参数。
 
2.4.1 组类型
组类型有四种select和all，其中all和indirect是交换机必须支持的类型，而select和fast failover是可选的。

* All：依次执行动作桶中的所有动作，这种类型常被用来执行广播和多播，组中的每个动作桶都会复制一份数据包。每个动作桶独立处理一份数据。如果动作桶将数据指向该数据包的入端口，那么该数据包会被丢弃。如果？控制器（controller writer）指定将数据从该数据的入端口转发出去，则该组必须包含一个指定输出动作指向OFPP_IN_PORT保留端口的动作桶。
* Select：执行组中的某一个动作桶中的动作，数据包只被组中的某一个动作桶处理。所有的选择算法的配置和状态都是of协议中没有的。这些选择算法可以实现负载均衡。当某个select类型的组表项的动作桶的指定的端口出现故障，交换机会将数据从其他正常的端口转发出去，而不是将数据包丢弃。
* Indirect：执行一个已在组中定义的动作桶，这个组中只有一个动作桶。Allows multiple flow entries or groups to point to a common group identier,supporting faster, more efficient convergence (e.g. next hops for IP forwarding). This group type is effectively identical to an all group with one bucket。
* Fast failover: Execute the first live bucket. Each action bucket is associated with a specific port and/or group that controls its liveness. The buckets are evaluated in the order defined by the group, and the first bucket which is associated with a live port/group is selected.This group type enables the switch to change forwarding without requiring a round trip to the controller. If no buckets are live, packets are dropped. This group type must implement a liveness mechanism 。

2.5 计量表
 计量表定义了每条流的由一个到多个计量表项组成
2.5.1 计量带
![](/images/2015-10-27-sdn-openflow1.3/17.png)
2.6 计数器
 
## 3 指令

当数据包与流表项匹配成功之后便会执行流表项中包含的指令集，这些指令可能会修改数据包的包头、动作集或者流水线进程。
Of1.3中规定了6种指令类型，其中Write-Action action(s)和GOTO-Table next-table-id是交换机必须支持的指令类型，而Meter meter_id、Apply-Actions action(s)、Clear-Actions和Write-Metadata metadata / mask指令类型交换机不一定支持。

* Write-Action action(s)：将指定动作写入到当前动作集中。如果当前动作集中已经存在需要写入的指定动作的类型，那么就会覆盖原有的动作；如果没有，那么就会添加到动作集中；
* GOTO-Table next-table-id：指示在流水线中的下级流表，参数table-id必须大于当前流表的table-id，而流水线最后的流表不能包含这个指令；
* Meter meter_id：将数据包指向指定的计量表，通过计量表处理的数据大多都是被丢弃（实际处理结果根据计量表的配置和状态）；
* Apply-Actions action(s)：使指定的动作立即生效，但动作集不做任何改变。这条指令常被用来执行同种动作类型的多次操作，需要立即执行的动作（actions）以action list的形式存在；
* Clear-Actions：立即清楚动作急中的所有动作；
* Write-Metadata metadata / mask：将可屏蔽的元数据（meta data）写入元数据域（字段）。由掩码指定修改哪一位元数据值（即new metadata = old_metadata & ~mask | value & mask）

需要注意的是执行指令集中的指令时，有一定的执行顺序即：Meter meter_id指令必须在Apply-Actions action(s)指令之前执行；Clear-Actions指令必须在Write-Action action(s)指令之前执行；GOTO-Table next-table-id指令必须在最后执行。当交换机不支持流表项中的指令时，会返回一个ofp_error_msg。

## 4 动作

Of1.3中的动作的定义与of1.0大致相同，并在其基础之上增加了新的动作，如group。

## 4.1 动作集

动作集默认为空，匹配成功的流表项可以通过指令修改动作集。当匹配成功的流表项的指令为指向下级流表，那么指令集就会在这两个流表之间传递。如果匹配成功的流表项中并没有Goto-stable的指令，那么动作集中的动作将全部依次执行。
执行动作集中的动作时，需要按照一定的次序，这个顺序是of协议规定的，动作被写入动作集的先后顺序无关。如果动作集中含有组动作，组表中的动作桶中的动作也是按照这个顺序执行。当使用Apply-Action指令立即执行动作列表中的动作时，交换机支持任意的动作执行顺序。Of1.3中定义的动作执行顺序如下：
1.copy TTL inwards：？向数据包中拷贝TTL值
2.POP：所有数据包的弹出操作标签动作
3.Push-MPLS：为数据包打上MPLS标签
4.Push-PBB：为数据包打上PBB标签
5.Push-VLAN：为数据包打上VLAN标签
6.Copy TTL outwards：？从数据包中向外拷贝TTL值
7.Decrement TTL：数据包中的TTL值递减
8.Set：所有设置字段值的动作
9.QoS：所有Qos的动作，如数据包的set_queue动作
10.Group：如果指定了组操作，所有组动作通中的动作
11.Output：如果没有指定组动作，从输出动作中指定的端口转发数据包
输出动作总是在最后执行，如果当动作集中既定义了组动作也定义了输出动作，那么会先执行组动作。可以动作桶中指向另外一个组。

## 4.2 动作列表

Apply-Action指令个Packet-out消息都包含动作列表，而动作列表的语法和of1.0中定义是一样的。动作列表中的动作是立即执行的，执行顺序也是按照4.1中所定义的顺序执行。而执行action的效果是累计的，也就是说当action list中有两个添加VLAN头的动作，那么就会向数据表添加两次VLAN包头。如果action list中存在输出动作，那么数据包的一个当前状态的拷贝就会从指定端口转发出去。如果action list中中存在组动作，那么数据包的一个当前状态拷贝就会转到组动作桶中执行动作。
执行完Apply-Action指令中的action list，流水线会对执行动作修改后的数据进行下一步操作。注意：执行完action list中的动作之后，动作集中的动作是没有变化的。
4.3 动作（actions）
Of交换机并不一定支持所有的动作类型（action type），控制器会查询交换机支持的动作类型。Of1.3中定义了7种动作类型，其中

* Output：输出动作，将数据包从指定的openflow端口转发。Of交换机必须支持转发到物理端口、交换机定义的逻辑端口和必须支持的保留端口。
* Set-Queue：为数据包设置queue id编号，当执行输出动作，将数据包从指定的端口进行转发时，交换机会根据queue id来选择通过交换机端口的哪个queue执行转发，这也是基本的QoS支持；
* Drop：of1.3协议中并没有明确指定丢弃动作，相反的，如果某个数据包的行动集中没有指定输出动作，那么数据包将会被丢弃。这中情况会出现在流水线中的指令集为空或动作桶为空，或者在执行了Clear-Actions指令之后时；
* Group：用指定组处理数据包，而具体的操作要根据组类型决定；
* Push-Tag/Pop-Tag：交换机支持如下图中tag的添加（push）和弹出（pop），新增加的tag包头增加插在数据包的最外层且同一类型的包头也可以累加。当动作集（action set）中存在多个添加tag的动作时，执行动作的顺序是：MPLS->PBB->VLAN，当动作列表（action list）中存在多个添加ta动作时执行顺序4.1中动作集中动作执行的顺序：
![](/images/2015-10-27-sdn-openflow1.3/19.png)
* Set-Field：多个Set-Field动作有该动作包含的类型字段和被修改的数据包中对应包头字段的值。使用Set-Field动作修改多个包头字段大大提高了OpenFlow的实际作用；
* Change-TTL：有多个修改数据包中IPv4 TTL、IPv6 Hop Limit或MPLS TTL的Change-TTL类型的动作，
![](/images/2015-10-27-sdn-openflow1.3/20.png)

Of交换机会检查无效的IP TTL或MPLS TTL值并拒绝，虽然交换机并不会对所有的数据包进行无效检查，但是每次对数据包执行递减TTL值动作时，交换机都会进行无效TTL值检查。
>注意：所有下图中的字段值，当执行一个push动作时，会从已存在的外层包头中拷贝到新添加（push）的外层包头。而如果新添加的包头中不含下图中字段那么该字段会被设置为0。无法通过Set-Field动作修改的字段会被初始化成协议默认值。
![](/images/2015-10-27-sdn-openflow1.3/21.png) 

## 5 of交换机

在of v1.3中of交换机的标准端口必须支持三种端口：物理端口、逻辑端口和LOCAL保留端口（其他保留端口不属于of交换机标准端口）；注意，并不是所有的of交换机都支持LOCAL保留端口。这些标准端口都可以被用作入端口和出端口。标准端口都有各自的端口计数器。

## 5.1 物理端口

物理端口指的是交换机定义的端口，与交换机的物理端口一一对应。由交换机硬件虚拟化的of交换机的物理端口可以代表一个交换机硬件接口对应的虚拟切片。

## 5.2逻辑端口

逻辑端口也是交换机定义的端口，但是和物理端口不同的是逻辑端口并不和交换机的硬件接口一一对应。逻辑端口是交换机定义的更高层的抽象概念，可能使用到非OpenFlow协议中定义的转发方式（如环回，隧道，链路汇聚组）。逻辑端口和物理端口实际的唯一本质区别就是逻辑端口的数据包中必须有一个Tunnel-ID的元数据，并且当一个逻辑端口接受到一个数据包并发送到控制器时，逻辑端口和底层的物理端口都要报告给控制器。

## 5.3 保留端口

保留端口指定了通用的转发操作，如：发给控制器、泛洪或者使用非OpenFlow定义的转发方式等。交换机并不需要支持所有的保留端口，但必须支持以下的几个保留端口：ALL、Required、TABLE、IN PORT、ANY，可选支持端口为：LOCAL、NORMAL、FLOOD。这些端口的具体定义与of1.0中基本一致，详细情况可参见上文openflow V1.0 第3节。所有的保留端口中，有些既能作为入端口（ingress port），又能作为输出端口（output），但有些端口不能。
只能作为输出端口的保留端口：ALL、IN_PORT、NORMAL、FLOOD
既能作为入端口又能作为输出端口：CONTROLLER、LOCAL
既不能作为入端口又不能作为输出端口：ANY

## 6 其他

## 6.1 OpenFlow Channel

OpenFlow Channel是控制器与交换机连接的接口，控制器通过这个接口配置和控制交换机，接收来自交换机的事件，向控制器发送数据包。Of协议通道经常会使用TLS加密，但也可以直接通过tcp传输，这里和of1.0协议中的规定一致。

## 7 与openflow v1.0的主要区别

![](/images/2015-10-27-sdn-openflow1.3/22.png)

## OpenFlow V1.3抓包实验

实践出真知，对of1.3消息进行抓包实验是最好的学习理解of协议的办法。
环境
控制器：floodlight plus
交换机：ovs2.0（mininet中自带）
网络拓扑和主机：mininet2.1虚拟
Mininet默认只支持of1.0，需要修改配置文件才能实现of1.3的通信
修改/usr/local/lib/python2.7/dist-packages/mininet-2.1.0- py2.7.egg/mininet/node.py文件。
第1步：在OVSSwitch类中的初始化函数最后中添加以下红框内的部分：
![](/images/2015-10-27-sdn-openflow1.3/23.png)
第二步：在OVSSwitch类中的start函数中添加以下部分，同时注意图中箭头位置需要添加空格建：
![](/images/2015-10-27-sdn-openflow1.3/24.png)
第三步：验证是否修改成功：
在switch属性中添加protocols参数用以指定OpenFlow协议版本：

	# sudo mn --topo single,3  --controller remote,ip=[controller IP] --switch ovsk, protocols=OpenFlow10
	# sudo mn --topo single,3  --controller remote,ip=[controller IP]--switch ovsk, protocols=OpenFlow13

使用以下指令查看不同OpenFlow版本的OVS交换机信息。

	#ovs-ofctl -O OpenFlow10 show s1
	#ovs-ofctl -O OpenFlow13 show s1
	
如果修改成功了，则出现如下画面：
![](/images/2015-10-27-sdn-openflow1.3/25.png)
1 消息抓包分析
对of协议中定义的消息进行一一抓包实验，抓包工具是wireshark
1.1 HELLO消息
之前我一直以为控制器的OFP_FEATURE_REQUEST消息是在互相say Hello成功（即版本协商成功之后），建立了连接后发送，在抓包实验中，可以清晰的看到实际上在控制器发送了Hello之后就立即再发送一个OFP_FEATURE_REQUEST消息，而如果控制器与交换机的版本协商不成功，话断开连接，重新发送HELL消息，一直循环。下图中ip192.168.1.79对应控制器，192.168.119.137对应控制器。
![](/images/2015-10-27-sdn-openflow1.3/26.png)
交换机首先向控制器发送了一个HELLO消息，如of1.0协议中所描述，HELLO消息只含of消息包头（of_header），包括版本、类型和长度三个字段，没有of_message部分：
![](/images/2015-10-27-sdn-openflow1.3/27.png)
而控制器是支持of1.3协议的，所以发送的HELLO消息包含元素字段，该字段中包含了控制器支持的所有版本的信息。
![](/images/2015-10-27-sdn-openflow1.3/28.png)
Of1.3协议中定义的Element结构如下：
![](/images/2015-10-27-sdn-openflow1.3/29.png)
其中bitmap指定了设备支持的协议版本，并用来进行版本协商。Bitmap字段的数值取决于设备支持的最高协议版本：ofp_versions0到31在第一bitmap数组中，OFP版本32〜63在第二个bitmap数组中，依次类推。
例如，一个设备只支持1.0（OFP_Version=0x01）和1.3版（OFP_Version=0x04），第一个bitmap数组将被设置为0x00000012。
反过来说，0x00000012的最后两位写成二进制就是 0001 0010bitmap的最低位是无效的的，也就是说从次低位开始向左计数，0001 0010就是第一位和第四位被置1，也就是对应of协议的0x10和0x40版本，也就是说该设备支持of1.0和of1.3两个版本。
1.2 OFP_FEATURE_*消息
在控制器向交换机发送完带自身版本信息之后的，控制器会立即发送OFP_FEATURE_REQUEST消息，而不会等待版本协商的结果。如果版本协商成功，使用的控制器支持的最高版本，那么控制器会等待交换机的OFP_FEATURE_REPLAY消息；如果版本协商结果是使用控制器所支持的最低版本，那么控制器会重新发送一个携带最低版本信息的OFP_FEATURE_REQUEST消息，该消息是只有of_header没有of_message的。
![](/images/2015-10-27-sdn-openflow1.3/30.png)
交换机接收到OFP_FEATURE_REQUEST消息之后，便会向控制器返回一个OFP_FEATURE_REPLAY消息，of1.3协议中的定义与wireshark抓到的数据包内容一致：
![](/images/2015-10-27-sdn-openflow1.3/31.png)
![](/images/2015-10-27-sdn-openflow1.3/32.png)
>注意：OFP_FEATURE_REPLAY消息中的DPID是用来唯一标识交换机的48位编号，其中低32位为交换机的MAC地址，高16为of协议实现设备自行定义的。
1.3 *_CONFIG_*消息
控制器获取了交换机的特征信息之后，会向设置交换机的部分属性，交换机主要有两个属性需要设置，详情参见OpenFlow V1.0第四节第4小段，这里实验结果与协议定义一致：
![](/images/2015-10-27-sdn-openflow1.3/-1.png)
![](/images/2015-10-27-sdn-openflow1.3/-2.png)
为了确保配置项已经被写入交换机，控制器会在发送了SET_CONFIG消息之后立即发送一个BARRIER_REQUEST消息，这个消息的作用就是让交换机执行完这个消息之前的所有命令再执行此消息之后的请求，确保交换机的flags和miss send length属性设置成功。当然是有BARRIER_REPLAY消息的。
![](/images/2015-10-27-sdn-openflow1.3/33.png) 
而SET_CONFIG消息是没有应答消息的，控制器在设置完交换机属性之后会发送GET_CONFIG_REQUEST消息查询交换机的属性：
![](/images/2015-10-27-sdn-openflow1.3/34.png)
这个消息也是只有of_header的。交换机接收到此消息之会返回一个GET_CONFIG_REPLAY消息：
![](/images/2015-10-27-sdn-openflow1.3/35.png)
这个消息的of_message中携带了交换机的属性值。
问题：为什么次数据包中有三个消息合并在一个？
![](/images/2015-10-27-sdn-openflow1.3/36.png)
![](/images/2015-10-27-sdn-openflow1.3/37.png)
1.4 MULTIPART_*消息
这里抓到两组MULTIPART_*消息，分别双击查看：
![](/images/2015-10-27-sdn-openflow1.3/38.png)
第一组：Of1.3协议中将switch_feature消息中的ofp_phy_port[]字段去掉了，那控制器如何获得交换机的端口信息呢？就是通过这个MULTIPART消息，OPPT_PORT_DESC类型的消息就是用来传递端口信息的，
![](/images/2015-10-27-sdn-openflow1.3/39.png) 
![](/images/2015-10-27-sdn-openflow1.3/40.png)
![](/images/2015-10-27-sdn-openflow1.3/41.png)
第二组：OFPMP_DESC类型描述了交换机的一些额外详信息，如下图中红框内容所示：
![](/images/2015-10-27-sdn-openflow1.3/42.png) 
![](/images/2015-10-27-sdn-openflow1.3/43.png)
这也与协议中描述的一致：
![](/images/2015-10-27-sdn-openflow1.3/44.png)
![](/images/2015-10-27-sdn-openflow1.3/45.png)
1.5 Experimenter消息
Experimenter是自定义的一种对称消息，因为这里并没有进行自定义设置，所以交换机无法识别，返回ERROR消息：
![](/images/2015-10-27-sdn-openflow1.3/46.png) 
1.6 packet-out消息
再上述的交互都完成之后，控制器开始对网络进行链路探测，在of1.0协议中已经讲过，负责of网络中链路探测的是LLDP数据包，该数据包封装在packet-out数据包中进行转发。
![](/images/2015-10-27-sdn-openflow1.3/47.png)
![](/images/2015-10-27-sdn-openflow1.3/48.png)
从上图中不难看出内部封装的数据类型是LLDP数据包
问题：该数据包的入端口为ANY，但是ANY不能作为入端口也不能作为输出端口：
![](/images/2015-10-27-sdn-openflow1.3/49.png)
1.7 packet-in消息
这里我使用mininet的pingall命令让h1、h2、h3之间互相执行ping命令，得到了packet-in和packet-out数据包，这里的packet-out消息是由packet-in消息触发的，但是并不一定所有的packet-in消息都会触发packet-out消息，也有可能触发flow-mod消息等情况。
当主机之间互相发出ping数据包的时候，因为mininet虚拟的交换机（ovs）是刚初始化的，也就是说交换机内部没有任何转发表（流表）。此时交换机接受到ping数据包的时候不知道如何处理，将数据包封装入packet-in消息并发送给控制器，控制器接受到packet-in消息之后会根据消息中封装的数据进行分析，决定如何处理。下图中可以看到当交换机不知如何处理数据包并封装转发给控制器时，packet-in消息的reason字段为OFPR_NO_MATCH，封装的数据（data字段）中也可以清晰的看到数据包的类型是ICMP，源、目的ip地址也是mininet虚拟主机的地址；注意，其中的BUFFER ID字段存放的数据包在交换机中缓存的地址，因为交换机在将数据封装入packet-in消息的时候并不一定将整个数据完全封装在消息中而是根据配置截取数据包的一部分（根据miss_send_len字段决定，也有可能是全部，取决于控制器对交换机的配置）发送到控制器，同时交换机本身也会缓存一份完整的数据在本地，当控制器分析完 数据之后，向交换机返回packet-out或者flow-mod消息时处理的数据实际上就是交换机本地缓存的数据，控制器会在消息中制定数据在控制器中BUFFER ID：
![](/images/2015-10-27-sdn-openflow1.3/50.png)
与of1.3协议中的描述一致：
![](/images/2015-10-27-sdn-openflow1.3/51.png)
 
## 杂记：

1.流表结构，of1.0中分为包头域、计数器和动作，of1.3中改为匹配域，优先级，计数器，指令，超时定时器和cookie。of1.0中packet并没有多流表场景，一条数据进行匹配之后，就立即执行动作，及action对数据进行处理（drop或转发等）。而1.3中将“动作”改为了“指令”，一条数据进行了匹配之后也有可能转到其他流表进一步的执行匹配，并不一定直接对数据进行动作，所以“动作”改为“指令”更为确切。
2.流表中的数据包处理方法是一个动作列表（action list），动作列表就是各种action的组合。
3.Of1.3增加多级流表
4.Of1.3增加了组表
5.Of1.3增加了Meter
6.Of1.3修改了数据包特征匹配的描述方法（match方法）
7.Of1.3增加了数据包处理的动作类型