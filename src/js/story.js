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
    bottom: 25,
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
      right: 10,
      bottom: 25,
      left: 30
    };
    var width = 310 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;
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
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

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

  x.domain([0,3000]);//.nice();
  y.domain([0,250]); //.nice();

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -10)
      .style("text-anchor", "end")
      .text("Shelter population (2016)");

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
      .text("Bookings at facility (2016)")

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
      .attr("cx", function(d) { return x(d.population); })
      .attr("cy", function(d) { return y(d.bookings); })
      .style("stroke","#696969")
      .style("opacity","1.0")
      .style("fill", function(d) {
        return "#c12020";
      })
      .on("mouseover", function(d) {
          tooltipDots.html(`
              <div><b>${d.shelter}</b></div>
              <div>Population in 2016: <b>${formatthousands(d.population)}</b></div>
              <div>Bookings in 2016: <b>${formatthousands(d.bookings)}</b></div>
          `);
          tooltipDots.style("visibility", "visible");
      })
      .on("mousemove", function() {
        if (screen.width <= 480) {
          return tooltipDots
            .style("top",(d3.event.pageY+40)+"px")//(d3.event.pageY+40)+"px")
            .style("left",10+"px");
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
        return x(d.population)-50
      })
      .attr("y", function(d) {
        return y(d.bookings)+40;
      })
      .style("font-size","12px")
      .style("font-family","AntennaMedium")
      .text(function(d) {
        if (d.shelter == "Mary Graham-San Joaquin County") {
          return d.shelter;
        } else {
          return "";
        }
      });

}

// function to create map
var drawMap = function(key,mapDataFLAG) {

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
    .attr("class", "tooltip-map");

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
    .attr("id",function(d) {
      return d.Facility;
    })
    .attr("class",function(d) {
      return "dot "+d.Facility;
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
          .style("top",70+"px")
          .style("left",40+"px");
      } else {
        return tooltip
          .style("top", (d3.event.pageY+20)+"px")
          .style("left",(d3.event.pageX-100)+"px");
      }
    })
    .on("mouseout", function(){
        return tooltip.style("visibility", "hidden");
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
      if (screen.width <= 480) {
        return "14px";
      } else {
        return "16px";
      }
    })
    .style("font-family", function(d){
      if (screen.width <= 480) {
        return "AntennaMedium";
      } else {
        return "AntennaExtraLight";
      }
    })
    .text(function(d) {
      if (d.Name == "Mary Graham Children's Shelter"){
        if (screen.width <= 340) {
          return "Mary Graham Shelter"
        } else {
          return d.Name
        }
      } else {
        return "";
      }
    });


}

// function to create bar chart
var drawBars = function() {

  // show tooltip
  var bar_tooltip = d3.select("div.tooltip-bars");

  // setting sizes of interactive
  var margin = {
    top: 15,
    right: 50,
    bottom: 50,
    left: 70
  };
  if (screen.width > 768) {
    var width = 900 - margin.left - margin.right;
    var height = 420 - margin.top - margin.bottom;
  } else if (screen.width <= 768 && screen.width > 480) {
    var width = 720 - margin.left - margin.right;
    var height = 420 - margin.top - margin.bottom;
  } else if (screen.width <= 480 && screen.width > 340) {
    console.log("big phone");
    var margin = {
      top: 20,
      right: 20,
      bottom: 70,
      left: 30
    };
    var width = 340 - margin.left - margin.right;
    var height = 360 - margin.top - margin.bottom;
  } else if (screen.width <= 340) {
    console.log("mini iphone")
    var margin = {
      top: 20,
      right: 20,
      bottom: 70,
      left: 43
    };
    var width = 310 - margin.left - margin.right;
    var height = 360 - margin.top - margin.bottom;
  }

  // x-axis scale
  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], 0.2);

  // y-axis scale
  var y = d3.scale.linear()
      .rangeRound([height, 0]);

  x.domain(bubbleData.map(function(d) {
    return d.short_name;
  }));
  y.domain(d3.extent(bubbleData, function(d) { return d.arrests; })).nice();

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");
      // .tickFormat(d3.time.format("%Y"));

  // use y-axis scale to set y-axis
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(d3.format(".2s"));

  // create SVG container for chart components
  var svgBars = d3.select(".bar-chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svgBars.selectAll("bar")
      .data(bubbleData)
    .enter().append("rect")
      .style("fill", "#6790B7")
      .attr("x", function(d) { return x(d.short_name); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(+d.arrests); })
      .attr("height", function(d) {
        return height - y(+d.arrests);
      })
      .on("mouseover", function(d) {
        bar_tooltip.html(`
            <div>Shelter: <b>${d.shelter}</b></div>
            <div>Arrests: <b>${(d.arrests)}</b></div>
        `);
        bar_tooltip.style("visibility", "visible");
      })
      .on("mousemove", function(d) {
        if (screen.width <= 480) {
          return bar_tooltip
            .style("top", (d3.event.pageY+20)+"px")
            .style("left",d3.event.pageX/2+20+"px");
        } else {
          return bar_tooltip
            .style("top", (d3.event.pageY+20)+"px")
            .style("left",(d3.event.pageX-80)+"px");
        }
      })
      .on("mouseout", function(){return bar_tooltip.style("visibility", "hidden");});

  if (screen.width <= 480) {
    svgBars.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)" );
      svgBars.append("g")
        .attr("transform", "translate(0," + height + ")")
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", 60)
        .style("text-anchor", "end")
        .text("Childrens' shelters")
  } else {
    svgBars.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        // .selectAll("text")
        //     .style("text-anchor", "end")
        //     .attr("dx", "1em")
        //     .attr("dy", "1em")
          // .attr("transform", "rotate(-65)" )
        .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", 45)
          .style("text-anchor", "end")
          .text("California childrens' shelters")
  }

  if (screen.width <= 480){
    svgBars.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("dy", "20px")
        .style("text-anchor", "end")
        .text("Total arrests in 2016");
  } else {
    svgBars.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("dy", "-45px")
        .style("text-anchor", "end")
        .text("Total arrests in 2016");
  };

}

