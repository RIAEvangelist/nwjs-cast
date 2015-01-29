var nwjsCast=require('../../nwjs-cast');
var castManager=new nwjsCast();

castManager.find(foundDevice);

function foundDevice(chromecast){
    console.log('found chromecast : ',chromecast);
    
    chromecast.on(
        'status',
        function(status){
            console.log('chromecast status updated : ',status);
        }
    );
}