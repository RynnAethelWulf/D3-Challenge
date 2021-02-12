// Set width 
function Refresh_btext() {
    xText.attr(
        "transform",
        "translate(" +
        ((width - labelArea) / 2 + labelArea) +
        ", " +
        (height - margin - tPadBot) +
        ")"
    );
}

let width = parseInt(d3.select("#scatter").style("width"));
// let width_1 = parseInt(d3.select("#scatter1").style("width"));
// Set height 
let height = width - width / 3.9;
// Margin s
let margin = 20;
// space for placing words
let labelArea = 110;
// padding for the text at the bottom and left axes
let tPadBot = 40;
let tPadLeft = 40;
// SVG
let svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");

// Set the radius for each dot that will appear in the graph.
let circRadius;

function crSize() {
    if (width <= 530) {
        circRadius = 8;
    } else {
        circRadius = 13;
    }
}
crSize();
// Labels 
// 1. Bottom Axis
svg.append("g").attr("class", "xText");
// xText will allows us to select the group without excess code.
let xText = d3.select(".xText");


Refresh_btext();

// Now we use xText to append three text SVG files, with y coordinates specified to space out the values.
// Graph 1
// 1. Poverty
xText
    .append("text")
    .attr("y", -28)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class", "aText active x")
    .text("In Poverty (%)");
// 2. Age
xText
    .append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Age (Median)");
// 3. Income
xText
    .append("text")
    .attr("y", 28)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Household Income (Median)");

// 2. Left Axis
// ============

// Specifying the variables like this allows us to make our transform attributes more readable.
let leftTextX = margin + tPadLeft;
let leftTextY = (height + labelArea) / 2 - labelArea;
svg.append("g").attr("class", "yText");
let yText = d3.select(".yText");

function Refresh_ltext() {
    yText.attr(
        "transform",
        "translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)"
    );
}
Refresh_ltext();

// 1. Obesity
yText
    .append("text")
    .attr("y", -26)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Obese (%)");

// 2. Smokes
yText
    .append("text")
    .attr("x", 0)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Smokes (%)");

// 3. Lacks Healthcare
yText
    .append("text")
    .attr("y", 26)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Lacks Healthcare (%)");



// Import our CSV data 
d3.csv("assets/data/data.csv").then(function(data) {
    // Visualize the data
    visualize_dynamic(data);
});

