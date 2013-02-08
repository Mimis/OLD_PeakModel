#!/bin/bash
FILES=$1
for f in $FILES;do
  echo "Processing $f file..."
  java -jar removeAttributeNameSpacesFromXMlFile.jar  $f
done
