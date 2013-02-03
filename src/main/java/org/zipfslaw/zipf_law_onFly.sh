#!/bin/bash

y=1
#get all the links for downloading and save them in a temp file(temp.txt)
link_pattern='ger-all-4gram-20120701';
python getLinksHref.py "$link_pattern";

FILENAME="temp.txt"
cat $FILENAME | while read LINE
do
    echo $LINE
    curl -o "$y.gz" "$LINE" 
    pigz -d "$y.gz" 
    java -jar groupNgramsAndSumUpTheirFreq.jar "$y" "$y.txt"
    sort -nr "$y.txt" > "NGRAM/ngram-$y.csv"
    rm -v "$y" "$y.txt"
    y=$((y + 1))
done

#merge files and sort them numerically in desc order 
sort -nr -m NGRAM/*  > NGRAM/ngram-all.csv

#delete rest files
NGRAM_FILES=./NGRAM/*
for f in $NGRAM_FILES
do
    if [[ "$f" =~ ^.*[0-9]\.csv$ ]]
    then
        rm -v $f
    fi
done

# and  get rid of the words =>FINAL file
cat  NGRAM/ngram-all.csv |
awk 'BEGIN{FS=";";}  {print  $1;}END{} '  > NGRAM/ngram-zipf-law.csv

#delete the previous all ngram file
rm -v NGRAM/ngram-all.csv
