require("./lib/social"); //Do not delete

console.log(slidesData);
console.log(MGData.length);

var offset_top = 500;

var slides = slidesData["slides"];
// var num_slides = slides.length();

// CODE FOR INTERACTIVES -------------------------------------------------------

// function to draw scatter chart
var drawDots = function(){

  var margin = {
    top: 15,
    right: 25,
    bottom: 25,
    left: 35
  };

  if (screen.width > 768) {
    var width = 800 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;
  } else if (screen.width <= 768 && screen.width > 480) {
    var width = 650 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;
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
  var tooltip = d3.select("div.tooltip-dots");

  // convert strings to numbers
  bubbleData.forEach(function(d) {
    d.capacity = +d.capacity;
    d.placements = +d.placements;
    d.arrests = +d.arrests;
  });

  // x-axis scale
  var x = d3.scale.linear()
      .rangeRound([0, width]);

  // y-axis scale
  var y = d3.scale.linear()
      .rangeRound([height, 0]);

  var color = d3.scale.category10();

  // use x-axis scale to set x-axis
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  // use y-axis scale to set y-axis
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")

  // create SVG container for chart components
  var svg = d3.select(".dot-chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(d3.extent(bubbleData, function(d) { return d.placements; })).nice();//.nice();
  y.domain(d3.extent(bubbleData, function(d) { return d.arrests; })).nice(); //.nice();

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -10)
      .style("text-anchor", "end")
      .text("Shelter placements (2016)");

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
      .text("Arrests at facility (2016)")

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
        return 10;
        // if (screen.width <= 480) {
        //   return (d.num_teachers/1400)+5;
        // } else {
        //   return (d.num_teachers/800)+6.5;
        // }
      })
      .attr("cx", function(d) { return x(d.placements); })
      .attr("cy", function(d) { return y(d.arrests); })
      .style("stroke","#696969")
      .style("opacity","0.7")
      .style("fill", function(d) {
        return "red";
        // return color_function(d.county) || colors.fallback;
      })
      .on("mouseover", function(d) {
          tooltip.html(`
              <div><b>${d.shelter}</b></div>
              <div>Placements in 2016: <b>${d.placements}</b></div>
              <div>Arrests in 2016: <b>${d.arrests}</b></div>
          `);
          tooltip.style("visibility", "visible");
      })
      .on("mousemove", function() {
        if (screen.width <= 480) {
          return tooltip
            .style("top",(d3.event.pageY+40)+"px")//(d3.event.pageY+40)+"px")
            .style("left",10+"px");
        } else {
          return tooltip
            .style("top", (d3.event.pageY+20)+"px")
            .style("left",(d3.event.pageX-80)+"px");
        }
      })
      .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

  var node = svg.selectAll(".circle")
    .data(bubbleData)
    .enter().append("g")
    .attr("class","node");

  node.append("text")
      .attr("x", function(d) {
        return x(d.placements)+20
      })
      .attr("y", function(d) {
        return y(d.arrests)+5;
      })
      // .attr("id", function(d) {
      //   return (d.school.replace(/\s/g, '').toLowerCase()+"text");
      // })
      // .style("fill","BFBFBF")
      .style("font-size","12px")
      .style("font-family","AntennaMedium")
      // .style("font-style","italic")
      .style("visibility",function(d) {
        if (d.shelter == "Mary Graham") {
          return "visible";
        } else {
          return "hidden";
        }
      })
      .text(function(d) {
        if (d.shelter == "Mary Graham") {
          return d.shelter;
        } else {
          return "";
        }
      });

}

