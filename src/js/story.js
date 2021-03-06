require("./lib/social"); //Do not delete
var d3 = require('d3');


var offset_top = 500;

// helpful functions:
var formatthousands = d3.format("0,000");

// CODE FOR INTERACTIVES -------------------------------------------------------

// function to draw scatter chart
var drawDots = function(key){

  var margin = {
    top: 20,
    right: 25,
    bottom: 70,
    left: 40
  };

  if (screen.width > 768) {
    var width = 500 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
  } else if (screen.width <= 768 && screen.width > 480) {
    var width = 500 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
  } else if (screen.width <= 480) {
    var margin = {
      top: 15,
      right: 25,
      bottom: 70,
      left: 32
    };
    var width = 310 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;
  }

  // show tooltip
  // show tooltip
  var tooltipDots = d3.select("body").append("div")
    .attr("class", "tooltip-dots")

  // convert strings to numbers
  bubbleData.forEach(function(d) {
    d.bookings = +d.bookings;
    d.population = +d.population;
  });

  // x-axis scale
  var x = d3.scale.linear()
      .rangeRound([0, width]);

  // y-axis scale
  var y = d3.scale.linear()
      .rangeRound([height, 0]);

  // use x-axis scale to set x-axis
  if (screen.width <= 480) {
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(5);
  } else {
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
  }

  // use y-axis scale to set y-axis
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")

  // create SVG container for chart components
  var svg = d3.select("#"+key).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain([0,2000]);//.nice();
  y.domain([0,220]); //.nice();

  if (screen.width <= 480) {
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width+15)
        .attr("y", 45)
        .style("text-anchor", "end")
        .text("Population over 5 years old (2015 and 2016)");
  } else {
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width+10)
        .attr("y", 50)
        .style("text-anchor", "end")
        .text("Shelter population over 5 years old (2015 and 2016)");
  }

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 15)
      .attr("x", 0)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Juvenile hall bookings (2015 and 2016)")

  //color in the dots
  svg.selectAll(".dot")
      .data(bubbleData)
      .enter().append("circle")
      .attr("id", function(d) {
        return d.shelter.replace(/\s/g, '').toLowerCase();
      })
      .attr("class", function(d) {
        return "dot "+d.shelter.replace(/\s/g, '').toLowerCase();
      })
      .attr("r", function(d) {
        return 15;
      })
      .attr("cx", function(d) { return x(d.populationSixPlus); })
      .attr("cy", function(d) { return y(d.bookings); })
      .style("stroke","#696969")
      .style("opacity","1.0")
      .style("fill", function(d) {
        return "#c12020";
      })
      .on("mouseover", function(d) {
          tooltipDots.html(`
              <div><b>${d.shelter}</b></div>
              <div>Population over 5 years old: <b>${formatthousands(d.populationSixPlus)}</b></div>
              <div>Juvenile hall bookings: <b>${formatthousands(d.bookings)}</b></div>
          `);
          tooltipDots.style("visibility", "visible");
      })
      .on("mousemove", function() {
        if (screen.width <= 480) {
          return tooltipDots
            .style("top",(d3.event.pageY+20)+"px")//(d3.event.pageY+40)+"px")
            .style("left",30+"px");
        } else {
          return tooltipDots
            .style("top", (d3.event.pageY+20)+"px")
            .style("left",(d3.event.pageX-80)+"px");
        }
      })
      .on("mouseout", function(){return tooltipDots.style("visibility", "hidden");});

  var node = svg.selectAll(".circle")
    .data(bubbleData)
    .enter().append("g")
    .attr("class","node");

  node.append("text")
      .attr("x", function(d) {
        return x(d.populationSixPlus)-50
      })
      .attr("y", function(d) {
        return y(d.bookings)+40;
      })
      .style("font-size","12px")
      .style("font-family","AntennaMedium")
      .text(function(d) {
        if (d.shelter == "Mary Graham Children's Shelter") {
          return d.shelter;
        } else {
          return "";
        }
      });

}

