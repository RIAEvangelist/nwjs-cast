var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var mdns = require('mdns-js');
var EventEmitter = require('events').EventEmitter;

/**
 * Chromecast Manager.
 * Exposes find, stopFinding, and devices
 * @class ChromecastManager
 * @typedef {object} ChromecastManager
 */
function ChromecastManager(){
    this.find=findChromecasts;
    this.stopFinding=stopFindingChromecasts;
    this.constructor=init;
    
    /**
     * Array of found chromecast refrences by ip
     * @type {Object}
     * @memberof ChromecastManager
     * @public
     */
    this.devices={};
    
    function init(){
        //lock scope vars
        Object.defineProperties(
            this,
            {
                find:{
                    value:findChromecasts
                },
                stopFinding:{
                    value:stopFindingChromecasts
                },
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
    
    /**
     * Starts looking for chromecasts
     * @function
     * @memberof ChromecastManager
     * @param {function} callback - triggered each time a new chromecast device is found.
     * @public 
     */
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
     * @memberof findChromecasts
     */
    function find(){
        browser.discover();   
    }
    
    /**
     * Triggered when service found by mdns browser
     * @function
     * @memberof findChromecasts
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
    
    /**
     * Stops looking for chromecasts
     * @function
     * @memberof ChromecastManager
     * @public 
     */
    function stopFindingChromecasts(){
        browser.stop();
    }
}

/**
 * Class for Chromecast objects
 * @class Chromecast
 * @param   {Object}   data   network information
 * @returns {EventEmitter} chromecast object
 */
function Chromecast(data) {
    var chromecast = new EventEmitter();
    
    //initialize object - for code completion in many IDEs
    /** chromecast name @type {string} */
    chromecast.name='';
    /** chromecast session id if connected @type {string} */
    chromecast.session='';
    /** chromecast status object @type {object} */
    chromecast.status={
        /** @function request status from chromecast */
        get:getStatus
    };
    /** chromecast ip @type {string} */
    chromecast.ip='';
    
    // set writeable and non writable chromecast values
    Object.defineProperties(
        chromecast,
        {
            name : {
                value:data.txt[4].replace('fn=','')
            },
            session:{
                value:'',
                writable:true
            },
            status:{
                value:{},
                writable:true
            },
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
    
    // set writeable and non writable chromecast.status values
    Object.defineProperties(
        chromecast.status,
        {
            get:{
                value:getStatus 
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
    
    /**
     * Request the chromecasts status
     * @public
     */
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

module.exports=ChromecastManager;