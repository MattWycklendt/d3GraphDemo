var width = 960,
    height = 500;
    nodeData = [];

var force = d3.layout.force()
    .size([width, height])
    .charge(-400)
    .linkDistance(40)
    .on("tick", tick);

var drag = force.drag()
    .on("dragstart", dragstart)
    .on("drag", function(d) {
        d3.selectAll(".sel:not(#"+d.name+")").each(function(f) {
            f.px += d3.event.dx;
            f.py += d3.event.dy;
        });
    });

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");


d3.json("graph.json", function(error, graph) {
  force
      .nodes(graph.nodes)
      .links(graph.links);

  link = link.data(graph.links)
    .enter().append("line")
      .attr("class", "link");

  node = node.data(graph.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", 12)
      .attr("id", function(d) { return d.name;})
      .on("dblclick", dblclick)
      .call(drag);

  sim();

});

function sim() {
  force.start();
  setTimeout( function() {
      force.stop();
      d3.selectAll(".node").each(function(d) {d.fixed = true;});
  }, 1000 );
}

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  svg.selectAll("circle")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });

  svg.selectAll("rect")
      .attr("x", function(d) { return d.x-20; })
      .attr("y", function(d) { return d.y-20; });
}

function dblclick(d) {
  d3.select(this).classed("sel", false);
}

function dragstart(d) {
    d3.select(this).classed("sel", true);
}

function arrUnselected() {
    var un = d3.selectAll(".node:not(.sel)").each(function(d) {d.fixed = false;});
    sim();
}

function arrSelected() {
    var sel = d3.selectAll(".sel").each(function(d) {d.fixed = false;});
    sim();
}

function collapseSelected() {
    var rsel = d3.selectAll("rect.sel");
    var csel = d3.selectAll("circle.sel");
    var sel = d3.selectAll(".sel");

    //rsel.each(function(d) {csel.append(d.nodeChildren);});

    // need 2 or more nodes in order to create a region
    if (sel.empty() || sel.size()===1) return;


    var name = "";
        newx = 0;
        newy = 0;
    csel.each(function(s) {
        name += s.name;
        newx += s.x;
        newy += s.y;
    });
    if (rsel.size()) {
        var num = 0;
        rsel.each(function(d) { d.nodeChildren.forEach(function(s) {
                name += s.name;
                newx += s.px+d.x;
                newy += s.py+d.y;
                num++;
            });
        });
        newx /= csel.size()+num;
        newy /= csel.size()+num;
    }
    else {
        newx /= csel.size();
        newy /= csel.size();
    }

    svg.selectAll(".node").data([{"name": name}], function(d) {return d.name;})
      .enter()
      .append("rect")
      .attr("class", "node")
      .attr("width", 40)
      .attr("height", 40)
      .attr("id", name)
      .classed("sel", true)
      .on("dblclick", dblclick)
      .call(drag);


    var newNode;
    svg.select("#"+name).each(function(d) {
        d.x = newx;
        d.y = newy;
        d.fixed = true;
        csel.each(function(n) {
            n.px -= newx;
            n.py -= newy;
        });
        d.nodeChildren = csel.data();
        if (rsel.size())
            rsel.each(function(r) {
                r.nodeChildren.forEach(function(j) {
                    j.px += r.x-newx;
                    j.py += r.y-newy;
                    d.nodeChildren.push(j);
                });
            });
        newNode = d;
    });

    sel.remove();

    force.nodes(svg.selectAll(".node").data());

    link.each(function(d) {
        csel.each(function(s) {
            if(d.source.name === s.name) {
                d._source = d.source;
                d.source = newNode;
            }
            if(d.target.name === s.name) {
                d._target = d.target;
                d.target = newNode;
            }
        });
        rsel.each(function(s) {
            if(d.source.name === s.name) {
                d.source = newNode;
            }
            if(d.target.name === s.name) {
                d.target = newNode;
            }
        });
    });


    sim();
}

function uncollapseSelected() {
    var hiddenNodes = svg.selectAll("rect.sel");

    var nodeList = [];
    hiddenNodes.each(function(f) { f.nodeChildren.forEach( function(d) {
            d.px += f.x;
            d.py += f.y;
        });
    });
    hiddenNodes.each(function(f) { nodeList = nodeList.concat(f.nodeChildren);});

    svg.selectAll(".node").data(nodeList, function(d) {return d.name;})
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 12)
        .attr("id", name)
        .classed("sel", true)
        .on("dblclick", dblclick)
        .call(drag);

    link.each(function(d) {
        if(d._source && (nodeList.indexOf(d._source) != -1)) d.source = d._source;
        if(d._target && (nodeList.indexOf(d._target) != -1)) d.target = d._target;
    });

    svg.selectAll("rect.sel").remove();

    force.nodes(svg.selectAll(".node").data());
    sim();
}

