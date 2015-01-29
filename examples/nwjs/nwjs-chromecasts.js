var nwjsCast=require('../../nwjs-cast');
var castManager=new nwjsCast();

castManager.find(foundDevice);

function foundDevice(chromecast){
    setList();
    
    output(
        '</br><strong>Connected to : </strong></br>'+
        JSON.stringify(chromecast,false,'    ').replace(/\n/g,'<br>').replace(/\s/g,'&nbsp;')
    );
    
    chromecast.on(
        'status',
        function(status){
            output(
                '</br><strong>Chromecast updated :</strong> </br>'+
                JSON.stringify(status,false,'    ').replace(/\n/g,'<br>').replace(/\s/g,'&nbsp')
            );
        }
    );
}

window.addEventListener(
    'DOMContentLoaded',
    function(){
        castManager.find(foundDevice);
    }
);

function output(data){
    console.log(data);
    document.querySelector('p').innerHTML+=data+'</br>';
}

function setList(){
    var ul=document.querySelector('ul');
    ul.innerHTML='';
    for(var i=0, list=Object.keys(castManager.devices); i<list.length; i++){
        var li=document.createElement('li');
        li.innerText=list[i];
        ul.appendChild(li);
    }
}