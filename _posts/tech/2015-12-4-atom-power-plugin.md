---
layout: post
title: 一个草鸡炫酷的编辑器，一个草鸡炫酷的插件
description: 一个草鸡炫酷的编辑器，一个草鸡炫酷的插件
category: Web
tags:  [Atom]
---

说起`编辑器到底哪家强？`，就跟说`哪个编程语言最好？`一样，虽说是毫无意义的话题，但总能让程序员吵个天翻地覆。今天分享一个极好的文本编辑器，以及一个草鸡炫酷的插件。
这些天偶然在微博上看到一款很炫酷的编辑器，于是便好好搜寻了一番。一开始我以为这是VIM某个插件实现的效果，后来终于找到了这个编辑器`Atom`。这个文本编辑器`你也可以叫它IDE`。

话不多说，先上一张效果图：
![](/images/2015-12-4-atom-power-plugin/1.gif) 

感觉是不是很带感，是不是一下子就有了来一发的冲动？
莫急，先copy一段介绍：

## 何为 ATOM

Atom 是专门为程序员推出的一个跨平台文本编辑器。具有简洁和直观的图形用户界面，并有很多有趣的特点：支持 CSS，HTML，JavaScript 等网页编程语言。它支持宏，自动完成分屏功能，集成了文件管理器。

## 为什么用 ATOM

* 开源 — 遵循 MIT 协议,代码托管在 Github 上。
* 多平台 — 支持 MAC/WIN/LINUX(支持源码编译安装,也提供二进制安装包)。
* 丰富的插件库 — 开源到现在一年了..社区的各种插件丰富起来了,且 Atom 的插件支持在线更新。
* 类 Sublime — 风格和 sublime text 极其相似,不管是风格还是操作上,快捷键上一些是通用的,应该借鉴
* 采用包管理技术 — 采用了 node.js 来访问文件系统和包管理。
* 强大的生命力 — 背靠 Github 社区,这对于 Atom 来说,可以注入源源不断的生命力。

下面是使用教程：

## 下载windows installer

下载地址`<a href="https://atom.io/">Atom官网`，ps：似乎需要翻墙。这个默认是会安装到C盘下面的，有强迫症的慎入。
![](/images/2015-12-4-atom-power-plugin/2.png)

## 安装主题

Atom官网的下载`<a href="https://atom.io/packages/">packages</a>`。
我这边安装的主题的下载地址是`<a href="https://atom.io/packages/activate-power-mode">activate-power-mode</a>`

拷贝到安装目录下的`.atom\packages\`目录下,或者直接`CD`到该目录下,使用git将`github`上的代码拉下来。并`cd`到该目录下执行：

	>apm install
	
显示`install done`之后打开Atom编辑器，任意打开一个文件，同时按下`ctrl+alt+r`，然后再同时按下`ctrl+alt+o`，开始感受这duangduang的效果吧：）

>实际上，图个新鲜，玩一会儿之后就觉得没什么意思了。。。





