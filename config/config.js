module.exports = {
    "name": "UPS Shipping",
    "acronym": 'UPS',
    "logging": { level: 'trace'},
    "customTypes":[
        {
            "key": 'upsShippingNumber',
            "regex": /(1Z?[0-9A-Z]{3}?[0-9A-Z]{3}?[0-9A-Z]{2}?[0-9A-Z]{4}?[0-9A-Z]{3}?[0-9A-Z])/,
            "isCaseSensitive": true,
            "isGlobal": true
        }
    ],
   "styles": [
        "./styles/shipping.less"
    ],
    "block": {
        "component": {
            "file": "./components/shipping.js"
        },
        "template": {
            "file": "./templates/shipping.hbs"
        }
    },
    "options":[
        {
            "key"          : "license",
            "name"         : "Access Key ",
            "description"  : "Access Key issued by UPS",
            "default"      : "",
            "type"         : "text",
            "userCanEdit" : true,
            "adminOnly"    : false
        }
    ]
};