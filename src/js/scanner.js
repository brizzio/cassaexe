//var db = new PouchDB('cashier');
//var cnv = document.querySelector('#camera') 

var scans = new PouchDB('scans');


var detections = []

/* scans.info().then(function (info) {
    console.log(info);
}) */


// barcode scanner
var last_codes = []
var infos = []
var images = []
var obj = {}

var options = {
  inputStream : {
    name : "Live",
    type : "LiveStream",
    target: document.querySelector('#camera')   // Or '#yourElement' (optional)
  },
  decoder : {
    readers : ["code_128_reader", "ean_8_reader", "ean_reader"]
  }
}

var cb = function(err) {
  if (err) {
      console.log(err);
      return
  }
  console.log("Initialization finished. Ready to start");
  Quagga.initialized = true
  Quagga.start();
}

if (Quagga.initialized == undefined){


    Quagga.onDetected(function(data){

        var video = document.getElementsByTagName('video')[0]; //border: 1px solid #fff

        var canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        var ctx = canvas.getContext('2d');
     
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);    
        var dataURI = canvas.toDataURL('image/jpeg')
        //console.log(dataURI )
        
        images.push({[data.codeResult.code]:dataURI})

        let info = (infos.findIndex(object => object.code === data.codeResult.code) === -1) 
        ? 
        {
            code:data.codeResult.code,
            format:data.codeResult.format
        }
        :
        undefined

        if(info){infos.push(info)}

        
        last_codes.push(data.codeResult.code)
        
        console.log(last_codes)
    
        if (last_codes.length > 20){
            console.log(last_codes)
            var code = mode(last_codes)
            last_codes = [];
            Quagga.stop()
            var readed = {}
            images.forEach(function(el){
                if (el[code]){
                    Object.assign(readed, el)
                }
            })

            readed.format = infos.find(x => x.code === code).format;


           
           /*  var readed = findObjectInArray(images, code)
                    .then(function(res){return res})
                    .catch(function(err){return err}) */
            
            console.log('images ...' , images)
            console.log('infos ...' , infos)
            
            console.log('most frequent ...' , code)

            console.log('readed ...' , readed)
            
            addScan(code,readed.format,readed[code])

            setTimeout(Quagga.init(options, cb), 5000)
           
            //process_identified_code(code)
        }
    });

}


Quagga.init(options, cb);

  


  /* start Pouch DB functions ###################################################################### */

  function addScan(cod,type,uri) {
    var timeStampInMs = window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart ? window.performance.now() + window.performance.timing.navigationStart : Date.now();

    var scan = {
      _id: new Date().toISOString(),
      uid:uuidv4(),
      timestamp: timeStampInMs,
      title: cod,
      completed: false,
      code:cod,
      type:type,
      uri:uri,
      user_id:'system',
      application:'cashier',
      device: 'cashier'
    };
    
    add(scan)
  }

  function add(reg) {
    
    scans.put(reg).then(function (result) {
      console.log("everything is A-OK");
      console.log(result);
    }).catch(function (err) {
      console.log('everything is terrible');
      console.log(err);
    });
  }

  /* end Pouch DB functions -------------------------------------------------------------------------- */




  function findObjectInArray(arr, ref){

    return new Promise(function(resolve, reject){

        resp = {}
        for (let i = 0; i < arr.length; i++) {
            console.log(arr[i])
            
            for (let k = 0; k < Object.keys(arr[i]).length; k++) {
                console.log('base ... ', Object.keys(arr[i])[k], ref, (Object.keys(arr[i])[k] === ref))
                if (Object.keys(arr[i])[k] === ref) { 
                    console.log('ponto  ... ',arr[i][k])
                    resp[ref]=arr[i][k]
                    break; 
                }
            }
            
          }
        
          resolve(resp)


    })
    

  }


// if you want to preview the captured image,
// attach the canvas to the DOM somewhere you can see it.

//console.log(cnv)

   

  function process_identified_code(c){
    
    
    console.log("identificou o codigo")
    
 


    for (let i = 0; i < images.length; i++) {
        var [key, value] = Object.entries(images[i])
        console.log(key, c, (key === c))
        if (key === c) { 
            obj[c]=value
            break; 
        }
      }


      var parElement = document.getElementById("produtos");

      var newdiv = document.createElement("div");

      var img = new Image();
      img.src =  obj[c]

      var textToAdd = document.createTextNode("codigo >>> " + c);

      newdiv.appendChild(img)
      newdiv.appendChild(textToAdd)

      parElement.appendChild(newdiv);  

    console.log(obj)
    //printCollectedResults()
    //console.log(images)

  
   

  }

  function order_by_occurrence(arr){
    var counts  = {}
    Array(arr).forEach(function(value) {
        if (!counts[value]){counts[value]=0} 
        counts[value]++
        console.log(counts)
    });
    
    //return Object.keys(counts).sort(function(curKey,nextKey){
    //    return counts[curKey]< counts[nextKey]
    //})


}

function mode(arr){
    return arr.sort((a,b) =>
          arr.filter(v => v===a).length
        - arr.filter(v => v===b).length
    ).pop();
}



  

  var tsts = ['11547181', '11547181', '11547181', '11547181', '11547181', '11547181', '80843122', '80843122', '80843122', '80843122', '80843122', '80843122', '80843122', '80843122', '80843122', '80843122', '80843122', '80843122', '80843122', '21140129', '21140129', '21140129', '21140129', '21140129', '21140129']
  
  