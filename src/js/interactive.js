require("./lib/social"); //Do not delete
var d3 = require('d3');

console.log(slidesData);
console.log(MGData.length);

// var timeTimeout = 50;

var offset_top = 500;

var slides = slidesData["slides"];
// var num_slides = slides.length();

var colors = {
    // 'runaway': '#D4A190',
    // 'assault/battery': '#D4C890',
    // 'juvenilemisconduct': '#782E20',
    // 'threats/disturbingthepeace': '#3C501F',
    // 'propertycrime': '#D3D57C',
    // 'suicidalsubject': '#889C6B',
    // '5150/mentalhealthemergency': '#957964',
    // 'drugs': '#F5CB5C',
    // 'sexcrimes': '#492D18',
    // 'childabuse': '#CAD178',
    'fallback': '#92483A'
}

function color(name, depth) {
  var id = name.toLowerCase().replace(/ /g,"");
  console.log(id);
  if (colors[id]) {
    return colors[id];
  } else {
    return null;
  }
}

// CODE FOR INTERACTIVES -------------------------------------------------------

// function to draw scatter chart
var drawDots = function(key){

  var margin = {
    top: 20,
    right: 25,
    bottom: 25,
    left: 35
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

  // var color = d3.scale.category10();

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

  x.domain(d3.extent(bubbleData, function(d) { return d.population; })).nice();//.nice();
  y.domain(d3.extent(bubbleData, function(d) { return d.bookings; })).nice(); //.nice();

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
      // .attr("class", "dot")
      .attr("id", function(d) {
        return d.shelter.replace(/\s/g, '').toLowerCase();
      })
      .attr("class", function(d) {
        return "dot "+d.shelter.replace(/\s/g, '').toLowerCase();
      })
      .attr("r", function(d) {
        return 20;
        // if (screen.width <= 480) {
        //   return (d.num_teachers/1400)+5;
        // } else {
        //   return (d.num_teachers/800)+6.5;
        // }
      })
      .attr("cx", function(d) { return x(d.population); })
      .attr("cy", function(d) { return y(d.bookings); })
      .style("stroke","#696969")
      .style("opacity","1.0")
      .style("fill", function(d) {
        return "#92483A";
        // return color_function(d.county) || colors.fallback;
      })
      .on("mouseover", function(d) {
          tooltipDots.html(`
              <div><b>${d.shelter}</b></div>
              <div>Population in 2016: <b>${d.population}</b></div>
              <div>Bookings in 2016: <b>${d.bookings}</b></div>
          `);
          tooltipDots.style("visibility", "visible");
      })
      .on("mousemove", function() {
        console.log("moving");
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
      // .attr("id", function(d) {
      //   return (d.school.replace(/\s/g, '').toLowerCase()+"text");
      // })
      // .style("fill","BFBFBF")
      .style("font-size","12px")
      .style("font-family","AntennaMedium")
      // .style("font-style","italic")
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
      var html_str = "<div class='name bold'>"+d.Name+"</div><div>"+d.Address+"</div><div>Count in 2016: <span class='bold'>"+d.Count2016+"</span></div><div>"+d.Note+"</div>"
      return html_str;
    } else {
      var html_str = "<div class='name bold'>"+d.Name+"</div><div>"+d.Address+"</div><div>Count in 2016: <span class='bold'>"+d.Count2016+"</span></div>"
      return html_str;
    }
  }

  // setting parameters for the center of the map and initial zoom level
  if (screen.width <= 480) {
    var sf_lat = 37.85;
    var sf_long = -122.43;
    var zoom_deg = 8;
  } else {
    var sf_lat = 37.14
    var sf_long = -121.5;
    var zoom_deg = 6;
  }

  // show tooltip
  var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip-map")
    // .style("opacity", 0);

  console.log(tooltip);

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
      return "#782E20";//"#3C87CF";
    })
    .style("stroke","#696969")
    .attr("r", function(d) {
      if (screen.width <= 480) {
        return 7;
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
          .style("top", 70+"px")
          .style("left",40+"px");
      } else {
        return tooltip
          .style("top", (d3.event.pageY+10)+"px")
          .style("left",(d3.event.pageX-10)+"px");
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
    .style("font-size","16px")
    .text(function(d) {
      if (d.Name == "Mary Graham Children's Shelter"){
        return d.Name
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
  } else if (screen.width <= 480) {
    var diameter = 360;
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

  console.log(svg);

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
          return 1;
        } else {
          return 0.6;
        }
      })
      .style("fill", function(d) {
        return color(d.call_types, 1) || colors.fallback;
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
    html_str += "<div class='"+key+" show"+"' id='icon"+String(count)+"'><i class='fa fa-male' aria-hidden='true'></i></div>";
    count++;
  };
  for (var ii=0; ii< lastactive_num; ii++) {
    html_str += "<div class='"+key+" dark"+"' id='icon"+String(count)+"'><i class='fa fa-male' aria-hidden='true'></i></div>";
    count++;
  };
  for (var ii=0; ii< inactive_num; ii++) {
    html_str += "<div class='"+key+"' id='icon"+String(count)+"'><i class='fa fa-male' aria-hidden='true'></i></div>";
    count++;
  };
  html_str += "</div>";
  return html_str;

}


// ------------------------------------------------------------------------------------------------------------------------


slides.forEach( function(slide) {

  console.log(slide["Interactive"]);

  // this is the map with numbers of kids on it
  if (slide["Interactive"] == "map"){
    drawMap("map","count");

  // this is the map with numbers of arrests on it
  } else if (slide["Interactive"] == "map-v2"){
    drawMap("map-v2","calls");

  // this is the interactive that shows how Mary Graham is an outlier
  } else if (slide["Interactive"] == "bars"){
    drawBars();

  // this is the interactive that shows how Mary Graham is an outlier
  } else if (slide["Interactive"] == "dots"){
    drawDots("dots");

  // this is the interactive that shows how Mary Graham is an outlier
} else if ((slide["Interactive"] == "bubbles") || (slide["Interactive"] == "bubbles-v2") || (slide["Interactive"] == "bubbles-v3") || (slide["Interactive"] == "bubbles-v4")){

    // bubble chart that includes runaways
    if (slide["Interactive"] == "bubbles"){
      drawBubbles("bubbles",0,"Runaway");
    // bubble chart that does not include runaways
    } else if (slide["Interactive"] == "bubbles-v2"){
      drawBubbles("bubbles-v2",0,"Assault/Battery");
    } else if (slide["Interactive"] == "bubbles-v3") {
      drawBubbles("bubbles-v3",0,"Juvenile misconduct");
    } else if (slide["Interactive"] == "bubbles-v4") {
      drawBubbles("bubbles-v4",0,"Threats/Disturbing the Peace");
    }

  // this is the icon chart that shows all the cases that were thrown out
  } else if ((slide["Interactive"] == "icons-arrests") || (slide["Interactive"] == "icons-bookings") || (slide["Interactive"] == "icons-pursued") || (slide["Interactive"] == "icons-probation")) {

    var key = "icon-"+slide["Interactive"].split("-")[1];

    var html_str = drawIcons("",key);
    document.getElementById(slide["Interactive"]).innerHTML = html_str;

  }

});

// set up scrolling timeout
// var scrollTimer = null;
// $(window).scroll(function () {
//     if (scrollTimer) {
//         clearTimeout(scrollTimer);   // clear any previous pending timer
//     }
//     scrollTimer = setTimeout(handleScroll, timeTimeout);   // set new timer
// });

var prevIDX = -1;
// function handleScroll() {
$(window).scroll(function () {

  // scrollTimer = null;

  var pos = $(this).scrollTop();
  // var pos_map_top = $('#bottom-of-top').offset().top;
  // var pos_map_bottom = $('#top-of-bottom').offset().top-bottomOffset;

  var currentIDX = -1;
  slides.forEach(function(slide,slideIDX) {
    var pos_slides = $('#slide-top-'+slideIDX).offset().top-400;
    if (pos > pos_slides) {
      currentIDX = Math.max(slideIDX,currentIDX);
    }
  });

  console.log(currentIDX);

  if (currentIDX != prevIDX) {

    console.log("switching slide");
    var prevInteractives = document.getElementsByClassName("sticky");
    for (var i=0; i< prevInteractives.length; i++) {
      prevInteractives[i].classList.remove("fixedInteractive");
    };
    // var prevMap = document.getElementsByClassName("map");
    // for (var i=0; i< prevMap.length; i++) {
    //   prevMap[i].classList.remove("fixedMap");
    // };

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
    var targetInteractive = document.getElementById(["slide-top-"+currentIDX]).getElementsByClassName("sticky");
    console.log(targetInteractive);
    if (targetInteractive.length > 0) {
      if (targetInteractive[0].id != "dots") {
        targetInteractive[0].classList.add("fixedInteractive");
      }
    }
    var targetText = document.getElementById(["slide-top-"+currentIDX]).getElementsByClassName("flex-left");
    if ((targetText.length > 0) && (targetInteractive.length > 0)){
      if (targetInteractive[0].id != "dots") {
        targetText[0].classList.add("fixedText");
      }
    }
    // var targetMap = document.getElementById(["slide-top-"+currentIDX]).getElementsByClassName("map");
    // if (targetMap.length > 0) {
    //   targetMap[0].classList.add("fixedMap");
    // }

    var icon_list = [];
    if (slides[currentIDX]["Interactive"] == "icons-arrests") {
      var icon_list = document.getElementsByClassName("icon-arrests");
    } else if (slides[currentIDX]["Interactive"] == "icons-bookings") {
      var icon_list = document.getElementsByClassName("icon-bookings");
    } else if (slides[currentIDX]["Interactive"] == "icons-pursued") {
      var icon_list = document.getElementsByClassName("icon-pursued");
    } else if (slides[currentIDX]["Interactive"] == "icons-probation") {
      var icon_list = document.getElementsByClassName("icon-probation");
    }
    if ((slides[currentIDX]["Interactive"] == "icons-arrests") || (slides[currentIDX]["Interactive"] == "icons-bookings") || (slides[currentIDX]["Interactive"] == "icons-pursued") || (slides[currentIDX]["Interactive"] == "icons-probation")){
      Array.from(icon_list).forEach(function(element,idx){
        if (element.classList.contains("show")) {
          $(function(){
            setTimeout(function() {
              element.classList.add("active");
            }, 500+10*idx);
          });
        }
      });
    }

  }

});
