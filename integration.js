'use strict';

let request = require('async');
let _ = require('lodash');
let async = require('async');
let upsApi = require('shipping-ups');
let log;




function startup(logger) {
    log = logger;
}

function doLookup(entities, options, cb) {
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
    cb(null, errors);
}



function _lookupEntity(entityObj, options, cb) {

    let ups = new upsApi({
        environment: 'live',
        username: "username",
        password: "password",
        access_key: options.license,
        pretty: true});

    log.trace({entityObj: entityObj}, "Printing entity Object");
    log.trace({ups: ups}, "UPS check:");


    ups.track(entityObj.value, options = {latest:true},
        function (err, response) {
        // check for an error
        if (err) {
            cb(null, {
                entity: entityObj,
                data: null
            });
            log.error({err:err}, "Logging any errors that might occur");
            return;
        }
        
        log.trace({body: response}, "Returned Data:");

        //caching blank results
        if(response.Shipment == null){
            cb(err);
            return;
        }

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


module.exports = {
    startup:startup,
    doLookup: doLookup,
    validateOptions: validateOptions
};




