
// Define Parameters
var PluginParameters = [
{name:"Pitch Bend Variability", defaultValue:1, minValue:0, maxValue:4,numberOfSteps:4000,type:"lin"},
{name:"Poly Aftertouch Variability", defaultValue:0, minValue:0, maxValue:4,numberOfSteps:4000,type:"lin"},
{name:"Poly Aftertouch Offset", defaultValue:0, minValue:0, maxValue:127,numberOfSteps:127,type:"lin"},
{name:"CC Number", defaultValue:0, minValue:0, maxValue:127,numberOfSteps:127,type:"lin"},
{name:"CC Variability", defaultValue:0, minValue:0, maxValue:4,numberOfSteps:4000,type:"lin"},
{name:"CC Offset", defaultValue:0, minValue:0, maxValue:127,numberOfSteps:127,type:"lin"},
{name:"Global Seed", defaultValue:1, minValue:1, maxValue:100,numberOfSteps:99, type:"lin"},
];


//Pseudo random number generator between 0 and 1
function mulberry32(a) {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

//Convert random number to Normal Distribution
function randn_bm(globalSeed, noteSeed, x) {
    let u = 0, v = 0;
    while(u === 0) u = mulberry32(globalSeed*noteSeed+x); //Converting [0,1) to (0,1)
    while(v === 0) v = mulberry32(globalSeed*noteSeed*2+x);
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    return num;
}

//Convert Normal number to work with space size
function generate_Random(variance, globalSeed, noteSeed, min, max, offset) {
	num = randn_bm(globalSeed, noteSeed, 1);
	num = (num * (max-min) * variance/10);
	num = Math.floor(Math.max(min+0.5, Math.min(max+0.5, num + offset))) ;
	return num;
}

//Handle MIDI events
function HandleMIDI(event)
{ 
	event.trace();
	if (event instanceof NoteOn) {
		
		globalSeed=GetParameter("Global Seed")
		noteSeed = event.pitch;		
		
		variance=GetParameter("Pitch Bend Variability");
		if (variance!=0) {
 			var cc = new PitchBend;
 			offset=0
 			r=generate_Random(variance, globalSeed, noteSeed, -8192, 8191, offset);
			cc.value = r;                 
   			cc.send();                     /* send the event */
   			cc.trace();                    /* print the event to the console */
   		}

   		
   		variance=GetParameter("CC Variability");
   		offset=GetParameter("CC Offset");
   		if (variance!=0 || offset!=0) {
   			var cc = new ControlChange;	  		
   			cc.number=GetParameter("CC Number");   
   			cc.pitch=event.pitch; 
   			r=generate_Random(variance, globalSeed*3, noteSeed, 0, 127, offset);
			cc.value = r;                 
   			cc.send();                     /* send the event */
   			cc.trace();                    /* print the event to the console */
   		}

   			
   		variance=GetParameter("Poly Aftertouch Variability");
   		offset=GetParameter("Poly Aftertouch Offset");
   		if (variance!=0 || offset!=0) {
   			var cc = new PolyPressure;	  
   			cc.pitch=event.pitch; 
   			r=generate_Random(variance, globalSeed*2, noteSeed, 0, 127, offset);
			cc.value = r;                 
   			cc.send();                     /* send the event */
   			cc.trace();                    /* print the event to the console */
   		}
   		

	}

	event.send() 
}
