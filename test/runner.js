import {extend} from 'src/utils';
import {SkipTest} from 'test/annotations';

export {BiscuitsTestRunner};

// TODO extract this to a standalone node module?

function shouldSkipTest(testFunc) {
  var skip = false;
  if (testFunc.annotations) {
    testFunc.annotations.forEach((anno) => {
      if (anno instanceof SkipTest) {
        skip = true;
      }
    });
  }
  return skip;
}

var skipTest = function() { return {skipped: true}; };


function runTest(testFunc) {
  var skipped = false;
  var success = true;
  var log = [];
  var time = 0;

  if (shouldSkipTest(testFunc)) {
    skipped = true;
  } else {
    var start = Date.now();
    try {
      testFunc();
    } catch (e) {
      success = false;
      log.push(e.stack);
    }
    time = Date.now() - start;
  }

  return {
    skipped: skipped,
    success: success,
    log: log,
    time: time,
  };
}

class BiscuitsTestRunner {

  constructor() {
    this.SUITE_REGEXP = /^test\/suites\//;
    this.TEST_FUNC_REGEXP = /^test/;
    this.tests = [];

    this.resultDefaults = {
      id: 'unknown',
      description: '',
      suite: [],
      log: [],
      skipped: false,
      success: false,
      time: 0,
    };
  }

  get testNames() {
    var names = [];
    this.tests.forEach((test) => {
      names.push(test.id);
    });
    return names;
  }

  discoverTests(moduleNames) {

    return new Promise((resolve) => {

      var suites = [];
      moduleNames.forEach((moduleName) => {
        if (this.SUITE_REGEXP.test(moduleName)) {
          suites.push(moduleName);
        }
      });

      // TODO(abuchanan) it's weird to have require() hard-coded here,
      //                 but until the JS module loader madness dies down
      //                 and System.import becomes standard, this will have
      //                 to live on.
      require(suites, (...modules) => {

        modules.forEach((mod) => {
          for (var key in mod) {
            if (this.TEST_FUNC_REGEXP.test(key) && typeof mod[key] == 'function') {
              this.tests.push({
                id: key,
                // TODO description
                suite: [mod.name],
                func: mod.skipAll ? skipTest : runTest.bind({}, mod[key]),
              });
            }
          }
        });

        console.log('resolve');
        resolve();
      });
    });
  }

  run(karma) {
    console.log('run');

    karma.info({
      total: this.tests.length,
      specs: this.testNames,
    });

    this.tests.forEach((test) => {
      var result = extend({}, this.resultDefaults, test, test.func());
      karma.result(result);
    });

    karma.complete();
  }
}
