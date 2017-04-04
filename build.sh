#!/bin/bash

entrydir='script/es2015/'
entryfile='gnum.js estimate.js alphabeta.js ui.js'
outputfile='script/main.debug.js'

echo '// '`date` > $outputfile

for file in $entryfile; do
  filename=$entrydir$file
  cat $filename | egrep -v 'export|import' >> $outputfile
done

exit 0

