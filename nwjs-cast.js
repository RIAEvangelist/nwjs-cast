'use strict';
var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var mdns = require('mdns-js');
var EventEmitter = require('events').EventEmitter;

/**
* nwjs-cast chromecast implementation for node-webkit and node.js
* @module nwjs/cast
*/
module.exports=ChromecastManager;

/**
 * Chromecast Manager.
 * @class ChromecastManager
 */
function ChromecastManager(){
    Object.defineProperties(
        this,
        {
            find:{
                value:findChromecasts,
                enumerable:true
            },
            stopFinding:{
                value:stopFindingChromecasts,
                enumerable:true
            },
            /**
             * Object of found chromecast refrences by name
             * @member {Object} devices found on the network
             * @memberof ChromecastManager
             * @public
             */
            devices:{
                value:{},
                writeable:true,
                enumerable:true
            }
        }
    );
    
    this._browser=null;
    
    /**
    * Starts looking for chromecasts
    * @method find
    * @memberof ChromecastManager
    * @param {function} callback - triggered each time a new chromecast device is found.
    * @public
    */
    function findChromecasts(callback) {
        if(!callback){
            throw('findChromecasts requires a callback to trigger when a chromecast is found');
        }
        
        if(this._browser){
            this.stopFinding();
        }
        
        this._browser=mdns.createBrowser('_googlecast._tcp');
        
        this._browser._manager=this;
        this._browser.foundCallback=callback;
        this._browser._chromecastScanTimer=setTimeout(
            function(){
                var timer=this;
                timer.findChromecasts.apply(
                    timer._browser._manager,
                    [timer._browser.foundCallback]
                );
            },
            10000
        );
        this._browser._chromecastScanTimer.findChromecasts=findChromecasts;
        this._browser._chromecastScanTimer._browser=this._browser;        
    
        this._browser.on(
            'ready',
            function(){
                var browser=this;
                this.discover();
            }
        );
        this._browser.on(
            'update',
            foundDevice
        );
    }

    /**
     * Triggered when service found by mdns browser
     * @function
     * @memberof ChromecastManager
     * @param {Object} data - mdns network object
     * @private
     */
    function foundDevice(data){
        
//        if(data.networkInterface=='pseudo multicast'){
//            return;
//        }
        var browser=this;
        var chromecast = new Chromecast(data);
        if (this._manager.devices[chromecast.name]) {
            return;
        }
        browser._manager.devices[chromecast.name] = chromecast;
        chromecast._register();
        browser.foundCallback(chromecast);
    }

    /**
    * Stops looking for chromecasts
    * @method stopFinding
    * @memberof ChromecastManager
    * @public
    */
    function stopFindingChromecasts(){
        clearTimeout(this._browser._chromecastScanTimer);
        delete this._browser._chromecastScanTimer;
        this._browser.stop();
        this._browser=null;
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
                value:data.txt[4].replace('fn=',''),
                enumerable:true
            },
            /**
             * chromecast session id
             * @member {String} session id last used when connecting to chromecast
             * @memberof chromecast
             * @public
             */
            session:{
                value:'',
                writable:true,
                enumerable:true
            },
            /**
             * chromecast status object
             * @member {Object} status information about the chromecasts current status
             * @memberof chromecast
             * @public
             */
            status:{
                value:{
                    get:getStatus
                },
                writable:true,
                enumerable:true
            },
            /**
             * chromecast ip
             * @member {String} ip of this chromecast
             * @memberof chromecast
             * @public
             */
            ip:{
                value:data.addresses[0],
                enumerable:true
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
            this.client.close();
            console.log(err);
            chromecast.emit('disconnected');
            delete chromecast._manager.devices[chromecast.name];
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
    * Request the chromecast status
    * @method get
    * @memberof chromecast.status
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