// function to draw bubbles
var drawBubbles = function(key,flag,highlight) {

  // show tooltip
  // var bubbles_tooltip = d3.select("div.tooltip-bubbles");

  if (screen.width > 768) {
    var diameter = 500;
    var margin = {
      right: 30,
      left: 30
    }
    var topbuffer = 20;
  } else if (screen.width <= 768 && screen.width > 480) {
    var diameter = 500;
    var margin = {
      right: 15,
      left: 15
    }
    var topbuffer = 20;
  } else if (screen.width <= 480 && screen.width > 340) {
    var diameter = 360;
    var margin = {
      right: 5,
      left: 5
    }
    var topbuffer = 20;
  } else if (screen.width <= 340) {
    var diameter = 300;
    var margin = {
      right: 5,
      left: 5
    }
    var topbuffer = 20;
  }

  var width = diameter-margin.left-margin.right;
  var height = diameter-topbuffer; //because the bubbles aren't arranged so they're square
  // var color = d3.scale.category20b();

  var svg = d3.select("#"+key).append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + 0 + ")"); // giving the bubbles some padding, so that the text won't get cut off on the right and left margins

  var bubble = d3.layout.pack()
      .sort(null)
      // .sort(function(a, b) {
      //   return -(a.value - b.value);
      // }) // sorting from biggest to smallest
      .size([width, height])
      .padding(2)
      .value(function(d){
        if (flag == 1) {
          if (d.call_types == "Runaway") {
            return 0;
          }
        }
        return +d.call_totals;
      });

  // adding the nodes to the chart (automatically generate attributes)
  var nodes = bubble.nodes({children: callsData})
    .filter(function(d) { return !d.children; }); // filter out the outer bubble

  var node = svg.selectAll('.node')
    .data(nodes, d => d.call_types);

  //setup the chart
  var bubbles = svg.append("g")
      .attr("transform", "translate(0,0)")
      .selectAll(".bubble")
      .data(nodes)
      .enter()
      .append("g");
      // .on("mouseover", function(d) {
      //   bubbles_tooltip.html(`
      //       <div>Call type: <b>${d.call_types}</b></div>
      //       <div>Total calls: <b>${formatthousands(d.call_totals)}</b></div>
      //   `);
      //   bubbles_tooltip.style("visibility", "visible");
      // })
      // .on("mousemove", function(d) {
      //   if (screen.width <= 480) {
      //     return bubbles_tooltip
      //       .style("top", (d3.event.pageY+20)+"px")
      //       .style("left",d3.event.pageX/2+20+"px");
      //   } else {
      //     return bubbles_tooltip
      //       .style("top", (d3.event.pageY+20)+"px")
      //       .style("left",(d3.event.pageX-80)+"px");
      //   }
      // })
      // .on("mouseout", function(){return bubbles_tooltip.style("visibility", "hidden");});

  //create the bubbles
  bubbles.append("circle")
      .attr("r", function(d){ return d.r; })
      .attr("cx", function(d){ return d.x; })
      .attr("cy", function(d){ return d.y; })
      .style("opacity",function(d) {
        console.log(d);
        // return "0.7";
        if (d.call_types == highlight) {
          return 0.8;
        } else {
          return 0.6;
        }
      })
      .style("fill", function(d) {
        return "#8E0000";
      });

  //format the text for each bubble
  bubbles.append("text")
      .attr("x", function(d){
        if (d.call_types == "Runaway") {
          return d.x;
        } else {
          return d.x;
        }
      })
      .attr("y", function(d){ return d.y + 5; })
      .attr("text-anchor", "middle")
      .text(function(d){
        if (d.call_types == highlight) {
          return d["call_types"];
        } else {
          return "";
        }
      })
      .style("fill","black")
      .style("font-size","18px")

}

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
    html_str += "</div>";
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


