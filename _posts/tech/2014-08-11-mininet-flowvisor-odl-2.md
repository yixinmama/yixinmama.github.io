---
layout: post
title: mininet+FlowVisor+OpenDayLight环境搭建及实验一
description: mininet+FlowVisor+OpenDayLight环境搭建及实验一
category: SDN
tags:  [OpenDayLight,FlowVisor,mininet]
---

随着软件定义网络概念的提出，NFV也得到了极大的关注，围绕SDN/NFV的课题研究也是层数不穷。本实验基于mininet+ODL+flowvisor实现网络的虚妄隔离。

## 1.5 flowspaces深入

(1)命令格式：

	fvctl add-flowspace [options] <flowspace-name> <dpid> <priority> <match> <slice-perm>
	
![](/images/2014-08-11-mininet-flowvisor-odl-2/1.png) 
![](/images/2014-08-11-mininet-flowvisor-odl-2/2.png) 
在上文中添加的flowspace是这样的：
![](/images/2014-08-11-mininet-flowvisor-odl-2/3.png) 
上图中的8888是在config.json文件中自定义的flowvisor控制端口，add-flowspace后面跟上的5个参数的分别是：

* fs1：新创建的flowspace名，这个flowspace名是可以重名的。
* all：指定数据通路，这里的all指的是虚拟网络中所有的数据通路。以下图的的topo结构为例：
![](/images/2014-08-11-mininet-flowvisor-odl-2/4.png)

如果想要h1能够ping通h2，只需要指定S3为数据通路即可。而想要平通h1和h8则需要指定S3、S2、S1、S5、S7为该flowspace规则的数据通路。
* 100：指定该规则的优先权，值范围为：0-65535。
* any：指定该规则的匹配项，any代表匹配所有字段。（可以指定一个或多个字段）
* S1=7：指定slice对该flowspace规则拥有的权限。DELEGATE=1, READ=2, WRITE=4。值为这3个值的和,取值范围为{1,2,3,4,5,6,7}。

(2)组网实验
这里采用的是上文提到的划分两个切片，一个连接到odl控制器，一个连接到floodlight控制器。下面创建flowspace规则，只允许h1与h2、h7与h8互相ping通。

* 为连接到odl的s1创建sp1规则（分开创见两个，分别指定h1->h2和h2->h1），因为h1和h2连在同一个交换机上（拓扑图见图 30），所以数据通路只需要指定S3即可：
![](/images/2014-08-11-mininet-flowvisor-odl-2/5.png)
![](/images/2014-08-11-mininet-flowvisor-odl-2/6.png)
* 为连接到floodlight的s2创建创建sp2规则，同样的，h7和h8连接在同一交换机上，数据通路也只需要指定S7即可：
![](/images/2014-08-11-mininet-flowvisor-odl-2/7.png)
* 查看已添加的flowspace规则信息：
![](/images/2014-08-11-mininet-flowvisor-odl-2/8.png)
* 重启切片
这一步骤可以省略，但由于flowvisor并不稳定，有时新建的规则生效需要重启该规则对应的切片：
![](/images/2014-08-11-mininet-flowvisor-odl-2/9.png)
* pingall
在mininet中输入pingall命令查看连通情况：
![](/images/2014-08-11-mininet-flowvisor-odl-2/10.png)
如图所示，虚拟网络中只有h1和h2、h7和h8可以互相ping通，其他虚拟主机则不能。

(3)补充实验
这里补充一个h1与h8之间互相ping通的实验（拓扑图建图 30）。由于fvctl命令只支持一次指定一个数据通路，所以想要将S3、S2、S1、S5、S7都指定为数据通路，需要多次添加规则：
![](/images/2014-08-11-mininet-flowvisor-odl-2/11.png)
![](/images/2014-08-11-mininet-flowvisor-odl-2/12.png)
从图中可以看出，除了之前fs1和fs2中指定的h1和h2、h7和h8之间能互相ping同之外，sp3指定的h1和h8之间也能互相ping通了。