var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var mdns = require('mdns-js');
var EventEmitter = require('events').EventEmitter;

/**
 * Chromecast Manager.
 * @class ChromecastManager
 */
function ChromecastManager(){
    
    
    this.constructor=init;
    
    
    function init(){
        Object.defineProperties(
            this,
            {
                /**
                 * Starts looking for chromecasts
                 * @method find
                 * @memberof ChromecastManager
                 * @param {function} callback - triggered each time a new chromecast device is found.
                 * @public 
                 */
                find:{
                    value:findChromecasts
                },
                /**
                 * Stops looking for chromecasts
                 * @method stopFinding
                 * @memberof ChromecastManager
                 * @public 
                 */
                stopFinding:{
                    value:stopFindingChromecasts
                },
                /**
                 * Object of found chromecast refrences by name
                 * @member {Object} devices found on the network
                 * @memberof ChromecastManager
                 * @public
                 */
                devices:{
                    value:{},
                    writeable:true
                },
                _manager:{
                    value:this
                }
            }
        );   
    }
    
    var browser=null;
    
    function findChromecasts(callback) {
        if(!callback){
            throw('findChromecasts requires a callback to trigger when a chromecast is found');   
        }
        
        if(browser){
            stopFindingChromecasts();
            browser=null;
        }

        browser=mdns.createBrowser('_googlecast._tcp');
        browser.foundCallback=callback;
        browser._manager=this;
        
        browser.on(
            'ready',
            find
        );

        browser.on(
            'update',
            foundDevice
        );
    }
    
    /**
     * Triggered when browser ready to start searching
     * @function - starts mdns browser searching
     * @memberof ChromecastManager
     * @private
     */
    function find(){
        browser.discover();   
    }
    
    /**
     * Triggered when service found by mdns browser
     * @function
     * @memberof ChromecastManager
     * @param {Object} data - mdns network object 
     * @private
     */
    function foundDevice(data){
        var chromecast = new Chromecast(data);
        if (this._manager.devices[chromecast.name]) {
            return;
        }
        this._manager.devices[chromecast.name] = chromecast;
        chromecast._register();
        this.foundCallback(chromecast);
    }
    
    function stopFindingChromecasts(){
        browser.stop();
    }
}

/**
 * Class for Chromecast objects
 * @class
 * @constructs chromecast
 * @param   {Object}   data   network information
 * @returns {EventEmitter} chromecast object
 */
function Chromecast(data) {
    
    /**
     * Chromecast Object
     * @member {object} chromecast refrence to a chromecast found on the network
     * @memberof Chromecast
     */
    var chromecast = new EventEmitter();
    
    Object.defineProperties(
        chromecast,
        {
            /** 
             * chromecast name 
             * @member {string} name of the chromecast device
             * @memberof chromecast
             * @public
             */
            name : {
                value:data.txt[4].replace('fn=','')
            },
            /** 
             * chromecast session id
             * @member {String} session id last used when connecting to chromecast
             * @memberof chromecast
             * @public
             */
            session:{
                value:'',
                writable:true
            },
            /** 
             * chromecast status object 
             * @member {Object} status information about the chromecasts current status
             * @memberof chromecast
             * @public
             */
            status:{
                value:{
                    /**
                     * Request the chromecast status
                     * @method get
                     * @memberof chromecast.status
                     * @public
                     */
                    get:getStatus 
                },
                writable:true
            },
            /** 
             * chromecast ip
             * @member {String} ip of this chromecast
             * @memberof chromecast
             * @public
             */
            ip:{
                value:data.addresses[0]
            },
            _networkData:{
                value:data
            },
            _client:{
                value:new Client()   
            },
            _register:{
                value:register   
            }
        }
    );
    
    chromecast._client.on(
        'error',
        function error(err) {
            chromecast.emit(
                'error',
                err
            );
            delete chromecast._manager.devices[chromecast.name];
            chromecast._client.close();
            chromecast.emit('disconnected');
            chromecast=null;
        }
    );
    
    function register(){
        chromecast._client.connect(
            chromecast.ip,
            connected
        );
    }
    
    function getStatus(){
        chromecast._client.receiver.getStatus(gotStatus);
    }
    
    /**
     * Triggered when chromecast sends status update. This will update the chromecast status object.
     * @param {Object} status chromecast status info
     * @memberof connected
     * @private
     */
    function setStatus(status) {
        for (var i = 0, keys = Object.keys(status); i < keys.length; i++) {
            chromecast.status[keys[i]] = status[keys[i]];
        }
        chromecast.emit('status',chromecast.status);
    }
    
    /**
     * Triggered with result from getStatus call
     * @memberof getStatus
     * @param {Object} err    error object
     * @param {Object} status chromecast status
     * @private
     */
    function gotStatus(err, status) {
        setStatus(status);
    }
    
    /**
     * Triggered when castv2 client connects to chromecast
     * @memberof Chromecast
     * @private
     */
    function connected() {
        chromecast._client.receiver.on(
            'status',
            setStatus
        );
        getStatus(gotStatus);
    }
    
    return chromecast;
}

/**
 * nwjs-cast chromecast implementation for node-webkit and node.js
 * @module nwjs/cast
 */
module.exports=ChromecastManager;