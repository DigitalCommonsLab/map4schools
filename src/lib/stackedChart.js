/*
	source: http://bl.ocks.org/puzzler10/2226e8d73c8f10dcdac7c77357838ba2
 */
module.exports = function(id, data, options) {
		
	var svgWidth = 400,
		svgHeight = 200;
		
	var margin = {top: 0, right: 0, bottom: 0, left: 0},
	svgWidth = svgWidth - margin.left - margin.right,
	svgHeight = svgHeight - margin.top - margin.bottom;

	stack = d3.layout.stack()
	layers = stack(data)

	//colour scale
	var c10 = d3.scale.category10();

	//see http://stackoverflow.com/questions/37688982/nesting-d3-max-with-array-of-arrays/37689132?noredirect=1#comment62916776_37689132
	//for details on the logic behind this
	max_y = d3.max(layers, function(d) {
	    return d3.max(d, function(d) 
		{
			return d.y0 + d.y;
		});
	})

	var yScale = d3.scale.linear()
					.domain([0,	max_y])
					.range([svgHeight,0]);

	var yAxis = d3.svg.axis()
					.ticks(5)
					.scale(yScale)
					.orient("right");
					
	d3.select(id).select("svg").remove();

	var svg = d3.select(id).append("svg")
				.attr("width", svgWidth + margin.left + margin.right)
				.attr("height", svgHeight+ margin.top + margin.bottom)

	var groups = svg.selectAll("g")
					.data(layers)
					.enter()
					.append("g")
					.style("fill", function (d,i) {return c10(i)});
					
	var rects = groups.selectAll("rect")
			.data(function(d) {return d} )
			.enter()
			.append("rect")
			.attr("x", function(d) {return (d.x * 50) })
			.attr("y", function(d) {return yScale(d.y0 + d.y)} )
			.attr("width", 40)
			.attr("height", function (d) {return yScale(d.y0) - yScale(d.y + d.y0)});	

	//add y axis
/*	svg.append("g")
		.attr("class", "y axis")
		//.attr("transform", "translate(" + (svgWidth -50) +",0)")
		.call(yAxis)
		.style("stroke", "black");*/
};