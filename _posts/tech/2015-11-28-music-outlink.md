---
layout: post
title: 为博客添加音乐播放器
description: 为博客添加音乐播放器
category: Web
tags:  [网易云音乐外链播放器,jplayer]
---

博主平时写博客的时候总觉得有点单调无聊，心想：要是能来点激昂的音乐就好了。对啊！为什么不给自己的博客添加一个外链播放器呢？说干就干！在一番调查了解之后，决定用网易云音乐的外链播放器，或者html5网页播放器。
这里和大家一一分享这两种方式如何去实现。

## 网易音乐播放器外链

因为我依稀记得网易云音乐有这么一个功能，所以第一反映就是找到这个功能。看,就是这个功能：
![](/images/2015-11-28-music-outlink/1.png)

>这里还发生了一个小插曲：第一次点击生成外链播放器的时候，成功生成了外链代码。然后我又去其他网站逛了一圈回来之后，点击生成外链时弹出的对话框中写着`因为版权原因无法生成外链`。我去这是唱哪出啊？在一番折腾之后，发现原因：第二次访问的时候我开着shadowsocks，ip是香港的，非中国大陆的ip似乎是不给生成外链的。于是我又更换了不同的节点地点，美国、新加坡、日本都是不行的。也是有意思。

其实这种方式要做事情很简单，找到歌单，点击生成外链就可以了。
然而。。。
要是没有节外生枝我会特意写出来嘛？图样。
这种简单粗暴的方式并不是万能的，具体那些能用那些能用我也说不清，只是我在使用我自建的歌单生成外链的时候又被提示`因为版权原因无法生成外链`了。这个时候需要做的就是ctrl-s，将歌单页面保存下来。为什么保存下来？一会儿你就知道了。
这里先贴上生成外链的代码：

	<iframe class="recentcome box-shadow" frameborder="no" border="0" marginwidth="0" marginheight="0" width=402 height=450 src="http://music.163.com/outchain/player?type=0&id=112515886&auto=1&height=430"></iframe>

很简单的一行代码，这里需要注意的就是`src="http://music.163.com/outchain/player?type=0&id=112515886&auto=1&height=430"`中的`id=112515886`，这个id就是当前歌单所对应的id。
这时候之前保存下来的不能生成外链的页面就起到作用了，用文本编辑器打开`.html`文件,这一行被注释中的就是你需要的id了，替换掉上面代码中id吧，这样你就能各种自定义歌单了。
![](/images/2015-11-28-music-outlink/2.png)

## html5网页播放器
现在开源的成熟的网页在线播放器很多，这里我使用的是<a href="http://www.jplayer.cn/">`JPlayer`</a>，很简单易用的网页播放器工具。
`jPlayer`是一个`JavaScript`写的完全免费和开源(`MIT`)的`jQuery`多媒体库插件(现在也是一个`Zepto`插件)`jPlayer`可以让你迅速编写一个跨平台的支持音频和视频播放的网页。
首先你需要的是到官网下载`jplayer.min.js`和`Jplayer.swf`这两个文件是必不可少的，因为要自定义歌单，所以`jplayer.playlist.min.js`文件也需要。

>其实这个用起来很简单，参照官网文档很容易就可以实现，主要是自定义样式的时候会麻烦一点，这里我分享一个自己觉得不错的样式。ps:这个不是我写的，你们也应该能直接从网上搜索到的。我直接贴`js`和`css`文件了

`myMusicList.js`

	$(document).ready(function(){
	  var playlist = [{
		  title:"NiceHidden",
		  artist:"CuPlayer.com",
		  mp3:"http://music.163.com/outchain/player?type=0&id=112515886&auto=1&height=430",
		  poster: "images/1.jpg"
		},{
		  title:"Cro Magnon Man",
		  artist:"The Stark Palace",
		  mp3:"http://music.163.com/outchain/player?type=0&id=112515886&auto=1&height=430",
		  poster: "images/2.jpg"
		},{
		  title:"Bubble",
		  artist:"The Stark Palace",
		  mp3: "http://rm.sina.com.cn/wm/VZ2010050511043310440VK/music/MUSIC1005051622027270.mp3",
		  poster: "images/3.jpg"
	  }];

	  var cssSelector = {
		jPlayer: "#jquery_jplayer",
		cssSelectorAncestor: ".music-player"
	  };

	  var options = {
		swfPath: "Jplayer.swf",
		supplied: "ogv, m4v, oga, mp3"
	  };

	  var myPlaylist = new jPlayerPlaylist(cssSelector, playlist, options);
	});

`reset.css`

	html,body,div,span,applet,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,a,abbr,acronym,address,big,cite,code,del,dfn,em,img,ins,kbd,q,s,samp,small,strike,strong,sub,sup,tt,var,b,u,i,center,dl,dt,dd,ol,ul,li,fieldset,form,label,legend,table,caption,tbody,tfoot,thead,tr,th,td,article,aside,canvas,details,embed,figure,figcaption,footer,header,hgroup,menu,nav,output,ruby,section,summary,time,mark,audio,video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}body{line-height:1}ol,ul{list-style:none}blockquote,q{quotes:none}blockquote:before,blockquote:after,q:before,q:after{content:'';content:none}table{border-collapse:collapse;border-spacing:0}