// function to create map
var drawMap = function() {

  // tooltip information
  function tooltip_function (d) {
    var html_str = "<div class='name'>"+d.Name+"</div><div>"+d.Address+"</div><div>"+d.County+" County</div><div>Capacity: "+d.Capacity+"</div><div>Count in 2016: "+d.Count2016+"</div>"
    return html_str;
  }

  // setting parameters for the center of the map and initial zoom level
  if (screen.width <= 480) {
    var sf_lat = 37.85;
    var sf_long = -122.43;
    var zoom_deg = 8;
  } else {
    var sf_lat = 36.04
    var sf_long = -119.5;
    var zoom_deg = 6;
  }

  // show tooltip
  var tooltip = d3.select("div.tooltip-map");

  //get access to Leaflet and the map
  var element = document.querySelector("map");
  // var L = element.leaflet;
  // var map = element.map;

  var Stamen = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.{ext}', {
  	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  	subdomains: 'abcd',
  	minZoom: 0,
  	maxZoom: 18,
  	ext: 'png'
  });

  // var Stamen = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
  // 	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  // 	subdomains: 'abcd',
  // 	minZoom: 0,
  // 	maxZoom: 20,
  // 	ext: 'png'
  // });
  //
  // var Stamen = L.tileLayer('http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
  // 	maxZoom: 18,
  // 	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  // });
  //
  // var Stamen = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
  // 	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  // 	subdomains: 'abcd',
  // 	minZoom: 1,
  // 	maxZoom: 16,
  // 	ext: 'png'
  // });

  // initialize map with center position and zoom levels
  var map = L.map("map", {
    // minZoom: 7,
    // maxZoom: 16,
    zoomControl: false,
    dragging: true,
    touchZoom: true
    // zoomControl: isMobile ? false : true,
    // scrollWheelZoom: false
  }).setView([sf_lat,sf_long], zoom_deg);;
  // window.map = map;

  map.addLayer(Stamen);

  map.dragging.enable();

  // add tiles to the map
  // var mapLayer = L.tileLayer("https://api.mapbox.com/styles/v1/emro/ciyvv7c2n003h2sqvmfffselg/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZW1ybyIsImEiOiJjaXl2dXUzMGQwMDdsMzJuM2s1Nmx1M29yIn0._KtME1k8LIhloMyhMvvCDA",{attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>'})
  // mapLayer.addTo(map);

  // L.control.zoom({
  //      position:'topright'
  // }).addTo(map);

  // dragging and zooming controls
  map.scrollWheelZoom.disable();
  map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.keyboard.disable();

  // initializing the svg layer
  // L.svg().addTo(map)
  map._initPathRoot();

  // creating Lat/Lon objects that d3 is expecting
  mapData.forEach(function(d,idx) {
  	d.LatLng = new L.LatLng(d.Lat,
  							d.Long);
  });

  var svg = d3.select("#map").select("svg"),
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
      return 0.8;
      // if ((d.Day == current_day) || (current_day == 100)) {
      //   return 0.8;
      // } else {
      //   return 0.3;
      // }
    })
    .style("fill", function(d) {
      return "#E32B2B";//"#3C87CF";
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
          // .style("top",(d3.event.pageY+40)+"px")//(d3.event.pageY+40)+"px")
          // .style("left",10+"px");
      } else {
        return tooltip
          .style("top", (d3.event.pageY+10)+"px")
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

  node.append("rect")
    .attr("x", function(d) {
      if (d.Name.match("Betty")) {
        return map.latLngToLayerPoint(d.LatLng).x-100;
      } else {
        return map.latLngToLayerPoint(d.LatLng).x+20;
      }
    })
    .attr("y", function(d) {
      if (d.Name.match("Betty")) {
        return map.latLngToLayerPoint(d.LatLng).y+15;
      } else {
        return map.latLngToLayerPoint(d.LatLng).y-15;
      }
    })
    .attr("width",function(d){
      return (d.Name).length*7+40 + "px";
    })
    .attr("visibility",function(d) {
      if (d.Name.match("Mary Graham")) {
        console.log("visibility");
        return "visible";
      } else {
        return "hidden";
      }
    })
    .attr("height","20px")
    .attr("opacity","0.5")
    .attr("fill","white")
    .attr("pointer-events", "none");

  node.append("text")
    .attr("x", function(d) {
      if (d.Name.match("Betty")) {
        return map.latLngToLayerPoint(d.LatLng).x-90;
      } else {
        return map.latLngToLayerPoint(d.LatLng).x+30;
      }
    })
    .attr("y", function(d) {
      if (d.Name.match("Betty")) {
        return map.latLngToLayerPoint(d.LatLng).y+30;
      } else {
        return map.latLngToLayerPoint(d.LatLng).y;
      }
    })
    .attr("id", function(d) {
      // return (d.school.replace(/\s/g, '').toLowerCase()+"text");
    })
    .attr("visibility",function(d) {
      if (d.Name.match("Mary Graham")) {
        console.log("visibility");
        return "visible";
      } else {
        return "hidden";
      }
    })
    // .style("fill","BFBFBF")
    .style("font-family","AntennaBold")
    .style("font-size","14px")
    // .style("font-style","italic")
    .text(function(d) {
        return d.Name
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
var drawBubbles = function(flag) {

  // show tooltip
  var bubbles_tooltip = d3.select("div.tooltip-bubbles");

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
  var color = d3.scale.category20b();

  var svg = d3.select(".bubble-chart").append('svg')
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
      .append("g")
      .on("mouseover", function(d) {
        bubbles_tooltip.html(`
            <div>Call type: <b>${d.call_types}</b></div>
            <div>Total calls: <b>${formatthousands(d.call_totals)}</b></div>
        `);
        bubbles_tooltip.style("visibility", "visible");
      })
      .on("mousemove", function(d) {
        if (screen.width <= 480) {
          return bubbles_tooltip
            .style("top", (d3.event.pageY+20)+"px")
            .style("left",d3.event.pageX/2+20+"px");
        } else {
          return bubbles_tooltip
            .style("top", (d3.event.pageY+20)+"px")
            .style("left",(d3.event.pageX-80)+"px");
        }
      })
      .on("mouseout", function(){return bubbles_tooltip.style("visibility", "hidden");});

  //create the bubbles
  bubbles.append("circle")
      .attr("r", function(d){ return d.r; })
      .attr("cx", function(d){ return d.x; })
      .attr("cy", function(d){ return d.y; })
      .style("opacity",0.8)
      .style("fill", function(d) { return color(d.value); });

  //format the text for each bubble
  bubbles.append("text")
      .attr("x", function(d){ return d.x; })
      .attr("y", function(d){ return d.y + 5; })
      .attr("text-anchor", "middle")
      .text(function(d){
        if (d.r > 20) {
          return d["call_types"];
        }
      })

}

// function to draw icons
var drawIcons = function(html_str, maxIcon, key) {

  html_str += "<div class='icon-container'>";
  MGData.forEach(function(d,idx) {
    html_str += "<div class='"+key+" "+d["disposition_cleaned"].toLowerCase().replace(/ /g,"")+" "+d["final_disposition_cleaned"].toLowerCase().replace(/ /g,"")+"' id='icon"+String(idx)+"'><i class='fa fa-male' aria-hidden='true'></i></div>"
  });
  html_str += "</div>";
  return html_str;

}


// ------------------------------------------------------------------------------------------------------------------------


slides.forEach( function(slide) {

  // this is the map interactive
  if (slide["Interactive"] == "map"){
    drawMap();

  // this is the interactive that shows how Mary Graham is an outlier
  } else if (slide["Interactive"] == "bars"){
    drawBars();

  // this is the interactive that shows how Mary Graham is an outlier
  } else if (slide["Interactive"] == "dots"){
    drawDots();

  // this is the interactive that shows how Mary Graham is an outlier
  } else if ((slide["Interactive"] == "bubbles") || (slide["Interactive"] == "bubbles-v2")){

    // bubble chart that includes runaways
    if (slide["Interactive"] == "bubbles"){
      drawBubbles();
    // bubble chart that does not include runaways
    } else {
      drawBubbles(1);
    }


  // this is the icon chart that shows all the cases that were thrown out
  } else if ((slide["Interactive"] == "icons-arrests") || (slide["Interactive"] == "icons-bookings") || (slide["Interactive"] == "icons-pursued") || (slide["Interactive"] == "icons-probation")) {

    var key = "icon-"+slide["Interactive"].split("-")[1];

    var html_str = drawIcons("",MGData.length,key);
    document.getElementById(slide["Interactive"]).innerHTML = html_str;

  }

});


$(window).scroll(function () {

  var pos = $(this).scrollTop();
  // var pos_map_top = $('#bottom-of-top').offset().top;
  // var pos_map_bottom = $('#top-of-bottom').offset().top-bottomOffset;

  var currentIDX = -1;
  slides.forEach(function(slide,slideIDX) {
    var pos_slides = $('#slide-top-'+slideIDX).offset().top-offset_top;
    if (pos > pos_slides) {
      currentIDX = Math.max(slideIDX,currentIDX);
    }
  });
  console.log(currentIDX);

  document.getElementById(["slide-top-"+currentIDX]).classList.add("active");

  // var targetDiv = document.getElementById(["slide-top-"+currentIDX]).getElementsByClassName("bold")[0];
  // console.log(targetDiv);
  //There were 259 arrests and citations at Mary Graham in 2015 and 2016.
  //Those incidents led to 199 bookings of Mary Graham residents, some as young as 9 and 10 years old.
  //The District Attorney pursued just 55 cases. The rest were either rejected by probation officers or prosecutors who determined the alleged offenses were too minor to justify incarceration.
  //Only 31 of those cases had resulted in probation or prosecution. The rest were either dismissed by the court or pending at the time of publication.
  console.log(slides[currentIDX]["Interactive"]);
  if (slides[currentIDX]["Interactive"] == "icons-arrests") {
    var icon_list = document.getElementsByClassName("icon-arrests");
    Array.from(icon_list).forEach(function(element,idx){
      if (element.classList.contains("pursuedbydistrictattorney")) {
        $(function(){
          setTimeout(function() {
            element.classList.add("active");
          }, 500+10*idx);
        });
      }
    });
  } else if (slides[currentIDX]["Interactive"] == "icons-bookings") {
    var icon_list = document.getElementsByClassName("icon-bookings");
    var count = 0;
    Array.from(icon_list).forEach(function(element,idx){
      if (element.classList.contains("closedandreleased")) {
        count += 1;
        $(function(){
          setTimeout(function() {
            element.classList.add("active");
          }, 500+10*count);
        });
      }
    });
  } else if (slides[currentIDX]["Interactive"] == "icons-pursued") {
    var icon_list = document.getElementsByClassName("icon-pursued");
    var count = 0;
    Array.from(icon_list).forEach(function(element,idx){
      if (element.classList.contains("closed")) {
        count += 1;
        $(function(){
          setTimeout(function() {
            element.classList.add("active");
          }, 500+10*count);
        });
      }
    });
  } else if (slides[currentIDX]["Interactive"] == "icons-probation") {
    console.log("here");
    var icon_list = document.getElementsByClassName("icon-probation");
    var count = 0;
    Array.from(icon_list).forEach(function(element,idx){
      if (element.classList.contains("adjudicatedandplacedonprobationorwardship")) {
        count += 1;
        $(function(){
          setTimeout(function() {
            element.classList.add("active");
          }, 500+10*count);
        });
      }
    });
    console.log(count);
  }


});
