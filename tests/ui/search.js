/*
    Test for the search results page.
    Note that a lot of it is already tested in the app_list.js tests.
*/
var appList = require('../lib/app_list');
var constants = require('../lib/constants');
var helpers = require('../lib/helpers');

var appNthChild = appList.appNthChild;

casper.test.begin('Test search results header', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            casper.fill('.search', {q: 'test'}, true);
        });

        // Test search results count in header.
        casper.waitForSelector('.app-list', function() {
            test.assertUrlMatch(/\/search\?q=test$/);
            test.assertSelectorHasText('.search-results-header',
                                       '"test" returned 42 results');

            appList.waitForLoadMore(function() {
                // Test results count in header after clicking `Load more`.
                test.assertUrlMatch(/\/search\?q=test$/);
                test.assertSelectorHasText('.search-results-header',
                                           '"test" returned 42 results');
            });
        });

        helpers.done(test);
    }
});

casper.test.begin('Test search device filtering', {
    test: function(test) {
        helpers.startCasper({path: '/search?q=test&device_override=desktop'});

        helpers.waitForPageLoaded(function() {
            test.assertField('compatibility_filtering', 'desktop');

            casper.fill('.search', {q: 'test'}, true);

            // New search during dev. filter clears filter.
            casper.waitForSelector('.app-list', function() {
                casper.waitForUrl(/\/search\?q=test$/, function() {
                    test.assertField('compatibility_filtering', 'all');
                });
            });
        });

        helpers.done(test);
    }
});


casper.test.begin('Test search empty', {
    test: function(test) {
        helpers.startCasper();

        helpers.waitForPageLoaded(function() {
            casper.fill('.search', {q: 'empty'}, true);
        });

        casper.waitWhileVisible('.placeholder .spinner', function() {
            test.assertUrlMatch(/\/search\?q=empty/);
            test.assertVisible('#search-q');
            test.assertDoesntExist('.app-list');
            test.assertSelectorHasText('.subheader h1', 'No results found');
        });

        helpers.done(test);
    }
});


casper.test.begin('Test search XSS', {
    test: function(test) {
        helpers.startCasper({
            path: '/search?q=%3Cscript+id%3D%22%23xss-script%22%3E%3C%2Fscript%3E'
        });

        helpers.waitForPageLoaded(function() {
            test.assertDoesntExist('#xss-script');
        });

        helpers.done(test);
    }
});
