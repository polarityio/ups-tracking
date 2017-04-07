'use strict';

var request = require('async');
var _ = require('lodash');
var async = require('async');
var upsApi = require('shipping-ups');
var log;




function startup(logger) {
    log = logger;
}

function doLookup(entities, options, cb) {
    let entitiesWithNoData = [];
    let lookupResults = [];

    async.each(entities, function (entityObj, next) {
        if (entityObj.type === 'custom') {
            _lookupEntity(entityObj, options, function (err, result) {
                if (err) {
                    next(err);
                } else {
                    lookupResults.push(result); log.trace({result: result}, "results");
                    next(null);
                }
            });
        } else {
            lookupResults.push({entity: entityObj, data: null}); //Cache the missed results
            next(null);
        }
    }, function (err) {
        cb(err, lookupResults);
    });
}

function validateOptions(userOptions, cb) {
    let errors = [];
    if(typeof userOptions.license.value !== 'string' ||
        (typeof userOptions.license.value === 'string' && userOptions.license.value.length === 0)){
        errors.push({
            key: 'license',
            message: 'You must provide a valid UPS API License'
        })
    }

    if(typeof userOptions.username.value !== 'string' ||
        (typeof userOptions.username.value === 'string' && userOptions.username.value.length === 0)){
        errors.push({
            key: 'username',
            message: 'You must provide your UPS account UserID'
        })
    }

    if(typeof userOptions.password.value !== 'string' ||
        (typeof userOptions.password.value === 'string' && userOptions.password.value.length === 0)){
        errors.push({
            key: 'password',
            message: 'You must provide your UPS account Password'
        })
    }

    cb(null, errors);
}


function _lookupEntity(entityObj, options, cb) {

    let ups = new upsApi({
        environment: 'live',
        username: options.username,
        password: options.password,
        access_key: options.license,
        pretty: true});

    log.trace({entityObj: entityObj}, "Printing entity Object");


    ups.track(entityObj.value, options = {latest:true},
        function (err, response) {
        // check for an error
        if (err) {
            log.trace({err:err}, "Logging any errors that might occur");
            return;
        }
        
        log.trace({body: response}, "Returned Data:")

        // The lookup results returned is an array of lookup objects with the following format
        cb(null, {
            // Required: This is the entity object passed into the integration doLookup method
            entity: entityObj,
            // Required: An object containing everything you want passed to the template

            data: {
                // Required: this is the string value that is displayed in the template

                entity_name: entityObj.value,
                // Required: These are the tags that are displayed in your template
                summary: [response.Shipment.Package.Activity.Status.StatusType.Description],
                // Data that you want to pass back to the notification window details block
                details: {
                weight: [response.Shipment.Package.PackageWeight.Weight + " LBS"],
                location: [response.Shipment.Package.Activity.ActivityLocation.Address.City + ", " + response.Shipment.Package.Activity.ActivityLocation.Address.StateProvinceCode + " " + response.Shipment.Package.Activity.ActivityLocation.Address.PostalCode],
                date: response.Shipment.Package.Activity.Date + response.Shipment.Package.Activity.Time
                }}
        });
    });
}


// function that takes the ErrorObject and passes the error message to the notification window
var _createJsonErrorPayload = function (msg, pointer, httpCode, code, title, meta) {
    return {
        errors: [
            _createJsonErrorObject(msg, pointer, httpCode, code, title, meta)
        ]
    }
};

// function that creates the Json object to be passed to the payload
var _createJsonErrorObject = function (msg, pointer, httpCode, code, title, meta) {
    let error = {
        detail: msg,
        status: httpCode.toString(),
        title: title,
        code: 'SP_' + code.toString()
    };

    if (pointer) {
        error.source = {
            pointer: pointer
        };
    }

    if (meta) {
        error.meta = meta;
    }

    return error;
};


module.exports = {
    startup:startup,
    doLookup: doLookup,
    validateOptions: validateOptions
};




