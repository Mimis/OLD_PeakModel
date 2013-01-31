#!/usr/bin/python
import re,urllib2,urllib,os,datetime,sys

#link_pattern = 'ger-all-1gram-20120701';
link_pattern = sys.argv[1];
print "link_pattern: %s" % link_pattern; 

url = "http://storage.googleapis.com/books/ngrams/books/datasetsv2.html"
f = open("temp.txt", "w")

htmlpage = urllib2.urlopen(url).read()
alllinks = re.findall('<a href=(.*'+link_pattern+'.*)>.*?</a>',htmlpage)

for links in alllinks:
 links = links[1:-1]
 linkName = links.split('/')[-1]
 #print "Links: %s" % links
 f.write(links+"\n")


