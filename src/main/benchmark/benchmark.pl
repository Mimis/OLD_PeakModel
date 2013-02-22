#!/usr/bin/perl

#--- start config ---
my $forkCount = 1;
my $queryCount = 512;
my $outputDir = "/tmp/zot";
my $querySource = "/home/mimis/Development/eclipse_projects/PeakModel/src/main/benchmark/$ARGV[2]-queries";
my $urlHost = "localhost";
my $urlPort = "8080";
my $urlCore = ""; # set to "" to not use a core
my $urlOptions = "rows=10&fl=id";
my $uriEscape = 1; # Enable if queries are not already URI escaped
my $writeResponses = 0; # Enable to write responses to disk

#date 
my $createDateQueries = $ARGV[0];
my $start_year = "1950";
my $end_year = "1995";
my $range = $end_year - $start_year;
my $time_period_duration = $ARGV[1]; #given a date we transform it to a range query with the given length
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

my $urlTemplate = "http://HOST:PORT/solr/COREselect/?q=QUERY&OPTIONS";
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
$urlTemplate =~ s/CORE/$urlCore/;
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
	  if($createDateQueries){
	    my $date = int(rand($range)) + $start_year;
		$url = $url . "&date:[".($date-$time_period_duration)."-01-01 TO ".($date+$time_period_duration)."-01-01]";
	  }
      print "\t\t count:$i url:$url \n";
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
