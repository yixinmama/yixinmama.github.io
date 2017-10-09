---
layout: post
title: Mockito简单介绍及示例
description: Mockito简单介绍及示例
category: 测试
tags:  Mockito
---

Mockito是一个流行的Mocking框架。它使用起来简单，学习成本很低，而且具有非常简洁的API，测试代码的可读性很高。因此它十分受欢迎，用户群越来越多，很多的开源的软件也选择了Mockito。


## Mockito

Jar包下载地址：http://code.google.com/p/mockito/downloads/list
 
## Maven

如果项目是通过Maven管理的，需要在项目的Pom.xml中增加如下的依赖：

	<dependencies>
		<dependency>
			<groupId>org.mockito</groupId>
				<artifactId>mockito-all</artifactId>
				<version>1.8.5</version>
				<scope>test</scope>
		</dependency>
	</dependencies>

## 2.1 简单示例：

`TestMock.java `

	import static org.mockito.Mockito.*;  
	import java.util.List;  
	import org.junit.Assert;  
	import org.junit.Test;  
	 
	public class TestMock {  
		@Test  
		public void simpleTest(){  
			//创建mock对象，参数可以是类，也可以是接口  
			List<String> list = mock(List.class);  
			//设置方法的预期返回值  
			when(list.get(0)).thenReturn("helloworld");  
			String result = list.get(0);  
			//验证方法调用(是否调用了get(0))  
			verify(list).get(0);  
			//junit测试  
			Assert.assertEquals("helloworld", result);  
		}  
	}  
 
`TestMockito2.java`

	import static org.mockito.Mockito.*;  
	import java.util.LinkedList;
	import java.util.List;  
	import org.junit.Assert;  
	import org.junit.Test;
	 
	public class TestMockito2 {
		@Test
		public void simpleTest(){
			LinkedList mockedList = mock(LinkedList.class) ;
			System.out.println(mockedList.get(999)) ;
			when(mockedList.get(0)).thenReturn("first") ;
			System.out.println(mockedList.get(0)) ;
		}
	}
	
以上两个示例运行之后第一个示例没有任何回显，只是将结果与预定值进行对比；对比结果一致则正常运行，对比结果不一致则报错。而第二个示例会在控制台打印信息：
![](/images/2014-09-09-unit-mockito/2.png)

## 2.1.2  mock创建对象

可使用如下语法创建对象，可以对类和接口进行mock对象的创建，创建时可以为mock对象命名。对mock对象命名的好处是调试的时候容易辨认mock对象。创建mock对象不能对final，Anonymous ，primitive类进行mock。

	mock(Class<T> classToMock);
	mock(Class<T> classToMock, String name)
	mock(Class<T> classToMock, Answer defaultAnswer)
	mock(Class<T> classToMock, MockSettings mockSettings)
	mock(Class<T> classToMock, ReturnValues returnValues)

示例2中创建mock对象：

	// 模拟LinkedList 的对象   
	LinkedList mockedList = mock(LinkedList. class );      
	// 此时调用get方法，是会返回null，因为还没有对方法调用的返回值做模拟    
	System.out.println(mockedList.get( 999 ));
 
## 2.1.3 模拟返回值

因为创建模拟对象时没有对这里调用的get()方法进行返回值模拟，所以该方法的返回值为null，所以示例2中第一次打印结果为null。
对方法返回值进行模拟：

	// 模拟获取第一个元素时，返回字符串first   
	when(mockedList.get( 0 )).thenReturn( "first" );  
	// 此时打印输出first   
	System.out.println(mockedList.get( 0 ));  
	
因为已经对方法的返回值进行了模拟，所以第二次打印的值为已定义的模拟值。

## 2.1.4 异常模拟

也可以对异常方法异常进行模拟：

	// 模拟获取第二个元素时，抛出RuntimeException  
	when(mockedList.get(1)).thenThrow(new RuntimeException());  
	// 此时将会抛出RuntimeException  
	System.out.println(mockedList.get(1));  
	
在示例2中添加上述代码，对异常进行模拟，运行之后得到如下结果：
![](/images/2014-09-09-unit-mockito/2.png)
此时，系统会抛出模拟的异常，当然没有返回值的方法也是可以模拟其抛出异常的：
![](/images/2014-09-09-unit-mockito/3.png)
	doThrow( new  RuntimeException()).when(mockedList).clear();  
	mockList.clear();

此时，系统抛出异常：
 
## 2.1.5 方法匹配参数模拟

也可以对方法的参数匹配模拟：

	// anyInt()匹配任何int参数，这意味着参数为任意值，其返回值均是element   
	when(mockedList.get(anyInt())).thenReturn( "element" );    
	// 此时打印是element   
	System.out.println(mockedList.get( 0 ));  
	
结果：
![](/images/2014-09-09-unit-mockito/4.png)