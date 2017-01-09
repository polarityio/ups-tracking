module.exports = {
    "name": "UPS Shipping",
    "acronym": 'UPS',
    "logging": { level: 'debug'},
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
            "name"         : "License Number",
            "description"  : "License Number issued by UPS",
            "default"      : "",
            "type"         : "text",
            "user-can-edit" : true,
            "admin-only"    : false
        },
        {
            "key"          : "userid",
            "name"         : "UserID",
            "description"  : "UserID provided when logging into UPS",
            "default"      : "",
            "type"         : "text",
            "user-can-edit" : true,
            "admin-only"    : false
        },
        {
            "key"          : "password",
            "name"         : "Password",
            "description"  : "Password used to authenticate to UPS",
            "default"      : "",
            "type"         : "password",
            "user-can-edit" : true,
            "admin-only"    : false
        }
    ]
};