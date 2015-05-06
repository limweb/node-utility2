/*jslint
    browser: true,
    maxerr: 8,
    maxlen: 96,
    node: true,
    nomen: true,
    stupid: true
*/
(function (local) {
    'use strict';



    // run shared js-env code
    (function () {
        // init tests
        local.testCase_ajax_default = function (onError) {
            /*
                this function will test ajax's default handling behavior
            */
            var data, onTaskEnd;
            onTaskEnd = local.utility2.onTaskEnd(function (error) {
                local.utility2.testTryCatch(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, error);
                    // test xhr.abort handling behavior
                    data = local.utility2.ajax({ url: '/test/timeout' }, function (error) {
                        local.utility2.testTryCatch(function () {
                            // validate error occurred
                            local.utility2.assert(error instanceof Error, error);
                            onError();
                        }, onError);
                    });
                    data.abort();
                    // test multiple-callback handling behavior
                    data.abort();
                }, onError);
            });
            onTaskEnd.counter += 1;
            // test http GET handling behavior
            onTaskEnd.counter += 1;
            local.utility2.ajax({
                // test debug handling behavior
                debug: true,
                url: '/test/hello'
            }, function (error, xhr) {
                local.utility2.testTryCatch(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, error);
                    // validate data
                    data = xhr.responseText;
                    local.utility2.assert(data === 'hello', data);
                    onTaskEnd();
                }, onTaskEnd);
            });
            // test http GET 304 cache handling behavior
            onTaskEnd.counter += 1;
            local.utility2.ajax({
                headers: { 'If-Modified-Since': new Date(Date.now() + 0xffff).toGMTString() },
                url: '/test/hello'
            }, function (error, xhr) {
                local.utility2.testTryCatch(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, error);
                    // validate 304 http status
                    local.utility2.assert(xhr.status === 304, xhr.status);
                    onTaskEnd();
                }, onTaskEnd);
            });
            // test http POST handling behavior
            ['blob', 'response', 'text'].forEach(function (responseType) {
                onTaskEnd.counter += 1;
                local.utility2.ajax({
                    data: responseType === 'blob' && local.modeJs === 'node'
                        // test blob post handling behavior
                        ? new Buffer('hello')
                        // test string post handling behavior
                        : 'hello',
                    // test request header handling behavior
                    headers: { 'X-Header-Test': 'Test' },
                    method: 'POST',
                    responseType: responseType,
                    url: '/test/echo'
                }, function (error, xhr) {
                    local.utility2.testTryCatch(function () {
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        if (responseType === 'response') {
                            // cleanup response
                            local.utility2.requestResponseCleanup(null, xhr.response);
                            // validate response
                            data = xhr.response;
                            local.utility2.assert(data, data);
                            onTaskEnd();
                            return;
                        }
                        // validate responseText
                        data = xhr.responseText;
                        local.utility2.assert((/\r\nhello$/).test(data), data);
                        // validate responseHeaders
                        local.utility2.assert((/^X-Header-Test: Test\r\n/im).test(data), data);
                        data = xhr.getAllResponseHeaders();
                        local.utility2.assert((/^X-Header-Test: Test\r\n/im).test(data), data);
                        data = xhr.getResponseHeader('x-header-test');
                        local.utility2.assert(data === 'Test', data);
                        data = xhr.getResponseHeader('x-header-undefined');
                        local.utility2.assert(data === null, data);
                        // validate statusCode
                        local.utility2.assert(xhr.statusCode === 200, xhr.statusCode);
                        onTaskEnd();
                    }, onTaskEnd);
                });
            });
            [{
                // test 404-not-found-error handling behavior
                url: '/test/error-400?modeErrorIgnore=1'
            }, {
                // test 500-internal-server-error handling behavior
                url: '/test/error-500?modeErrorIgnore=1'
            }, {
                // test undefined-error handling behavior
                url: '/test/error-undefined?modeErrorIgnore=1'
            }, {
                // test timeout handling behavior
                timeout: 1,
                url: '/test/timeout'
            }, {
                // test undefined https host handling behavior
                timeout: 1,
                url: 'https://' + local.utility2.uuidTime() + '.com'
            }].forEach(function (options) {
                onTaskEnd.counter += 1;
                local.utility2.ajax(options, function (error) {
                    local.utility2.testTryCatch(function () {
                        // validate error occurred
                        local.utility2.assert(error instanceof Error, error);
                        onTaskEnd();
                    }, onTaskEnd);
                });
            });
            onTaskEnd();
        };

        local.testCase_assert_default = function (onError) {
            /*
                this function will test assert's default handling behavior
            */
            // test assertion passed
            local.utility2.assert(true, true);
            // test assertion failed with undefined message
            local.utility2.testTryCatch(function () {
                local.utility2.assert(false);
            }, function (error) {
                // validate error occurred
                local.utility2.assert(error instanceof Error, error);
                // validate error-message
                local.utility2.assert(error.message === '', error.message);
            });
            // test assertion failed with string message
            local.utility2.testTryCatch(function () {
                local.utility2.assert(false, 'hello');
            }, function (error) {
                // validate error occurred
                local.utility2.assert(error instanceof Error, error);
                // validate error-message
                local.utility2.assert(error.message === 'hello', error.message);
            });
            // test assertion failed with error object
            local.utility2.testTryCatch(function () {
                local.utility2.assert(false, local.utility2.errorDefault);
            }, function (error) {
                // validate error occurred
                local.utility2.assert(error instanceof Error, error);
            });
            // test assertion failed with json object
            local.utility2.testTryCatch(function () {
                local.utility2.assert(false, { aa: 1 });
            }, function (error) {
                // validate error occurred
                local.utility2.assert(error instanceof Error, error);
                // validate error-message
                local.utility2.assert(error.message === '{"aa":1}', error.message);
            });
            onError();
        };

        local.testCase_debug_print_default = function (onError) {
            /*
                this function will test debug_print's default handling behavior
            */
            var message;
            local.utility2.testMock([
                // suppress console.error
                [console, { error: function (arg) {
                    message += (arg || '') + '\n';
                } }]
            ], function (onError) {
                message = '';
                local.global['debug_print'.replace('_p', 'P')]('hello');
                // validate message
                local.utility2.assert(
                    message === '\n\n\n' + 'debug_print'.replace('_p', 'P') + '\nhello\n\n',
                    message
                );
                onError();
            }, onError);
        };

        local.testCase_jsonCopy_default = function (onError) {
            /*
                this function will test jsonCopy's default handling behavior
            */
            // test various data-type handling behavior
            [undefined, null, false, true, 0, 1, 1.5, 'a'].forEach(function (data) {
                local.utility2.assert(
                    local.utility2.jsonCopy(data) === data,
                    [local.utility2.jsonCopy(data), data]
                );
            });
            onError();
        };

        local.testCase_jsonStringifyOrdered_default = function (onError) {
            /*
                this function will test jsonStringifyOrdered's default handling behavior
            */
            var data;
            // test data-type handling behavior
            [undefined, null, false, true, 0, 1, 1.5, 'a', {}, []].forEach(function (data) {
                local.utility2.assert(
                    local.utility2.jsonStringifyOrdered(data) === JSON.stringify(data),
                    [local.utility2.jsonStringifyOrdered(data), JSON.stringify(data)]
                );
            });
            // test data-ordering handling behavior
            data = {
                // test nested dict handling behavior
                ff: { hh: 2, gg: 1},
                // test nested array handling behavior
                ee: [undefined],
                dd: local.utility2.nop,
                cc: undefined,
                bb: null,
                aa: 1
            };
            // test circular-reference handling behavior
            data.zz = data;
            data = local.utility2.jsonStringifyOrdered(data);
            local.utility2.assert(
                data === '{"aa":1,"bb":null,"ee":[null],"ff":{"gg":1,"hh":2}}',
                data
            );
            onError();
        };

        local.testCase_listShuffle_default = function (onError) {
            /*
                this function will test listShuffle's default handling behavior
            */
            var data, list = '[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]';
            // validate list before shuffle
            data = JSON.stringify(JSON.parse(list));
            local.utility2.assert(data === list, data);
            // shuffle list
            data = JSON.stringify(local.utility2.listShuffle(JSON.parse(list)));
            // validate list after shuffle
            local.utility2.assert(data.length === list.length, data);
            local.utility2.assert(data !== list, data);
            onError();
        };

        local.testCase_objectSetDefault_default = function (onError) {
            /*
                this function will test objectSetDefault's default handling behavior
            */
            var options;
            // test non-recursive handling behavior
            options = local.utility2.objectSetDefault(
                { aa: 1, bb: {}, cc: [] },
                { aa: 2, bb: { cc: 2 }, cc: [1, 2] },
                // test default depth handling behavior
                null
            );
            // validate options
            local.utility2.assert(
                local.utility2.jsonStringifyOrdered(options) === '{"aa":1,"bb":{},"cc":[]}',
                options
            );
            // test recursive handling behavior
            options = local.utility2.objectSetDefault(
                { aa: 1, bb: {}, cc: [] },
                { aa: 2, bb: { cc: 2 }, cc: [1, 2] },
                Infinity
            );
            // validate options
            local.utility2.assert(
                local.utility2.jsonStringifyOrdered(options) ===
                    '{"aa":1,"bb":{"cc":2},"cc":[]}',
                options
            );
            onError();
        };

        local.testCase_objectSetOverride_default = function (onError) {
            /*
                this function will test objectSetOverride's default handling behavior
            */
            var data, options;
            // test non-recursive handling behavior
            options = local.utility2.objectSetOverride(
                {
                    aa: 1,
                    bb: { cc: 2 },
                    dd: [3, 4],
                    ee: { ff: { gg: 5, hh: 6 } }
                },
                {
                    aa: 2,
                    bb: { dd: 3 },
                    dd: [4, 5],
                    ee: { ff: { gg: 6 } }
                },
                // test default depth handling behavior
                null
            );
            // validate options
            data = local.utility2.jsonStringifyOrdered(options);
            local.utility2.assert(data ===
                '{"aa":2,"bb":{"dd":3},"dd":[4,5],"ee":{"ff":{"gg":6}}}', data);
            // test recursive handling behavior
            options = local.utility2.objectSetOverride(
                {
                    aa: 1,
                    bb: { cc: 2 },
                    dd: [3, 4],
                    ee: { ff: { gg: 5, hh: 6 } }
                },
                {
                    aa: 2,
                    bb: { dd: 3 },
                    dd: [4, 5],
                    ee: { ff: { gg: 6 } }
                },
                // test depth handling behavior
                2
            );
            // validate options
            data = local.utility2.jsonStringifyOrdered(options);
            local.utility2.assert(data ===
                '{"aa":2,"bb":{"cc":2,"dd":3},"dd":[4,5],"ee":{"ff":{"gg":6}}}', data);
            // test envDict with empty-string handling behavior
            options = local.utility2.objectSetOverride(
                local.utility2.envDict,
                { 'emptyString': null },
                // test default depth handling behavior
                null
            );
            // validate options
            local.utility2.assert(options.emptyString === '', options.emptyString);
            onError();
        };

        local.testCase_objectTraverse_default = function (onError) {
            /*
                this function will test objectTraverse's default handling behavior
            */
            var data;
            data = { aa: null, bb: 2, cc: { dd: 4, ee: [5, 6, 7] } };
            local.utility2.objectTraverse(data, function (element) {
                if (element && typeof element === 'object' && !Array.isArray(element)) {
                    element.zz = true;
                }
            }, Infinity);
            // validate data
            data = local.utility2.jsonStringifyOrdered(data);
            local.utility2.assert(
                data === '{"aa":null,"bb":2,"cc":{"dd":4,"ee":[5,6,7],"zz":true},"zz":true}',
                data
            );
            onError();
        };

        local.testCase_onErrorDefault_default = function (onError) {
            /*
                this function will test onErrorDefault's default handling behavior
            */
            var message;
            local.utility2.testMock([
                // suppress console.error
                [console, { error: function (arg) {
                    message = arg;
                } }]
            ], function (onError) {
                // test no error handling behavior
                local.utility2.onErrorDefault();
                // validate message
                local.utility2.assert(!message, message);
                // test error handling behavior
                local.utility2.onErrorDefault(local.utility2.errorDefault);
                // validate message
                local.utility2.assert(message, message);
                onError();
            }, onError);
        };

        local.testCase_onErrorJsonParse_default = function (onError) {
            /*
                this function will test onErrorJsonParse's default handling behavior
            */
            var data, error, jsonParse;
            jsonParse = local.utility2.onErrorJsonParse(function (arg0, arg1) {
                data = arg1;
                error = arg0;
            });
            // test parse passed handling behavior
            jsonParse(null, '1');
            // validate no error occurred
            local.utility2.assert(!error, error);
            // validate data
            local.utility2.assert(data === 1, data);
            // test parse failed handling behavior
            jsonParse(null, 'syntax error');
            // validate no error occurred
            local.utility2.assert(error instanceof Error, error);
            // validate data
            local.utility2.assert(!data, data);
            // test error handling behavior
            jsonParse(new Error());
            // validate no error occurred
            local.utility2.assert(error instanceof Error, error);
            // validate data
            local.utility2.assert(!data, data);
            onError();
        };

        local.testCase_onTaskEnd_default = function (onError) {
            /*
                this function will test onTaskEnd's default handling behavior
            */
            var onTaskEnd, onTaskEndError;
            // test onDebug handling behavior
            onTaskEnd = local.utility2.onTaskEnd(onError, function (error, self) {
                local.utility2.testTryCatch(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, error);
                    // validate self
                    local.utility2.assert(self.counter >= 0, self);
                }, onError);
            });
            onTaskEnd.counter += 1;
            // test multiple-task handling behavior
            onTaskEnd.counter += 1;
            setTimeout(function () {
                onTaskEndError = local.utility2.onTaskEnd(function (error) {
                    local.utility2.testTryCatch(function () {
                        // validate error occurred
                        local.utility2.assert(error instanceof Error, error);
                        onTaskEnd();
                    }, onTaskEnd);
                });
                onTaskEndError.counter += 1;
                // test error handling behavior
                onTaskEndError.counter += 1;
                onTaskEndError(local.utility2.errorDefault);
                // test ignore-after-error handling behavior
                onTaskEndError();
            });
            // test default handling behavior
            onTaskEnd();
        };

        local.testCase_onTimeout_timeout = function (onError) {
            /*
                this function will test onTimeout's timeout handling behavior
            */
            var timeElapsed;
            timeElapsed = Date.now();
            local.utility2.onTimeout(function (error) {
                local.utility2.testTryCatch(function () {
                    // validate error occurred
                    local.utility2.assert(error instanceof Error, error);
                    // save timeElapsed
                    timeElapsed = Date.now() - timeElapsed;
                    // validate timeElapsed passed is greater than timeout
                    // bug - ie might timeout slightly earlier,
                    // so increase timeElapsed by a small amount
                    local.utility2.assert(timeElapsed + 100 >= 1000, timeElapsed);
                    onError();
                }, onError);
            // coverage-hack - use 1500 ms to cover setInterval test-report refresh in browser
            }, 1500, 'testCase_onTimeout_errorTimeout');
        };

        local.testCase_stringFormat_default = function (onError) {
            /*
                this function will test stringFormat's default handling behavior
            */
            var data;
            // test undefined valueDefault handling behavior
            data = local.utility2.stringFormat('{{aa}}', {}, undefined);
            local.utility2.assert(data === '{{aa}}', data);
            // test default handling behavior
            data = local.utility2.stringFormat(
                '{{aa}}{{aa}}{{bb}}{{cc}}{{dd}}{{ee.ff}}',
                {
                    // test string value handling behavior
                    aa: 'aa',
                    // test non-string value handling behavior
                    bb: 1,
                    // test null-value handling behavior
                    cc: null,
                    // test undefined-value handling behavior
                    dd: undefined,
                    // test nested value handling behavior
                    ee: { ff: 'gg' }
                },
                '<undefined>'
            );
            local.utility2.assert(data === 'aaaa1null<undefined>gg', data);
            // test list handling behavior
            data = local.utility2.stringFormat(
                '[{{#list1}}[{{#list2}}{{aa}},{{/list2}}],{{/list1}}]',
                {
                    list1: [
                        // test null-value handling behavior
                        null,
                        // test recursive list handling behavior
                        { list2: [{ aa: 'bb' }, { aa: 'cc' }] }
                    ]
                },
                '<undefined>'
            );
            local.utility2.assert(
                data === '[[<undefined><undefined>,<undefined>],[bb,cc,],]',
                data
            );
            onError();
        };

        local.testCase_taskRunOrSubscribe_default = function (onError) {
            /*
                this function will test taskRunOrSubscribe's default handling behavior
            */
            var key, onTaskEnd;
            key = local.utility2.uuidTime();
            onTaskEnd = local.utility2.onTaskEnd(onError);
            onTaskEnd.counter += 1;
            // test create handling behavior
            onTaskEnd.counter += 1;
            local.utility2.taskRunOrSubscribe({
                key: key,
                onTask: function (onError) {
                    setTimeout(function () {
                        // test multiple-callback handling behavior
                        onError();
                        onError();
                    });
                }
            }, onTaskEnd);
            // test addCallback handling behavior
            onTaskEnd.counter += 1;
            local.utility2.taskRunOrSubscribe({
                key: key
            }, onTaskEnd);
            onTaskEnd();
        };

        local.testCase_testRun_failure = function (onError) {
            /*
                this function will test testRun's failure handling behavior
            */
            // test failure from callback handling behavior
            onError(local.utility2.errorDefault);
            // test failure from multiple-callback handling behavior
            onError();
            // test failure from ajax handling behavior
            local.utility2.ajax({ url: '/test/undefined?modeErrorIgnore=1' }, onError);
            // test failure from thrown error handling behavior
            throw local.utility2.errorDefault;
        };
    }());
    switch (local.modeJs) {



    // run node js-env code
    case 'node':
        // init tests
        local.testCase_fsWriteFileWithMkdirp_default = function (onError) {
            /*
                this function will test fsWriteFileWithMkdirp's default handling behavior
            */
            var dir, file, modeNext, onNext;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.testTryCatch(function () {
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        dir = local.utility2.envDict.npm_config_dir_tmp +
                            '/testCase_fsWriteFileWithMkdirp_default';
                        // cleanup dir
                        local.utility2.fsRmrSync(dir);
                        // validate no dir exists
                        local.utility2.assert(!local.fs.existsSync(dir), dir);
                        onNext();
                        break;
                    case 2:
                        // test fsWriteFileWithMkdirp with mkdirp handling behavior
                        file = dir + '/aa/bb';
                        local.utility2.fsWriteFileWithMkdirp(file, 'hello1', onNext);
                        break;
                    case 3:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // validate data
                        data = local.fs.readFileSync(file, 'utf8');
                        local.utility2.assert(data === 'hello1', data);
                        onNext();
                        break;
                    case 4:
                        // test fsWriteFileWithMkdirp with no mkdirp handling behavior
                        file = dir + '/aa/bb';
                        local.utility2.fsWriteFileWithMkdirp(file, 'hello2', onNext);
                        break;
                    case 5:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // validate data
                        data = local.fs.readFileSync(file, 'utf8');
                        local.utility2.assert(data === 'hello2', data);
                        onNext();
                        break;
                    case 6:
                        // test error handling behavior
                        file = dir + '/aa/bb/cc';
                        local.utility2.fsWriteFileWithMkdirp(file, 'hello', onNext);
                        break;
                    case 7:
                        // validate error occurred
                        local.utility2.assert(error instanceof Error, error);
                        onNext();
                        break;
                    case 8:
                        // cleanup dir
                        local.utility2.fsRmrSync(dir);
                        // validate no dir exists
                        local.utility2.assert(!local.fs.existsSync(dir), dir);
                        onNext();
                        break;
                    default:
                        onError(error);
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_istanbulMerge_default = function (onError) {
            /*
                this function will test istanbulMerge's default handling behavior
            */
            var coverage1, coverage2, script;
            script = local.utility2.istanbul_lite.instrumentSync(
                '(function () {\nreturn arg ' +
                    '? __coverage__ ' +
                    ': __coverage__;\n}());',
                'test'
            );
            local.utility2.arg = 0;
            // jslint-hack
            local.utility2.nop(script);



            /* jslint-ignore-begin */
            // init coverage1
            coverage1 = local.vm.runInNewContext(script, { arg: 0 });
            // validate coverage1
            local.utility2.assert(local.utility2.jsonStringifyOrdered(coverage1) === '{"/test":{"b":{"1":[0,1]},"branchMap":{"1":{"line":2,"locations":[{"end":{"column":25,"line":2},"start":{"column":13,"line":2}},{"end":{"column":40,"line":2},"start":{"column":28,"line":2}}],"type":"cond-expr"}},"f":{"1":1},"fnMap":{"1":{"line":1,"loc":{"end":{"column":13,"line":1},"start":{"column":1,"line":1}},"name":"(anonymous_1)"}},"path":"/test","s":{"1":1,"2":1},"statementMap":{"1":{"end":{"column":5,"line":3},"start":{"column":0,"line":1}},"2":{"end":{"column":41,"line":2},"start":{"column":0,"line":2}}}}}', coverage1);
            // init coverage2
            coverage2 = local.vm.runInNewContext(script, { arg: 1 });
            // validate coverage2
            local.utility2.assert(local.utility2.jsonStringifyOrdered(coverage2) === '{"/test":{"b":{"1":[1,0]},"branchMap":{"1":{"line":2,"locations":[{"end":{"column":25,"line":2},"start":{"column":13,"line":2}},{"end":{"column":40,"line":2},"start":{"column":28,"line":2}}],"type":"cond-expr"}},"f":{"1":1},"fnMap":{"1":{"line":1,"loc":{"end":{"column":13,"line":1},"start":{"column":1,"line":1}},"name":"(anonymous_1)"}},"path":"/test","s":{"1":1,"2":1},"statementMap":{"1":{"end":{"column":5,"line":3},"start":{"column":0,"line":1}},"2":{"end":{"column":41,"line":2},"start":{"column":0,"line":2}}}}}', coverage2);
            // merge coverage2 into coverage1
            local.utility2.istanbulMerge(coverage1, coverage2);
            // validate merged coverage1
            local.utility2.assert(local.utility2.jsonStringifyOrdered(coverage1) === '{"/test":{"b":{"1":[1,1]},"branchMap":{"1":{"line":2,"locations":[{"end":{"column":25,"line":2},"start":{"column":13,"line":2}},{"end":{"column":40,"line":2},"start":{"column":28,"line":2}}],"type":"cond-expr"}},"f":{"1":2},"fnMap":{"1":{"line":1,"loc":{"end":{"column":13,"line":1},"start":{"column":1,"line":1}},"name":"(anonymous_1)"}},"path":"/test","s":{"1":2,"2":2},"statementMap":{"1":{"end":{"column":5,"line":3},"start":{"column":0,"line":1}},"2":{"end":{"column":41,"line":2},"start":{"column":0,"line":2}}}}}', coverage1);
            /* jslint-ignore-end */



            // test null-case handling behavior
            coverage1 = null;
            coverage2 = null;
            local.utility2.istanbulMerge(coverage1, coverage2);
            // validate merged coverage1
            local.utility2.assert(coverage1 === null, coverage1);
            onError();
        };

        local.testCase_onFileModifiedRestart_watchFile = function (onError) {
            /*
                this function will test onFileModifiedRestart's watchFile handling behavior
            */
            var file, onTaskEnd;
            file = __dirname + '/package.json';
            onTaskEnd = local.utility2.onTaskEnd(onError);
            onTaskEnd.counter += 1;
            local.fs.stat(file, function (error, stat) {
                // test default watchFile handling behavior
                onTaskEnd.counter += 1;
                local.fs.utimes(file, stat.atime, new Date(), onTaskEnd);
                // test nop watchFile handling behavior
                onTaskEnd.counter += 1;
                setTimeout(function () {
                    local.fs.utimes(file, stat.atime, stat.mtime, onTaskEnd);
                // coverage-hack - use 1500 ms to cover setInterval watchFile in node
                }, 1500);
                onTaskEnd(error);
            });
        };

        local.testCase_testPage_default = function (onError) {
            /*
                this function will test the test-page's default handling behavior
            */
            var onTaskEnd, options;
            onTaskEnd = local.utility2.onTaskEnd(onError);
            onTaskEnd.counter += 1;
            [{
                // test default handling behavior
                url: 'http://localhost:' +
                    local.utility2.envDict.npm_config_server_port +
                    '?' +
                    // test _testSecret-validation handling behavior
                    '_testSecret={{_testSecret}}&' +
                    // test phantom-callback handling behavior
                    'modeTest=phantom&' +
                    'timeExit={{timeExit}}'
            }, {
                modeError: true,
                modeErrorIgnore: true,
                url: 'http://localhost:' +
                    local.utility2.envDict.npm_config_server_port +
                    // test script-error handling behavior
                    '/test/script-error.html?' +
                    'timeExit={{timeExit}}'
            }, {
                modeError: true,
                modeErrorIgnore: true,
                // run phantom self-test
                modePhantomSelfTest: true,
                url: 'http://localhost:' +
                    local.utility2.envDict.npm_config_server_port +
                    // test script-only handling behavior
                    '/test/script-only.html?' +
                    // test modeTest !== 'phantom' handling behavior
                    'modeTest=phantom2&' +
                    // test specific testCase handling behavior
                    // test testRun's failure handling behavior
                    'modeTestCase=testCase_testRun_failure&' +
                    'timeExit={{timeExit}}'
            }].forEach(function (options) {
                onTaskEnd.counter += 1;
                local.utility2.phantomTest(options, function (error) {
                    local.utility2.testTryCatch(function () {
                        // validate error occurred
                        if (options.modeError) {
                            local.utility2.assert(error instanceof Error, error);
                        // validate no error occurred
                        } else {
                            local.utility2.assert(!error, error);
                        }
                        onTaskEnd();
                    }, onTaskEnd);
                });
            });
            // test screenCapture handling behavior
            onTaskEnd.counter += 1;
            options = {
                modeErrorIgnore: true,
                timeoutScreenCapture: 1,
                url: 'http://localhost:' +
                    local.utility2.envDict.npm_config_server_port +
                    '/test/script-error.html?' +
                    'timeExit={{timeExit}}'
            };
            local.utility2.phantomScreenCapture(options, function (error) {
                local.utility2.testTryCatch(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, error);
                    // validate screen-capture file
                    local.utility2.assert(
                        options.phantomjs.fileScreenCapture &&
                            local.fs.existsSync(options.phantomjs.fileScreenCapture),
                        options.phantomjs.fileScreenCapture
                    );
                    // remove screen-capture file, so it will not interfere with re-test
                    local.fs.unlinkSync(options.phantomjs.fileScreenCapture);
                    onTaskEnd();
                }, onTaskEnd);
            });
            // test misc handling behavior
            onTaskEnd.counter += 1;
            local.utility2.testMock([
                [local.utility2, {
                    envDict: {
                        // test no slimerjs handling behavior
                        npm_config_mode_no_slimerjs: '1',
                        // test no cover utility2.js handling behavior
                        npm_package_name: 'undefined'
                    },
                    onTimeout: local.utility2.nop,
                    processSpawnWithTimeout: function () {
                        return { on: local.utility2.nop };
                    }
                }]
            ], function (onError) {
                local.utility2.phantomTest({
                    url: 'http://localhost:' +
                        local.utility2.envDict.npm_config_server_port +
                        '?' +
                        'timeExit={{timeExit}}'
                });
                onError();
            }, onTaskEnd);
            onTaskEnd();
        };

        local.testCase_processSpawnWithTimeout_default = function (onError) {
            /*
                this function will test processSpawnWithTimeout's default handling behavior
            */
            var childProcess, onTaskEnd;
            onTaskEnd = local.utility2.onTaskEnd(onError);
            onTaskEnd.counter += 1;
            // test default handling behavior
            onTaskEnd.counter += 1;
            local.utility2.processSpawnWithTimeout('ls')
                .on('error', onTaskEnd)
                .on('exit', function (exitCode, signal) {
                    // validate exitCode
                    local.utility2.assert(exitCode === 0, exitCode);
                    // validate signal
                    local.utility2.assert(signal === null, signal);
                    onTaskEnd();
                });
            // test timeout handling behavior
            onTaskEnd.counter += 1;
            local.utility2.testMock([
                [local.utility2, { timeoutDefault: 1000 }]
            ], function (onError) {
                childProcess = local.utility2.processSpawnWithTimeout('sleep', [5000]);
                onError();
            }, local.utility2.nop);
            childProcess
                .on('error', onTaskEnd)
                .on('exit', function (exitCode, signal) {
                    local.utility2.testTryCatch(function () {
                        // validate exitCode
                        local.utility2.assert(exitCode === null, exitCode);
                        // validate signal
                        local.utility2.assert(signal === 'SIGKILL', signal);
                        onTaskEnd();
                    }, onTaskEnd);
                });
            onTaskEnd();
        };

        local.testCase_replStart_default = function (onError) {
            /*
                this function will test replStart's default handling behavior
            */
            /*jslint evil: true*/
            local.utility2.testMock([
                [local.utility2, { processSpawnWithTimeout: function () {
                    return { on: function (event, callback) {
                        // jslint-hack
                        local.utility2.nop(event);
                        callback();
                    } };
                } }]
            ], function (onError) {
                [
                    // test shell handling behavior
                    '$ :\n',
                    // test git diff handling behavior
                    '$ git diff\n',
                    // test git log handling behavior
                    '$ git log\n',
                    // test grep handling behavior
                    'grep \\bhello\\b\n',
                    // test print handling behavior
                    'print\n'
                ].forEach(function (script) {
                    local.utility2.local._replServer.eval(
                        script,
                        null,
                        'repl',
                        local.utility2.nop
                    );
                });
                onError();
            }, onError);
        };

        local.testCase_serverRespondTimeoutDefault_default = function (onError) {
            /*
                this function will test serverRespondTimeoutDefault's default handling behavior
            */
            local.utility2.testMock([
                // suppress console.error
                [console, { error: local.utility2.nop }],
                [local.utility2, {
                    // suppress onErrorDefault
                    onErrorDefault: local.utility2.nop,
                    // test timeout callback handling behavior
                    onTimeout: function (onError) {
                        onError();
                    },
                    serverRespondDefault: local.utility2.nop
                }]
            ], function (onError) {
                local.utility2.serverRespondTimeoutDefault(
                    {},
                    { on: local.utility2.nop },
                    // test default timeout handling behavior
                    null
                );
                onError();
            }, onError);
        };

        local.testCase_taskRunCached_default = function (onError) {
            /*
                this function will test taskRunCached's default handling behavior
            */
            var cacheValue, done, modeNext, onNext, onTestCaseCached, options;
            modeNext = 0;
            onTestCaseCached = function (options, modeCacheHit, onError) {
                /*
                    this function will run the testCase with the given options
                */
                // test wait-for-cache-write handling behavior
                if (modeCacheHit !== 'memory') {
                    options.onCacheWrite = onError;
                }
                local.utility2.taskRunCached(options, function (error, data) {
                    local.utility2.testTryCatch(function () {
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // validate data
                        local.utility2.assert(data === cacheValue, data);
                        // validate modeCacheHit
                        local.utility2.assert(
                            options.modeCacheHit === modeCacheHit,
                            [options.modeCacheHit, modeCacheHit]
                        );
                        // test no wait-for-cache-write handling behavior
                        if (modeCacheHit === 'memory') {
                            onError();
                        }
                    }, onError);

                });
            };
            onNext = function (error) {
                modeNext = error instanceof Error
                    ? Infinity
                    : modeNext + 1;
                switch (modeNext) {
                case 1:
                    cacheValue = local.utility2.stringAsciiCharset;
                    options = {};
                    options.cacheDict = 'testCase_taskRunCached_default.' +
                        local.utility2.envDict.npm_config_mode_legacy_node;
                    options.key = local.utility2.stringUriComponentCharset;
                    options.modeCacheFile = local.utility2.envDict.npm_config_dir_tmp +
                        '/testCase_taskRunCached_default/' +
                        local.utility2.envDict.npm_config_mode_legacy_node;
                    options.modeCacheFileHit = 'file';
                    options.modeCacheMemory = true;
                    options.modeCacheMemoryHit = 'memory';
                    options.onTask = function (onError) {
                        onError(null, cacheValue);
                    };
                    // cleanup memory-cache
                    local.utility2.cacheDict[options.cacheDict] = null;
                    // cleanup file-cache
                    local.child_process
                        .spawn('rm', ['-fr', options.modeCacheFile], { stdio: 'ignore' })
                        .on('exit', function () {
                            onNext();
                        });
                    break;
                // test no cache handling behavior
                case 2:
                    [
                        'modeCacheFile',
                        'modeCacheMemory',
                        'modeCacheUndefined'
                    ].forEach(function (modeCache) {
                        var optionsCopy;
                        optionsCopy = {
                            cacheDict: options.cacheDict,
                            key: options.key,
                            onTask: options.onTask
                        };
                        optionsCopy[modeCache] = options[modeCache];
                        onTestCaseCached(
                            optionsCopy,
                            undefined,
                            onNext
                        );
                    });
                    break;
                // test cache handling behavior
                case 3:
                    [
                        'modeCacheFile',
                        'modeCacheMemory',
                        'modeCacheUndefined'
                    ].forEach(function (modeCache) {
                        var optionsCopy;
                        optionsCopy = {
                            cacheDict: options.cacheDict,
                            key: options.key,
                            onTask: options.onTask
                        };
                        optionsCopy[modeCache] = options[modeCache];
                        onTestCaseCached(
                            optionsCopy,
                            options[modeCache + 'Hit'],
                            onNext
                        );
                    });
                    break;
                default:
                    if (!done) {
                        done = true;
                        // test error handling behavior
                        onNext(local.utility2.errorDefault);
                        onError(error);
                    }
                }
            };
            onNext();
        };

        local.testCase_testRunServer_misc = function (onError) {
            /*
                this function will test testRunServer's misc handling behavior
            */
            local.utility2.testMock([
                [local.utility2, {
                    envDict: {
                        // test $npm_package_name !== 'utility2' handling behavior
                        npm_package_name: 'undefined',
                        // test timeout-exit handling behavior
                        npm_config_timeout_exit: '1',
                        // test random $npm_config_server_port handling behavior
                        npm_config_server_port: ''
                    },
                    phantomScreenCapture: local.utility2.nop,
                    onReady: {},
                    taskRunOrSubscribe: local.utility2.nop
                }],
                [local.utility2.local, {
                    http: { createServer: function () {
                        return { listen: local.utility2.nop };
                    } }
                }]
            ], function (onError) {
                local.utility2.testRunServer({
                    middleware: local.utility2.middlewareGroupCreate([
                        local.utility2.middlewareInit
                    ])
                });
                // validate $npm_config_server_port
                local.utility2.assert(
                    Number(local.utility2.envDict.npm_config_server_port) > 0,
                    local.utility2.envDict.npm_config_server_port
                );
                onError();
            }, onError);
        };

        local.testCase_uuidXxx_default = function (onError) {
            /*
                this function will test uuidXxx's default handling behavior
            */
            var data1, data2;
            // test uuid4
            data1 = local.utility2.uuid4();
            // validate data1
            local.utility2.assert(local.utility2.regexpUuidValidate.test(data1), data1);
            // test uuidTime
            data1 = local.utility2.uuidTime();
            setTimeout(function () {
                local.utility2.testTryCatch(function () {
                    data2 = local.utility2.uuidTime();
                    // validate data1
                    local.utility2.assert(local.utility2.regexpUuidValidate.test(data1), data1);
                    // validate data2
                    local.utility2.assert(local.utility2.regexpUuidValidate.test(data2), data2);
                    // validate data1 < data2
                    local.utility2.assert(data1 < data2, [data1, data2]);
                    onError();
                }, onError);
            }, 1000);
        };
        break;
    }
    switch (local.modeJs) {



    // run browser js-env code
    case 'browser':
        // init onErorExit
        local.utility2.onErrorExit = function () {
            // test modeTest !== 'phantom' handling behavior
            if (local.utility2.modeTest === 'phantom2') {
                setTimeout(function () {
                    throw new Error('\nphantom\n' +
                        JSON.stringify({ global_test_results: window.global_test_results }));
                }, 1000);
            }
        };
        // test no modeTest handling behavior
        local._modeTest = local.utility2.modeTest;
        local.utility2.modeTest = null;
        local.utility2.testRun();
        // restore modeTest
        local.utility2.modeTest = local._modeTest;
        // run test
        local.utility2.testRun(local);
        break;



    // run node js-env code
    case 'node':
        // require modules
        local.child_process = require('child_process');
        local.fs = require('fs');
        local.http = require('http');
        local.https = require('https');
        local.path = require('path');
        local.url = require('url');
        local.vm = require('vm');
        local.zlib = require('zlib');
        // init assets
        local.utility2.cacheDict.assets['/'] =
            local.utility2.cacheDict.assets['/test/test.html'];
        local.utility2.cacheDict.assets['/test/hello'] = 'hello';
        local.utility2.cacheDict.assets['/test/script-error.html'] =
            '<script>syntax error</script>';
        local.utility2.cacheDict.assets['/test/script-only.html'] =
            '<script src="/assets/utility2.js">\n' +
            '</script><script src="/test/test.js"></script>';
        local.utility2.cacheDict.assets['/test/test.js'] = local.utility2.istanbul_lite
            .instrumentInPackage(
                local.fs.readFileSync(__filename, 'utf8'),
                __filename,
                'utility2'
            );
        // init middleware
        local.middleware = local.utility2.middlewareGroupCreate([
            local.utility2.middlewareInit,
            function (request, response, nextMiddleware) {
                /*
                    this function will run the test-middleware
                */
                // set main-page content-type to text/html
                if (request.urlParsed.pathnameNormalized === '/') {
                    local.utility2.serverRespondHeadSet(request, response, null, {
                        'Content-Type': 'text/html; charset=UTF-8'
                    });
                }
                switch (request.urlParsed.pathnameNormalized) {
                // test http POST handling behavior
                case '/test/echo':
                    // test response header handling behavior
                    local.utility2.serverRespondHeadSet(request, response, null, {
                        'X-Header-Test': 'Test'
                    });
                    local.utility2.serverRespondEcho(request, response);
                    break;
                // test 500-internal-server-error handling behavior
                case '/test/error-500':
                    // test multiple-callback serverRespondHeadSet handling behavior
                    local.utility2.serverRespondHeadSet(request, response, null, {});
                    nextMiddleware(local.utility2.errorDefault);
                    // test multiple-callback error handling behavior
                    nextMiddleware(local.utility2.errorDefault);
                    // test onErrorDefault handling behavior
                    local.utility2.testMock([
                        // suppress console.error
                        [console, { error: local.utility2.nop }],
                        // suppress modeErrorIgnore
                        [request, { url: '' }]
                    ], function (onError) {
                        local.utility2.serverRespondDefault(
                            request,
                            response,
                            500,
                            local.utility2.errorDefault
                        );
                        onError();
                    }, local.utility2.nop);
                    break;
                // test undefined-error handling behavior
                case '/test/error-undefined':
                    local.utility2.serverRespondDefault(request, response, 999);
                    break;
                // test timeout handling behavior
                case '/test/timeout':
                    setTimeout(function () {
                        response.end();
                    }, 1000);
                    break;
                // default to nextMiddleware
                default:
                    nextMiddleware();
                }
            },
            local.utility2.middlewareAssetsCached
        ]);
        // init middleware error-handler
        local.onMiddlewareError = local.utility2.onMiddlewareError;
        // run server-test
        local.utility2.testRunServer(local);
        // init dir
        local.fs.readdirSync(process.cwd()).forEach(function (file) {
            file = process.cwd() + '/' + file;
            // if the file is modified, then restart the process
            local.utility2.onFileModifiedRestart(file);
            switch (local.path.extname(file)) {
            case '.js':
            case '.json':
                // jslint the file
                local.utility2.jslint_lite
                    .jslintAndPrint(local.fs.readFileSync(file, 'utf8'), file);
                break;
            }
        });
        // jslint /assets/utility2.css
        local.utility2.jslint_lite.jslintAndPrint(
            local.utility2.cacheDict.assets['/assets/utility2.css'],
            '/assets/utility2.css'
        );
        // init repl debugger
        local.utility2.replStart();
        // init $npm_config_file_start
        [
            // test no $npm_config_file_start handling behavior
            null,
            local.utility2.envDict.npm_config_file_start
        ].forEach(function (file) {
            if (file) {
                require(process.cwd() + '/' + file);
            }
        });
        break;
    }
}((function () {
    'use strict';
    var local;



    // run shared js-env code
    (function () {
        // init local
        local = {};
        local.modeJs = (function () {
            try {
                return module.exports &&
                    typeof process.versions.node === 'string' &&
                    typeof require('http').createServer === 'function' &&
                    'node';
            } catch (errorCaughtNode) {
                return typeof navigator.userAgent === 'string' &&
                    typeof document.querySelector('body') === 'object' &&
                    'browser';
            }
        }());
        // init global
        local.global = local.modeJs === 'browser'
            ? window
            : global;
        // export local
        local.global.local = local;
        // init utility2
        local.utility2 = local.modeJs === 'browser'
            ? window.utility2
            : require('./index.js');
    }());
    return local;
}())));