`style.css`

	*, *:before, *:after {
	  -moz-box-sizing: border-box;
		   box-sizing: border-box;
	}

	html {
	  min-height: 100%;
	}

	body {
	  background: #eee url("../images/82fLDu4.jpg") no-repeat center;
	  background-size: cover;
	  font-family: "Open Sans", sans-serif;
	}

	.music-player {
	  position: relative;
	  width: 350px;
	  height: 290px;
	  margin: 150px auto;
	  box-shadow: 0 0 60px rgba(0, 0, 0, 0.8);
	  border-radius: 10px;
	  background: #222;
	  overflow: hidden;
	  z-index: 0;
	}
	.music-player img {
	  position: absolute;
	  top: 0px;
	  left: 0px;
	  bottom: 0px;
	  right: 0px;
	  z-index: -1;
	  display: block;
	  width: 100% !important;
	  height: 100% !important;
	  -webkit-filter: blur(2px);
			  filter: blur(2px);
	}
	.music-player .info {
	  width: 100%;
	  height: 100px;
	  background: #222;
	  background: rgba(0, 0, 0, 0.8);
	  text-align: center;
	  position: relative;
	}
	.music-player .info .jp-playlist li {
	  display: none;
	}
	.music-player .info .jp-playlist li a {
	  font-size: 30px;
	  font-weight: 300;
	  text-decoration: none;
	  color: #fff;
	  color: rgba(225, 225, 225, 0.4);
	}
	.music-player .info .jp-playlist li a span {
	  font-size: 14px;
	  display: block;
	  margin-top: 10px;
	}
	.music-player .info .jp-playlist li.jp-playlist-current {
	  display: block;
	}
	.music-player .info .jp-playlist li .jp-free-media, .music-player .info .jp-playlist li .jp-playlist-item-remove {
	  display: none;
	}
	.music-player .info .left, .music-player .info .right {
	  width: 25px;
	  position: absolute;
	  top: 30px;
	  left: 30px;
	}
	.music-player .info .right {
	  left: auto;
	  right: 30px;
	}
	.music-player .info [class^="icon-"] {
	  margin: 0 0 10px;
	}
	.music-player .info .center {
	  padding: 20px 0 0;
	}
	.music-player .progress, .music-player .volume-level {
	  width: 100%;
	  height: 5px;
	  display: block;
	  background: #000;
	  position: absolute;
	  bottom: 0px;
	  cursor: pointer;
	}
	.music-player .progress span, .music-player .volume-level span {
	  position: relative;
	  display: block;
	  background: #ed553b;
	  width: 0%;
	  height: 5px;
	}
	.music-player .progress span:after, .music-player .volume-level span:after {
	  position: absolute;
	  right: -5px;
	  top: -8px;
	  content: "";
	  width: 10px;
	  height: 22px;
	  background: url("../images/tsqwz1N.png") no-repeat center;
	}
	.music-player .controls {
	  text-align: center;
	  width: 100%;
	  height: 190px;
	  background: #982e4b;
	  background: rgba(152, 46, 75, 0.6);
	}
	.music-player .controls .current {
	  font-size: 48px;
	  color: #fff;
	  color: rgba(225, 225, 225, 0.4);
	  padding: 15px 0 20px;
	}
	.music-player .controls .play-controls a {
	  display: inline-block;
	  width: 35px;
	  height: 40px;
	  margin: 0 30px;
	}
	.music-player .controls .volume-level {
	  position: relative;
	  bottom: auto;
	  width: 200px;
	  height: 2px;
	  margin: 30px auto 0;
	  background: rgba(225, 225, 225, 0.3);
	}
	.music-player .controls .volume-level span {
	  height: 2px;
	}
	.music-player .controls .volume-level span:after {
	  right: -11px;
	  top: -8px;
	  width: 22px;
	  height: 22px;
	  background-image: url("../images/V5i67V2.png");
	}
	.music-player .controls .volume-level a {
	  position: absolute;
	  right: -32px;
	  top: -8px;
	  width: 22px;
	}
	.music-player .controls .volume-level a.icon-volume-down {
	  right: auto;
	  left: -25px;
	}

	[class^="icon-"] {
	  width: 18px;
	  height: 18px;
	  background: url("../images/E09T8tf.png") no-repeat center;
	  display: block;
	}

	.icon-shuffle {
	  background-image: url("../images/AQAxRxS.png");
	}
	.icon-heart {
	  background-image: url("../images/E09T8tf.png");
	}
	.icon-repeat {
	  background-image: url("../images/338F8MX.png");
	}
	.icon-share {
	  background-image: url("../images/PGIC6ME.png");
	}
	.icon-previous {
	  background-image: url("../images/LIqj0nr.png");
	}
	.icon-play {
	  background-image: url("../images/xlBv5aR.png");
	}
	.icon-pause {
	  background-image: url("../images/lIhwduj.png");
	}
	.icon-next {
	  background-image: url("../images/RIqj0nr.png");
	}
	.icon-volume-up {
	  background-image: url("../images/qqdoddi.png");
	}
	.icon-volume-down {
	  background-image: url("../images/3iirf2f.png");
	}

	.copyrights {
	  text-align: center;
	  text-transform: capitalize;
	  margin: 50px;
	  color: rgba(0, 0, 0, 0.6);
	}
	.copyrights a {
	  color: rgba(152, 46, 75, 0.9);
	  text-decoration: none;
	}

## 效果图
![](/images/2015-11-28-music-outlink/3.png)
![](/images/2015-11-28-music-outlink/4.png)
