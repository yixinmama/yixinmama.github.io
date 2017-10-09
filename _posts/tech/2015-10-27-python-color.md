---
layout: post
title: 从零开始学python——颜色的16进制于RGB之间的转换
description: 从零开始学python——颜色的16进制于RGB之间的转换
category: Python
tags:  Python
---

在学习openstack的时候，发现openstack是python开发的；学习mininet自定义拓扑，发现mininet是python开发的；看看ryu，还是python开发的……于是心中升起了自学python的想法。这是第一次动手写了个python的小程序，功能只是将输入的十六进制字符串转换成RGB格式输出，或者将RGB格式的输入转换成对应16进制输出。很简单的小功能，也让我费了一番功夫，因为每次调用函数，我都的去查怎么去写，返回值是什么。ps这个小程序的并没有很严格输入校验，随便乱输入一些字符、数字是会报错的，哈哈XD！
同时，近来也疯狂迷恋上一句话：Talk is cheap , show me the code !


	#colorValue.py  
	#coding=utf-8  
	import re  
	import string   
	def toRgb(tmp):  
		opt = re.findall(r'(.{2})',tmp) #将字符串两两分割  
		strs = ""                       #用以存放最后结果  
		for i in range (0, len(opt)):   #for循环，遍历分割后的字符串列表  
			strs += str(int(opt[i], 16)) + ","  #将结果拼接成12，12，12格式  
		print("转换后的RGB数值为：")  
		print(strs[0:-1])               #输出最后结果，末尾的","不打印  
		  
	def toHex(tmp) :  
		rgb = tmp.split(",")  
		strs = "#"  
		for j in range (0, len(rgb)):  
			num = string.atoi(rgb[j])  
			strs += str(hex(num))[-2:]  #每次转换之后只取0x7b的后两位，拼接到strs中  
		print("转换后的16进制值为：")  
		print(strs)   
			  
	def main():  
		inColor = raw_input("输入颜色值")  
		if (len(inColor) <= 11):     
			if(inColor.index(",") >= 0):  
				tmp = inColor  
				toHex(tmp)  
			elif(inColor[0] == "#"):  #如果首字母#则代表输入为16进制字符串  
				tmp = inColor[1:]   #取出第一个至最后一个字符  
				toRgb(tmp)  
		else:  
			print("请输入正确的数值！如\"#777bbb\"或\"123,123,123\"")  
			
	main() 
	