// tooltip information
function tooltip_function (d) {
  if (d.Note){
    var html_str = "<div class='name bold'>"+d.Name+"</div><div>"+d.Address+"</div><div>Count in 2016: <span class='bold'>"+formatthousands(d.Count2016)+"</span></div><div>"+d.Note+"</div>"
    return html_str;
  } else {
    var html_str = "<div class='name bold'>"+d.Name+"</div><div>"+d.Address+"</div><div>Count in 2016: <span class='bold'>"+formatthousands(d.Count2016)+"</span></div>"
    return html_str;
  }
}

// function to create map
var drawMap = function(key,mapDataFLAG) {

  // setting parameters for the center of the map and initial zoom level
  if (screen.width <= 480) {
    var sf_lat = 36.85;
    var sf_long = -118.53;
    var zoom_deg = 5;
  } else {
    var sf_lat = 37.14
    var sf_long = -121.5;
    var zoom_deg = 6;
  }

  // show tooltip
  var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip-map")
    .attr("id","tooltip-map");

  //get access to Leaflet and the map
  var element = document.querySelector(key);

  // add tiles to the map
  var Stamen = L.tileLayer("https://api.mapbox.com/styles/v1/emro/cj2i9mx33001b2rqov44u9fux/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZW1ybyIsImEiOiJjaXl2dXUzMGQwMDdsMzJuM2s1Nmx1M29yIn0._KtME1k8LIhloMyhMvvCDA",{attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>'})

  // initialize map with center position and zoom levels
  var map = L.map(key, {
    zoomControl: false
  }).setView([sf_lat,sf_long], zoom_deg);;
  // window.map = map;

  map.addLayer(Stamen);

  // dragging and zooming controls
  map.scrollWheelZoom.disable();
  map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.keyboard.disable();

  // initializing the svg layer
  map._initPathRoot();

  // creating Lat/Lon objects that d3 is expecting
  mapData.forEach(function(d,idx) {
  	d.LatLng = new L.LatLng(d.Lat,
  							d.Long);
  });

  var svg = d3.select("#"+key).select("svg"),
  g = svg.append("g");

  // adding circles to the map
  var feature = g.selectAll("circle")
    .data(mapData)
    .enter().append("circle")
    // .attr("id",function(d) {
    //   return d.Facility;
    // })
    .attr("class",function(d) {
      return "dot mapdot";
    })
    .style("opacity", function(d) {
      return "0.8";
    })
    .style("fill", function(d) {
      return "#c12020";//"#3C87CF";
    })
    .style("stroke","#696969")
    .attr("r", function(d) {
      if (screen.width <= 480) {
        return d.Count2016/100+6;
      } else {
        return d.Count2016/100+10;
      }
    })
    .on('mouseover', function(d) {
      var html_str = tooltip_function(d);
      tooltip.html(html_str);
      tooltip.style("visibility", "visible");
    })
    .on("mousemove", function() {
      if (screen.width <= 480) {
        return tooltip
          .style("top",(d3.event.pageY+20)+"px")//(d3.event.pageY+40)+"px")
          .style("left",30+"px");
      } else {
        return tooltip
          .style("top", (d3.event.pageY+20)+"px")
          .style("left",(d3.event.pageX-100)+"px");
      }
    })
    .on("mouseout", function(){
        return tooltip.style("visibility", "hidden");
    })
    .on('click', function(d) {
      if (screen.width <= 480) {
        var html_str = tooltip_function(d);
        tooltip.html(html_str);
        tooltip.style("visibility", "visible")
        tooltip.style("top",(d3.event.pageY+20)+"px")
        tooltip.style("left",30+"px")
      }
    });

    map.on("viewreset", update);
    update();

    function update() {
    feature.attr("transform",
    function(d) {
      return "translate("+
        map.latLngToLayerPoint(d.LatLng).x +","+
        map.latLngToLayerPoint(d.LatLng).y +")";
      }
    )
  }

  var node = svg.selectAll(".circle")
    .data(mapData)
    .enter().append("g")
    .attr("class","node");

  node.append("text")
    .attr("x", function(d) {
      return map.latLngToLayerPoint(d.LatLng).x+20;
    })
    .attr("y", function(d) {
      return map.latLngToLayerPoint(d.LatLng).y+5;
    })
    .attr("id", function(d) {
    })
    .style("font-size", function(d){
      return "14px";
    })
    .style("font-family", function(d){
      return "AntennaMedium";
    })
    .text(function(d) {
      if (d.Name == "Mary Graham Children's Shelter"){
        if (screen.width <= 380) {
          return "Mary Graham Shelter"
        } else {
          return d.Name
        }
      } else {
        return "";
      }
    });


}

// if (screen.width <= 480) {
//
//   setTimeout(
//     function() {
//
//     // event listener for each dot
//     var qsa = s => Array.prototype.slice.call(document.querySelectorAll(s));
//     console.log(qsa(".mapdot"));
//     qsa(".mapdot").forEach(function(group,index) {
//       group.addEventListener("click", function(e) {
//         document.querySelector("#tooltip-map").innerHTML = tooltip_function(mapData[index]);
//         d3.select("#tooltip-map").style("visibility", "visible");
//         d3.select("#tooltip-map").style("top",20+"px")//(d3.event.pageY+40)+"px")
//         d3.select("#tooltip-map").style("left",30+"px");
//         // highlight the appropriate dot
//         // d3.selectAll(".dot").style("opacity", "0.2");
//         // d3.select("#"+e.target.classList[1]).style("opacity","1.0");
//
//       });
//     });
//   },5000);
//
// }

// function to draw icons
var active_num, lastactive_num, inactive_num;
var drawIcons = function(html_str,key) {

  if (screen.width > 480) {

    var count = 0;
    html_str += "<div class='icon-container'>";
    for (var ii=0; ii< 31; ii++) {
      html_str += "<div class='icon icons-arrests icons-bookings icons-pursued icons-probation' id='icon"+String(count)+"'><i class='fa fa-male' aria-hidden='true'></i></div>";
      count++;
    };
    for (var ii=0; ii< 22; ii++) {
      html_str += "<div class='icon icons-arrests icons-bookings icons-pursued' id='icon"+String(count)+"'><i class='fa fa-male' aria-hidden='true'></i></div>";
      count++;
    };
    for (var ii=0; ii< 115; ii++) {
      html_str += "<div class='icon icons-arrests icons-bookings' id='icon"+String(count)+"'><i class='fa fa-male' aria-hidden='true'></i></div>";
      count++;
    };
    for (var ii=0; ii< 91; ii++) {
      html_str += "<div class='icon icons-arrests' id='icon"+String(count)+"'><i class='fa fa-male' aria-hidden='true'></i></div>";
      count++;
    };
    html_str += "</div><div class='interactive-caption scrolly'><div class='interactive-entry'><b>Source:</b> San Joaquin County Probation Department</div><div class='interactive-entry'><b>About the data:</b> The figures show all juvenile hall bookings stemming from arrests at Mary Graham’s campus. A small number of bookings from August – December 2016 may have followed off-campus arrests of children living at Mary Graham. Three cases were pending as of February, when the records were obtained. </div><div class='interactive-entry interactive-author'>Emma O'Neill, The Chronicle</div></div></div>";
    return html_str;

  } else {

    if (key == "icon-arrests") {
      active_num = 259;
      lastactive_num = 0;
      inactive_num = 0;
    } else if (key == "icon-bookings") {
      active_num = 199;
      lastactive_num = 60;
      inactive_num = 0;
    } else if (key == "icon-pursued") {
      active_num = 53;
      lastactive_num = 141;
      inactive_num = 65;
    } else if (key == "icon-probation") {
      active_num = 31;
      lastactive_num = 24;
      inactive_num = 204;
    }

    html_str += "<div class='icon-container'>";
    var count = 0;
    for (var ii=0; ii< active_num; ii++) {
      html_str += "<div class='icon "+key+" show"+"' id='icon"+String(count)+"'><i class='fa fa-male' aria-hidden='true'></i></div>";
      count++;
    };
    for (var ii=0; ii< lastactive_num; ii++) {
      html_str += "<div class='icon "+key+" dark"+"' id='icon"+String(count)+"'><i class='fa fa-male' aria-hidden='true'></i></div>";
      count++;
    };
    for (var ii=0; ii< inactive_num; ii++) {
      html_str += "<div class='icon "+key+"' id='icon"+String(count)+"'><i class='fa fa-male' aria-hidden='true'></i></div>";
      count++;
    };
    html_str += "</div>";
    return html_str;
  }

}


// ------------------------------------------------------------------------------------------------------------------------
drawDots("dots");

drawMap("map","count");

if (screen.width <= 480) {
  ["icons-arrests","icons-bookings","icons-pursued","icons-probation"].forEach(function(icon){
    var key = "icon-"+icon.split("-")[1]
    var html_str = drawIcons("",key);
    document.getElementById(icon).innerHTML = html_str;
  });

} else {
  var html_str = drawIcons("",'arrests');
  document.getElementById('icons-arrests').innerHTML = html_str;
}

window.onresize = function(){ location.reload(); }

var offsetVar = 280;
console.log("280");
if (screen.width <= 1400){
  var offsetVar = 260;
  console.log("260");
}
if (screen.width <= 860){
  var offsetVar = 150;
  console.log("150");
}

var prevIDX = -1;
// var currentIDX = -1;
var icons_list = ["icons-arrests","icons-bookings","icons-pursued","icons-probation"];
var current_icons = "icons-arrests";
$(window).scroll(function () {

  var currentIDX = -1;
  var pos = $(this).scrollTop();

  [0,1,2,3].forEach(function(slide,slideIDX) {
    var pos_slides = $('#slide-top-'+slideIDX).offset().top-400;
    if (pos > pos_slides) {
      currentIDX = Math.max(slideIDX,currentIDX);
    }
  });

  if (screen.width > 480) {

    var pos_icons_top = $("#slide-top-0").offset().top-37;
    var pos_icons_bottom = $("#slide-top-3").offset().top+offsetVar;
    var sticker_ph = document.getElementById('stick-ph');
    if ((pos > pos_icons_top) && (pos < pos_icons_bottom)) {
      $("#icons-arrests").addClass("fixedInteractive");
      sticker_ph.style.display = 'block';
    } else {
      $("#icons-arrests").removeClass("fixedInteractive");
      sticker_ph.style.display = 'none';
    }
  }

  if (currentIDX != prevIDX && currentIDX > -1) {
    current_icons = icons_list[currentIDX];
    console.log("switching slide");

    document.getElementById(["slide-top-"+currentIDX]).classList.add("active");

    var targetDivs = document.getElementById(["slide-top-"+currentIDX]).getElementsByClassName("bold");
    if (targetDivs.length > 0) {
      if (targetDivs.length > 1) {
        targetDivs.forEach(function(target){
          target.classList.add("boldColor");
        });
      } else {
        targetDivs[0].classList.add("boldColor");
      }
    }

    if (screen.width > 480) {
      var icon_list = document.getElementsByClassName("icon");
      for (var j=0; j<icon_list.length; j++) {
        icon_list[j].classList.remove("active");
      }
    }
    // if ((currentIDX == "icons-arrests") || (currentIDX == "icons-bookings") || (currentIDX == "icons-pursued") || (currentIDX == "icons-probation")){

    if (screen.width <= 480) {
      // var timer = setTimeout(
        var targetIcons = document.getElementById(current_icons).getElementsByClassName("show");
        Array.from(targetIcons).forEach(function(element,idx){
            $(function(){
              setTimeout(function() {
                element.classList.add("active");
              }, 1000+40*idx);
            });
        })
      // ,500);
    } else {
      Array.from(icon_list).forEach(function(element,idx){
        if (element.classList.contains(current_icons)) {
          element.classList.add("active");
        } else {
          element.classList.remove("active");
        }
      });
    }
    prevIDX = currentIDX;

  }

});


if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());
}
