##Modules
<dl>
<dt><a href="#module_nwjs/cast">nwjs/cast</a></dt>
<dd><p>nwjs-cast chromecast implementation for node-webkit and node.js</p>
</dd>
</dl>
##Globals
<dl>
<dt><a href="#ChromecastManager">class: ChromecastManager</a></dt>
<dd></dd>
<dt><a href="#chromecast">class: chromecast</a></dt>
<dd></dd>
</dl>
<a name="module_nwjs/cast"></a>
##nwjs/cast
nwjs-cast chromecast implementation for node-webkit and node.js

<a name="ChromecastManager"></a>
##class: ChromecastManager

* [class: ChromecastManager](#ChromecastManager)
  * [new ChromecastManager()](#new_ChromecastManager_new)
  * _static_
    * [.devices](#ChromecastManager.devices) → <code>Object</code>
    * [.find(callback)](#ChromecastManager.find)
    * [.stopFinding()](#ChromecastManager.stopFinding)

<a name="new_ChromecastManager_new"></a>
###new ChromecastManager()
Chromecast Manager.

<a name="ChromecastManager.devices"></a>
###ChromecastManager.devices → <code>Object</code>
Object of found chromecast refrences by name

**Access:** public  
<a name="ChromecastManager.find"></a>
###ChromecastManager.find(callback)
Starts looking for chromecasts

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | triggered each time a new chromecast device is found. |

**Access:** public  
<a name="ChromecastManager.stopFinding"></a>
###ChromecastManager.stopFinding()
Stops looking for chromecasts

**Access:** public  
<a name="chromecast"></a>
##class: chromecast

* [class: chromecast](#chromecast)
  * [new Chromecast(data)](#new_chromecast_new)
  * _static_
    * [.name](#chromecast.name) → <code>string</code>
    * [.session](#chromecast.session) → <code>String</code>
    * [.status](#chromecast.status) → <code>Object</code>
      * [.get()](#chromecast.status.get)
    * [.ip](#chromecast.ip) → <code>String</code>

<a name="new_chromecast_new"></a>
###new Chromecast(data)
Class for Chromecast objects

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | network information |

**Returns**: <code>EventEmitter</code> - chromecast object  
<a name="chromecast.name"></a>
###chromecast.name → <code>string</code>
chromecast name

**Access:** public  
<a name="chromecast.session"></a>
###chromecast.session → <code>String</code>
chromecast session id

**Access:** public  
<a name="chromecast.status"></a>
###chromecast.status → <code>Object</code>
chromecast status object

**Access:** public  
<a name="chromecast.status.get"></a>
####status.get()
Request the chromecast status

**Access:** public  
<a name="chromecast.ip"></a>
###chromecast.ip → <code>String</code>
chromecast ip

**Access:** public  