function visualize_dynamic(theData) {

    let curX = "poverty";
    let curY = "obesity";

    let xMin;
    let xMax;
    let yMin;
    let yMax;

    let toolTip = d3
        .tip()
        .attr("class", "d3-tip")
        .offset([40, -60])
        .html(function(d) {
            let theX;
            let theState = "<div>" + d.state + "</div>";
            let theY = "<div>" + curY + ": " + d[curY] + "%</div>";
            if (curX === "poverty") {
                theX = "<div>" + curX + ": " + d[curX] + "%</div>";
            } else {
                theX = "<div>" +
                    curX +
                    ": " +
                    parseFloat(d[curX]).toLocaleString("en") +
                    "</div>";
            }
            return theState + theX + theY;
        });
    // Call the toolTip function.
    svg.call(toolTip);

    function xMinMax() {
        xMin = d3.min(theData, function(d) {
            return parseFloat(d[curX]) * 0.90;
        });
        xMax = d3.max(theData, function(d) {
            return parseFloat(d[curX]) * 1.10;
        });
    }

    function yMinMax() {
        yMin = d3.min(theData, function(d) {
            return parseFloat(d[curY]) * 0.90;
        });
        yMax = d3.max(theData, function(d) {
            return parseFloat(d[curY]) * 1.10;
        });
    }

    function labelChange(axis, clickedText) {
        // Switch the currently active to inactive.
        d3
            .selectAll(".aText")
            .filter("." + axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true);
        clickedText.classed("inactive", false).classed("active", true);
    }
    // grab the min and max values of x and y.
    xMinMax();
    yMinMax();
    let xScale = d3
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin]);
    let yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labelArea, margin]);
    let xAxis = d3.axisBottom(xScale);
    let yAxis = d3.axisLeft(yScale);

    function tickCount() {
        if (width <= 500) {
            xAxis.ticks(5);
            yAxis.ticks(5);
        } else {
            xAxis.ticks(10);
            yAxis.ticks(10);
        }
    }
    tickCount();
    svg
        .append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
    svg
        .append("g")
        .call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

    let theCircles = svg.selectAll("g theCircles").data(theData).enter();
    theCircles
        .append("circle")
        // These attr's specify location, size and class.
        .attr("cx", function(d) {
            return xScale(d[curX]);
        })
        .attr("cy", function(d) {
            return yScale(d[curY]);
        })
        .attr("r", circRadius)
        .attr("class", function(d) {
            return "stateCircle " + d.abbr;
        })
        // Hover rules
        .on("mouseover", function(d) {
            // Show the tooltip
            toolTip.show(d, this);
            d3.select(this).style("stroke", "#323232");
        })
        .on("mouseout", function(d) {
            // Remove the tooltip
            toolTip.hide(d);
            // Remove highlight
            d3.select(this).style("stroke", "#e3e3e3");
        });

    //  state abbreviations from our data and place them in the center of our dots.
    theCircles
        .append("text")
        // We return the abbreviation to .text
        .text(function(d) {
            return d.abbr;
        })
        // Now place the text using our scale.
        .attr("dx", function(d) {
            return xScale(d[curX]);
        })
        .attr("dy", function(d) {
            return yScale(d[curY]) + circRadius / 2.5;
        })
        .attr("font-size", circRadius)
        .attr("class", "stateText")
        // Hover Rules
        .on("mouseover", function(d) {
            // Show the tooltip
            toolTip.show(d);
            // Highlight the state circle's border
            d3.select("." + d.abbr).style("stroke", "#323232");
        })
        .on("mouseout", function(d) {
            // Remove tooltip
            toolTip.hide(d);
            // Remove highlight
            d3.select("." + d.abbr).style("stroke", "#e3e3e3");
        });
    //Making Graph Dynamic
    // Select all axis text and add this d3 click event.
    d3.selectAll(".aText").on("click", function() {

        let self = d3.select(this);
        if (self.classed("inactive")) {
            // Grab the name and axis saved in label.
            var axis = self.attr("data-axis");
            var name = self.attr("data-name");
            // When x is the saved axis, execute this:
            if (axis === "x") {
                curX = name;
                xMinMax();
                xScale.domain([xMin, xMax]);
                svg.select(".xAxis").transition().duration(300).call(xAxis);
                d3.selectAll("circle").each(function() {
                    d3
                        .select(this)
                        .transition()
                        .attr("cx", function(d) {
                            return xScale(d[curX]);
                        })
                        .duration(300);
                });
                d3.selectAll(".stateText").each(function() {
                    d3
                        .select(this)
                        .transition()
                        .attr("dx", function(d) {
                            return xScale(d[curX]);
                        })
                        .duration(300);
                });

                labelChange(axis, self);
            } else {
                curY = name;
                yMinMax();
                yScale.domain([yMin, yMax]);
                svg.select(".yAxis").transition().duration(300).call(yAxis);
                d3.selectAll("circle").each(function() {
                    d3
                        .select(this)
                        .transition()
                        .attr("cy", function(d) {
                            return yScale(d[curY]);
                        })
                        .duration(300);
                });
                d3.selectAll(".stateText").each(function() {
                    d3
                        .select(this)
                        .transition()
                        .attr("dy", function(d) {
                            return yScale(d[curY]) + circRadius / 3;
                        })
                        .duration(300);
                });
                labelChange(axis, self);
            }
        }
    });
    // Part 5: Mobile Responsive
    d3.select(window).on("resize", resize);

    function resize() {
        width = parseInt(d3.select("#scatter").style("width"));
        height = width - width / 3.9;
        leftTextY = (height + labelArea) / 2 - labelArea;
        svg.attr("width", width).attr("height", height);
        xScale.range([margin + labelArea, width - margin]);
        yScale.range([height - margin - labelArea, margin]);
        svg
            .select(".xAxis")
            .call(xAxis)
            .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
        svg.select(".yAxis").call(yAxis);
        tickCount();
        // Update the labels.
        xTextRefresh();
        yTextRefresh();
        crGet();
        d3
            .selectAll("circle")
            .attr("cy", function(d) {
                return yScale(d[curY]);
            })
            .attr("cx", function(d) {
                return xScale(d[curX]);
            })
            .attr("r", function() {
                return circRadius;
            });
        d3
            .selectAll(".stateText")
            .attr("dy", function(d) {
                return yScale(d[curY]) + circRadius / 3;
            })
            .attr("dx", function(d) {
                return xScale(d[curX]);
            })
            .attr("r", circRadius / 3);
    }
}