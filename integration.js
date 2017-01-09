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
        if (entityObj) {
            _lookupEntity(entityObj, options, function (err, result) {
                if (err) {
                    next(err);
                } else {
                    lookupResults.push(result); log.debug("Printing out the Results %j", result);
                    next(null);
                }
            });
        } else {
            next(null);
        }
    }, function (err) {
        cb(err, lookupResults);
    });
}




function _lookupEntity(entityObj, options, cb) {

    var ups = new upsApi({
        environment: 'live',
        username: options.userid,
        password: options.password,
        access_key: options.license,
        pretty: true});
    log.debug("checking UPS pass %j", ups);
    log.debug("Printing out the entityobj %j", entityObj);

    /*ups.track('1ZV5E9420444964064', function(err, results){
        if(err){
            console.log(err);
        }
        else{
            console.log(results);
        }
    });*/
    ups.track(entityObj.value, options = {latest:true},
        function (err, response) {
        // check for an error
        if (err) {
            cb(err);
            log.debug("checking to see if there is an error %j", err);
            return;
        }

       // if (response.statusCode !== 200) {
         //   cb(body);
           // return;
        //}
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
                location: [response.Shipment.ShipTo.Address.City + ", " + response.Shipment.ShipTo.Address.StateProvinceCode + " " + response.Shipment.ShipTo.Address.PostalCode],
                date: response.Shipment.Package.Activity.Date + response.Shipment.Package.Activity.Time
                }}
        });
    });
}





module.exports = {
    startup:startup,
    doLookup: doLookup
};