// slides.forEach( function(slide) {

//   console.log(slide["Interactive"]);

//   // this is the map with numbers of kids on it
//   if (slide["Interactive"] == "map"){
//     drawMap("map","count");

//   // this is the interactive that shows how Mary Graham is an outlier
//   } else if (slide["Interactive"] == "bars"){
//     drawBars();

//   // this is the interactive that shows how Mary Graham is an outlier
//   } else if (slide["Interactive"] == "dots"){
    drawDots("dots");

//   // this is the interactive that shows how Mary Graham is an outlier
//   } else if (slide["Interactive"] == "bubbles"){
//     drawBubbles("bubbles",0,"Runaway");

//   // this is the icon chart that shows all the cases that were thrown out
//   } else if ((slide["Interactive"] == "icons-arrests")) {

//     var key = "icon-"+slide["Interactive"].split("-")[1];

    // var html_str = drawIcons("",key);
//     document.getElementById(slide["Interactive"]).innerHTML = html_str;

//   } else if ((screen.width <= 480) && ((slide["Interactive"] == "icons-bookings") || (slide["Interactive"] == "icons-pursued") || (slide["Interactive"] == "icons-probation"))) {
//     var key = "icon-"+slide["Interactive"].split("-")[1];

    var html_str = drawIcons("",'arrests');
    document.getElementById('icons-arrests').innerHTML = html_str;

//   }

// });

drawMap("map","count");


// var prevIDX = -1;
$(window).scroll(function () {

  var pos = $(this).scrollTop();

//   var currentIDX = -1;
//   slides.forEach(function(slide,slideIDX) {
//     var pos_slides = $('#slide-top-'+slideIDX).offset().top-400;
//     if (pos > pos_slides) {
//       currentIDX = Math.max(slideIDX,currentIDX);
//     }
//   });

  if (screen.width > 480) {

    var pos_icons_top = $("#slide-top-11").offset().top;
    var pos_icons_bottom = $("#slide-top-14").offset().top+400;
    var sticker_ph = document.getElementById('stick-ph');
    if ((pos > pos_icons_top) && (pos < pos_icons_bottom)) {
      $("#icons-arrests").addClass("fixedInteractive");
      sticker_ph.style.display = 'block';
    } else {
      $("#icons-arrests").removeClass("fixedInteractive");
      sticker_ph.style.display = 'none';
    }
  }

//   console.log(currentIDX);

//   if (currentIDX != prevIDX) {

//     console.log("switching slide");

//     document.getElementById(["slide-top-"+currentIDX]).classList.add("active");

//     var targetDivs = document.getElementById(["slide-top-"+currentIDX]).getElementsByClassName("bold");
//     if (targetDivs.length > 0) {
//       if (targetDivs.length > 1) {
//         targetDivs.forEach(function(target){
//           target.classList.add("boldColor");
//         });
//       } else {
//         targetDivs[0].classList.add("boldColor");
//       }
//     }


    // var icon_list = document.getElementsByClassName("icon");
    // for (var j=0; j<icon_list.length; j++) {
    //   icon_list[j].classList.remove("active");
    // }
    // if ((slides[currentIDX]["Interactive"] == "icons-arrests") || (slides[currentIDX]["Interactive"] == "icons-bookings") || (slides[currentIDX]["Interactive"] == "icons-pursued") || (slides[currentIDX]["Interactive"] == "icons-probation")){
    //   Array.from(icon_list).forEach(function(element,idx){
    //     if (element.classList.contains(slides[currentIDX]["Interactive"])) {
    //       // $(function(){
    //       //   setTimeout(function() {
    //       //     element.classList.add("active");
    //       //   }, 500+10*idx);
    //       // });
    //       element.classList.add("active");
    //     } else {
    //       element.classList.remove("active");
    //     }
    //   });
    // }

  // }

});
