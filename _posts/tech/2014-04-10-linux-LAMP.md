---
layout: post
title: LAMP配置web服务器(Ubuntu12.04LTS)
description: LAMP配置web服务器(Ubuntu12.04LTS)
category: Linux
tags:  LAMP
---

## 一、说明

LAMP就是Linux+Apache2+MySQL+PHP
只需要简单的配置就能配置一台属于自己的web服务器了

## 二、安装LAMP

### 1、安装MySQL

因为在ubuntu系统下，所以通过apt-get来安装软件

	$su //切换到root账户 
	#apt-get update //更新一下，否则安装apache时会发生错误
	#apt-get install mysql-server mysql-client
	
然后系统提示你输入两次mysql root账户的密码。

### 2、安装apche2

	#apt-get install apache2

安装完毕之后，打开浏览器输入：http://202.119.167.244

>注:这是我的ubuntu的IP地址，使用ifconfig命令查看自己的IP地址

此时会出现这个页面：
![](/images/2014-04-10-linux-LAMP/01.png)

Apache的默认文档根目录是在ubuntu上的/var/www目录 ，最初里面只有一个index.html这个文档是为了图操作测试用的。配置文件是/ etc/apache2/apache2.conf。配置存储在的子目录在/etc/apache2目录。

### 3、安装PHP

直接安装PHP5和apache的PHP模块

	#apt-get install php5 libapache2-mod-php5
	
安装完毕之后需要重启：
	
	#/etc/init.d/apache2 restart
 
这时会出现下图情况：
![](/images/2014-04-10-linux-LAMP/02.png)

>注:could notreliably determine the server’s fully quality domain name,useing 202.119.167.176 for serverName，但是只要最后显示[OK]就不影响后面的操作。

现在可以测试一下PHP是否安装成功并查看PHP详细信息：
因为apache默认的根目录在/var/www/目录下，所以在次目录下新建一个PHP文件，用来显示PHP详细信息。具体操作如下：

	#vim /var/www/info.php
	
info.php文件内容

	<?php
		  phpinfo() ;
	?>
 
现在打开浏览器，输入网址：http://202.119.167.224/info.php，进入如下页面：
![](/images/2014-04-10-linux-LAMP/03.png)

这个页面详细的显示了php的所有信息，包括一些加载的模块。
这个页面正常显示的话就说明你的PHP5已经成功安装并运行了。
 
下面要添加MySQL对PHP的支持：

	#apt-cache search php5
	
还安装需要安装一些其他的东西：

	#apt-get install php5-mysql php5-curl php5-gd php5-idn php-pear php5-imagick php5-imap php5-mcrypt php5-memcache php5-ming php5-ps php5-pspell php5-recode php5-snmp php5-sqlite php5-tidy php5-xmlrpc php5-xsl 
	
>建议右键复制粘贴
	
全部安装完毕之后刷新信息显示网页，就可以看到MySQL模块已经加载上去了：
![](/images/2014-04-10-linux-LAMP/04.png)

然后重启apache2服务：

	#/etc/init.d/apache restart
	
打开浏览器输入网址：http://202.119.167.224/phpmyadmin/，这是可能出现404错误：
如果出现了404错误只需要输入以下命令就ok了：
	
	#ln -s /etc/phpmyadmin/apache.conf  /etc/apache2/conf.d/phpmyadmin.conf
 
重载apache2：
	
	#sudo /etc/init.d/apache2 reload

这时再输入网址打开网页：
![](/images/2014-04-10-linux-LAMP/05.png)

>用户名是root密码是之前安装mysql是输入两次的密码！

登录成功！！！
![](/images/2014-04-10-linux-LAMP/06.png)

That’s all !