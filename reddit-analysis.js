// Reddit Data Analysis
// Steve Veerman - 2017

if (typeof jQuery == 'undefined'){ // add jquery if missing
  var script_jQuery = document.createElement('script');
  script_jQuery.setAttribute('src', '//code.jquery.com/jquery-latest.min.js');
  document.body.appendChild(script_jQuery);
  console.log('jQuery loaded');
}

function getSubredditData(subreddit){
	var $div = $('<div>');
	$div.load('/r/' + subreddit + ' #siteTable', function(){ // use ajax to grab html from subreddit
		var subreddit_data = parseSubredditData($(this));
		$.each(subreddit_data.links, function(index, value){ // merge subreddit results with all previous data
			value.unshift('/r/' + subreddit); // add subreddit name to front of data
			data_all.push(value.join(',')); // convert to CSV
		});
		subreddit_data.summary.unshift('/r/' + subreddit);
		data_summary.push(subreddit_data.summary.join(',')); // convert to CSV

		subreddits_completed++;
		if (subreddits_completed === subreddits.length){ // all subreddits have been processed, display results
			showResults();
		}
	});
}

function parseSubredditData($div){ // parse html for subreddit and return votes, comment counts, etc
	var links = [];
	var totals = {'votes': 0, 'comments': 0, 'votes_to_comments': 0, 'comments_to_votes': 0, 'ratios_count': 0}; // totals used to calcuate final subreddit breakdown
	$($div).find('.thing').each(function(){
		var title = $(this).find('a.title').text().replace(/["',]/g,''); // replace things that will break CSV
		var votes = $(this).find('.score.unvoted').attr('title');
		votes = parseInt(votes) || 0;
		var comments = $(this).find('.bylink.comments').text();
		comments = parseInt(comments) || 0;

		var votes_to_comments = 0;
		var comments_to_votes = 0;
		if (votes !== 0 && comments !== 0){ // calculate ratios and prevent divide by 0 and infinity
			votes_to_comments = votes / comments;
			comments_to_votes = comments / votes;

			totals.votes_to_comments += votes_to_comments;
			totals.comments_to_votes += comments_to_votes;
			totals.ratios_count++; // used to calcuate the average of all ratios
		}
		totals.votes += votes;
		totals.comments += comments;

		links.push([title, votes, comments, votes_to_comments, comments_to_votes]);
	});
	var summary = [totals.votes, totals.comments, (totals.votes / totals.comments), (totals.comments / totals.votes), (totals.votes_to_comments / totals.ratios_count), (totals.comments_to_votes / totals.ratios_count)];
	return {'links': links, 'summary' : summary};
}

function showResults(){
	var csv = summary_only === 1 ? data_summary.join('\r\n') : data_all.join('\r\n'); // select which data to dump

	// download CSV, from http://stackoverflow.com/a/27284736/1014733
	var link = document.createElement("a");
	var d = new Date(); // current date/time
	var ds = [d.getFullYear(), d.getMonth()+1, d.getDate()].join('/') + '_' + [d.getHours(), d.getMinutes(),d.getSeconds()].join(':');
	link.download = 'reddit_data_' + ds + '.csv';
	var uri = 'data:text/csv;base64,' + window.btoa(unescape(encodeURIComponent(csv)));
	link.href = uri;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link); // Cleanup the DOM
	delete link;
}

var data_summary = [];
data_summary.push(['subreddit', 'votes', 'comments', 'votes-to-comments ratio', 'comments-to-votes ratio', 'average votes-to-comments ratio', 'average comments-to-votes ratio']); // set headers
var data_all = [];
data_all.push(['subreddit', 'post title', 'votes', 'comments', 'votes-to-comments ratio', 'comments-to-votes ratio']); // set headers
var subreddits_completed = 0;
var summary_only = 1; // change to 0 for all data

// default subreddits from https://np.reddit.com/r/defaults/comments/4l3svc/list_of_default_subreddits_usa_26_may_2016/
var subreddits = ['announcements', 'Art', 'AskReddit', 'askscience', 'aww', 'blog', 'books', 'creepy', 'dataisbeautiful', 'DIY', 'Documentaries', 'EarthPorn', 'explainlikeimfive', 'food', 'funny', 'Futurology', 'gadgets', 'gaming', 'GetMotivated', 'gifs', 'history', 'IAmA', 'InternetIsBeautiful', 'Jokes', 'LifeProTips', 'listentothis', 'mildlyinteresting', 'movies', 'Music', 'news', 'nosleep', 'nottheonion', 'OldSchoolCool', 'personalfinance', 'philosophy', 'photoshopbattles', 'pics', 'science', 'Showerthoughts', 'space', 'sports', 'television', 'tifu', 'todayilearned', 'TwoXChromosomes', 'UpliftingNews', 'videos', 'worldnews', 'WritingPrompts'];
//subreddits.push('the_donald'); // morbid curiousity

$.each(subreddits, function(index, value){
	getSubredditData(value);
});
