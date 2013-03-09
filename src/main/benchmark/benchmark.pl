#!/usr/bin/perl


#--- start config ---
my $date_query_time_period_duration = $ARGV[0]; #given a date we transform it to a range query with the given length
my $queryFile = $ARGV[1];
my $useAllShards = $ARGV[2];
my $createDateQueries = "false";
if($useAllShards eq "false"){
	$createDateQueries = "true";
}

my $shard = "false";
if($createDateQueries eq "true"){
	$shard = "true";
}

my $forkCount = 1;
my $queryCount = 5;
my $outputDir = "/tmp/zot";
my $querySource = "/home/mimis/Development/eclipse_projects/PeakModel/src/main/benchmark/$queryFile-queries";
my $urlHost = "localhost";
my $urlPort = "8080";
my $urlOptions = "rows=10&fl=id,article_title,article_url,score"; 
my $uriEscape = 0; # Enable if queries are not already URI escaped
my $writeResponses = 0; # Enable to write responses to disk
#date 
my $start_year = "1950";
my $end_year = "1995";
my $range = $end_year - $start_year;
#---- end config ----



use strict;
use URI::Escape;
use warnings qw(all);
use Time::HiRes qw ( time alarm sleep );
use Statistics::Descriptive;
use IO::Handle;
use LWP::Simple;

my %kids;
my $pid;
my $i;
my $j = 0;
my $r;
my $query;
my @queries;
my $size;
my $num;
my $veryStart = time();
my $start;
my $elapsed;
my $stat;
my %cfg;

my $urlTemplate = "http://HOST:PORT/solr/COREselect?SHARDq=QUERY&OPTIONS";
my $url;

###
### Main routine
###

mkdir $outputDir;
mkdir "$outputDir/result" if $writeResponses;
# The length test ensures that we don't clobber the root filesystem.
system "rm -f $outputDir/* 2> /dev/null" if length $outputDir;
system "rm -f $outputDir/result/* 2> /dev/null" if length $outputDir
  and $writeResponses;

$urlTemplate =~ s/HOST/$urlHost/;
$urlTemplate =~ s/PORT/$urlPort/;

$urlTemplate =~ s/OPTIONS/$urlOptions/;

for ($i = 0; $i < $forkCount; $i++) {
  $pid = fork();
  if ($pid) {
    $kids{$pid} = 1;
  } else {
    print "pid:",$pid," forc:",$forkCount,"\n";
    @queries = `cat $querySource`;
    $size = @queries;

    open OUT, ">$outputDir/$$.zot";
    OUT->autoflush(1);
    for ($i = 0; $i < $queryCount; $i++) {
      $num = int(rand $size);
      $query = $queries[$num];
      chomp $query;

      $query =~ s/ /+/g; # use + for space
      $query = uri_escape($query) if $uriEscape;
      
      $url = $urlTemplate;
      $url =~ s/QUERY/$query/;


      #Create date queries
      my $date = "";
	  if($createDateQueries eq "true"){
	    	$date = int(rand($range)) + $start_year;
		$url = $url . "&fq=date:[".($date-$date_query_time_period_duration)."-01-01 TO ".($date+$date_query_time_period_duration)."-12-31]";
	  }

      #shard parameters
      my $shardCores = "";
	  if($shard eq "true"){
		my $min_date = substr($date-$date_query_time_period_duration,0,3) . "0";
		my $max_date = substr($date+$date_query_time_period_duration,0,3) . "0";
		print "\t\t date:$date \tmin_date:$min_date max_date:$max_date \n";

		#get first three digits and append a zero at the end
		$date = substr($date, 0, 3) . "0";
		$shardCores = "shards=localhost:8080/solr/core$date";

		if(($min_date ne $date)&&($min_date >= substr($start_year,0,3) ."0")){
			$shardCores .= ",localhost:8080/solr/core$min_date";
		}
		if(($max_date ne $date)&&($max_date <= substr($end_year,0,3) ."0")){
			$shardCores .= ",localhost:8080/solr/core$max_date";
		}
	  }

	if($useAllShards eq "true"){
		$date = "1950";
		$shardCores = "shards=localhost:8080/solr/core1950";
		$shardCores .= ",localhost:8080/solr/core1960";
		$shardCores .= ",localhost:8080/solr/core1970";
		$shardCores .= ",localhost:8080/solr/core1980";
		$shardCores .= ",localhost:8080/solr/core1990";
	  }
      $url =~ s/CORE/core$date\//;
      $url =~ s/SHARD/$shardCores&/;
      print "count:$i url:$url \n";



      $start = time();
      $r = get ($url);
      if (defined $r and $r) {
        $elapsed = time() - $start;
        print OUT "$elapsed\n";
        if ($writeResponses) {
          open R, ">$outputDir/result/$$.$j";
          print R $r;
          close R;
          $j++;
        }
      }
    }
    close OUT;
    exit 0;
  }
}

foreach (keys %kids) {
  waitpid($_, 0);
}

$stat = Statistics::Descriptive::Full->new();
foreach $i (keys %kids) {
  open IN, "<$outputDir/$i.zot";
  while (<IN>) {
    chomp;
    $stat->add_data($_);
  }
  close IN;
}

system "rm -f $outputDir/* 2> /dev/null" if length $outputDir;
system "rm -f $outputDir/result/* 2> /dev/null" if length $outputDir
  and $writeResponses;

printf " Req/s: %1.03f (%1.03f sec, requests %d/%d)\n"
  , $stat->count() / (time() - $veryStart)
  , time() - $veryStart, $stat->count(), $forkCount * $queryCount;
printf "   Avg: %1.03f\n", $stat->mean();
printf "Median: %1.03f\n", $stat->median();
printf "  95th: %1.03f\n", $stat->percentile(95);
printf "  99th: %1.03f\n", $stat->percentile(99);
printf "   Max: %1.03f\n", $stat->max();
print "\n";

exit 0;
