'use strict';

require('should');
var benv = require('benv');
var read = require('fs').readFileSync;

var nowData = {
  sgvs: [
    { mgdl: 100, mills: Date.now(), direction: 'Flat', type: 'sgv' }
  ]
  , treatments: []
};

describe('client', function ( ) {
  this.timeout(40000); // TODO: see why this test takes longer on Travis to complete

  var headless = require('./fixtures/headless')(benv, this);

  beforeEach(function (done) {
    console.log('Starting headless setup for Careportal test');
    headless.setup({mockAjax: true}, done);
    console.log('Headless setup for Careportal test done');
  });

  afterEach(function (done) {
    headless.teardown( );
    done( );
  });

  it ('open careportal, and enter a treatment', function (done) {

	var client = window.Nightscout.client;
	
    var hashauth = require('../lib/client/hashauth');
    hashauth.init(client,$);
    hashauth.verifyAuthentication = function mockVerifyAuthentication(next) { 
      hashauth.authenticated = true;
      next(true); 
    };

    console.log('Careportal test client init');
    client.init();
    console.log('Careportal test client data update');
    client.dataUpdate(nowData, true);

    client.careportal.prepareEvents();

    $('#eventType').val('Snack Bolus');
    $('#glucoseValue').val('100');
    $('#carbsGiven').val('10');
    $('#insulinGiven').val('0.60');
    $('#preBolus').val(15);
    $('#notes').val('Testing');
    $('#enteredBy').val('Dad');

    //simulate some events
    client.careportal.eventTimeTypeChange();
    client.careportal.dateTimeFocus();
    client.careportal.dateTimeChange();

    window.confirm = function mockConfirm (message) {
      function containsLine (line) {
        message.indexOf(line + '\n').should.be.greaterThan(0);
      }

      containsLine('Event Type: Snack Bolus');
      containsLine('Blood Glucose: 100');
      containsLine('Carbs Given: 10');
      containsLine('Insulin Given: 0.60');
      containsLine('Carb Time: 15 mins');
      containsLine('Notes: Testing');
      containsLine('Entered By: Dad');

      return true;
    };

    window.alert = function mockAlert(messages) { messages.should.equal(''); };
    
    console.log('Careportal test saving');

    client.careportal.save();

    done();
  });

});
