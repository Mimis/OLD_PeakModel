set title "Zipfs Law for German N-gram"
set xlabel "log rank"
set ylabel "log frequency"
set terminal svg
set output "german_ngrams.svg"
plot  "1-ngram-zipf-lawML.csv" using (log10($1)):(log10($2)) title '1-gram' with lines, \
"2-ngram-zipf-lawML.csv" using (log10($1)):(log10($2)) title '2-gram' with lines, \
"3-ngram-zipf-lawML.csv" using (log10($1)):(log10($2)) title '3-gram' with lines, \
"4-ngram-zipf-lawML.csv" using (log10($1)):(log10($2)) title '4-gram' with lines, \
"5-ngram-zipf-lawML.csv" using (log10($1)):(log10($2)) title '5-gram' with lines, \
"mergedFileSL.txt" using (log10($1)):(log10($2)) title 'All-grams' with lines
