Sublime/Textmate Snippets
=========================

[See the docs on sublime text snippets](http://docs.sublimetext.info/en/latest/extensibility/snippets.html).

The files in this folder are helper snippets that are common code blocks used in this datatorrent console. 
Snippets are blocks of code with parameterized parts that can make creation of these common elements easy.


Syntax
------

Snippets have the following syntax:

```XML
<snippet>
  <content><![CDATA[
This is the ${1:snippet}
]]></content>
  <!-- Optional: Set a tabTrigger to define how to trigger the snippet -->
  <tabTrigger>sometabtrigger</tabTrigger>
  <!-- Optional: Set a scope to limit where the snippet will trigger -->
  <scope>source.js</scope>
</snippet>
```

Assuming you have installed the above snippet, typing `sometabtrigger` and then pressing tab will result in
the string "This is the snippet" will be printed, with the word "snippet" highlighted for you to easily edit.


Installation
------------

Sublime Text 2 (on Mac) loads snippets from `~/Library/Application\ Support/Sublime\ Text\ 2/Packages/User`
(users of other systems will have to determine where these are stored). The best way to isntall these is to
create soft links from this repository to that location. Using the director above:

```Shell
$ ln -s /path/to/this/repo/snippets/*.sublime-snippet ~/Library/Application\ Support/Sublime\ Text\ 2/Packages/User
```

Restart of sublime text may be required to register these snippets.